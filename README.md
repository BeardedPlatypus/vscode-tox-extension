<p align='center'><img src="extension/img/icon.png" align="center"></p>

# Visual Studio Code - Tox Runner

`tox runner` is a visual studio code extension to collect and run [tox][tox] 
environments within [Visual Studio Code][vscode]. It collects the different 
environments defined in a `tox.ini` file and presents them as tests in the test tab 
of visual studio code, allowing them to be run easily from within your IDE.

## Motivation

`tox runner` is first and foremost a personal project of myself to learn how to write 
Visual Studio Code extensions. It provides the necessary functionality that I need 
within my own workflows. For a more battle-tested extension, I recommend taking a look
at [`python-tox`][python-tox].

## Functionality

Currently, the following functionality is supported within `tox runner`:

* Collect the different tox environments defined in a `tox.ini` file and nest them 
   according to their factors.
* Run the tests either from within the `tox.ini` file or from within the Visual Studio
   Code test tab.
* Collect the results of the test run and display them within Visual Studio Code

## Development

## Contributions

Because this project is primarily a hobby project, I do not currently accept any code
contributions. If you require particular functionality that you believe `tox runner`
should support, or if you encountered a bug, I would appreciate issue reports however.
These can be opened on within this repository and should follow the respective 
templates. Keep in mind that this is not a commercial project, and as such I cannot 
make any guarantees about time tables.

If you require specific changes, I recommend forking this repository, and building your
own version. The development notes should help you set the environment. If this process
is not clear, feel free to open a discussion for help.

## Attribution

- Face in the icon is based on an icon provided by <a href="https://www.freepik.com" title="Freepik">Freepik</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a>
   The underlying background is the icon of [tox][tox]. 

[python-tox]: https://marketplace.visualstudio.com/items?itemName=the-compiler.python-tox
[tox]: https://tox.wiki/en/latest/
[vscode]: https://code.visualstudio.com/