import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";
import { getGeminiClient } from "./gemini/client";
import { getPlanFromGemini } from "./gemini/getPlanFromGemini";

export class IntletViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = "intletView";
  private _view?: vscode.WebviewView;

  constructor(private readonly _context: vscode.ExtensionContext) {}

  resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [
        vscode.Uri.file(path.join(this._context.extensionPath, "webview-ui", "dist")),
      ],
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
    webviewView.webview.onDidReceiveMessage(async (message) => {
    switch (message.type) {
      case "generatePlan":
        {
          const { id, query } = message;
          if (!query || query.trim() === "") {
            this._view?.webview.postMessage({
              type: "planGenerated",
              id,
              error: "Query cannot be empty",
            });
            return;
          }
          const client = getGeminiClient();
          try {
            const plan = await getPlanFromGemini(client, query);

            webviewView.webview.postMessage({
              type: "planGenerated",
              id,
              plan: plan,
            });
          } catch (err: any) {
            webviewView.webview.postMessage({
              type: "planGenerated",
              id,
              error: err.message,
            });
          }
        }
        break;
    }
  });
}

  private _getHtmlForWebview(webview: vscode.Webview): string {
    const distPath = path.join(this._context.extensionPath, "webview-ui", "dist");
    const indexPath = path.join(distPath, "index.html");
    console.log("Html web view is loading...")
    let html = fs.readFileSync(indexPath, "utf8");
    
    html = html.replace(/(["'])(\/assets\/[^"']+\.(js|css))\1/g, (match, quote, assetPath) => {
    const fullPath = path.join(distPath, assetPath.replace(/^\//, ""));
    const webviewUri = webview.asWebviewUri(vscode.Uri.file(fullPath));
    return `${quote}${webviewUri.toString()}${quote}`;
  });
    
    console.log(html);
    return html;
  }


}
