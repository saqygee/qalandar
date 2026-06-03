import * as vscode from "vscode";
import axios from "axios";
import { stripCodeBlock } from "./utils";
import { SYSTEM_PROMPT } from './prompts';
import {ollamaConfig} from './config';
import {showAIResponseWebView} from './panel';

export async function handleAIRequest(
  placeHolder: string,
  promptMessage: string,
  hasContext: boolean,
) {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    return vscode.window.showErrorMessage("No active editor");
  }
  const selection = editor.selection;
  const selectedText = editor.document.getText(selection);
  // Extract all text from the start of the document up to the selection
  const content = editor.document.getText();
  const userQuery = await vscode.window.showInputBox({
    placeHolder,
    prompt: promptMessage,
  });
  const isEqual = content === selectedText;

  if (!userQuery) {
    return;
  }

  const systemPrompt = SYSTEM_PROMPT;
  const userPrompt = `
${!isEqual ? `Full code context:\n${hasContext ? content : ""}` : ""}
${userQuery ? `Primary request (focus here): ${userQuery}` : ""}
${selectedText ? `SELECTED CODE TO MODIFY (MOST IMPORTANT):\n${selectedText}` : ""}
`;
  console.log("userPrompt: ", userPrompt);

  const model = vscode.workspace
    .getConfiguration()
    .get("qalandar.defaultModel");

 try {
    const result = await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: "AI is thinking...",
        cancellable: false,
      },
      async () => {
        const response = await axios.post(
         ollamaConfig.ollamaURL,
          {
            model,
            prompt: userPrompt,
            stream:ollamaConfig.stream,
            system: systemPrompt,
            options: {
              temperature:ollamaConfig.temperature,
              top_p:ollamaConfig.top_p,
              top_k:ollamaConfig.top_k,
              repeat_penalty:ollamaConfig.repeat_penalty,
              max_new_tokens:ollamaConfig.max_new_tokens,
            },
          },
        );
        console.log("response: ", response);

        return response.data?.response;
      },
    );

    if (!result) {
      return vscode.window.showErrorMessage("No response from AI.");
    }
    const cleanedCode = stripCodeBlock(result);
    showAIResponseWebView(cleanedCode, selection);
  } catch (error: any) {
    console.error("AI API error:", error);
    vscode.window.showErrorMessage(
      `Error calling AI: ${error.message || error}`,
    );
  }
}
