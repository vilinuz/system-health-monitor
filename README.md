# Service Health & Event Monitor

Welcome to the Service Health & Event Monitor project! This application allows you to monitor your microservices in real-time.

It features a robust **Java 25 / Spring Boot 4** backend and a reactive **Angular 21** frontend.

## 🚀 Getting Started

### Prerequisites
Make sure you have the following installed on your machine:
- **Java 25** (GraalVM recommended)
- **Node.js** (v20+ recommended)
- **Docker** (for the PostgreSQL database)

---

## 🛠️ Running the Application

We use Docker Compose to orchestrate the entire production-like environment, including the PostgreSQL database, the Backend (Java 25 Spring Boot), and the Frontend (Angular 21 served via Nginx).

### 1. Start the Complete Stack
Run the following command to build and start the infrastructure:
```bash
docker compose up -d --build
```

### 2. Access the Application
- **Frontend (Angular)**: The user interface is available at `http://localhost:8082`. Open this in your browser!
- **Backend (Spring Boot)**: The REST and GraphQL APIs are available at `http://localhost:8081`.

---

## 🧪 Running Tests

### Backend Tests
The backend contains comprehensive JUnit tests covering the repositories and services.
```bash
./gradlew test
```

### End-to-End Test Script
We've provided a simple script that automates the process of standing up the database, compiling the code, running the backend tests, starting the server, and performing a basic endpoint smoke test.

```bash
chmod +x run-e2e.sh
./run-e2e.sh
```

---

## 🔐 Credentials
If you are prompted for login credentials at any point, use the default development basic auth:
- **Username:** `admin`
- **Password:** `admin`

## 📚 Tech Stack Highlights
- **Structured Concurrency (Java 25):** The event generator uses the latest `StructuredTaskScope` API to concurrently fork event generation tasks without leaking threads.
- **Virtual Threads:** Enabled by default for all HTTP requests to provide massive scalability.
- **GraalVM Native Image:** The project is configured to be compiled into a lightning-fast native binary.
- **Dual APIs:** REST for flat Service CRUD, and GraphQL for deeply nested Event querying.
- **Angular 21 Zoneless:** Blazing fast frontend relying entirely on Angular Signals instead of `zone.js`.