import { spawn } from "node:child_process"
import { mkdtemp, rm, writeFile } from "node:fs/promises"
import os from "node:os"
import path from "node:path"
import semver from "semver"
import * as setil from "setil"

export type SeaBuilder = "native" | "legacy"

/**
 * `--build-sea` was introduced in Node.js v25.5.0.
 * Older supported runtimes continue using setil's postject workflow.
 */
export function selectSeaBuilder(nodeVersion: string): SeaBuilder {
    return semver.satisfies(nodeVersion, ">=25.5.0") ? "native" : "legacy"
}

export async function compileSea(
    source: string,
    output: string,
) {
    const builder = selectSeaBuilder(process.versions.node)

    if (builder === "native") {
        await compileNativeSea(source, output)
        return
    }

    await setil.compile(source, output, {
        noSign: process.platform === "win32",
    })
}

async function compileNativeSea(source: string, output: string) {
    await using temporaryDirectory = await createTemporaryDirectory()
    const main = path.join(temporaryDirectory.path, "main.cjs")
    const config = path.join(temporaryDirectory.path, "sea-config.json")

    await writeFile(main, source)
    await writeFile(
        config,
        JSON.stringify({
            main,
            mainFormat: "commonjs",
            executable: process.execPath,
            output,
            disableExperimentalSEAWarning: true,
        }),
    )
    await runCommand(process.execPath, ["--build-sea", config])

    if (process.platform === "darwin") {
        await runCommand("codesign", ["--sign", "-", output])
    }
}

async function createTemporaryDirectory() {
    const temporaryDirectory = await mkdtemp(path.join(os.tmpdir(), "seac-sea-"))
    return {
        path: temporaryDirectory,
        [Symbol.asyncDispose]: () =>
            rm(temporaryDirectory, { recursive: true, force: true }),
    }
}

function runCommand(command: string, args: string[]): Promise<void> {
    return new Promise((resolve, reject) => {
        const displayCommand = [command, ...args]
            .map((argument) => JSON.stringify(argument))
            .join(" ")
        let settled = false
        const settle = (callback: () => void) => {
            if (settled) return
            settled = true
            callback()
        }
        const child = spawn(command, args, { stdio: "inherit" })
        child.once("error", (error) => {
            settle(() => {
                reject(new Error(`Failed to start ${displayCommand}: ${error.message}`))
            })
        })
        child.once("close", (code, signal) => {
            if (code === 0) {
                settle(resolve)
                return
            }
            settle(() => {
                reject(
                    new Error(
                        `${displayCommand} exited with ${
                            signal ? `signal ${signal}` : `code ${code}`
                        }`,
                    ),
                )
            })
        })
    })
}
