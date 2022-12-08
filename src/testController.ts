import * as vscode from 'vscode';
import * as path from 'path';
import * as util from 'util';
import { TOX_FILE_NAME } from './common';

export function create() {
    const controller = vscode.tests.createTestController("bearded_platypus.tox_test_controller", "Tox");

    controller.resolveHandler = async (test) => {
        if (!test) {
            await discoverAllFilesInWorkspace();
        } else {
            await parseTestsInFileContents(test);
        }
    };

    // When text documents are open, parse tests in them.
    vscode.workspace.onDidOpenTextDocument(parseTestsInDocument);
    // We could also listen to document changes to re-parse unsaved changes:
    vscode.workspace.onDidChangeTextDocument(e => parseTestsInDocument(e.document));

    function parseTestsInDocument(e: vscode.TextDocument, filename: string = 'tox.ini') {
		if (e.uri.scheme === 'file' && path.basename(e.uri.fsPath) === filename) {
            parseTestsInFileContents(resolveFile(e.uri), e.getText());
        }
    }
    
    async function parseTestsInFileContents(file: vscode.TestItem, contents?: string) {
        // If a document is open, VS Code already knows its contents. If this is being
        // called from the resolveHandler when a document isn't open, we'll need to
        // read them from disk ourselves.
        
        if (contents === undefined) {
            const rawContent = await vscode.workspace.fs.readFile(file.uri!);
            contents = new util.TextDecoder().decode(rawContent);
        }
        
        // some custom logic to fill in test.children from the contents...
        let testItems: vscode.TestItem[] = [];
		
        const newTestItem = controller.createTestItem("test", "test", file.uri);
        testItems.push(newTestItem);

        return testItems;
    }

    function getExistingFile(uri: vscode.Uri): vscode.TestItem | undefined {
        return controller.items.get(uri.toString());
    }

    function createFile(uri: vscode.Uri): vscode.TestItem {
        const id: string = uri.toString();
        const label: string = uri.path.split('/').pop()!;
        const file = controller.createTestItem(id, label, uri);
        controller.items.add(file);
        
        file.canResolveChildren = true;
        return file;
    }

    function resolveFile(uri: vscode.Uri): vscode.TestItem {
        return getExistingFile(uri) ?? createFile(uri);
    }

    function deleteFile(uri: vscode.Uri) {
        controller.items.delete(uri.toString());
    }

    function createWatcher(pattern: vscode.RelativePattern) : vscode.FileSystemWatcher {
        const watcher = vscode.workspace.createFileSystemWatcher(pattern);
        watcher.onDidCreate(resolveFile);
        watcher.onDidChange(uri => parseTestsInFileContents(resolveFile(uri)));
        watcher.onDidDelete(deleteFile);

        return watcher;
    }

    async function discoverAllFilesInWorkspace() {
        if (!vscode.workspace.workspaceFolders) {
            // No open folders thus no tox files.
            return [];
        }

        return Promise.all(
            vscode.workspace.workspaceFolders.map(
                async workspaceFolder => {
                    const pattern = new vscode.RelativePattern(workspaceFolder, TOX_FILE_NAME);
                    const watcher = createWatcher(pattern);

                    for (const file of await vscode.workspace.findFiles(pattern)) {
                        resolveFile(file);
                    }

                    return watcher;
                }
            )
        );
    }

    return controller;
}