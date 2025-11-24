# 🔄 Main ↔ Worker Request/Response Communication Example

This example demonstrates how the **main thread** can **delegate a computation** (in this case, the sum of an array of numbers) to a **worker thread**, and receive the result asynchronously.

By offloading the calculation to a worker, the main thread stays free to handle other tasks without being blocked.

This is a two-way communication, meaning the worker can also request data from the main thread.

---

## How It Works

1. **Main Thread Starts the Worker**
    - The main thread creates a new worker thread.
    - It sends a request containing an array of numbers to be summed.

2. **Worker Processes the Request**
    - The worker receives the array, calculates the **sum**, and sends the result back to the main thread.

3. **Main Thread Receives the Response**
    - The main thread receives for the worker’s response and logs the sum.
    - If the worker fails to process the request, it logs an error.

---

## Run the Example

```bash
   npm run example:messenger
```

You should see an output in the console with the sum of the array
