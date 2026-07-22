import { NextResponse } from "next/server";
import { createClient } from "../../../lib/supabase/server";

/**
 * OAuth + email-confirmation callback. Supabase redirects here with a `code`
 * that we exchange for a session (cookies are set on the response), then send
 * the user to `next` (defaults to /account).
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const nextParam = searchParams.get("next");
  const next = nextParam && nextParam.startsWith("/") && !nextParam.startsWith("//") ? nextParam : "/account";

  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
