#!/usr/bin/env node
import os from "node:os"
import * as setil from "setil"
import { command, positional, run, string } from "cmd-ts"
import { File as FileType } from "cmd-ts/batteries/fs"
import * as esbuild from "esbuild"

export const cmd = command({
    name: "seac",
    description: "single executable application compiler",
    args: {
        srcPath: positional({
            type: FileType,
            displayName: "source",
            description: "path to the source file",
        }),
        destPath: positional({
            type: string,
            displayName: "destination",
            description: "path to the destination file",
        }),
    },
    handler: async (args) => {
        // bundle the source file
        const bundled = await esbuild.build({
            bundle: true,
            entryPoints: [args.srcPath],
            platform: "node",
            write: false,
        })
        if (!bundled.outputFiles) {
            throw new Error("cannot bundle")
        }
        // compile the bundled code into single executable
        const bundledCode = bundled.outputFiles[0].text
        // do not remove the signature of the binary for Linux
        const noSign = os.type() === "Linux" ? false : true
        await setil.compile(bundledCode, args.destPath, { noSign })
    },
})

if (require.main === module) {
    run(cmd, process.argv.slice(2))
}
