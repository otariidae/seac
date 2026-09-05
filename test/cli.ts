import test from "node:test"
import path from "node:path"
import fs, { mkdtemp } from "node:fs/promises"
import os from "node:os"
import { spawnSync } from "node:child_process"
import assert from "node:assert/strict"
import { run } from "../src/cli"
import { selectSeaBuilder } from "../src/sea"

const osTmpdir = os.tmpdir()

async function withTmpdir(prefix: string) {
    const tmpdir = await mkdtemp(prefix)
    return {
        tmpdir,
        [Symbol.asyncDispose]: async () => {
            await fs.rm(tmpdir, { recursive: true, force: true })
        },
    }
}

async function compileFile(srcFilePath: string, destPath: string) {
    await fs.rm(destPath, { force: true })
    await run([srcFilePath, destPath])
}

test("selects the native builder from Node.js v25.5.0", () => {
    assert.equal(selectSeaBuilder("22.17.0"), "legacy")
    assert.equal(selectSeaBuilder("24.20.0"), "legacy")
    assert.equal(selectSeaBuilder("25.4.0"), "legacy")
    assert.equal(selectSeaBuilder("25.5.0"), "native")
    assert.equal(selectSeaBuilder("26.0.0"), "native")
    assert.equal(selectSeaBuilder("invalid"), "legacy")
})

test("rejects missing positional arguments", () => {
    const result = spawnSync(process.execPath, [
        "-r",
        "esbuild-register",
        path.join(__dirname, "../src/cli.ts"),
    ])

    assert.equal(result.status, 1)
})

test("rejects excess positional arguments", () => {
    const result = spawnSync(process.execPath, [
        "-r",
        "esbuild-register",
        path.join(__dirname, "../src/cli.ts"),
        "source.js",
        "output",
        "unexpected",
    ])

    assert.equal(result.status, 1)
})

test(
    "reports native builder failures with command context",
    { skip: selectSeaBuilder(process.versions.node) !== "native" },
    async () => {
        const helloJsPath = path.join(__dirname, "hello.js")
        await using tmpdirResource = await withTmpdir(
            path.join(osTmpdir, "seac-test-"),
        )

        await assert.rejects(
            run([helloJsPath, tmpdirResource.tmpdir]),
            /--build-sea.*exited with code/,
        )
    },
)

test("compile dependency-free common js file", async () => {
    const helloJsPath = path.join(__dirname, "hello.js")

    await using tmpdirResource = await withTmpdir(
        path.join(osTmpdir, "seac-test-"),
    )
    const destExecutablePath = path.join(tmpdirResource.tmpdir, "hello.exe")

    await compileFile(helloJsPath, destExecutablePath)

    const { stdout } = spawnSync(destExecutablePath, ["world"])
    assert.equal(stdout.toString(), "Hello, world!\n")
})

test("compile js file that depends on node buildin packages", async () => {
    const helloJsPath = path.join(__dirname, "hello-node-buildin-deps.js")

    await using tmpdirResource = await withTmpdir(
        path.join(osTmpdir, "seac-test-"),
    )
    const destExecutablePath = path.join(tmpdirResource.tmpdir, "hello.exe")

    await compileFile(helloJsPath, destExecutablePath)

    const { stdout } = spawnSync(destExecutablePath, ["world"])
    assert.equal(stdout.toString(), "Hello, world!\n")
})

test("compile js file that depends on internal modules", async () => {
    const helloJsPath = path.join(__dirname, "hello-internal-deps.js")

    await using tmpdirResource = await withTmpdir(
        path.join(osTmpdir, "seac-test-"),
    )
    const destExecutablePath = path.join(tmpdirResource.tmpdir, "hello.exe")

    await compileFile(helloJsPath, destExecutablePath)

    const { stdout } = spawnSync(destExecutablePath, ["world"])
    assert.equal(stdout.toString(), "Hello, world!\n")
})

test("compile js file that depends on npm packages", async () => {
    const helloJsPath = path.join(__dirname, "hello-external-deps.js")

    await using tmpdirResource = await withTmpdir(
        path.join(osTmpdir, "seac-test-"),
    )
    const destExecutablePath = path.join(tmpdirResource.tmpdir, "hello.exe")

    await compileFile(helloJsPath, destExecutablePath)

    const { stdout } = spawnSync(destExecutablePath, ["world"])
    assert.equal(stdout.toString(), "Hello, world!\n")
})
