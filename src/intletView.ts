import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";

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
  }

  private _getHtmlForWebview(webview: vscode.Webview): string {
    const distPath = path.join(this._context.extensionPath, "webview-ui", "dist");
    const indexPath = path.join(distPath, "index.html");

    let html = fs.readFileSync(indexPath, "utf8");

    // Replace relative paths with webview-safe URIs
    html = html.replace(/(src|href)="([^"]+)"/g, (match, p1, p2) => {
      if (p2.startsWith("http") || p2.startsWith("data:")) {
        return match; // leave external URLs untouched
      }
      const assetPath = vscode.Uri.file(path.join(distPath, p2));
      return `${p1}="${webview.asWebviewUri(assetPath)}"`;
    });

    return html;
  }
}
