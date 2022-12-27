import * as vscode from 'vscode';
import * as test_controller from './testController';

export function activate(context: vscode.ExtensionContext) {
	const controller = test_controller.create();
	context.subscriptions.push(controller);
}

export function deactivate() {}
