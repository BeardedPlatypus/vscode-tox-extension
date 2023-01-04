# Tox Runner - Core

The `core` module is written in F# and compiled with [Fable][Fable]. It provides the logic to
discover the environments within the contents of a `tox.ini` string.

## Development

The `core` source code can be compiled within the Visual Studio Code devcontainer. Once active
the application can be build with:

```bash
npm run build
```

The application can subsequently be bundled into a minified javascript
file with:

```bash
npm run production
```

This will generate the `core.js` file within the `public` folder. This
file is used within the `extension` to provide the test discovery.

