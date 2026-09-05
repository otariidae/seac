# seac: Single Executable Application Compiler

[![NPM Version](https://img.shields.io/npm/v/seac)](https://www.npmjs.com/package/seac)
[![GitHub License](https://img.shields.io/github/license/otariidae/seac)](https://www.apache.org/licenses/LICENSE-2.0)
[![Node.js CI](https://github.com/otariidae/seac/actions/workflows/node.js.yml/badge.svg)](https://github.com/otariidae/seac/actions/workflows/node.js.yml)

A simple command-line tool that bundles a Node.js program into a single executable binary that runs without a separate Node.js runtime. It is built on Node.js [single executable applications](https://nodejs.org/docs/latest/api/single-executable-applications.html) (SEA).

> [!NOTE]
> Node.js SEA remains experimental ([Stability: 1.1](https://nodejs.org/docs/latest/api/single-executable-applications.html)). Treat generated executables as platform-specific release artifacts and test them on every target platform.

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

- Requires Node.js v22 or higher.
- Node.js v26+ uses Node's native `--build-sea` command. Node.js v22 and v24 use the compatible legacy `setil`/`postject` path.
- seac emits a single CommonJS bundle. Although Node.js v26 SEA supports an ESM main entry, this CLI does not yet expose that mode.
- Build on the target OS and architecture. SEA code cache and snapshots are not portable across platforms; seac leaves both disabled.
- On macOS, seac ad-hoc signs executables built through the native Node.js v26+ path. Production distribution may require your own Developer ID signing and notarization.

## Prior art

- [pkg](https://www.npmjs.com/package/pkg)
- [nexe](https://www.npmjs.com/package/nexe)
- [boxednode](https://www.npmjs.com/package/boxednode)
- [caxa](https://www.npmjs.com/package/caxa)
- [List of existing solutions on Node.js SEA team repository](https://github.com/nodejs/single-executable/blob/main/docs/existing-solutions.md)

## License

Apache-2.0

## Technical notes

seac cannot be compiled to a single executable by itself because its dependency esbuild uses `require.resolve`, which cannot be bundled into a SEA entry point.
