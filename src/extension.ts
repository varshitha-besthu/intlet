import * as vscode from 'vscode';
import { IntletViewProvider } from './intletView';

export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "intlet" is now active!');
	

	const sidebar = vscode.window.registerWebviewViewProvider(
			"intletView",
			new IntletViewProvider(context)
	)

	const helloCommand = vscode.commands.registerCommand('intlet.helloWorld', () => {
		vscode.window.showInformationMessage('Hello World from intlet!');
	});

	context.subscriptions.push(helloCommand);
	context.subscriptions.push(sidebar);
}

export function deactivate() {}
