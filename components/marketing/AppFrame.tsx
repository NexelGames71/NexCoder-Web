type AppFrameProps = {
  src: string;
  alt: string;
  label?: string;
  className?: string;
};

export default function AppFrame({ src, alt, label = "NexCoder", className = "" }: AppFrameProps) {
  return (
    <figure className={`overflow-hidden rounded-2xl border border-white/10 bg-[#0b0b10] shadow-[0_32px_120px_rgba(80,70,255,0.22)] ${className}`}>
      <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
        <span className="h-3 w-3 rounded-full bg-white/15" aria-hidden />
        <span className="h-3 w-3 rounded-full bg-white/15" aria-hidden />
        <span className="h-3 w-3 rounded-full bg-white/15" aria-hidden />
        <span className="ml-3 text-xs font-medium text-white/50">{label}</span>
      </div>
      <img src={src} alt={alt} className="block w-full" loading="lazy" />
    </figure>
  );
}
