const { parseArgs } = require("node:util")

const args = parseArgs({
    strict: true,
    allowPositionals: true,
})
console.log(`Hello, ${args.positionals[0]}!`)
