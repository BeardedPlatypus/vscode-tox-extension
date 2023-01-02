<p align='center'><img src="img/icon.png" align="center"></p>

# Visual Studio Code - Tox Runner

Tox Runner is a simple test extension which integrates the [tox][tox] task automation 
tool within Visual Studio Code. It can discover the different tasks defined in a `tox.ini`
file located at the root of your workspace, and run them directly from within Visual Studio
Code's test environment.

## Features


## Requirements

1. A Python distribution with [`tox`][tox] installed.  
   * Python installation details can be found [here][python-installation]
   * `tox` installation details can be found [here][tox-installation]

## Extension Settings

This extension contributes the following settings:

* `tox`: Set the path to the before-mentioned `tox` executable. If unset, the `tox` executable will be obtained from the `PATH` variable.


[tox]: https://tox.wiki/en/latest/index.html
[python-installation]: https://www.python.org/downloads/
[tox-installation]: https://tox.wiki/en/latest/installation.html