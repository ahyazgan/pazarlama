"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { HAMMADDEM_SAMPLE, saveBrandLocal } from "@/lib/brand-store";
import { getSector } from "@/lib/sectors";
import { recommendAngle } from "@/lib/strategy";
import { evaluatePackage, runAgentTeam } from "@/lib/agent-team";
import { ANGLE_LABELS, type ContentPackage, type GenerateRequest } from "@/lib/types";

// Tek tık: örnek markayı yükle → ajan ekibini demo modda çalıştır → çıktıya götür.
// Anahtarsız çalışır; tüm zinciri (marka beyni → stratejist → copy → editör → düzeltmen) gösterir.
export function QuickStart() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const run = async () => {
    setLoading(true);
    setError(false);
    try {
      const brand = saveBrandLocal({ ...HAMMADDEM_SAMPLE });
      const topic = "Geç teslimat riski ve tedarik güvenliği";
      const rec = recommendAngle(getSector(brand.sector), topic, [], {});
      const base: GenerateRequest = {
        brand,
        topic,
        contentType: "deger",
        angle: rec.value,
        personaIndex: 0,
        demo: true,
      };

      const postGenerate = async (r: GenerateRequest): Promise<ContentPackage> => {
        const res = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...r, demo: true }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Üretim başarısız.");
        return data as ContentPackage;
      };

      const teamRun = await runAgentTeam(base, {
        generate: postGenerate,
        evaluate: evaluatePackage, // demo: deterministik editör
        threshold: 80,
        maxRounds: 2,
        strategist: (rq) => ({
          req: { ...rq, angle: rec.value },
          note: `Açı: ${ANGLE_LABELS[rec.value]} — ${rec.reason}`,
        }),
      });

      sessionStorage.removeItem("content-os.results");
      sessionStorage.removeItem("content-os.team-runs");
      sessionStorage.setItem("content-os.result", JSON.stringify(teamRun.final));
      sessionStorage.setItem("content-os.team-run", JSON.stringify(teamRun));
      router.push("/output");
    } catch {
      setError(true);
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <button type="button" className="btn-primary" onClick={run} disabled={loading}>
        {loading ? "Hazırlanıyor…" : "⚡ Hammaddem ile örnek paket üret (ajan ekibi)"}
      </button>
      {error && (
        <span className="text-xs text-red-600">Üretim başarısız oldu, tekrar deneyin.</span>
      )}
    </div>
  );
}
