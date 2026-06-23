import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { rateLimited } from "@/lib/rate-limit";
import {
  buildCritiqueSystem,
  buildCritiqueUser,
  CRITIQUE_SCHEMA,
} from "@/lib/critique";
import type { Brand, ContentPackage, CritiqueResult } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6";

export async function POST(request: Request) {
  const limited = rateLimited(request);
  if (limited) return limited;

  let body: { brand?: Brand; pkg?: ContentPackage };
  try {
    body = (await request.json()) as { brand?: Brand; pkg?: ContentPackage };
  } catch {
    return NextResponse.json({ error: "Gecersiz istek govdesi." }, { status: 400 });
  }
  if (!body.brand || !body.pkg) {
    return NextResponse.json({ error: "brand ve pkg gerekli." }, { status: 400 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "ANTHROPIC_API_KEY tanimli degil. Deterministik kalite-lint kullanin veya anahtari ekleyin.",
      },
      { status: 503 },
    );
  }

  const client = new Anthropic({ apiKey });
  try {
    const response = await client.beta.messages.create({
      model: MODEL,
      max_tokens: 8000,
      betas: ["structured-outputs-2025-11-13"],
      system: buildCritiqueSystem(body.brand),
      messages: [{ role: "user", content: buildCritiqueUser(body.brand, body.pkg) }],
      output_format: {
        type: "json_schema",
        schema: CRITIQUE_SCHEMA as unknown as Record<string, unknown>,
      },
    });

    if (response.stop_reason === "refusal") {
      return NextResponse.json({ error: "Model istegi reddetti." }, { status: 422 });
    }
    const block = response.content.find((b) => b.type === "text");
    if (!block || block.type !== "text") {
      return NextResponse.json({ error: "Modelden cikti alinamadi." }, { status: 502 });
    }
    return NextResponse.json(JSON.parse(block.text) as CritiqueResult);
  } catch (err) {
    const message =
      err instanceof Anthropic.APIError
        ? `AI hatasi (${err.status}): ${err.message}`
        : "Beklenmeyen hata.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
