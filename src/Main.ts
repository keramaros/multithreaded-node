import {Worker} from "node:worker_threads"
import EventEmitter from "./EventEmitter"
import SharedMemory from "./SharedMemory"
import Messenger, {Responder} from "./Messenger"

type MemorySnapshot = {
    rss: number
    heapTotal: number
    heapUsed: number
    external: number
    arrayBuffers: number
    time: number
}

export default class Main extends EventEmitter {
    protected memory: SharedMemory
    protected worker: Worker
    protected messenger: Messenger

    constructor(worker: Worker, memory: SharedMemory) {
        super(worker)
        this.worker = worker
        this.memory = memory
        this.memory.threadId = worker.threadId
        this.messenger = new Messenger(worker, () => null)

        this.worker.on("exit", (code: number) => {
            this.memory.ready = false
            this.memory.busy = true
            super.emit("exit", code)
        })
        this.worker.on("error", (error: Error) => this.emit("error", error))
        this.worker.on("messageerror", (error: Error) => this.emit("messageerror", error))
        // this.worker.on("message", (message: any) => this.emit("message", message))
    }

    async terminate(): Promise<number> {
        this.memory.ready = false
        this.memory.busy = true
        return this.worker.terminate()
    }

    get ready(): boolean {
        return this.memory.ready
    }

    get busy(): boolean {
        return this.memory.busy
    }

    get progress(): number {
        return this.memory.progress
    }

    get memorySnapshot(): MemorySnapshot {
        return {
            rss: this.memory.memoryRss,
            heapTotal: this.memory.memoryHeapTotal,
            heapUsed: this.memory.memoryHeapUsed,
            external: this.memory.memoryExternal,
            arrayBuffers: this.memory.memoryArrayBuffers,
            time: this.memory.memoryLastSnapshot
        }
    }

    get cpuUsage(): number {
        return this.memory.cpuUsage
    }

    get lastMessageReceived(): number {
        return this.memory.lastMessageReceived
    }

    public async ping(): Promise<void> {
        if (!this.ready) throw new Error("Worker is not ready")
        return this.messenger.request("ping")
    }

    public request(method: string, data?: any): Promise<any> {
        if (!this.ready) throw new Error("Worker is not ready")
        if (this.busy) throw new Error("Worker is busy")
        return this.messenger.request(method, data)
    }

    public respondTo(method: string, callback: Responder): void {
        this.messenger.respondTo(method, callback)
    }

    public responderExists(method: string): boolean {
        return this.messenger.responderExists(method)
    }

    public pendingRequestsSize(): number {
        return this.messenger.pendingRequestsSize()
    }

    public emit(event: string, data?: any): void {
        if (!this.ready) throw new Error("Worker is not ready")
        if (this.busy) throw new Error("Worker is busy")
        super.emit(event, data)
    }
}
