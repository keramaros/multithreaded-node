# 🧠 Heavy Task Handling with Worker Example

This example demonstrates how to handle **heavy or long-running tasks** in a **worker thread**, while ensuring that **no other requests are accepted** until the current task completes.

The worker exposes a simple busy/available mechanism:

- When a heavy task starts, the worker marks itself as **busy**.
- Any new requests during that time are **rejected immediately** with an error.
- The worker **periodically reports progress** back to the main thread.
- When the task finishes, it sends the **final result** and marks itself as **free** again.

---

## How It Works

1. **Main Thread Sends a Heavy Request**
    - The main thread starts a worker and sends a request that simulates a **time-consuming operation** (e.g., large computation or file processing).

2. **Worker Marks Itself as Busy**
    - The worker sets its internal state to `busy = true`.
    - Any subsequent requests while busy are **rejected** with a clear error message.

3. **Progress Updates**
    - While processing, the worker periodically updates the **progress percentage** back to the main thread (e.g., `25%`, `50%`, `75%`).

4. **Completion & Reset**
    - Once the heavy task is finished, the worker sends the **final result** back to the main thread.
    - It then sets `busy = false`, making itself ready for the **next request**.

---

## Run the Example

```bash
   npm run example:progress
```

You should see an output in the console with the sum of the array
