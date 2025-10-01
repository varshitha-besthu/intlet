import * as vscode from 'vscode';

export class IntletViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'intletView';
  private _view?: vscode.WebviewView;

  constructor(private readonly _context: vscode.ExtensionContext) {}

  resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true
    };

    webviewView.webview.html = this.getHtmlForWebview(webviewView.webview);

    webviewView.webview.onDidReceiveMessage((message) => {
      switch (message.command) {
        case 'sendInput':
          vscode.window.showInformationMessage(`You typed: ${message.text}`);
          break;
      }
    });
  }

  private getHtmlForWebview(webview: vscode.Webview): string {
    return /* html */`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <style>
          body {
            font-family: sans-serif;
            padding: 10px;
          }
          input {
            width: 80%;
            padding: 6px;
          }
          button {
            padding: 6px 12px;
            margin-left: 5px;
          }
        </style>
      </head>
      <body>
        <input id="inputBox" type="text" placeholder="Type something..." />
        <button id="sendBtn">Send</button>

        <script>
          const vscode = acquireVsCodeApi();
          document.getElementById('sendBtn').addEventListener('click', () => {
            const text = document.getElementById('inputBox').value;
            vscode.postMessage({ command: 'sendInput', text });
          });
        </script>
      </body>
      </html>`;
  }
}
