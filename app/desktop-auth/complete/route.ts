import { NextResponse } from "next/server";
import { createClient } from "../../../lib/supabase/server";

function isAllowedDesktopReturn(raw: string | null): raw is string {
  if (!raw) return false;
  try {
    const url = new URL(raw);
    return (
      url.protocol === "http:" &&
      (url.hostname === "127.0.0.1" || url.hostname === "localhost") &&
      url.pathname === "/auth/callback" &&
      Boolean(url.port)
    );
  } catch {
    return false;
  }
}

function isSafeState(raw: string | null): raw is string {
  return Boolean(raw && /^[A-Za-z0-9_-]{32,180}$/.test(raw));
}

function encodePayload(payload: unknown): string {
  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
}

/**
 * Desktop auth handoff endpoint.
 *
 * The desktop app opens /login?next=/desktop-auth/complete?... with a random
 * state and a loopback return URL. After Supabase login, this endpoint verifies
 * the web session, restricts the return target to localhost, and redirects back
 * to the desktop callback with identity plus the Supabase session needed for
 * authenticated desktop API calls.
 */
export async function GET(request: Request) {
  const current = new URL(request.url);
  const state = current.searchParams.get("state");
  const returnTo = current.searchParams.get("return_to");

  if (!isSafeState(state) || !isAllowedDesktopReturn(returnTo)) {
    return NextResponse.redirect(new URL("/login?error=desktop-auth", current.origin));
  }

  const supabase = createClient();
  const [{ data: userData, error: userError }, { data: sessionData, error: sessionError }] = await Promise.all([
    supabase.auth.getUser(),
    supabase.auth.getSession(),
  ]);
  const user = userData.user;
  const session = sessionData.session;

  if (userError || sessionError || !user || !session) {
    const retry = new URL("/login", current.origin);
    retry.searchParams.set("next", `${current.pathname}${current.search}`);
    return NextResponse.redirect(retry);
  }

  const callback = new URL(returnTo);
  callback.searchParams.set("state", state);
  callback.searchParams.set("user", encodePayload({
    id: user.id,
    email: user.email,
    name: user.user_metadata?.full_name || user.user_metadata?.name || user.email,
    avatarUrl: user.user_metadata?.avatar_url || null,
    provider: "nexcoder-web",
    session: {
      accessToken: session.access_token,
      refreshToken: session.refresh_token,
      expiresAt: session.expires_at ?? null,
      expiresIn: session.expires_in ?? null,
      tokenType: session.token_type,
    },
  }));

  return NextResponse.redirect(callback);
}
