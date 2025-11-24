import test from "node:test"
import assert from "node:assert/strict"
import {createWorker} from "./tools/createWorker"

test("create a worker and ping it", async () => {
    const child = () => {
        const {initializeWorker} = require("../src")
        const thread = initializeWorker()
    }

    const worker = await createWorker(child)

    const pong = await worker.ping()
    assert.equal(pong, "pong")

    await worker.terminate()
})
