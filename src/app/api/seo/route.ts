import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { buildSystemPrompt } from "@/lib/prompt";
import { SEO_SCHEMA, buildSeoUser, buildDemoSeo } from "@/lib/seo";
import type { SeoRequest } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6";

export async function POST(request: Request) {
  let body: SeoRequest;
  try {
    body = (await request.json()) as SeoRequest;
  } catch {
    return NextResponse.json({ error: "Gecersiz istek govdesi." }, { status: 400 });
  }
  if (!body.brand?.name) return NextResponse.json({ error: "Marka eksik." }, { status: 400 });
  if (!body.topic?.trim()) return NextResponse.json({ error: "Konu bos olamaz." }, { status: 400 });

  if (body.demo) return NextResponse.json(buildDemoSeo(body));

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY tanimli degil. Demo modunu kullanin veya anahtari ekleyin." },
      { status: 503 },
    );
  }

  const client = new Anthropic({ apiKey });
  try {
    const response = await client.beta.messages.create({
      model: MODEL,
      max_tokens: 6000,
      betas: ["structured-outputs-2025-11-13"],
      system: [
        { type: "text", text: buildSystemPrompt(body.brand), cache_control: { type: "ephemeral" } },
      ],
      messages: [{ role: "user", content: buildSeoUser(body) }],
      output_format: {
        type: "json_schema",
        schema: SEO_SCHEMA as unknown as Record<string, unknown>,
      },
    });
    if (response.stop_reason === "refusal") {
      return NextResponse.json({ error: "Model istegi reddetti." }, { status: 422 });
    }
    const block = response.content.find((b) => b.type === "text");
    if (!block || block.type !== "text") {
      return NextResponse.json({ error: "Modelden cikti alinamadi." }, { status: 502 });
    }
    return NextResponse.json(JSON.parse(block.text));
  } catch (err) {
    const message =
      err instanceof Anthropic.APIError
        ? `AI hatasi (${err.status}): ${err.message}`
        : "Beklenmeyen hata.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
