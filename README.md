# WashQueue 🚀

## Overview

WashQueue is a real-time vehicle wash management platform designed for both queue-based station execution and on-site service dispatching.

It manages:
* **Live Queue Operations** at wash stations
* **Slot-based & Walk-in** bookings
* **Real-time Service Tracking**
* **Payments & Settlements**
* **Provider & Admin Governance**

The system is built for high concurrency using Redis, MongoDB, and WebSockets.

---

## Tech Stack

### Monorepo
* [Turborepo](https://turbo.build/)
* [pnpm](https://pnpm.io/) workspaces

### Frontend
* **Next.js** (App Router)
* **TypeScript**
* **Tailwind CSS**
* **TanStack Query** (Server state management)
* **Zustand** (Client state management)
* **Socket.IO Client**

### Backend
* **Node.js**
* **Express.js**
* **MongoDB (Atlas)**
* **Redis** (Queues, cache, distributed locks)
* **Socket.IO** (Real-time updates)
* **BullMQ** (Background jobs)

### Auth & Payments
* **JWT-based auth** + OTP verification
* **Razorpay** payment gateway integration

### Third-party Services
* **Firebase Cloud Messaging (FCM)** for push notifications
* **SendGrid** for transactional emails
* **Sentry** for performance monitoring & error tracking

---

## Project Structure (Turborepo)

```bash
apps/
  ├── web/        # Next.js web application frontend
  ├── server/     # Express.js backend server API
  └── docs/       # Documentation site

packages/
  ├── ui/                 # Shared React UI component library
  ├── eslint-config/      # Shared ESLint configuration
  └── typescript-config/  # Shared tsconfig profiles
```

---

## Installation & Setup

### 1. Clone Repository

```bash
git clone https://github.com/your-org/washqueue.git
cd washqueue
```

### 2. Install Dependencies

Using pnpm workspaces:

```bash
pnpm install
```

### 3. Environment Variables Configuration

Create `.env` files for the respective applications.

#### Backend (`apps/server/.env`)

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/washqueue
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_jwt_refresh_secret
RAZORPAY_KEY=your_razorpay_key
RAZORPAY_SECRET=your_razorpay_secret
FCM_SERVER_KEY=your_fcm_key
SENDGRID_API_KEY=your_sendgrid_key
```

#### Frontend (`apps/web/.env`)

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

---

## Running the Project

### Start Development Server

Run the development pipelines for all applications and packages concurrently:

```bash
pnpm dev
```

This starts:
* Next.js Web App on `http://localhost:3000`
* Express Backend Server on `http://localhost:5000`
* Shared UI package building/watching

### Individual App Commands

You can run commands for specific workspaces:

#### Web Frontend
```bash
pnpm --filter web dev
```

#### Backend Server
```bash
pnpm --filter server dev
```

---

## Build & Production Commands

### Build All Workspaces
```bash
pnpm build
```

### Start Production Bundles
```bash
pnpm start
```

---

## Core System Architecture

WashQueue uses a distributed, decoupled architecture:
* **UI & Client State**: Next.js handles client-side rendering and user actions, using Zustand and TanStack Query.
* **API Service**: Express processes business logic and interacts with the database layer.
* **Persistent Storage**: MongoDB acts as the primary source of truth for structural/relational data.
* **Distributed Cache & Queues**: Redis manages real-time station queue states, soft locks, capacity windows, and coordinates with BullMQ for running background workers.

---

## Core Modules

### 1. Booking System
* Hybrid scheduling supporting slot-based appointments and real-time walk-in bookings.
* Redis-based distributed locking to guarantee concurrency safety and prevent double-booking.
* Comprehensive status tracking lifecycle (`pending`, `confirmed`, `in_progress`, `completed`, `cancelled`).

### 2. Execution & Dispatch Engines
* **Queue Engine**: Manages physical station workflows, bay allocations, and vehicle sequences.
* **Dispatch Engine**: Coordinates on-site services, matching field agents to dynamic customer coordinates.

### 3. Financial & Wallet Ledger
* Double-entry ledger system for wallets and refunds.
* Live Razorpay gateway payment tracking.
* Automated provider settlement calculation and processing rules.

### 4. Pricing & Promos
* Configurable base rates, platform commission tiers, promotions, and dynamic demand-based pricing adjustments.

### 5. Intelligence Layer
* Wait-time prediction algorithms based on station throughput.
* Security check rules for preventing transactional fraud.

---

## Database Schema Model

### MongoDB Collections
* `users`
* `stations`
* `bookings`
* `vehicles`
* `payments`
* `reviews`
* `wallet_transactions`
* `notifications`

### Redis Key Structures
* `station:queue:<id>` (Sorted Sets)
* `booking:active:<id>` (String/Hash trackers)
* `capacity:window:<date>` (Hash map slot tracking)
* `lock:booking:<id>` (Short TTL mutex keys)
