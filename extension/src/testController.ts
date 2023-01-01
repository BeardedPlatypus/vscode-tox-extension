import * as vscode from 'vscode';
import * as path from 'path';
import * as util from 'util';
import { TOX_FILE_NAME } from './common';


let core = require("./core.js");


export function create() {
    const controller = vscode.tests.createTestController("bearded_platypus.tox_test_controller", "Tox Runner");

    controller.resolveHandler = async (file) => {
        if (!file) {
            await discoverAllFilesInWorkspace();
        } else {
            await parseTestsInFileContents(file);
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

    type ToxTask = {
        full_env_name: string;
        pretty_name: string;
        line: number;
    }

    type ToxStructure = {
        name: string;
        sub_structures: ToxStructure[];
        sub_tests: ToxTask[];
    }

    async function parseTestsInFileContents(file: vscode.TestItem, contents?: string) {
        // If a document is open, VS Code already knows its contents. If this is being
        // called from the resolveHandler when a document isn't open, we'll need to
        // read them from disk ourselves.
        
        if (contents === undefined) {
            const rawContent = await vscode.workspace.fs.readFile(file.uri!);
            contents = new util.TextDecoder().decode(rawContent);
        }

        var constructedTests = new Map();

        function getExistingTest(id: string): vscode.TestItem | undefined {
            return constructedTests.get(id);
        }

        function createNewTest(id: string, label:string, uriFile?: vscode.Uri): vscode.TestItem {
            var test = controller.createTestItem(id, label, uriFile);
            constructedTests.set(id, test);
            return test;
        }

        function resolveTest(id: string, label:string, uriFile?: vscode.Uri): vscode.TestItem {
            return getExistingTest(id) ?? createNewTest(id, label, uriFile);
        }

        function buildTestItems(parentTestItem: vscode.TestItem, structure: ToxStructure) {
            let testItems: vscode.TestItem[] = [];

            for (const subStructure of structure.sub_structures) {
                const id = parentTestItem.id + "/" + subStructure.name;
                const subStructureTestItem = resolveTest(id, subStructure.name, file.uri);
                buildTestItems(subStructureTestItem, subStructure);
                testItems.push(subStructureTestItem);
            }

            for (const subTest of structure.sub_tests) {
                const id = parentTestItem.id + "/" + subTest.full_env_name;
                var taskItem = resolveTest(id, subTest.pretty_name, file.uri);
                taskItem.range = new vscode.Range(subTest.line, 0, subTest.line, 0);
                testItems.push(taskItem);
            }

            parentTestItem.children.replace(testItems);
        }

		var rootStructure = core.ToxParserLib.parseToxStructure("tox.ini", contents);
        buildTestItems(file, rootStructure);
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