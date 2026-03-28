/**
 * PDF extract uses the OpenAI-compatible Chat Completions API.
 * Set LLM_* (or OPENAI_*) for OpenAI, Groq, NVIDIA NIM, xAI Grok, etc.
 */

export type LlmExtractConfig = {
  apiKey: string;
  /** Omit for default OpenAI (https://api.openai.com/v1). */
  baseURL?: string;
  model: string;
  /** If false, skip response_format json_object (some OpenAI-compatible hosts reject it). */
  jsonMode: boolean;
  /** Max tokens for the completion (Groq console often uses 8192). */
  maxCompletionTokens: number;
  /** Groq `openai/gpt-oss-*` etc.: optional `reasoning_effort` (LLM_REASONING_EFFORT). */
  reasoningEffort?: "low" | "medium" | "high";
};

export function loadLlmExtractConfig():
  | { ok: true; config: LlmExtractConfig }
  | { ok: false; error: string } {
  const apiKey =
    process.env.LLM_API_KEY?.trim() ||
    process.env.OPENAI_API_KEY?.trim() ||
    "";
  if (!apiKey) {
    return {
      ok: false,
      error:
        "No LLM API key. Set LLM_API_KEY or OPENAI_API_KEY in .env.local. For Groq / NVIDIA / xAI, also set LLM_BASE_URL and LLM_MODEL (see .env.local.example). Restart the dev server after changes.",
    };
  }

  const baseRaw =
    process.env.LLM_BASE_URL?.trim() ||
    process.env.OPENAI_BASE_URL?.trim() ||
    "";
  const baseURL = baseRaw || undefined;

  const model =
    process.env.LLM_MODEL?.trim() ||
    process.env.OPENAI_MODEL?.trim() ||
    "gpt-4o";

  const jsonMode = process.env.LLM_JSON_MODE?.trim() !== "false";

  const maxRaw = process.env.LLM_MAX_COMPLETION_TOKENS?.trim();
  const maxCompletionTokens = maxRaw
    ? Math.min(32768, Math.max(256, Number(maxRaw) || 8192))
    : 8192;

  const re = process.env.LLM_REASONING_EFFORT?.trim().toLowerCase();
  const reasoningEffort =
    re === "low" || re === "medium" || re === "high" ? re : undefined;

  return {
    ok: true,
    config: {
      apiKey,
      baseURL,
      model,
      jsonMode,
      maxCompletionTokens,
      reasoningEffort,
    },
  };
}
