type CodeBlockProps = {
  code: string;
  className?: string;
};

export default function CodeBlock({ code, className = "" }: CodeBlockProps) {
  return (
    <pre
      className={`overflow-x-auto rounded-2xl border border-white/10 bg-[#0b0b10] p-4 text-sm leading-6 text-[#d7e3ff] ${className}`}
    >
      <code>{code}</code>
    </pre>
  );
}
