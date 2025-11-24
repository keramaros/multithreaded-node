import test from "node:test"
import assert from "node:assert/strict"
import {createWorker} from "./tools/createWorker"

test("create a worker and request", async () => {
    const child = () => {
        const {initializeWorker} = require("../src")
        const thread = initializeWorker()
        // @ts-ignore
        thread.respondTo("hello", (serverName) => "hello " + serverName)
    }

    const worker = await createWorker(child)

    const response = await worker.request("hello", "main thread")
    assert.equal(response, "hello main thread")

    await worker.terminate()
})

test("receive a request from the worker", async () => {
    const child = () => {
        const {initializeWorker} = require("../src")
        const thread = initializeWorker()
        thread.request("hello", "worker")
    }

    const worker = await createWorker(child)
    const workerName = await new Promise<string>(resolve => {
        worker.respondTo("hello", (workerName) => resolve(workerName))
    })

    assert.equal(workerName, "worker")

    await worker.terminate()
})

test("worker returns an error", async () => {
    const child = () => {
        const {initializeWorker} = require("../src")
        const thread = initializeWorker()
        thread.respondTo("hello", () => {
            throw new Error("error from worker")
        })
    }

    const worker = await createWorker(child)

    let error: unknown
    try {
        const response = await worker.request("hello", "main thread")
    } catch (e) {
        error = e
    }

    assert.ok(error instanceof Error, "error should be an instance of Error")
    assert.equal(error?.message, "error from worker")

    await worker.terminate()
})
