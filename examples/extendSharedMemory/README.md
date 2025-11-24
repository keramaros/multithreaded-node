# 🧪 Extend The Shared Memory

This example demonstrates how we can extend the shared memory by **simulate a WebSocket server** using a **worker thread** to handle incoming connections.  
The goal is to show how the number of active connections can be updated in **real time**, without the need for additional requests.

---

## How It Works

1. **Main Thread Initialization**
    - The main thread starts by launching a **worker** that will handle all WebSocket connections.

2. **Starting the Listener**
    - When the system is ready, the main thread sends a message to the worker, instructing it to **start listening** for incoming connections.

3. **Real-Time Updates**
    - As new clients connect, the worker updates the **connections count**.
    - This value is sent back to the main thread in **real time**, without any extra polling or manual refresh.

---

## Run the Example

```bash
   npm run example:extendSharedMemory
```

You should see logs in your terminal showing the number of active connections being updated as new clients connect.
