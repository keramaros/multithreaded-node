import Main from "./Main"
import {startWorker, StartWorkerOptions} from "./index"

type PoolOptions = StartWorkerOptions & {
    keepAliveWorkers?: number
    terminateIdleWorkers?: number
}

class Pool extends Array<Main> {
    readonly filename: string
    readonly options: PoolOptions
    protected removeFunction: (worker: Main) => void
    protected readonly idleWorkersInterval?: NodeJS.Timeout

    constructor(filename: string, options: PoolOptions = {}) {
        super()
        this.filename = filename
        this.options = options
        this.removeFunction = (worker: Main) => this.remove(worker)

        if (this.options.terminateIdleWorkers) {
            let intervalWorking: boolean = false
            this.idleWorkersInterval = setInterval(async () => {
                if (intervalWorking) return
                intervalWorking = true

                const availableWorkers = this.filter(worker => !worker.busy)
                const keepAliveWorkers = this.options.keepAliveWorkers ?? 0
                if (availableWorkers.length > keepAliveWorkers) {
                    const now = Date.now()
                    for (const worker of availableWorkers) {
                        if (this.length <= keepAliveWorkers) break
                        if (worker.busy) continue
                        if (now - worker.lastMessageReceived < (this.options.terminateIdleWorkers ?? 0)) continue
                        await worker.terminate()
                    }
                }

                intervalWorking = false
            }, this.options.terminateIdleWorkers > 1_000 ? this.options.terminateIdleWorkers : 1_000)
        }
    }

    protected cleanup(item: Main): void {
        item.off("exit", this.removeFunction)
    }

    public async destroy(): Promise<Pool> {
        const all = []
        while (this.length > 0) {
            const worker = this.shift()
            if (!worker) continue
            all.push(worker.terminate())
        }
        await Promise.all(all)
        return this
    }

    public shift(): Main | undefined {
        const worker = super.shift()
        if (worker) {
            this.cleanup(worker)
        }
        return worker
    }

    public unshift(...items: Main[]): number {
        items.forEach(item => item.on("exit", this.removeFunction))
        return super.unshift(...items)
    }

    public pop(): Main | undefined {
        const worker = super.pop()
        if (worker) {
            this.cleanup(worker)
        }
        return worker
    }

    public push(...items: Main[]): number {
        items.forEach(item => item.on("exit", this.removeFunction))
        return super.push(...items)
    }

    async new(): Promise<Main> {
        const worker = await startWorker(this.filename, this.options)
        this.push(worker)
        return worker
    }

    nextIdle(): Main | undefined {
        return this.find(worker => worker.ready && !worker.busy)
    }

    async next(): Promise<Main> {
        return this.nextIdle() ?? this.new()
    }

    remove(worker: Main): Pool {
        const index = this.indexOf(worker)
        if (index < 0) return this
        this.splice(index, 1)
        return this
    }
}
