import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
// import * as myExtension from '../../extension';
let core = require("../../core.js");



suite('Extension Test Suite', () => {
	vscode.window.showInformationMessage('Start all tests.');

	// TODO: Parametrize this for 'envlist =' and 'envlist=' etc.
	const envlist_without_factors = `
[tox]
min_version = 4.0
env_list = py310, py39, type

[testenv]
deps = pytest
commands = pytest tests
`

	test('envlist without factors parses correctly', () => {
		const name = "tox.ini"
		var rootStructure = core.ToxParserLib.parseToxStructure(
			name, envlist_without_factors
		);

		assert.strictEqual(rootStructure.name, name)
		assert.strictEqual(rootStructure.sub_structures.length, 0)
		assert.strictEqual(rootStructure.sub_tests.length, 3)

		const assertSameTask = (task: any, expected_name: string) => {
			assert.strictEqual(task.full_env_name, expected_name)
			assert.strictEqual(task.line, 2)
			assert.strictEqual(task.pretty_name, expected_name)
		}

		assertSameTask(rootStructure.sub_tests[0], "py310")
		assertSameTask(rootStructure.sub_tests[1], "py39")
		assertSameTask(rootStructure.sub_tests[2], "type")
	});

	// TODO: Verify that this works in tox with commas in multiple lines.
	const envlist_with_multiple_lines = `
[tox]
min_version = 4.0
env_list = 
    py310 
	py39
	type

[testenv]
deps = pytest
commands = pytest tests
`
	
    test('envlist with multiple lines parses correctly', () => {
		const name = "tox.ini"
		var rootStructure = core.ToxParserLib.parseToxStructure(
			name, envlist_with_multiple_lines
		);

		assert.strictEqual(rootStructure.name, name)
		assert.strictEqual(rootStructure.sub_structures.length, 0)
		assert.strictEqual(rootStructure.sub_tests.length, 3)

		const assertSameTask = (task: any, expected_name: string, line: number) => {
			assert.strictEqual(task.full_env_name, expected_name)
			assert.strictEqual(task.line, line)
			assert.strictEqual(task.pretty_name, expected_name)
		}

		assertSameTask(rootStructure.sub_tests[0], "py310", 3)
		assertSameTask(rootStructure.sub_tests[1], "py39", 4)
		assertSameTask(rootStructure.sub_tests[2], "type", 5)
	});
});
