import {initializeWorker} from "../../src"

const thread = initializeWorker()
thread.on("ping", async (data) => {
    try {
        console.log("WORKER", "Ping event received", data, "Pong event sent")

        // Simulate a long running task
        await new Promise(resolve => setTimeout(resolve, 100))

        thread.emit("pong", data)
    } catch (e) {
        console.error("WORKER", "Error:", e)
    }
})
