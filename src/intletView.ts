import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";
import { getPlanFromGemini } from "./gemini/getPlanFromGemini";
import { getProjectContext } from "./getProjectInfo";
import { executePhase } from "./agent/agenticLoop";
import { Plan } from "./types/phases";
import { openAiClient } from "./gemini/client";

export class IntletViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = "intletView";
  private _view?: vscode.WebviewView;
  private currentPlan: Plan | null = null;


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
        vscode.Uri.file(
          path.join(this._context.extensionPath, "webview-ui", "dist")
        ),
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
            const client = openAiClient();
            console.log("created the openAICLient");
            try {
              const projectContext = (await getProjectContext());

              console.log("project Context", projectContext);
              const plan = await getPlanFromGemini(client, query, 2, JSON.stringify(projectContext), false);
              this.currentPlan = plan;

              console.log("plan", plan)
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
        
        case "executePhase":
          {
            const { runId, planId, phaseId } = message;
            try{
               console.log("Gonna execute the phase");
                
                const context = await getProjectContext();
                const client = openAiClient();

                if(!this.currentPlan) return;

                const phase = this.currentPlan.phases.find((p) => p.id === phaseId);
                if (!phase) return;

                const subPhase = await executePhase(phase, context, client);
                
                webviewView.webview.postMessage({
                  type: "subPhaseGenerated",
                  runId,
                  phaseId,
                  subPhase: subPhase
                });

            }catch (err: any) {
              webviewView.webview.postMessage({
                type: "subPlanGenerated",
                runId,
                planId,
                error: err.message,
              });
            }
           
            
           
          }
          break;

       
  }});


    
  }

  private _getHtmlForWebview(webview: vscode.Webview): string {
    const distPath = path.join(
      this._context.extensionPath,
      "webview-ui",
      "dist"
    );
    const indexPath = path.join(distPath, "index.html");
    console.log("Html web view is loading...");
    let html = fs.readFileSync(indexPath, "utf8");

    html = html.replace(
      /(["'])(\/assets\/[^"']+\.(js|css))\1/g,
      (match, quote, assetPath) => {
        const fullPath = path.join(distPath, assetPath.replace(/^\//, ""));
        const webviewUri = webview.asWebviewUri(vscode.Uri.file(fullPath));
        return `${quote}${webviewUri.toString()}${quote}`;
      }
    );

    console.log(html);
    return html;
  }
}
