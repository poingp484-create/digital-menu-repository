import { cn } from "@/lib/cn";

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span aria-hidden="true" className="size-3 bg-accent" />
      <span className="text-[15px] font-semibold tracking-[0.28em]">GOKUDO</span>
    </span>
  );
}
