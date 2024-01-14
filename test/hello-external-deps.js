const { z } = require("zod")
const { parser } = require("zod-opts")

const parsed = parser()
    .name("hello")
    .args([
        {
            type: z.string(),
            name: "text",
        },
    ])
    .parse()

console.log(`Hello, ${parsed.text}!`)
