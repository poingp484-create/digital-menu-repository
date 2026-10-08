import fs from "node:fs";
import path from "node:path";
import Image from "next/image";
import { loops, shots, type LoopKey, type ShotKey } from "@/content/media";
import { cn } from "@/lib/cn";
import { LoopVideo } from "./motion/LoopVideo";

const ratioClass = {
  "16:9": "aspect-[16/9]",
  "4:5": "aspect-[4/5]",
  "3:4": "aspect-[3/4]",
  "4:3": "aspect-[4/3]",
  "1:1": "aspect-square",
  "9:16": "aspect-[9/16]",
} as const;

function exists(file: string) {
  return fs.existsSync(path.join(process.cwd(), "public", "media", file));
}

type MediaProps = {
  shot: ShotKey;
  className?: string;
  sizes?: string;
  priority?: boolean;
  /** Fill the positioned parent instead of keeping the shot's own ratio. */
  fill?: boolean;
};

export function Media({ shot, className, sizes = "100vw", priority, fill }: MediaProps) {
  const s = shots[shot];
  return (
    <div
      className={cn(
        "overflow-hidden bg-surface",
        fill ? "absolute inset-0" : cn("relative", ratioClass[s.ratio]),
        className,
      )}
    >
      {exists(s.file) ? (
        <Image
          src={`/media/${s.file}`}
          alt={s.alt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover"
        />
      ) : (
        <div
          role="img"
          aria-label={s.alt}
          className="media-placeholder absolute inset-0 flex items-end p-4"
        >
          <span className="font-mono text-[11px] text-muted">{s.file}</span>
        </div>
      )}
    </div>
  );
}

/** A muted background loop over its poster still. Falls back to the still. */
export function Loop({
  name,
  className,
  sizes,
  priority,
}: {
  name: LoopKey;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  const loop = loops[name];
  const poster = shots[loop.poster];
  const hasVideo = exists(loop.file);
  return (
    <div className={cn("absolute inset-0 overflow-hidden", className)}>
      <Media shot={loop.poster} fill sizes={sizes} priority={priority} />
      {hasVideo && (
        <LoopVideo
          src={`/media/${loop.file}`}
          poster={exists(poster.file) ? `/media/${poster.file}` : undefined}
        />
      )}
    </div>
  );
}
