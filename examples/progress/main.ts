import {startWorker} from "../../src"

(async () => {
    try {
        const worker = await startWorker("./examples/progress/worker.ts")

        console.log("MAIN", "Sending firest request")
        const sumPromise = worker.request("sum", [1, 2, 3, 4, 5])

        // Try to send a second request while the worker is busy will throw an error
        setTimeout(async () => {
            try {
                console.log("MAIN", "Sending second request")
                await worker.request("sum", [6, 7, 8, 9, 10])
            } catch (e) {
                console.error("MAIN", "Error", (e as Error).message)
            }
        }, 250)

        let lastProgress = 0
        console.log("MAIN", "Progress of the first request", worker.progress, "%")
        const interval = setInterval(() => {
            if (lastProgress === worker.progress) return
            lastProgress = worker.progress
            console.log("MAIN", "Progress of the first request", worker.progress, "%")
        }, 100)

        const sum = await sumPromise
        console.log("MAIN", "Progress of the first request", worker.progress, "%")
        clearInterval(interval)
        console.log("MAIN", "The sum is", sum)
        await worker.terminate()
    } catch (e) {
        console.error("MAIN", "Error", e)
    }
})()
