#!//usr/bin/env node
import * as setil from "setil"
import { command, positional, run, string } from "cmd-ts"
import { File as FileType } from "cmd-ts/batteries/fs"
import * as esbuild from "esbuild"

export const cmd = command({
    name: "seac",
    args: {
        srcPath: positional({ type: FileType, displayName: "source" }),
        destPath: positional({ type: string, displayName: "destination" }),
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
        await setil.compile(bundledCode, args.destPath)
    },
})

if (require.main === module) {
    run(cmd, process.argv.slice(2))
}
