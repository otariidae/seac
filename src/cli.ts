#!/usr/bin/env node
import { z } from "zod"
import { parser } from "zod-opts"
import * as esbuild from "esbuild"
import { compileSea } from "./sea"

export async function run(argv2: string[]) {
    const args = parser()
        .name("seac")
        .description("Single executable application compiler")
        .args([
            {
                type: z.string().describe("path to the source file"),
                name: "srcPath",
            },
            {
                type: z.string().describe("path to the destination file"),
                name: "destPath",
            },
        ])
        .parse(argv2)
    // bundle the source file
    const bundled = await esbuild.build({
        bundle: true,
        entryPoints: [args.srcPath],
        format: "cjs",
        platform: "node",
        write: false,
    })
    if (!bundled.outputFiles) {
        throw new Error("cannot bundle")
    }
    // compile the bundled code into single executable
    const bundledCode = bundled.outputFiles[0].text
    await compileSea(bundledCode, args.destPath)
}

if (require.main === module) {
    run(process.argv.slice(2))
}
