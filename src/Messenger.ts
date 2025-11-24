import {type MessagePort, Worker} from "node:worker_threads"

const EventEmitterSymbol: unique symbol = Symbol("port")

type RequestResolver = { resolve: (data: any) => void, reject: (data: any) => void }
export type Responder = (data: any) => any
export type SetProgress = (progress: number) => void
export type ResponderWithProgress = (data: any, setProgress: SetProgress) => any

export default class Messenger {
    protected resolvers: Map<number, RequestResolver> = new Map()
    protected responders: Map<string, Responder | ResponderWithProgress> = new Map()
    protected [EventEmitterSymbol]!: Worker | MessagePort

    constructor(parent: Worker | MessagePort, setProgress: SetProgress) {
        this[EventEmitterSymbol] = parent
        this[EventEmitterSymbol].on("message", (message: any) => {
            if (!Array.isArray(message)) return
            if (typeof message[0] !== "number") return

            if (message[0] === 1) {
                const [type, id, method, data] = message
                if (typeof message[1] !== "number") return
                if (typeof message[2] !== "string") return

                if (this.responders.has(method)) {
                    Promise.resolve()
                        .then(() => this.responders.get(method)!(data, setProgress))
                        .then(response => this[EventEmitterSymbol].postMessage([2, id, response]))
                        .catch(error => this[EventEmitterSymbol].postMessage([3, id, error]))
                } else {
                    this[EventEmitterSymbol].postMessage([3, id, new Error("Unknown request method: " + method)])
                }
            } else if (message[0] === 2) {
                const [type, id, data] = message
                if (typeof message[1] !== "number") return
                const resolver = this.resolvers.get(id)
                if (!resolver) return
                resolver.resolve(data)
                this.resolvers.delete(id)
            } else if (message[0] === 3) {
                const [type, id, data] = message
                if (typeof message[1] !== "number") return
                const resolver = this.resolvers.get(id)
                if (!resolver) return
                resolver.reject(data)
                this.resolvers.delete(id)
            }
        })
    }

    public request(method: string, data?: any): Promise<any> {
        let id: number
        do {
            id = Math.random()
        } while (this.resolvers.has(id))

        return new Promise<any>((resolve, reject) => {
            this.resolvers.set(id, {resolve, reject})
            this[EventEmitterSymbol].postMessage([1, id, method, data])
        })
    }

    public respondTo(method: string, callback: Responder | ResponderWithProgress): void {
        this.responders.set(method, callback)
    }

    public responderExists(method: string): boolean {
        return this.responders.has(method)
    }

    public pendingRequestsSize(): number {
        return this.resolvers.size
    }
}
