import { NextResponse } from "next/server";
import { createClient } from "../../../lib/supabase/server";

/** Sign out (POST) and return to the home page. Works without JavaScript. */
export async function POST(request: Request) {
  const supabase = createClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL("/", request.url), { status: 303 });
}
