import type { Metadata } from "next";

import CodeBlock from "../../../components/marketing/CodeBlock";
import DownloadTabs from "../../../components/marketing/DownloadTabs";
import Section from "../../../components/marketing/Section";

export const metadata: Metadata = {
  title: "Download",
  description:
    "Download NexCoder for Windows, macOS, or Linux - the agentic coding IDE. Streamed directly from nexcoder.trynexa-ai.com with a published SHA-256 checksum.",
  alternates: { canonical: "/download" },
};

export default function DownloadPage() {
  return (
    <>
      <section className="border-b border-line bg-panel px-5 py-16">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,460px)] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent-violet">Download</p>
            <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight md:text-5xl">
              Download NexCoder
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-muted">
              The agentic coding IDE for the Nexa ecosystem - one engine behind six chat
              modes and a terminal CLI. Available for Windows, macOS, and Linux - pick your
              platform, verify the checksum, and you are ready to run.
            </p>
            <ul className="mt-8 space-y-3 text-sm text-muted">
              <li className="flex gap-3">
                <span className="mt-1 h-1.5 w-1.5 flex-none rounded-full bg-accent-blue" aria-hidden />
                Streamed directly from nexcoder.trynexa-ai.com - no third-party redirects.
              </li>
              <li className="flex gap-3">
                <span className="mt-1 h-1.5 w-1.5 flex-none rounded-full bg-accent-cyan" aria-hidden />
                Every installer ships with a published SHA-256 checksum you can verify.
              </li>
              <li className="flex gap-3">
                <span className="mt-1 h-1.5 w-1.5 flex-none rounded-full bg-accent-violet" aria-hidden />
                Local-first: runs offline against a local model or the hosted endpoint.
              </li>
            </ul>
          </div>

          <DownloadTabs />
        </div>
      </section>

      <Section id="install" title="Installation" subtitle="Three steps from download to first run.">
        <ol className="grid gap-5 md:grid-cols-3">
          {[
            {
              step: "1",
              title: "Download",
              body: "Pick your platform above and click Download. Your browser saves the versioned installer - a .exe (Windows), .dmg (macOS), or .AppImage (Linux).",
            },
            {
              step: "2",
              title: "Verify (recommended)",
              body: "Compare the file's SHA-256 with the checksum shown above. Windows: Get-FileHash <file> -Algorithm SHA256. macOS / Linux: shasum -a 256 <file>.",
            },
            {
              step: "3",
              title: "Install & run",
              body: "Windows: run the .exe. macOS: open the .dmg and drag NexCoder to Applications. Linux: chmod +x the .AppImage, then run it.",
            },
          ].map((item) => (
            <li key={item.step} className="rounded-3xl border border-line bg-panel p-6 shadow-soft">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-ink text-sm font-semibold text-shell">
                {item.step}
              </span>
              <h3 className="mt-4 text-lg font-semibold text-ink">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{item.body}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section
        id="requirements"
        title="System requirements"
        subtitle="NexCoder targets modern 64-bit Windows, macOS, and Linux."
        className="bg-shell"
      >
        <div className="overflow-x-auto rounded-3xl border border-line bg-panel shadow-soft">
          <table className="w-full min-w-[420px] text-left text-sm">
            <tbody>
              {[
                ["Windows", "Windows 10 or 11, 64-bit (x64)"],
                ["macOS", "macOS 12 Monterey or later (Apple Silicon or Intel)"],
                ["Linux", "Ubuntu 20.04+ or an equivalent modern 64-bit distribution"],
                ["Memory", "8 GB minimum; 32 GB recommended for the local model server"],
                ["Disk", "~1 GB for the app; additional space for local models"],
                ["GPU (optional)", "A consumer GPU accelerates the optional local model server"],
                ["Network", "Required for the hosted model endpoint; optional when fully local"],
              ].map(([k, v]) => (
                <tr key={k} className="border-b border-line/60 last:border-0">
                  <th scope="row" className="w-56 px-6 py-4 font-medium text-ink">{k}</th>
                  <td className="px-6 py-4 text-muted">{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section
        id="troubleshooting"
        title="Troubleshooting"
        subtitle="Common questions when installing NexCoder."
      >
        <div className="grid gap-5 md:grid-cols-2">
          <article className="rounded-3xl border border-line bg-panel p-6 shadow-soft">
            <h3 className="text-lg font-semibold text-ink">First-launch security prompts</h3>
            <p className="mt-3 text-sm leading-6 text-muted">
              Until code signing propagates: on Windows, SmartScreen may warn - choose More
              info then Run anyway. On macOS, right-click NexCoder and choose Open to clear
              Gatekeeper. On Linux, mark the .AppImage executable with{" "}
              <code className="rounded bg-line px-1.5 py-0.5 text-xs text-ink">chmod +x</code>.
              Always verify the SHA-256 checksum first.
            </p>
          </article>
          <article className="rounded-3xl border border-line bg-panel p-6 shadow-soft">
            <h3 className="text-lg font-semibold text-ink">Checksum does not match</h3>
            <p className="mt-3 text-sm leading-6 text-muted">
              Delete the file and download again. A mismatch usually means an interrupted
              download - the download endpoint supports resuming, so retrying is safe.
            </p>
          </article>
          <article className="rounded-3xl border border-line bg-panel p-6 shadow-soft">
            <h3 className="text-lg font-semibold text-ink">Download is unavailable</h3>
            <p className="mt-3 text-sm leading-6 text-muted">
              If the button reports a temporary outage, the release service is briefly
              unavailable. Wait a moment and retry - your version and checksum reload
              automatically.
            </p>
          </article>
          <article className="rounded-3xl border border-line bg-panel p-6 shadow-soft">
            <h3 className="text-lg font-semibold text-ink">Configuring the model</h3>
            <p className="mt-3 text-sm leading-6 text-muted">
              NexCoder reads its configuration from a <code className="rounded bg-line px-1.5 py-0.5 text-xs text-ink">.env</code>{" "}
              file beside the executable. Set <code className="rounded bg-line px-1.5 py-0.5 text-xs text-ink">NEXA_API_KEY</code>{" "}
              there and nowhere else.
            </p>
          </article>
        </div>
      </Section>

      <Section
        title="Prefer to build from source?"
        subtitle="A Python virtual environment plus a frontend build is all it takes. The repository also ships a one-command PyInstaller build."
        className="bg-shell"
      >
        <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
          <article className="min-w-0 rounded-3xl border border-line bg-panel p-6 shadow-soft">
            <h3 className="text-lg font-semibold text-ink">Run from source</h3>
            <CodeBlock
              className="mt-4"
              code={`python -m venv venv\nvenv\\Scripts\\python.exe -m pip install -r requirements.txt\ncd nexcoder\\ui && npm install && npm run build && cd ..\\..\nvenv\\Scripts\\python.exe -m nexcoder.main`}
            />
          </article>
          <article className="min-w-0 rounded-3xl border border-line bg-panel p-6 shadow-soft">
            <h3 className="text-lg font-semibold text-ink">Package it yourself</h3>
            <p className="mt-3 text-sm leading-6 text-muted">
              The one-command build writes the packaged app to{" "}
              <code className="rounded bg-line px-1.5 py-0.5 text-xs text-ink">dist\NexCoder</code>.
            </p>
            <CodeBlock code={"python build.py"} className="mt-4" />
          </article>
        </div>
      </Section>

      <Section
        id="model-api"
        title="Models: hosted or local"
        subtitle="NexCoder defaults to the hosted, OpenAI-compatible coding-model endpoint. Prefer full offline? Serve a GGUF model locally and point NEXA_API_URL at it - nothing else changes."
      >
        <div className="grid gap-5 lg:grid-cols-2">
          <article className="rounded-3xl border border-line bg-panel p-6 shadow-soft">
            <h3 className="text-lg font-semibold text-ink">Hosted endpoint (default)</h3>
            <p className="mt-3 text-sm leading-6 text-muted">
              Production clients talk to{" "}
              <code className="rounded bg-line px-1.5 py-0.5 text-xs text-ink">
                https://nexcoder.trynexa-ai.com/v1
              </code>{" "}
              - no local model or GPU required. Set{" "}
              <code className="rounded bg-line px-1.5 py-0.5 text-xs text-ink">NEXA_API_KEY</code> in your
              local .env and you are done.
            </p>
          </article>
          <article className="rounded-3xl border border-line bg-panel p-6 shadow-soft">
            <h3 className="text-lg font-semibold text-ink">Local GGUF server</h3>
            <p className="mt-3 text-sm leading-6 text-muted">
              The NexCoder MoE coding model (3B active parameters) runs on 32GB RAM plus a
              consumer GPU by keeping the KV cache in system RAM. The server is
              OpenAI-compatible, so other coding agents can share it too.
            </p>
          </article>
        </div>
        <p className="mt-8 max-w-2xl text-sm leading-6 text-muted">
          By downloading NexCoder you agree to the{" "}
          <a href="https://trynexa-ai.com/terms" className="underline underline-offset-4 hover:text-ink">
            license terms
          </a>{" "}
          and{" "}
          <a href="https://trynexa-ai.com/privacy" className="underline underline-offset-4 hover:text-ink">
            privacy policy
          </a>
          .
        </p>
      </Section>
    </>
  );
}
