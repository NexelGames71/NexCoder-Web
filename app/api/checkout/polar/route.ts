import { NextRequest, NextResponse } from "next/server";

import {
  getPolarApiBaseUrl,
  getPolarProductId,
  isBusinessPlan,
  parseBillingPeriod,
  parsePolarPlan,
} from "../../../../lib/polar";
import { createClient } from "../../../../lib/supabase/server";

export const dynamic = "force-dynamic";

type PolarCheckoutResponse = {
  id?: string;
  url?: string;
};

function siteOrigin(request: NextRequest) {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (configured) return configured;
  return request.nextUrl.origin;
}

function redirectToLogin(request: NextRequest) {
  const next = `${request.nextUrl.pathname}${request.nextUrl.search}`;
  return NextResponse.redirect(new URL(`/login?next=${encodeURIComponent(next)}`, request.url));
}

export async function GET(request: NextRequest) {
  const plan = parsePolarPlan(request.nextUrl.searchParams.get("plan"));
  const billing = parseBillingPeriod(request.nextUrl.searchParams.get("billing"));
  const seats = Math.max(1, Number(request.nextUrl.searchParams.get("seats") || "1") || 1);

  if (!plan) {
    return NextResponse.json({ error: "Unsupported Polar checkout plan." }, { status: 400 });
  }

  const productId = getPolarProductId(plan, billing);
  if (!productId) {
    return NextResponse.json(
      { error: `Missing Polar product mapping for ${plan} (${billing}).` },
      { status: 500 },
    );
  }

  const accessToken = process.env.POLAR_ACCESS_TOKEN;
  if (!accessToken) {
    return NextResponse.json({ error: "POLAR_ACCESS_TOKEN is not configured." }, { status: 500 });
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return redirectToLogin(request);

  const origin = siteOrigin(request);
  const checkoutPayload = {
    products: [productId],
    success_url: `${origin}/account?checkout_id={CHECKOUT_ID}&plan=${plan}&billing=${billing}`,
    return_url: `${origin}/pricing`,
    external_customer_id: user.id,
    customer_email: user.email,
    customer_name:
      typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name : undefined,
    is_business_customer: isBusinessPlan(plan),
    seats: isBusinessPlan(plan) ? seats : undefined,
    metadata: {
      app: "nexcoder",
      user_id: user.id,
      plan,
      billing,
      seats,
    },
    customer_metadata: {
      app_user_id: user.id,
    },
  };

  const response = await fetch(`${getPolarApiBaseUrl()}/v1/checkouts/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(checkoutPayload),
  });

  if (!response.ok) {
    const text = await response.text();
    console.error("Polar checkout creation failed", {
      status: response.status,
      statusText: response.statusText,
      body: text.slice(0, 500),
    });
    return NextResponse.json({ error: "Unable to start checkout." }, { status: 502 });
  }

  const checkout = (await response.json()) as PolarCheckoutResponse;
  if (!checkout.url) {
    return NextResponse.json({ error: "Polar did not return a checkout URL." }, { status: 502 });
  }

  return NextResponse.redirect(checkout.url);
}
