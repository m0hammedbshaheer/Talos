// DOCUMENTATION NOTE:
// Extracts structured citations from an uploaded PDF via OpenAI.

import { NextResponse } from "next/server";
import OpenAI from "openai";
import pdfParse from "pdf-parse";

export const runtime = "nodejs";

const MAX_BYTES = 10 * 1024 * 1024;
const MIN_TEXT_LEN = 100;
const BIB_FALLBACK_CHARS = 6000;
const BIB_MAX_CHARS = 8000;

const BIB_REGEX =
  /(?:references|bibliography|works cited|literature cited)\s*\n([\s\S]+?)(?:\n\s*appendix|\n\s*supplementary|\Z)/i;

const SYSTEM_PROMPT =
  "You are a scientific bibliography parser. Extract all references from the provided bibliography text. Return ONLY a valid JSON object with a 'citations' array. Each citation must have: { title: string, authors: string, year: number | null, doi: string | null }. If DOI not present, set to null. Return nothing except the JSON object.";

function stripMarkdownFences(raw: string): string {
  let s = raw.trim();
  s = s.replace(/^```(?:json)?\s*/i, "");
  s = s.replace(/\s*```\s*$/i, "");
  return s.trim();
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("pdf");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "No PDF file received" },
        { status: 400 },
      );
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: "PDF too large. Please upload under 10MB." },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const pdfData = await pdfParse(buffer);
    const text = (pdfData.text ?? "").trim();

    if (text.length < MIN_TEXT_LEN) {
      return NextResponse.json(
        {
          error:
            "This PDF appears to be a scanned image. Please use a text-based PDF.",
        },
        { status: 400 },
      );
    }

    const match = text.match(BIB_REGEX);
    let bibliographyText = match?.[1]?.trim() ?? "";
    if (!bibliographyText) {
      bibliographyText = text.slice(-BIB_FALLBACK_CHARS);
    }
    bibliographyText = bibliographyText.slice(0, BIB_MAX_CHARS);

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY is not configured");
    }

    const openai = new OpenAI({ apiKey });
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      temperature: 0,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Extract all references from this bibliography:\n\n${bibliographyText}`,
        },
      ],
    });

    const rawContent = completion.choices[0]?.message?.content;
    if (!rawContent) {
      throw new Error("Empty OpenAI response");
    }

    const jsonStr = stripMarkdownFences(rawContent);
    const parsed = JSON.parse(jsonStr) as { citations?: unknown };
    const citations = Array.isArray(parsed.citations) ? parsed.citations : [];

    return NextResponse.json({
      citations,
      totalFound: citations.length,
    });
  } catch {
    return NextResponse.json(
      { error: "An unexpected error occurred while processing the PDF." },
      { status: 500 },
    );
  }
}
