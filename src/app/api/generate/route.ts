import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import {
  buildSystemPrompt,
  buildUserPrompt,
  OUTPUT_SCHEMA,
} from "@/lib/prompt";
import type { ContentOutputs, GenerateRequest } from "@/lib/types";

// Uretim sunucu tarafinda; Node runtime gerekir (Anthropic SDK).
export const runtime = "nodejs";
export const maxDuration = 60;

// Constitution: uretim modeli claude-sonnet-4-6 (env ile override edilebilir).
const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6";

function validate(req: Partial<GenerateRequest>): string | null {
  if (!req.brand?.name) return "Marka adi eksik. Once Marka Profili'ni doldur.";
  if (!req.topic?.trim()) return "Konu (topic) bos olamaz.";
  if (!req.contentType) return "Icerik tipi secilmeli.";
  if (!req.angle) return "Aci secilmeli.";
  return null;
}

export async function POST(request: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "ANTHROPIC_API_KEY tanimli degil. Sunucu ortam degiskenlerine ekleyip yeniden deneyin.",
      },
      { status: 503 },
    );
  }

  let body: GenerateRequest;
  try {
    body = (await request.json()) as GenerateRequest;
  } catch {
    return NextResponse.json({ error: "Gecersiz istek govdesi." }, { status: 400 });
  }

  const problem = validate(body);
  if (problem) return NextResponse.json({ error: problem }, { status: 400 });

  const client = new Anthropic({ apiKey });

  try {
    const response = await client.beta.messages.create({
      model: MODEL,
      max_tokens: 16000,
      // Structured outputs su an beta; parse edilebilir JSON garantisi (Constitution Bolum 8).
      betas: ["structured-outputs-2025-11-13"],
      system: buildSystemPrompt(body),
      messages: [{ role: "user", content: buildUserPrompt(body) }],
      output_format: {
        type: "json_schema",
        schema: OUTPUT_SCHEMA as unknown as Record<string, unknown>,
      },
    });

    if (response.stop_reason === "refusal") {
      return NextResponse.json(
        { error: "Model bu istegi reddetti. Konuyu/aciyi degistirip tekrar deneyin." },
        { status: 422 },
      );
    }

    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return NextResponse.json(
        { error: "Modelden metin ciktisi alinamadi." },
        { status: 502 },
      );
    }

    let outputs: ContentOutputs;
    try {
      outputs = JSON.parse(textBlock.text) as ContentOutputs;
    } catch {
      return NextResponse.json(
        { error: "Cikti JSON olarak ayristirilamadi." },
        { status: 502 },
      );
    }

    return NextResponse.json({
      topic: body.topic,
      contentType: body.contentType,
      angle: body.angle,
      outputs,
    });
  } catch (err) {
    const message =
      err instanceof Anthropic.APIError
        ? `AI hatasi (${err.status}): ${err.message}`
        : "Beklenmeyen bir hata olustu.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
