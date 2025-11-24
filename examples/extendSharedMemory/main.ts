import SharedMemoryExtended from "./SharedMemoryExtended"
import {startWorker} from "../../src"

(async () => {
    try {
        const sharedMemory = new SharedMemoryExtended()
        const worker = await startWorker("./examples/extendSharedMemory/worker.ts", {
            sharedMemory
        })

        console.log("MAIN", "Memory.listening before start", sharedMemory.listening)
        console.log("MAIN", "Memory.connections before start", sharedMemory.connections)
        await worker.request("start listening")

        console.log("MAIN", "Memory.listening after start", sharedMemory.listening)

        await new Promise(resolve => setTimeout(resolve, 110))
        console.log("MAIN", "Memory.connections after start", sharedMemory.connections)
        await new Promise(resolve => setTimeout(resolve, 210))
        console.log("MAIN", "Memory.connections after start", sharedMemory.connections)
        await new Promise(resolve => setTimeout(resolve, 310))
        console.log("MAIN", "Memory.connections after start", sharedMemory.connections)

        await worker.terminate()
    } catch (e) {
        console.error("MAIN", "Error", e)
    }
})()

