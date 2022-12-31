import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
// import * as myExtension from '../../extension';
let core = require("../../core.js");


suite('Extension Test Suite', () => {
	vscode.window.showInformationMessage('Start all tests.');

	// TODO: Parametrize this for 'envlist =' and 'envlist=' etc.
	const envlist_without_factors = (
`[tox]
min_version = 4.0
env_list = py310, py39, type

[testenv]
deps = pytest
commands = pytest tests
`)

	test('envlist without factors parses correctly', () => {
		const name = "tox.ini"
		var rootStructure = core.ToxParserLib.parseToxStructure(
			name, envlist_without_factors
		);

		assert.strictEqual(rootStructure.name, name);
		assert.strictEqual(rootStructure.sub_structures.length, 0);
		assert.strictEqual(rootStructure.sub_tests.length, 3);

		const assertSameTask = (task: any, expected_name: string) => {
			assert.strictEqual(task.full_env_name, expected_name)
			assert.strictEqual(task.line, 2)
			assert.strictEqual(task.pretty_name, expected_name)
		}

		assertSameTask(rootStructure.sub_tests[0], "py310");
		assertSameTask(rootStructure.sub_tests[1], "py39");
		assertSameTask(rootStructure.sub_tests[2], "type");
	});

	// TODO: Verify that this works in tox with commas in multiple lines.
	const envlist_with_multiple_lines = (
`[tox]
min_version = 4.0
env_list = 
    py310 
	py39
	type

[testenv]
deps = pytest
commands = pytest tests
`)
	
    test('envlist with multiple lines parses correctly', () => {
		const name = "tox.ini"
		var rootStructure = core.ToxParserLib.parseToxStructure(
			name, envlist_with_multiple_lines
		);

		assert.strictEqual(rootStructure.name, name);
		assert.strictEqual(rootStructure.sub_structures.length, 0);
		assert.strictEqual(rootStructure.sub_tests.length, 3);

		const assertSameTask = (task: any, expected_name: string, line: number) => {
			assert.strictEqual(task.full_env_name, expected_name);
			assert.strictEqual(task.line, line);
			assert.strictEqual(task.pretty_name, expected_name);
		}

		assertSameTask(rootStructure.sub_tests[0], "py310", 3);
		assertSameTask(rootStructure.sub_tests[1], "py39", 4);
		assertSameTask(rootStructure.sub_tests[2], "type", 5);
	});


	const envlist_with_factors_and_multiline = (
`[tox]
min_version = 4.0
env_list = 
	py39-django{15, 16, 17}
	{py39, py310}-{potato, tomato}-test
	type

[testenv]
deps = pytest
commands = pytest tests
`)
	
    test('envlist with factors and multi lines parses correctly', () => {
		const name = "tox.ini"
		var rootStructure = core.ToxParserLib.parseToxStructure(
			name, envlist_with_factors_and_multiline
		);

		assert.strictEqual(rootStructure.name, name);
		assert.strictEqual(rootStructure.sub_structures.length, 2);
		assert.strictEqual(rootStructure.sub_tests.length, 1);

		const assertSameTask = (task: any, expected_name: string, line: number, pretty_name: string) => {
			assert.strictEqual(task.full_env_name, expected_name);
			assert.strictEqual(task.line, line);
			assert.strictEqual(task.pretty_name, pretty_name);
		}

		assertSameTask(rootStructure.sub_tests[0], "type", 5, "type")

		const assertSameStructure = (sub_structure: any, expected_name: string, expected_tests: [string, number, string][]) => {
			assert.strictEqual(sub_structure.name, expected_name);
			assert.strictEqual(sub_structure.sub_structures.length, 0);
			
			assert.strictEqual(sub_structure.sub_tests.length, expected_tests.length);

			for (var i=0; i < sub_structure.sub_tests.length; i++) {
				assertSameTask(
					sub_structure.sub_tests[i], 
					expected_tests[i][0],
					expected_tests[i][1],
					expected_tests[i][2]
				);
			}
		}

		assertSameStructure(
			rootStructure.sub_structures[0],
			"py310",
			[
				["py310-potato-test", 4, "potato-test"],
				["py310-tomato-test", 4, "tomato-test"],
			]
		);

		assertSameStructure(
			rootStructure.sub_structures[1],
			"py39",
			[
				["py39-django15", 3, "django15"],
		        ["py39-django16", 3, "django16"],
		        ["py39-django17", 3, "django17"],
		        ["py39-potato-test", 4, "potato-test"],
		        ["py39-tomato-test", 4, "tomato-test"],
			]
		);
	});

	const envlist_with_factors= (
`[tox]
min_version = 4.0
env_list = py39-django{15, 16, 17}, {py39, py310}-{potato, tomato}-test, type

[testenv]
deps = pytest
commands = pytest tests
`)
	
    test('envlist with factors parses correctly', () => {
		const name = "tox.ini"
		var rootStructure = core.ToxParserLib.parseToxStructure(
			name, envlist_with_factors
		);

		assert.strictEqual(rootStructure.name, name);
		assert.strictEqual(rootStructure.sub_structures.length, 2);
		assert.strictEqual(rootStructure.sub_tests.length, 1);

		const assertSameTask = (task: any, expected_name: string, line: number, pretty_name: string) => {
			assert.strictEqual(task.full_env_name, expected_name);
			assert.strictEqual(task.line, line);
			assert.strictEqual(task.pretty_name, pretty_name);
		}

		assertSameTask(rootStructure.sub_tests[0], "type", 2, "type")

		const assertSameStructure = (sub_structure: any, expected_name: string, expected_tests: [string, number, string][]) => {
			assert.strictEqual(sub_structure.name, expected_name);
			assert.strictEqual(sub_structure.sub_structures.length, 0);
			
			assert.strictEqual(sub_structure.sub_tests.length, expected_tests.length);

			for (var i=0; i < sub_structure.sub_tests.length; i++) {
				assertSameTask(
					sub_structure.sub_tests[i], 
					expected_tests[i][0],
					expected_tests[i][1],
					expected_tests[i][2]
				);
			}
		}

		assertSameStructure(
			rootStructure.sub_structures[0],
			"py310",
			[
				["py310-potato-test", 2, "potato-test"],
				["py310-tomato-test", 2, "tomato-test"],
			]
		);

		assertSameStructure(
			rootStructure.sub_structures[1],
			"py39",
			[
				["py39-django15", 2, "django15"],
		        ["py39-django16", 2, "django16"],
		        ["py39-django17", 2, "django17"],
		        ["py39-potato-test", 2, "potato-test"],
		        ["py39-tomato-test", 2, "tomato-test"],
			]
		);
	});

	const envlist_with_testenvs= (
`[tox]
min_version = 4.0

[testenv]
deps = pytest
commands = pytest tests

[testenv:py39-django{15, 16, 17}]
deps = pytest
commands = pytest

[testenv:{py39, py310}-{potato, tomato}-test]
deps = pytest
commands = pytest

[testenv:type]
deps = pytest
commands = pytest
`)
    
    test('testenvs with factors parse correctly', () => {
		const name = "tox.ini"
		var rootStructure = core.ToxParserLib.parseToxStructure(
			name, envlist_with_testenvs 
		);

		assert.strictEqual(rootStructure.name, name);
		assert.strictEqual(rootStructure.sub_structures.length, 2);
		assert.strictEqual(rootStructure.sub_tests.length, 1);

		const assertSameTask = (task: any, expected_name: string, line: number, pretty_name: string) => {
			assert.strictEqual(task.full_env_name, expected_name);
			assert.strictEqual(task.line, line);
			assert.strictEqual(task.pretty_name, pretty_name);
		}

		assertSameTask(rootStructure.sub_tests[0], "type", 15, "type")

		const assertSameStructure = (sub_structure: any, expected_name: string, expected_tests: [string, number, string][]) => {
			assert.strictEqual(sub_structure.name, expected_name);
			assert.strictEqual(sub_structure.sub_structures.length, 0);
			
			assert.strictEqual(sub_structure.sub_tests.length, expected_tests.length);

			for (var i=0; i < sub_structure.sub_tests.length; i++) {
				assertSameTask(
					sub_structure.sub_tests[i], 
					expected_tests[i][0],
					expected_tests[i][1],
					expected_tests[i][2]
				);
			}
		}

		assertSameStructure(
			rootStructure.sub_structures[0],
			"py310",
			[
				["py310-potato-test", 11, "potato-test"],
				["py310-tomato-test", 11, "tomato-test"],
			]
		);

		assertSameStructure(
			rootStructure.sub_structures[1],
			"py39",
			[
				["py39-django15", 7, "django15"],
		        ["py39-django16", 7, "django16"],
		        ["py39-django17", 7, "django17"],
		        ["py39-potato-test", 11, "potato-test"],
		        ["py39-tomato-test", 11, "tomato-test"],
			]
		);
	});
});
