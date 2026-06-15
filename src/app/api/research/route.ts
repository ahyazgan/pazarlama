import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { rateLimited } from "@/lib/rate-limit";
import {
  buildResearchSystem,
  buildResearchUser,
  parseResearchBrief,
} from "@/lib/research-prompt";
import type { Brand } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6";

export async function POST(request: Request) {
  const limited = rateLimited(request);
  if (limited) return limited;

  let body: { brand?: Brand; topic?: string };
  try {
    body = (await request.json()) as { brand?: Brand; topic?: string };
  } catch {
    return NextResponse.json({ error: "Gecersiz istek govdesi." }, { status: 400 });
  }
  if (!body.brand || !body.topic?.trim()) {
    return NextResponse.json({ error: "brand ve topic gerekli." }, { status: 400 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY tanimli degil. Arastirma turu anahtar gerektirir." },
      { status: 503 },
    );
  }

  const client = new Anthropic({ apiKey });
  const tools = [{ type: "web_search_20250305", name: "web_search" } as const];

  try {
    const messages: Anthropic.MessageParam[] = [
      { role: "user", content: buildResearchUser(body.brand, body.topic) },
    ];
    let response = await client.messages.create({
      model: MODEL,
      max_tokens: 8000,
      system: buildResearchSystem(body.brand),
      tools,
      messages,
    });

    // Server-tool dongusu: pause_turn gelirse devam et (en fazla 5 tur).
    for (let i = 0; i < 5 && response.stop_reason === "pause_turn"; i++) {
      messages.push({ role: "assistant", content: response.content });
      response = await client.messages.create({
        model: MODEL,
        max_tokens: 8000,
        system: buildResearchSystem(body.brand),
        tools,
        messages,
      });
    }

    const text = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("\n");
    const brief = parseResearchBrief(text, body.topic);
    if (!brief) {
      return NextResponse.json(
        { error: "Arastirma sonucu ayristirilamadi." },
        { status: 502 },
      );
    }
    return NextResponse.json(brief);
  } catch (err) {
    const message =
      err instanceof Anthropic.APIError
        ? `AI hatasi (${err.status}): ${err.message}`
        : "Beklenmeyen hata.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
