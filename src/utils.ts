
/**
 * Cleans a response string by removing code block markers, duplicate line prefixes,
 * and trailing incomplete symbols.
 *
 * @param {string} response - The response string to clean.
 * @param {string} linePrefix - The prefix of lines to remove if present.
 * @returns {string} - The cleaned response string.
 */
export function cleanResponse(response: string, linePrefix: string): string {
  if (!response) return "";

  // Remove code block markers
  let cleaned = response
    .replace(/```[\s\S]*?```/g, "") // Remove complete code blocks
    .replace(/^```[a-z]*\n?/, "") // Remove starting ```
    .replace(/\n```$/, "") // Remove ending ```
    .trim();

  // Remove any duplicate line prefix
  if (cleaned.startsWith(linePrefix)) {
    cleaned = cleaned.slice(linePrefix.length);
  }

  // Remove trailing incomplete symbols
  cleaned = cleaned
    .replace(/[,\s;]+$/, "")
    .replace(/[{\[\(]\s*$/, "")
    .trim();

  return cleaned;
}

/**
 * Strips code blocks from a given string.
 * @param text - The input string containing potential code blocks.
 * @returns The input string with code blocks removed.
 */
export function stripCodeBlock(text: string): string {
  return text
    .replace(/^```(?:[^\n]*)?\n?/g, "")  // Remove opening ``` and optional language
    .replace(/\n?```$/g, "")            // Remove closing ```
    .trim();
}
