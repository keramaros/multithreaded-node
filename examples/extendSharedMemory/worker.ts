const {workerData} = require("node:worker_threads")
import {initializeWorker} from "../../src"
import SharedMemoryExtended from "./SharedMemoryExtended"

const memory = new SharedMemoryExtended(workerData.buffer)
const thread = initializeWorker(memory)

thread.respondTo("start listening", () => {
    // start listening
    memory.listening = true

    // a client connects
    setTimeout(() => {
        memory.connections++
    }, 100)

    // a client connects
    setTimeout(() => {
        memory.connections++
    }, 200)

    // a client connects
    setTimeout(() => {
        memory.connections++
    }, 300)

    return true
})
