import * as vscode from "vscode";
import axios from "axios";
import {cleanResponse} from "./utils";
const inlineModel: string =
  vscode.workspace.getConfiguration().get("qalandar.inlineSuggestionModel") ??
  "";
// Inline suggestions (shadow Copilot-like)
const provider: vscode.InlineCompletionItemProvider = {
  provideInlineCompletionItems: async (document, position) => {
    const linePrefix = document
      .lineAt(position)
      .text.slice(0, position.character);

    // Early return for empty cases
    if (!linePrefix.trim()) return { items: [] };

    const fullTextPrefix = document.getText(
      new vscode.Range(new vscode.Position(0, 0), position),
    );

    const languageId = document.languageId;

    const systemPrompt = `You are an AI code completion assistant. Strict rules:
  1. Analyze the FULL CONTEXT but ONLY complete what comes after the cursor.
  2. NEVER repeat any part of the existing code (before cursor).
  3. ONLY provide the exact text that should appear immediately after the cursor.
  4. NEVER include code block markers (\`\`\`) or (\`\`).
  5. Keep the completion short and minimal (1-2 lines usually).
  6. Maintain perfect syntax consistency with the existing code.
  7. Strictly provide code no explanation.`;

    const userPrompt = `Language: ${languageId}
  Full file context (read-only):\n${fullTextPrefix}

  The user has just typed:\n"${linePrefix}"
  Predict only what comes next (DO NOT REPEAT the above):`;

    try {
      const response = await axios.post(
        "http://localhost:11434/v1/chat/completions",
        {
          model: inlineModel,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          stream: true,
          temperature: 0.2,
          top_k: 10,
          top_p: 0.7,
          max_tokens: 25, // Increased slightly for better completions
        },
        { responseType: "stream" },
      );

      let buffer = "";
      const completionItems: vscode.InlineCompletionItem[] = [];
      const stream = response.data;

      return new Promise((resolve) => {
        stream.on("data", (chunk: Buffer) => {
          try {
            const lines = chunk.toString().split("\n");
            for (const line of lines) {
              if (line.startsWith("data:") && !line.includes("[DONE]")) {
                const data = JSON.parse(line.substring(5).trim());
                const content = data.choices?.[0]?.delta?.content || "";
                if (content) {
                  buffer += content;

                  // Early preview of partial results
                  const cleanSuggestion = cleanResponse(buffer, linePrefix);
                  console.log("buffer##: ", cleanSuggestion);
                  if (cleanSuggestion) {
                    completionItems[0] = new vscode.InlineCompletionItem(
                      cleanSuggestion,
                      new vscode.Range(position, position),
                    );
                    resolve(new vscode.InlineCompletionList(completionItems));
                  }
                }
              }
            }
          } catch (e) {
            console.error("Stream parsing error:", e);
          }
        });

        stream.on("end", () => {
          const finalSuggestion = buffer; //cleanResponse(buffer, linePrefix);
          console.log("predicted: ", finalSuggestion);
          if (finalSuggestion) {
            resolve(
              new vscode.InlineCompletionList([
                new vscode.InlineCompletionItem(
                  finalSuggestion,
                  new vscode.Range(position, position),
                ),
              ]),
            );
          } else {
            resolve({ items: [] });
          }
        });

        stream.on("error", (err: any) => {
          console.error("Stream error:", err);
          resolve({ items: [] });
        });
      });
    } catch (error) {
      console.error("Inline suggestion error:", error);
      return { items: [] };
    }
  },
};
