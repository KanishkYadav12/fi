# Uptime Monitoring Application - Architecture & Implementation Strategy

## 1. Requirement Review & Minimum Features
The goal is to build a pragmatic, production-ready MVP for monitoring a few dozen URLs.

### Minimum Viable Features (MVF):
* **Monitor Management:** CRUD operations for URLs (Register, List, Delete).
* **Heartbeat Engine:** Every monitor is checked exactly every minute.
* **Data Persistence:** Store response status, latency (ms), and timestamps.
* **Dashboard:** Visual representation of current status (Up/Down), recent history, and global statistics.
* **Infrastructure:** Containerized setup for easy deployment.

---

## 2. Backend Architecture
A **Service-Oriented Express Application** using TypeScript.

### Structure:
* **Controllers:** Handle HTTP request/response logic and validation.
* **Services:**
    * `MonitorService`: Business logic for CRUD and statistics calculation.
    * `PingService`: Logic for executing HTTP requests with a strict 10-second timeout and no retries.
    * `SchedulerService`: Manages the minute-by-minute cron job.
* **Models:** Mongoose schemas for data integrity.

---

## 3. MongoDB Collections & Indexes

### Collection: `Monitors`
Stores the configuration and latest state for each URL.
* `url`: String (required, unique)
* `name`: String (optional)
* `status`: Enum ['UP', 'DOWN', 'PENDING']
* `lastResponseTime`: Number (ms)
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
* **Index:** `{ monitorId: 1, timestamp: -1 }`
* **TTL Index:** `{ timestamp: 1 }, { expireAfterSeconds: 604800 }` (7-day retention).

---

## 4. API Endpoints

### Monitors
* `GET /api/monitors`: Fetch all monitors. Response includes `status`, `lastResponseTime`, and `lastChecked`.
* `POST /api/monitors`: Register a new URL.
* `DELETE /api/monitors/:id`: Remove a monitor.

### Dashboard
* `GET /api/dashboard/stats`: Returns `{ total, up, down }`.

### System
* `GET /api/health`: Health check for the monitoring service.

---

## 5. Cron Strategy
* **Tool:** `node-cron`.
* **Strategy:**
    * A cron job runs every minute (`* * * * *`).
    * It fetches all active monitors.
    * It executes pings in parallel using `Promise.allSettled`.
    * Each ping has a strict 10s timeout and no retry logic.

---

## 6. Frontend Data Requirements
Using Next.js 15 (App Router).

* **Server Components:** Initial fetch of monitors and stats.
* **Client Components (SWR/React Query):**
    * Polling every 60 seconds to refresh the dashboard status and stats.
* **Tailwind CSS:** Responsive grid showing cards for each monitor with Green/Red indicators.

---

## 7. Potential Pitfalls & Mitigations
* **Request Timeouts:** Pings taking too long. *Mitigation:* Strict 10s timeout.
* **DB Bloat:** *Mitigation:* 7-day TTL index on `CheckLogs`.
* **Scalability:** For "dozens of URLs", `Promise.allSettled` is fine. For thousands, a message queue (BullMQ/Redis) would be required.

---

## 8. Senior Implementation Strategy
1. **Graceful Shutdown:** Ensure the cron job and DB connections close properly.
2. **Error Handling:** Centralized middleware to catch and log all exceptions.
3. **Validation:** Use `Zod` for API request validation.
4. **Environment:** Use `.env` for MongoDB URI and Port.
