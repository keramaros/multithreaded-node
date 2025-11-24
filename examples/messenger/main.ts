import {startWorker} from "../../src"

(async () => {
    try {
        const worker = await startWorker("./examples/messenger/worker.ts")

        try {
            const sum = await worker.request("sum", [1, 2, "expect error", 4, 5])
            console.log("MAIN", "The first sum is", sum)
        } catch (e) {
            console.error("MAIN", "Error", (e as Error).message)
        }

        const sum = await worker.request("sum", [1, 2, 3, 4, 5])
        console.log("MAIN", "The second sum is", sum)
        await worker.terminate()
    } catch (e) {
        console.error("MAIN", "Error", e)
    }
})()
