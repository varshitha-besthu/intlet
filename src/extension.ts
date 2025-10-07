import * as vscode from "vscode";
import { IntletViewProvider } from "./intletView";
import { Plan } from "./types/phases";

import * as path from "path";
import * as dotenv from "dotenv";
import { searchInFiles } from "./tools/projectTools";
import { analyzeFolder } from "./tools/projectAnalyzer";

dotenv.config({ path: path.join(__dirname, "..", ".env") });

class FakeGeminiClient {
  async generateText({ prompt }: { prompt: string }) {
    return {
      text: JSON.stringify({
        id: "plan-123",
        title: "Fake demo plan",
        phases: [
          {
            id: "phase-1",
            title: "Run npm install",
            kind: "shell",
            payload: { command: "npm install" },
          },
        ],
      }),
    };
  }
}


export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "intlet" is now active!');

  const disposable = vscode.commands.registerCommand(
    "traycer.generatePlan",
    async () => {
      try {
        console.log("Opened Traycer");
        const query = await vscode.window.showInputBox({
          prompt: "What do you want Gemini to plan?",
          placeHolder: "e.g., add a new command to my VS Code extension",
        });

        if (!query) {
          vscode.window.showInformationMessage("No query provided.");
          return;
        }

        const client = new FakeGeminiClient();

        vscode.window.withProgress(
          {
            location: vscode.ProgressLocation.Notification,
            title: "Generating plan with Gemini...",
            cancellable: false,
          },
          async () => {
            const plan: Plan = {
              id: "veat",
              title : "This is business",
              phases : [{
                id : "phase1",
                title : "hehe",
                kind : "git",
                payload: { commands : ["npm install" ]},
                
            }]
          }
            vscode.window.showInformationMessage(
              `Plan generated: ${plan.title ?? plan.id} with ${plan.phases.length} phases`
            );
            console.log("Generated Plan:", plan);
          }
        );
      } catch (err: any) {
        vscode.window.showErrorMessage("Failed to generate plan: " + err.message);
      }
    }
  );

  let disposable2 = vscode.commands.registerCommand('folderAnalyzer.analyze', async () => {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    
    if (!workspaceFolders) {
      vscode.window.showErrorMessage('Please open a folder or workspace first');
      return;
    }
    
    const rootPath = workspaceFolders[0].uri.fsPath;
    
    vscode.window.withProgress({
      location: vscode.ProgressLocation.Notification,
      title: "Analyzing folder structure...",
      cancellable: true
    }, async (progress, token) => {
      try {
        const folderStructure = await analyzeFolder(rootPath);
        console.log(folderStructure);

      }catch(error){
        console.log("error occured while exploring the folder Structure");
      }
    })
  });

  const monster = vscode.commands.registerCommand(
    "traycer.checksearchdir",
    () => {
      const sera =  searchInFiles("No code only plan");
      console.log("Searching bro can't you wait");
      console.log("Search results:", sera);
      vscode.window.showInformationMessage(`Found in ${Object.keys(sera).length} files`);
    }
  )
  const sidebar = vscode.window.registerWebviewViewProvider(
	  "intletView",
	  new IntletViewProvider(context)
	);
	
	const helloCommand = vscode.commands.registerCommand(
		"intlet.helloWorld",
		() => {
			vscode.window.showInformationMessage("Hello World from intlet!");
		}
	);
  
	context.subscriptions.push(disposable);
	context.subscriptions.push(helloCommand);
	context.subscriptions.push(sidebar);
  context.subscriptions.push(monster);
  context.subscriptions.push(disposable2);
}

export function deactivate() {}
