import test from "node:test"
import assert from "node:assert/strict"
import {createWorker} from "./tools/createWorker"

test("create a worker and receive an event", async () => {
    const child = () => {
        const {initializeWorker} = require("../src")
        const thread = initializeWorker()
        thread.emit("event", "worker event")
    }

    const worker = await createWorker(child)

    const variable = await new Promise<string>(resolve => {
        worker.on("event", resolve)
    })
    assert.equal(variable, "worker event")

    await worker.terminate()
})

test("create a worker and send an event", async () => {
    const child = () => {
        const {initializeWorker} = require("../src")
        const thread = initializeWorker()
        thread.on("event", () => thread.emit("triggered", "event"))
    }

    const worker = await createWorker(child)
    const variablePromise = new Promise<string>(resolve => {
        worker.on("triggered", resolve)
    })
    worker.emit("event")
    const variable = await variablePromise

    assert.equal(variable, "event")

    await worker.terminate()
})
