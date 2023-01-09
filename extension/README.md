# Visual Studio Code - Tox Runner

Tox Runner is a simple test extension which integrates the [tox][tox] task automation 
tool within Visual Studio Code. It can discover the different tasks defined in a 
`tox.ini` file located at the root of your workspace, and run them directly from within
Visual Studio Code's test environment.

_For a more mature extension, please take a look at [`python-tox`][python-tox]_

## Features

The Tox Runner extension is largely inspired by [`python-tox`][python-tox], and 
provides some similar features with three main differences:

* The Tox Runner extension does not (currently) provide any tasks, while `python-tox` 
   does.
* The Tox Runner extension handles factors in the `tox.ini` definition, and nests these
   test environments in the test explorer.
* The Tox Runner extension by default executes tox testenvs in a child process, rather
   than in a Visual Studio code terminal.

The following sections show the tox runner application in practice:

### Discovering tox `testenvs`

_In the `envlist` variable:_  

<p align='left'><img src="https://github.com/BeardedPlatypus/media-storage/blob/main/tox-runner/envlist.gif?raw=true" align="left" width="100%"></p>

_In separate sections:_  

<p align='left'><img src="https://github.com/BeardedPlatypus/media-storage/blob/main/tox-runner/testenv.gif?raw=true" align="left" width="100%"></p>

### Nesting of similarly named `testenvs`

<p align='left'><img src="https://github.com/BeardedPlatypus/media-storage/blob/main/tox-runner/factors.gif?raw=true" align="left" width="100%"></p>

### Running of `testenvs`

<p align='left'><img src="https://github.com/BeardedPlatypus/media-storage/blob/main/tox-runner/run.gif?raw=true" align="left" width="100%"></p>

## Requirements

1. A Python distribution with [`tox`][tox] installed.  
   * Python installation details can be found [here][python-installation]
   * `tox` installation details can be found [here][tox-installation]

## Extension Settings

This extension contributes the following settings:

* `tox-runner.toxPath`: Set the path to the before-mentioned `tox` executable. If unset, the `tox` executable will be obtained from the `PATH` variable.
* `tox-runner.runInTerminal`: Set whether the test environments should be run in the
   terminal or in a separate process. Defaults to a separate process.

## Attribution

- Face in the icon is based on an icon provided by <a href="https://www.freepik.com" title="Freepik">Freepik</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a>
   The underlying background is the icon of [tox][tox]. 

[tox]: https://tox.wiki/en/latest/index.html
[python-installation]: https://www.python.org/downloads/
[tox-installation]: https://tox.wiki/en/latest/installation.html
[python-tox]: https://marketplace.visualstudio.com/items?itemName=the-compiler.python-tox
