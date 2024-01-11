const { command, run, string, positional } = require("cmd-ts")

const app = command({
    name: "hello",
    args: {
        text: positional({ type: string, displayName: "text" }),
    },
    handler: (args) => {
        console.log(`Hello, ${args.text}!`)
    },
})

run(app, process.argv.slice(2))
