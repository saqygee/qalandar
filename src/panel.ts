import * as vscode from "vscode";

const getPanelSnippet = (escapedCode: string): string => `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <style>
      body { font-family: sans-serif; padding: 10px; }
      pre { background: #1e1e1e; color: #d4d4d4; padding: 12px; border-radius: 6px; overflow: auto; max-height: 60vh; }
      button { margin-right: 10px; padding: 6px 12px; font-size: 14px; }
      .buttons { margin-top: 15px; }
    </style>
  </head>
  <body>
    <h3>AI Suggested Code:</h3>
    <pre><code>${escapedCode}</code></pre>
    <div class="buttons">
      <button onclick="vscode.postMessage({ action: 'insert' })">Insert</button>
      <button onclick="vscode.postMessage({ action: 'replace' })">Replace</button>
      <button onclick="vscode.postMessage({ action: 'close' })">Close</button>
    </div>
    <script>
      const vscode = acquireVsCodeApi();
    </script>
  </body>
  </html>
`;

export function showAIResponseWebView(
  code: string,
  selection: vscode.Selection,
) {
  const editor = vscode.window.activeTextEditor;

  const panel = vscode.window.createWebviewPanel(
    "aiResponse",
    "AI Code Assistant Response",
    vscode.ViewColumn.Beside,
    { enableScripts: true },
  );

  const escapedCode = code.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  panel.webview.html = getPanelSnippet(escapedCode);

  panel.webview.onDidReceiveMessage(async (message) => {
    console.log("message-action:", message);
    console.log("editor:", editor);
    if (!editor) {
      return;
    }

    if (message.action === "close") {
      panel.dispose();
    }

    await editor.edit((editBuilder) => {
      if (message.action === "replace") {
        console.log("selectionXXX:", selection.isEmpty);
        if (!selection.isEmpty) {
          editBuilder.replace(selection, code);
        } else {
          editBuilder.insert(selection.active, code);
        }
      } else if (message.action === "insert") {
        const insertPos = selection.end;
        editBuilder.insert(insertPos, "\n" + code);
      }
    });

    panel.dispose();
  });
}
