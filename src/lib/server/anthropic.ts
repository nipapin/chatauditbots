import Anthropic from "@anthropic-ai/sdk";

let cachedClient: Anthropic | null = null;

export function getAnthropicClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY не задан. Добавьте его в .env.local и перезапустите dev-сервер.");
  }
  if (!cachedClient) {
    cachedClient = new Anthropic({ apiKey });
  }
  return cachedClient;
}

// Единственная используемая модель — быстрая и дешёвая Haiku, без выбора в UI.
// Настраивается через ANTHROPIC_MODEL в .env.local при необходимости сменить.
const MODEL = process.env.ANTHROPIC_MODEL || "claude-haiku-4-5-20251001";

export function resolveModel(): string {
  return MODEL;
}

export function extractText(content: Anthropic.Messages.ContentBlock[]): string {
  return content
    .filter((block): block is Anthropic.Messages.TextBlock => block.type === "text")
    .map((block) => block.text)
    .join("\n")
    .trim();
}
