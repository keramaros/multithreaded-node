import SharedMemory, {MemoryIndex} from "../../src/SharedMemory"

enum MemoryIndexExtended {
    Counter = MemoryIndex.COUNT,

    Listening,
    Connections,
    // Add new properties here.

    COUNT
}

export default class SharedMemoryExtended extends SharedMemory {
    protected get requiredLength(): number {
        return MemoryIndexExtended.COUNT
    }

    get listening(): boolean {
        return this._getFlag(MemoryIndexExtended.Listening)
    }

    set listening(value: boolean) {
        this._setFlag(MemoryIndexExtended.Listening, value)
    }

    get connections(): number {
        return this._getValue(MemoryIndexExtended.Connections)
    }

    set connections(value: number) {
        this._setValue(MemoryIndexExtended.Connections, value)
    }
}
