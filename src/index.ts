import {Worker} from "node:worker_threads"
import type {WorkerOptions} from "node:worker_threads"
import SharedMemory from "./SharedMemory"
import Main from "./Main"
import WorkerThread from "./WorkerThread"

export type StartWorkerOptions = WorkerOptions & {
    sharedMemory?: SharedMemory
}

export function startWorker(filename: string, options?: StartWorkerOptions): Promise<Main> {
    options ??= {}
    const memory = options.sharedMemory ?? new SharedMemory()
    memory.ready = false
    memory.busy = true
    options.workerData = {
        ...options.workerData,
        buffer: memory.buffer
    }

    return new Promise<Main>((resolve, reject) => {
        const worker = new Worker(filename, options)

        worker.once("message", () => {
            if (memory.ready) return resolve(new Main(worker, memory))
            reject(new Error(`Look's like script ${filename} is not combatable with this WorkerThread`))
        })
        worker.on("error", reject)
        worker.on("exit", (code) => {
            if (code === 0) return
            reject(new Error(`WorkerThread stopped with exit code ${code}`))
        })
    })
}

export function initializeWorker(memory?: SharedMemory): WorkerThread {
    const {
        parentPort,
        workerData
    } = require("node:worker_threads")

    return new WorkerThread(parentPort, workerData, memory)
}
