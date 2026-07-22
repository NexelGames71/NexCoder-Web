import type { Metadata } from "next";
import { Suspense } from "react";

import AuthForm from "../../../components/auth/AuthForm";

export const metadata: Metadata = {
  title: "Log in",
  description: "Log in to your NexCoder account.",
};

export default function LoginPage() {
  return (
    <section className="flex min-h-[70vh] items-center justify-center px-5 py-16">
      <Suspense fallback={<div className="h-96 w-full max-w-md animate-pulse rounded-3xl border border-line bg-panel" />}>
        <AuthForm mode="login" />
      </Suspense>
    </section>
  );
}
