import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { rateLimited } from "@/lib/rate-limit";
import { buildSystemPrompt } from "@/lib/prompt";
import { EMAIL_SCHEMA, buildEmailUser, buildDemoEmail } from "@/lib/email";
import type { EmailRequest } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6";

export async function POST(request: Request) {
  const limited = rateLimited(request);
  if (limited) return limited;

  let body: EmailRequest;
  try {
    body = (await request.json()) as EmailRequest;
  } catch {
    return NextResponse.json({ error: "Gecersiz istek govdesi." }, { status: 400 });
  }
  if (!body.brand?.name) return NextResponse.json({ error: "Marka eksik." }, { status: 400 });
  if (!body.topic?.trim()) return NextResponse.json({ error: "Konu bos olamaz." }, { status: 400 });
  if (!body.sequenceType) return NextResponse.json({ error: "Dizi turu secilmeli." }, { status: 400 });

  if (body.demo) return NextResponse.json(buildDemoEmail(body));

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
      messages: [{ role: "user", content: buildEmailUser(body) }],
      output_format: {
        type: "json_schema",
        schema: EMAIL_SCHEMA as unknown as Record<string, unknown>,
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
