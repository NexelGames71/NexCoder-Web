import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://nexcoder.trynexa-ai.com"),
  title: {
    default: "NexCoder - Agentic Coding IDE for the Nexa Ecosystem",
    template: "%s | NexCoder",
  },
  description:
    "NexCoder is a production-grade agentic coding IDE: a desktop app and terminal CLI where one agentic engine plans, edits, verifies, and reverts - locally or against a hosted model.",
  openGraph: {
    title: "NexCoder - Agentic Coding IDE for the Nexa Ecosystem",
    description:
      "One agentic engine behind six chat modes and a terminal CLI. Checkpoint-backed edits, permission gates, skills, and local-first models.",
    type: "website",
    images: [{ url: "/media/og-image.png", width: 1200, height: 630, alt: "NexCoder" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "NexCoder - Agentic Coding IDE",
    description:
      "One agentic engine behind six chat modes and a terminal CLI. Checkpoint-backed edits, permission gates, skills, and local-first models.",
    images: ["/media/og-image.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
