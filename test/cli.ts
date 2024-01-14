import test from "node:test"
import path from "node:path"
import fs, { mkdtemp } from "node:fs/promises"
import os from "node:os"
import { spawnSync } from "node:child_process"
import assert from "node:assert/strict"
import { run } from "../src/cli"

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
