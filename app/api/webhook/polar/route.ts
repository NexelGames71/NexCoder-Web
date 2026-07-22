import { NextRequest, NextResponse } from "next/server";
import { Webhook, WebhookVerificationError } from "standardwebhooks";

import { createAdminClient } from "../../../../lib/supabase/admin";

export const dynamic = "force-dynamic";

type JsonRecord = Record<string, unknown>;

const PRODUCT_PLAN_ENV: Record<string, string> = {
  POLAR_PRODUCT_PLUS_MONTHLY: "plus",
  POLAR_PRODUCT_PLUS_YEARLY: "plus",
  POLAR_PRODUCT_PRO_MONTHLY: "pro",
  POLAR_PRODUCT_PRO_YEARLY: "pro",
  POLAR_PRODUCT_PREMIUM_MONTHLY: "premium",
  POLAR_PRODUCT_PREMIUM_YEARLY: "premium",
  POLAR_PRODUCT_BUSINESS_STANDARD_MONTHLY: "business-standard",
  POLAR_PRODUCT_BUSINESS_STANDARD_YEARLY: "business-standard",
  POLAR_PRODUCT_BUSINESS_PLUS_MONTHLY: "business-plus",
  POLAR_PRODUCT_BUSINESS_PLUS_YEARLY: "business-plus",
};

function asRecord(value: unknown): JsonRecord {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as JsonRecord) : {};
}

function asString(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function asNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function asBoolean(value: unknown): boolean {
  return value === true;
}

function isUuid(value: string | null): value is string {
  return Boolean(value && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value));
}

function isoOrNull(value: unknown): string | null {
  if (typeof value !== "string" || !value) return null;
  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? null : new Date(timestamp).toISOString();
}

function headersForVerification(request: NextRequest) {
  return {
    "webhook-id": request.headers.get("webhook-id") || "",
    "webhook-timestamp": request.headers.get("webhook-timestamp") || "",
    "webhook-signature": request.headers.get("webhook-signature") || "",
  };
}

function productIdToPlan(productId: string | null): string | null {
  if (!productId) return null;
  for (const [envKey, plan] of Object.entries(PRODUCT_PLAN_ENV)) {
    if (process.env[envKey] === productId) return plan;
  }
  return null;
}

function normalizePlan(value: string | null) {
  if (value === "business") return "business-standard";
  if (value === "business_plus") return "business-plus";
  return value;
}

function subscriptionStatus(eventName: string, data: JsonRecord, metadata: JsonRecord) {
  const explicit = asString(data.status) || asString(metadata.status);
  if (explicit) return explicit;
  if (eventName === "subscription.revoked") return "canceled";
  if (eventName === "subscription.past_due") return "past_due";
  if (eventName === "subscription.canceled") return asBoolean(data.cancel_at_period_end) ? "active" : "canceled";
  return "active";
}

async function recordWebhookEvent(payload: JsonRecord, eventName: string) {
  const supabase = createAdminClient();
  if (!supabase) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured.");

  const eventId = asString(payload.id) || `${eventName}:${asString(payload.timestamp) || Date.now().toString()}`;
  const { error } = await supabase.from("polar_webhook_events").upsert(
    {
      id: eventId,
      event_type: eventName,
      payload,
      processed_at: new Date().toISOString(),
    },
    { onConflict: "id" },
  );

  if (error) throw error;
  return supabase;
}

async function syncSubscription(payload: JsonRecord, eventName: string) {
  const supabase = await recordWebhookEvent(payload, eventName);
  const data = asRecord(payload.data ?? payload);
  const metadata = asRecord(data.metadata ?? payload.metadata);
  const eventMetadata = asRecord(payload.metadata);

  const productId =
    asString(data.product_id) ||
    asString(metadata.product_id) ||
    asString(eventMetadata.product_id);
  const planId = normalizePlan(
    asString(metadata.plan) ||
      asString(eventMetadata.plan) ||
      productIdToPlan(productId),
  );

  const userId =
    asString(metadata.user_id) ||
    asString(metadata.app_user_id) ||
    asString(data.external_customer_id) ||
    asString(payload.external_customer_id);

  const subscriptionId =
    asString(data.subscription_id) ||
    asString(data.id) ||
    asString(metadata.subscription_id) ||
    asString(eventMetadata.subscription_id);

  if (!planId || !subscriptionId) return;

  const status = subscriptionStatus(eventName, data, metadata);
  const safeUserId = isUuid(userId) ? userId : null;

  const { error: subscriptionError } = await supabase.from("subscriptions").upsert(
    {
      user_id: safeUserId,
      plan_id: planId,
      status,
      seats: asNumber(data.seats) || asNumber(metadata.seats) || 1,
      current_period_start:
        isoOrNull(data.current_period_start) ||
        isoOrNull(data.started_at) ||
        isoOrNull(metadata.started_at),
      current_period_end:
        isoOrNull(data.current_period_end) ||
        isoOrNull(data.ends_at) ||
        isoOrNull(metadata.ends_at),
      cancel_at_period_end: asBoolean(data.cancel_at_period_end) || asBoolean(metadata.cancel_at_period_end),
      polar_customer_id: asString(data.customer_id) || asString(payload.customer_id),
      polar_subscription_id: subscriptionId,
      polar_checkout_id: asString(data.checkout_id) || asString(metadata.checkout_id),
      polar_product_id: productId,
      polar_order_id: asString(data.order_id) || asString(metadata.order_id),
      billing_interval:
        asString(data.recurring_interval) ||
        asString(metadata.recurring_interval) ||
        asString(metadata.billing),
      metadata: {
        polar_event_id: asString(payload.id),
        polar_event_name: eventName,
        checkout_metadata: metadata,
      },
    },
    { onConflict: "polar_subscription_id" },
  );

  if (subscriptionError) throw subscriptionError;

  if (safeUserId) {
    const nextPlan = status === "canceled" || status === "revoked" ? "starter" : planId;
    const { error: profileError } = await supabase
      .from("profiles")
      .update({ plan: nextPlan })
      .eq("id", safeUserId);
    if (profileError) throw profileError;
  }
}

export async function POST(request: NextRequest) {
  const secret = process.env.POLAR_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "POLAR_WEBHOOK_SECRET is not configured." }, { status: 500 });
  }

  const body = await request.text();
  let payload: JsonRecord;

  try {
    payload = new Webhook(secret, { format: "raw" }).verify(body, headersForVerification(request)) as JsonRecord;
  } catch (error) {
    if (error instanceof WebhookVerificationError) {
      return NextResponse.json({ error: "Invalid webhook signature." }, { status: 401 });
    }
    throw error;
  }

  const eventName = asString(payload.type) || asString(payload.name);
  if (!eventName) {
    return NextResponse.json({ error: "Webhook event type is missing." }, { status: 400 });
  }

  try {
    if (eventName.startsWith("subscription.")) {
      await syncSubscription(payload, eventName);
    } else {
      await recordWebhookEvent(payload, eventName);
    }
  } catch (error) {
    console.error("Polar webhook processing failed", error);
    return NextResponse.json({ error: "Webhook processing failed." }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
