import type {MessagePort} from "node:worker_threads"
import SharedMemory from "./SharedMemory"
import EventEmitter from "./EventEmitter"
import Messenger, {Responder, ResponderWithProgress, SetProgress} from "./Messenger"
import {clearInterval} from "node:timers"
import os from "os"

const numCores = os.cpus().length
let prevUsage = process.cpuUsage()
let prevTime = process.hrtime()

export default class WorkerThread extends EventEmitter {
    protected memory: SharedMemory
    protected parentPort: MessagePort
    protected messenger: Messenger
    protected memoryUpdateInterval: NodeJS.Timeout | null = null
    protected cpuUsageInterval: NodeJS.Timeout | null = null

    constructor(parentPort: MessagePort, workerData: { [p: string]: any }, memory?: SharedMemory) {
        super(parentPort)
        if (!workerData?.buffer) throw new Error("workerData.buffer is not defined")
        if (!(workerData.buffer instanceof Int32Array)) throw new Error("workerData.buffer is not an Int32Array")
        this.memory = memory ?? new SharedMemory(workerData.buffer)
        this.memory.uptime = Math.floor(process.uptime() * 1000)

        this.parentPort = parentPort
        this.parentPort.on("message", () => this.memory.lastMessageReceived = Date.now())
        const setProgress: SetProgress = (progress: number) => this.memory.progress = progress
        this.messenger = new Messenger(this.parentPort, setProgress)
        this.messenger.respondTo("ping", () => "pong")

        this.memory.ready = true
        this.parentPort?.postMessage("")
        this.busy = false
    }

    set trackMemory(value: boolean) {
        if (value && this.memoryUpdateInterval) return

        if (!value && this.memoryUpdateInterval) {
            clearInterval(this.memoryUpdateInterval)
            this.memoryUpdateInterval = null
        }

        if (value) {
            this.memoryUsageUpdate()
            this.memoryUpdateInterval = setInterval(() => this.memoryUsageUpdate(), 100)
        }
    }

    get trackMemory(): boolean {
        return !!this.memoryUpdateInterval
    }

    set trackCpuUsage(value: boolean) {
        if (value && this.cpuUsageInterval) return

        if (!value && this.cpuUsageInterval) {
            clearInterval(this.cpuUsageInterval)
            this.cpuUsageInterval = null
        }

        if (value) {
            this.cpuUsageUpdate()
            this.cpuUsageInterval = setInterval(() => this.cpuUsageUpdate(), 100)
        }
    }

    get trackCpuUsage(): boolean {
        return !!this.cpuUsageInterval
    }

    set busy(value: boolean) {
        this.memory.busy = value
    }

    get busy(): boolean {
        return this.memory.busy
    }

    set progress(value: number) {
        this.memory.progress = value
    }

    get progress(): number {
        return this.memory.progress
    }

    public memoryUsageUpdate(): void {
        this.memory.memoryRss = process.memoryUsage().rss
        this.memory.memoryHeapTotal = process.memoryUsage().heapTotal
        this.memory.memoryHeapUsed = process.memoryUsage().heapUsed
        this.memory.memoryExternal = process.memoryUsage().external
        this.memory.memoryArrayBuffers = process.memoryUsage().arrayBuffers
        this.memory.memoryLastSnapshot = Date.now()
    }

    public cpuUsageUpdate(): number {
        const currentUsage = process.cpuUsage(prevUsage)
        const currentTime = process.hrtime(prevTime)

        const elapTimeMs = (currentTime[0] * 1000) + (currentTime[1] / 1e6) // ms
        const cpuTimeMs = (currentUsage.user + currentUsage.system) / 1000 // μs to ms

        const cpuPercent = (cpuTimeMs / elapTimeMs) / numCores

        prevUsage = process.cpuUsage()
        prevTime = process.hrtime()

        return +cpuPercent
    }

    public request(method: string, data?: any): Promise<any> {
        if (!this.memory.ready) throw new Error("Worker is not ready")
        return this.messenger.request(method, data)
    }

    public respondTo(method: string, callback: Responder): void {
        this.messenger.respondTo(method, callback)
    }

    public respondToWithProgress(method: string, callback: ResponderWithProgress): void {
        const newCallback: ResponderWithProgress = (data, setProgress) => {
            this.busy = true
            this.progress = 0

            let result: any

            try {
                result = callback(data, setProgress)
                if (result && typeof (result as Promise<any>).then === "function") {
                    return (result as Promise<any>).finally(() => {
                        this.busy = false
                        this.progress = 100
                    })
                } else {
                    return result
                }
            } finally {
                if (!result || typeof (result as Promise<any>).then !== "function") {
                    this.busy = false
                    this.progress = 100
                }
            }
        }

        this.messenger.respondTo(method, newCallback)
    }

    public responderExists(method: string): boolean {
        return this.messenger.responderExists(method)
    }

    public pendingRequestsSize(): number {
        return this.messenger.pendingRequestsSize()
    }

    public emit(event: string, data?: any): void {
        if (!this.memory.ready) throw new Error("Worker is not ready")
        super.emit(event, data)
    }
}
