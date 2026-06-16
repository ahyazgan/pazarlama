"use client";

import { LEVEL_LABEL, type BrainScore } from "@/lib/brain-score";

const BAR: Record<BrainScore["level"], string> = {
  zayif: "bg-red-400",
  orta: "bg-amber-400",
  iyi: "bg-lime-500",
  guclu: "bg-green-600",
};

export function BrainMeter({ score }: { score: BrainScore }) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold">
          Beyin Doluluğu: {score.score}/100{" "}
          <span className="text-neutral-500">({LEVEL_LABEL[score.level]})</span>
        </span>
      </div>
      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-neutral-200">
        <div
          className={`h-full rounded-full transition-all ${BAR[score.level]}`}
          style={{ width: `${score.score}%` }}
        />
      </div>
      {score.missing.length > 0 ? (
        <div className="mt-3">
          <p className="text-xs font-medium text-neutral-600">
            Beyni güçlendir (en getirili eksikler):
          </p>
          <ul className="mt-1 space-y-1 text-xs text-neutral-600">
            {score.missing.slice(0, 4).map((m) => (
              <li key={m.label}>
                <span className="font-medium text-brand-dark">+{m.points}</span> {m.label} —{" "}
                {m.hint}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="mt-3 text-xs text-green-600">Beyin tam dolu — çıktı en az generic olur. ✓</p>
      )}
    </div>
  );
}
