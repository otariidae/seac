# seac: Single Executable Application Compiler

A simple command-line tool that compiles a Node.js program into single executable binary that runs without Node.js runtime installed, built on top of the Node.js [single executable application](https://nodejs.org/docs/latest/api/single-executable-applications.html) (SEA) feature.

> [!NOTE]
> The Node.js SEA feature is currently still experimental according to [the official document](https://nodejs.org/docs/latest-v20.x/api/single-executable-applications.html).
> And seac is super experimental.

## Installation

```console
npm i -D seac
```

## Usage

Windows:

```console
seac hello.js hello.exe
```

Linux or macOS:

```console
seac hello.js hello
```

## Limitations

- Requires Node.js v20 or higher
- Only CommonJS is supported. ESM is not supported yet by the Node.js SEA feature.

## Prior art

- [pkg](https://www.npmjs.com/package/pkg)
- [nexe](https://www.npmjs.com/package/nexe)
- [boxednode](https://www.npmjs.com/package/boxednode)
- [caxa](https://www.npmjs.com/package/caxa)

## License

Apache-2.0

## Technical memo

Seac cannot be compiled to single executable by itself because its denendency esbuild uses uncompilable Node.js feature `require.resolve`.
