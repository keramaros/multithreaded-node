import {type MessagePort, Worker} from "node:worker_threads"

const EventEmitterSymbol: unique symbol = Symbol("port")

type EventCallbackRow = {
    id: number
    event: string
    callback: (data: any) => void
    once: boolean
}
type EventCallback = (data: any) => void

export default class EventEmitter {
    protected eventCallbacks: EventCallbackRow[] = []
    protected [EventEmitterSymbol]!: Worker | MessagePort
    private nextId = 0

    constructor(parent: Worker | MessagePort) {
        this[EventEmitterSymbol] = parent
        this[EventEmitterSymbol].on("message", (message: any) => {
            if (!Array.isArray(message)) return
            if (typeof message[0] !== "number") return

            if (message[0] === 0) {
                const [type, event, data] = message
                if (typeof message[1] !== "string") return

                for (const cb of [...this.eventCallbacks]) {
                    if (cb.event !== event) continue
                    if (cb.once) {
                        this.off(cb.id)
                    }
                    cb.callback(data)
                }
            }
        })
    }

    public emit(event: string, data?: any) {
        this[EventEmitterSymbol].postMessage([0, event, data])
    }

    public on(event: string, callback: EventCallback): number {
        const id = this.nextId++
        this.eventCallbacks.push({id, event, callback, once: false})
        return id
    }

    public once(event: string, callback: EventCallback): number {
        const id = this.nextId++
        this.eventCallbacks.push({id, event, callback, once: true})
        return id
    }

    public off(id: number): void;
    public off(event: string, callback: EventCallback): void;
    public off(idOrEvent: number | string, callback?: EventCallback): void {
        if (typeof idOrEvent === "number") {
            this.eventCallbacks = this.eventCallbacks.filter((cb) => cb.id !== idOrEvent)
        } else if (typeof idOrEvent === "string" && callback) {
            this.eventCallbacks = this.eventCallbacks.filter((cb) => cb.event !== idOrEvent || cb.callback !== callback)
        }

        throw new Error("Invalid arguments")
    }

    public clear(event: string): void {
        this.eventCallbacks = this.eventCallbacks.filter(cb => cb.event !== event)
    }

    public clearAll(): void {
        this.eventCallbacks = []
    }

    public listeners(event: string): EventCallback[] {
        return this.eventCallbacks
            .filter(cb => cb.event === event)
            .map(cb => cb.callback)
    }

    public listenerCount(event: string): number {
        return this.eventCallbacks.filter(cb => cb.event === event).length
    }

    public eventNames(): string[] {
        return [...new Set(this.eventCallbacks.map(cb => cb.event))]
    }

    public removeListener(event: string, callback: EventCallback): void {
        this.eventCallbacks = this.eventCallbacks.filter(
            cb => cb.event !== event || cb.callback !== callback
        )
    }

    public waitFor(event: string): Promise<any> {
        return new Promise(resolve => this.once(event, resolve))
    }
}
