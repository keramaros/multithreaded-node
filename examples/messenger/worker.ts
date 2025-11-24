import {initializeWorker} from "../../src"

const thread = initializeWorker()
thread.respondTo("sum", data => {
    if (!Array.isArray(data)) {
        throw new Error("WORKER Data must be an array")
    }
    if (!data.every(v => Number.isFinite(v))) {
        throw new Error("WORKER Data must contain only numbers")
    }

    return data.reduce((a, b) => a + b, 0)
})
