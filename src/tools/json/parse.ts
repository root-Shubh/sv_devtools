// Shared message for empty input, so every tool says the same thing instead of a raw parser error.
export const EMPTY_INPUT_MESSAGE = "Nothing to process. Select text, or open a document that contains it.";

export function isBlank(text: string): boolean {
  return text.trim() === "";
}
