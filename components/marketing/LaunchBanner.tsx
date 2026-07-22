import Link from "next/link";
import ReleaseCountdown from "./ReleaseCountdown";

/** Slim site-wide launch banner shown above the nav on every marketing page. */
export default function LaunchBanner() {
  return (
    <div className="bg-[#050505] px-5 py-2.5 text-center text-sm text-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-3 gap-y-1">
        <span className="inline-flex h-2 w-2 flex-none rounded-full bg-accent-cyan" aria-hidden />
        <ReleaseCountdown variant="inline" />
        <Link
          href="/download"
          className="font-semibold text-accent-cyan underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-cyan"
        >
          Get ready →
        </Link>
      </div>
    </div>
  );
}
