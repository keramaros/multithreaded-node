import fs from "node:fs"
import {startWorker} from "../../src"
import Main from "../../src/Main"
import * as crypto from "node:crypto"

export async function createWorker(fn: Function): Promise<Main> {
    const hash = crypto.createHash("sha256")
    hash.update(fn.toString())
    const hexHash = hash.digest("hex")

    if (!fs.existsSync("./tmp")) fs.mkdirSync("./tmp")
    const childFilename = "./tmp/worker-" + hexHash.slice(0, 8) + ".ts"

    fs.writeFileSync(childFilename, `(${fn.toString()})()`)

    try {
        return await startWorker(childFilename, {
            execArgv: ["-r", "ts-node/register"]
        })
    } finally {
        // setTimeout(() => {
        //     if (!fs.existsSync("./tmp")) return
        // fs.rmSync("./tmp", {recursive: true, force: true})
        // }, 1000)
    }
}
