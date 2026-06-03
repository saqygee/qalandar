import 'dotenv/config';
import * as vscode from "vscode";
import axios from "axios";
import { handleAIRequest } from "./request-handler";


console.log('=== DOTENV DEBUG ===');
console.log('ENVIRONMENT VARABLES:',process.env.OLLAMA_ENDPOINT_URL);


export async function activate(context: vscode.ExtensionContext) {
  const modelCheckKey: string = "qalandar.modelWarningShown";
  await context.globalState.update(modelCheckKey, false);

  const defaultModel: string =
    vscode.workspace.getConfiguration().get("qalandar.defaultModel") ?? "";

  // Check for model only once per session
  const alreadyWarned = context.globalState.get<boolean>(modelCheckKey);
  if (!alreadyWarned) {
    try {
      const result = await axios.get("http://localhost:11434/api/tags");
      const modelList: string[] =
        result.data?.models?.map((m: any) => m.name) || [];

      if (!modelList.includes(defaultModel)) {
        vscode.window.showErrorMessage(
          `⚠️ The model '${defaultModel}' is not installed in Ollama. Please run "ollama pull ${defaultModel}"`,
        );
      }

      await context.globalState.update(modelCheckKey, true); // Prevent repeat warning
    } catch (error) {
      console.error("Model check failed:", error);
    }
  }
  // Ask AI command
  const askAIHelper = vscode.commands.registerCommand(
    "qalandar.askAIHelper",
    async () => {
      await handleAIRequest(
        "Ask your coding question",
        "AI Code Assistant",
        true,
      );
    },
  );
  const askWithoutContext = vscode.commands.registerCommand(
    "qalandar.askWithoutContext",
    async () => {
      await handleAIRequest(
        "Ask your coding question without context",
        "AI Code Assistant",
        false,
      );
    },
  );

  context.subscriptions.push(
    askAIHelper,
    askWithoutContext,
    //! code integration for inline suggestions
    // vscode.languages.registerInlineCompletionItemProvider(
    //   { pattern: "**" },
    //   provider
    // )
  );
}
