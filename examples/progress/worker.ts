import {initializeWorker} from "../../src"

const thread = initializeWorker()
thread.respondToWithProgress("sum", async (data: any, setProgress) => {
    if (!Array.isArray(data)) {
        throw new Error("WORKER Data must be an array")
    }
    if (!data.every(v => Number.isFinite(v))) {
        throw new Error("WORKER Data must contain only numbers")
    }

    let sum: number = 0

    for (const number of data) {
        sum += number
        setProgress(Math.round((data.indexOf(number) / data.length) * 100))

        // simulate a long running task
        await new Promise(resolve => setTimeout(resolve, 1000))
    }

    return sum
})
