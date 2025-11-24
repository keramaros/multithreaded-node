# Multithreaded-Node Toolkit

A Node.js module providing tools to create high-performance, multithreaded applications.

Enhances communication between the main thread and workers using events and promises, utilizes shared memory for real-time updates, and much more.

---

## Table of Contents

- [Installation](#-installation)
- [Features](#-features)
- [Getting Started](#-getting-started)
- [Examples](#-examples)
- [Running Tests](#-running-tests)
- [License](#-license)
- [Contributing](#-contributing)
- [Notes](#-notes)

---

## Installation

Install using the following command

```bash
npm install multithreaded-node
```

## Features

- No dependencies
- Event-based communication between the main thread and the worker
- Asynchronous request between the main thread and the worker
- Shared memory between the main thread and the worker
- Progress updates for heavy tasks
- Worker state management

## Getting Started

Below is a minimal structure to get you started with a main thread and a worker.

### 1. Using events

Set up a listener on the worker thread and emit events from the main thread.

#### 📄 main.ts

```js
import {startWorker} from "multithreaded-node"

const worker = await startWorker("./worker.ts")

// you can emit events
worker.emit("print", "Hello from the main thread!")
```

#### 📄 worker.ts

```js
import {initializeWorker} from "multithreaded-node"

const thread = initializeWorker()

// listen for events
thread.on('print', (msg) => {
    console.log(msg);
});
```

### 2. Using Promises

Send a request to the worker and receive a response using promises.

#### 📄 main.ts

```js
import {startWorker} from "multithreaded-node"

const worker = await startWorker("./worker.ts")

// request something async
worker.request("add", [1, 2]).then((result) => {
    console.log(result)
}).catch((err) => {
    console.error(err)
})
```

#### 📄 worker.ts

```js
import {initializeWorker} from "multithreaded-node"

const thread = initializeWorker()

// respond to requests
thread.respondTo('add', (array) => {
    return array.reduce((a, b) => a + b, 0);
});
```

### 3. Real-time statistics

Get the current CPU and memory usage of the worker.

#### 📄 main.ts

```js
import {startWorker} from "multithreaded-node"

const worker = await startWorker("./worker.ts")

console.log(worker.cpuUsage, "%")
console.log(worker.memorySnapshot)
```

#### 📄 worker.ts

```js
import {initializeWorker} from "multithreaded-node"

const thread = initializeWorker()

thread.trackMemory = true
thread.trackCpuUsage = true
```

## Examples

Here’s a list of the examples included in this repository:

| Example                                                                           | Description                                                                   |
|-----------------------------------------------------------------------------------|-------------------------------------------------------------------------------|
| [🔄 Main ↔ Worker Event Communication](./examples/events/README.md)               | Emit and capture events between the main thread and the worker                |
| [🔄 Main ↔ Worker Request/Response Communication](./examples/messenger/README.md) | Send asynchronous request to the worker and receive a response using promises |
| [🧪 Extend The Shared Memory](./examples/extendSharedMemory/README.md)            | An example on how to use the SharedMemory and how to extend it                |
| [🧠 Heavy Task Handling with Worker](./examples/progress/README.md)               | Handle heavy tasks with a busy state and progress updates                     |

## Running Tests

You can run the test suite with:

```bash
npm test
```

## License

This project is licensed under the [MIT License](./LICENSE).

## Contributing

Pull requests and improvements are welcome!
If you have additional worker-thread examples, feel free to submit a PR and expand the collection.

## Notes

- No external libraries are required — only Node.js built-in worker_threads is required.
- Great for building advanced worker-based systems.
- Works seamlessly with modern async/await syntax
