# 🔄 Main ↔ Worker Event Communication Example

This example demonstrates how to **emit and capture events** between the **main thread** and a **worker**, enabling structured and reactive communication.

Instead of passing simple messages, this pattern shows how you can build a small **event system** that allows both sides to send and handle custom events — much like a lightweight event emitter.

---

## How It Works

1. **Worker Initialization**
    - The main thread starts a worker, which runs in a separate thread.
    - Both sides set up simple event listeners to handle incoming messages.

2. **Emitting Events**
    - The main thread can emit custom events to the worker (e.g., `"ping"`).
    - The worker receives the event, processes it, and can emit another event back (e.g., `"pong"`).

3. **Bidirectional Communication**
    - Each event includes a **type** and **payload**, making the communication clean and easy to extend.

---

## Run the Example

```bash
   npm run example:events
```

You should see logs in your terminal showing how the working is processing the event.
