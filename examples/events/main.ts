import {startWorker} from "../../src"

(async () => {
    try {
        const worker = await startWorker("./examples/events/worker.ts")
        worker.on("pong", (data) => {
            console.log("MAIN", "Pong received:", data)
        })
        console.log("MAIN", "Sending ping")
        worker.emit("ping", "secret")

        await new Promise(resolve => setTimeout(resolve, 1000))
        await worker.terminate()
    } catch (e) {
        console.error(e)
    }
})()
