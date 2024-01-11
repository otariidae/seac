# seac: Single Executable Application Compiler

A command-line tool that compiles a Node.js program into single executable binary built in the context of the Node.js [single executable application](https://nodejs.org/docs/latest/api/single-executable-applications.html) (SEA) feature.

> [!NOTE]
> The Node.js SEA feature is currently experimental according to [the official document](https://nodejs.org/docs/latest-v20.x/api/single-executable-applications.html).

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

## Technical memo

Seac cannot be compiled to single executable because its denendency esbuild uses uncompilable Node.js feature `require.resolve`.
