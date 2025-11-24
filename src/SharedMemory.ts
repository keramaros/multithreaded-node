export enum MemoryIndex {
    ThreadId,
    Ready,
    Busy,
    cpuUsage,
    MemoryHeapUsed,
    MemoryHeapTotal,
    MemoryExternal,
    MemoryArrayBuffers,
    MemoryRss,
    MemoryLastSnapshot,
    LastMessageReceived,
    Uptime,
    progress,
    // Add new properties here.

    COUNT
}

export default class SharedMemory {
    readonly buffer: Int32Array

    constructor(buffer?: Int32Array) {
        if (buffer) {
            if (buffer.length < this.requiredLength) {
                throw new Error(`Provided buffer is too small. Expected at least ${this.requiredLength} elements, but got ${buffer.length}.`)
            }
            this.buffer = buffer
        } else {
            const byteLength = Int32Array.BYTES_PER_ELEMENT * this.requiredLength
            this.buffer = new Int32Array(new SharedArrayBuffer(byteLength))
        }
    }

    protected get requiredLength(): number {
        return MemoryIndex.COUNT
    }

    protected _getValue(index: number): number {
        return Atomics.load(this.buffer, index)
    }

    protected _setValue(index: number, value: number): void {
        Atomics.store(this.buffer, index, value)
    }

    protected _getFlag(index: number): boolean {
        return !!Atomics.load(this.buffer, index)
    }

    protected _setFlag(index: number, value: boolean): void {
        Atomics.store(this.buffer, index, Number(value))
    }

    // --- Properties ---

    get threadId(): number {
        return this._getValue(MemoryIndex.ThreadId)
    }

    set threadId(value: number) {
        this._setValue(MemoryIndex.ThreadId, value)
    }

    get ready(): boolean {
        return this._getFlag(MemoryIndex.Ready)
    }

    set ready(value: boolean) {
        this._setFlag(MemoryIndex.Ready, value)
    }

    get busy(): boolean {
        return this._getFlag(MemoryIndex.Busy)
    }

    set busy(value: boolean) {
        this._setFlag(MemoryIndex.Busy, value)
    }

    get cpuUsage(): number {
        return this._getValue(MemoryIndex.cpuUsage)
    }

    set cpuUsage(value: number) {
        this._setValue(MemoryIndex.cpuUsage, value)
    }

    get memoryHeapUsed(): number {
        return this._getValue(MemoryIndex.MemoryHeapUsed)
    }

    set memoryHeapUsed(value: number) {
        this._setValue(MemoryIndex.MemoryHeapUsed, value)
    }

    get memoryHeapTotal(): number {
        return this._getValue(MemoryIndex.MemoryHeapTotal)
    }

    set memoryHeapTotal(value: number) {
        this._setValue(MemoryIndex.MemoryHeapTotal, value)
    }

    get memoryExternal(): number {
        return this._getValue(MemoryIndex.MemoryExternal)
    }

    set memoryExternal(value: number) {
        this._setValue(MemoryIndex.MemoryExternal, value)
    }

    get memoryArrayBuffers(): number {
        return this._getValue(MemoryIndex.MemoryArrayBuffers)
    }

    set memoryArrayBuffers(value: number) {
        this._setValue(MemoryIndex.MemoryArrayBuffers, value)
    }

    get memoryRss(): number {
        return this._getValue(MemoryIndex.MemoryRss)
    }

    set memoryRss(value: number) {
        this._setValue(MemoryIndex.MemoryRss, value)
    }

    get memoryLastSnapshot(): number {
        return this._getValue(MemoryIndex.MemoryLastSnapshot)
    }

    set memoryLastSnapshot(value: number) {
        this._setValue(MemoryIndex.MemoryLastSnapshot, value)
    }

    get uptime(): number {
        return this._getValue(MemoryIndex.Uptime)
    }

    set uptime(value: number) {
        this._setValue(MemoryIndex.Uptime, value)
    }

    get lastMessageReceived(): number {
        return this._getValue(MemoryIndex.LastMessageReceived)
    }

    set lastMessageReceived(value: number) {
        this._setValue(MemoryIndex.LastMessageReceived, value)
    }

    get progress(): number {
        return this._getValue(MemoryIndex.progress)
    }

    set progress(value: number) {
        this._setValue(MemoryIndex.progress, value)
    }
}
