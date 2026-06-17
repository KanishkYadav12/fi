# Uptime Monitoring Application - Architecture & Implementation Strategy

## 1. Requirement Review & Minimum Features
The goal is to build a pragmatic, production-ready MVP for monitoring a few dozen URLs.

### Minimum Viable Features (MVF):
* **Monitor Management:** CRUD operations for URLs (Register, List, Delete).
* **Heartbeat Engine:** Periodic pings (e.g., every 1-5 minutes) using HTTP/HTTPS.
* **Data Persistence:** Store response status, latency (ms), and timestamps.
* **Dashboard:** Visual representation of current status (Up/Down) and recent history.
* **Infrastructure:** Containerized setup for easy deployment.

---

## 2. Backend Architecture
A **Service-Oriented Express Application** using TypeScript.

### Structure:
* **Controllers:** Handle HTTP request/response logic and validation.
* **Services:**
    * `MonitorService`: Business logic for CRUD.
    * `PingService`: Logic for executing HTTP requests, measuring time, and handling retries/timeouts.
    * `SchedulerService`: Manages the cron jobs and prevents overlapping executions.
* **Models:** Mongoose schemas for data integrity.
* **Worker/Job Logic:** A background process (triggered by cron) that iterates through active monitors and dispatches ping tasks.

---

## 3. MongoDB Collections & Indexes

### Collection: `Monitors`
Stores the configuration for each URL.
* `url`: String (required, unique)
* `name`: String (optional)
* `interval`: Number (frequency in minutes)
* `status`: Enum ['UP', 'DOWN', 'PENDING']
* `lastChecked`: Date
* `isActive`: Boolean
* **Index:** `{ url: 1 }` (unique), `{ isActive: 1 }`

### Collection: `CheckLogs`
Stores the history of every ping.
* `monitorId`: ObjectId (ref: Monitors)
* `statusCode`: Number
* `responseTime`: Number (ms)
* `timestamp`: Date
* `error`: String (optional)
* **Index:** `{ monitorId: 1, timestamp: -1 }` (for fast history lookups)
* **TTL Index:** `{ timestamp: 1 }, { expireAfterSeconds: 604800 }` (Retention policy: 7 days to keep DB size manageable).

---

## 4. API Endpoints

### Monitors
* `GET /api/monitors`: Fetch all monitors with their current status.
* `POST /api/monitors`: Register a new URL.
* `GET /api/monitors/:id/logs`: Fetch recent history for a specific URL.
* `DELETE /api/monitors/:id`: Remove a monitor.

### System
* `GET /api/health`: Health check for the monitoring service itself.

---

## 5. Cron Strategy
For a "few dozen URLs", a single-instance cron is sufficient and simple.

* **Tool:** `node-cron` or `node-schedule`.
* **Strategy:**
    * A "Master Cron" runs every minute.
    * It queries the `Monitors` collection for any URLs that are due for a check (based on `lastChecked` + `interval`).
    * It uses `Promise.allSettled` to execute pings in parallel without blocking the main loop.
    * **Concurrency Control:** Use a "Processing" flag or a lock in MongoDB if the service scales to multiple instances, though unnecessary for the current requirements.

---

## 6. Frontend Data Requirements
Using Next.js 15 (App Router).

* **Server Components:** Fetch the initial list of monitors for the home page (SEO and speed).
* **Client Components (SWR/React Query):** Handle real-time updates.
    * Polling every 30-60 seconds to refresh the dashboard status.
* **Tailwind CSS:** Responsive grid showing cards for each monitor.
    * Green/Red badges for status.
    * Simple sparkline (if time permits) or a "last 10 pings" indicator.

---

## 7. Potential Pitfalls & Mitigations
* **Overlapping Jobs:** If a ping takes longer than the interval.
    * *Mitigation:* Set a strict `timeout` (e.g., 10s) in the HTTP client (Axios/Fetch).
* **DB Bloat:** `CheckLogs` grows rapidly.
    * *Mitigation:* Implement a MongoDB TTL index for automatic cleanup of logs older than 7-30 days.
* **DNS/Network Spikes:** Transient failures causing "Down" alerts.
    * *Mitigation:* Implement a "Retries" logic (e.g., re-ping 3 times before marking as DOWN).
* **Memory Leaks:** Long-running Node.js processes.
    * *Mitigation:* Proper error handling in the ping loop to ensure promises always resolve.

---

## 8. Senior Implementation Strategy
1. **Pragmatic Start:** Use a single Docker Compose file for Node, Next.js, and MongoDB.
2. **Observability:** Implement structured logging (e.g., Winston/Pino) to track ping failures.
3. **Graceful Shutdown:** Listen for `SIGTERM`/`SIGINT` to allow active pings to finish and close DB connections.
4. **Domain Separation:** Keep the "Ping Engine" logic decoupled from the Express API so it can be moved to a separate worker if the load increases.
5. **Validation:** Use `Zod` or `Joi` for strict API request validation.
