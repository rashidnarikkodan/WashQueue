# WashQueue

WashQueue is a full-stack car wash booking and operations platform that connects customers, wash stations, managers, owners, and administrators in a single workflow. Customers can book services, make payments, track queue progress, and rate their experience. Station managers and owners can manage operations, monitoring bookings, settlements, customer issues, and business performance from a centralized dashboard.

This project is structured as a monorepo with a React frontend and a Node.js backend, designed for modern service businesses that need both customer-facing convenience and operational control.

## Business Overview

WashQueue is designed for a vehicle wash business model where:

- Customers book car wash services online or through a web interface.
- Stations manage service slots, queue flow, and operational status.
- Managers supervise station performance and customer handling.
- Owners monitor revenue, payouts, settlement summaries, and platform performance.
- Administrators oversee platform-wide business activity, issue resolution, and governance.

The platform supports a real service business workflow instead of a simple demo app:

- service booking and scheduling
- queue status tracking and station coordination
- payment collection and payout logic
- customer support and issue management
- review and rating flow
- analytics and reporting
- AI-enabled knowledge and assistant features

## Core Product Features

### Customer Experience
- Book a wash service for a preferred station and time slot
- View service details, pricing, and queue status
- Receive notifications about booking updates
- Complete payment via integrated payment workflows
- Check in and manage bookings through the app
- Submit reviews and feedback after service completion

### Station & Operations Management
- Manage station availability and service flow
- Monitor bookings in the queue
- Track customer arrival, service checkpoints, and completion
- Handle station-specific operational actions

### Business & Finance Layer
- Owner/manager settlement reporting
- Wallet and payout tracking
- Revenue and commission insights
- Payment event handling and settlement logic

### Admin & Governance
- User and role management
- Issue and dispute handling
- Platform operations oversight
- Reporting and business monitoring

### AI & Intelligence Features
- Knowledge document support
- AI-assisted service and business workflows
- vector search and embedding-based retrieval support
- smart operational information access

## Tech Stack

### Frontend
| Layer | Technology |
| --- | --- |
| Client Framework | React 19 |
| Build Tool | Vite |
| Language | TypeScript |
| Routing | React Router |
| State Management | Zustand |
| Styling | Tailwind CSS via Vite plugin |
| UI | Custom component patterns + Lucide icons |
| Real-time | Socket.IO client |
| Maps | MapLibre GL |
| Charts | Recharts |
| Auth | Google OAuth |
| Notifications | Sonner |
| Validation | Zod |

### Backend
| Layer | Technology |
| --- | --- |
| Runtime | Node.js |
| Framework | Express 5 |
| Language | TypeScript |
| Database | MongoDB with Mongoose |
| Cache / Session Store | Redis / Valkey |
| Real-time | Socket.IO |
| Search / AI | Qdrant |
| Security | JWT, Argon2 |
| File Upload | Multer |
| Cloud Storage | Cloudinary |
| Payments | Razorpay |
| Email | Nodemailer |
| Scheduling | node-cron |
| Logging | Pino |
| PDF generation | PDFKit |

### AI / Knowledge Layer
- Qdrant vector database
- LangChain text splitters
- Embedding-based document retrieval
- Ollama-compatible LLM integration
- Knowledge docs for business operations and AI-driven interactions

### Tooling & DevOps
- pnpm workspaces
- Docker Compose
- Vitest
- ESLint
- Prettier
- TypeScript path aliases
- Husky git hooks

## Project Structure

```text
washqueue/
├── README.md
├── docker-compose.yml
├── package.json
├── pnpm-workspace.yaml
├── start.sh
├── simulate_payout.sh
├── client/
│   ├── package.json
│   ├── src/
│   ├── public/
│   └── ...
├── server/
│   ├── package.json
│   ├── src/
│   ├── .env.example
│   └── ...
└── ...
```

### Client
The frontend is organized around product features such as:

- auth
- booking
- queue
- manager
- owner
- admin
- review
- notification
- settlement
- wallet
- users
- vehicle
- station
- AI features

### Server
The backend is split into modular business domains under `src/modules` and supporting infrastructure under `src/infrastructure` and `src/configs`.

Main server concerns include:

- application bootstrapping
- authentication and authorization
- bookings and service scheduling
- queue management
- review and feedback
- wallet, settlement, and payment processing
- notifications and socket events
- AI and knowledge integration
- issue handling and support
- user and role management

## Role Model

The application is designed around multiple user roles:

- Customer
- Station staff / manager
- Business owner
- Administrator

This role-based model enables different flows and dashboards while sharing the same core platform.

## Architecture Overview

The application follows a modular service-style architecture:

- Frontend: user-focused UI and interactions
- Backend API: business operations and domain logic
- Database: persistent business records
- Redis / Valkey: caching and fast operational access
- Qdrant: vector storage for AI/knowledge workflows
- Socket layer: live operational updates and notifications
- Docker: local environment setup for core supporting services

## Local Development Setup

### Prerequisites

Make sure you have the following installed:

- Node.js 24.20+
- pnpm 11+
- Docker and Docker Compose
- Git

### 1) Install dependencies

From the project root:

```bash
pnpm install
```

### 2) Configure environment variables

Copy the example environment file for the backend:

```bash
cp server/.env.example server/.env
```

Then update the values according to your local setup, including:

- MongoDB connection string
- JWT secrets
- Redis host and port
- SMTP configuration for email notifications
- Google OAuth client ID
- Cloudinary credentials
- Razorpay credentials
- client URL

### 3) Start supporting services

This project uses Docker Compose for supporting infrastructure:

```bash
docker compose up -d
```

This includes services such as:

- Valkey / Redis
- Qdrant

### 4) Start the application

Run both frontend and backend in development mode:

```bash
pnpm dev
```

This runs the workspace in parallel using the root script.

You can also start them separately:

```bash
cd server && pnpm dev
cd client && pnpm dev --host
```

## Production / Build Commands

### Build all projects

```bash
pnpm build
```

### Type-check all projects

```bash
pnpm typecheck
```

### Run tests

```bash
pnpm test
```

### Linting and formatting

```bash
pnpm lint
pnpm format
```

## Docker Setup

The repository includes a Docker Compose setup for infrastructure services and backend execution.

```bash
docker compose up --build
```

The Docker configuration exposes core services such as:

- backend on port 3000
- Valkey on port 6379
- Qdrant on ports 6333 and 6334

## Environment Variables

The backend environment file is defined in `server/.env.example` and includes the following categories:

- server runtime and logging
- MongoDB connection
- JWT secrets and expiration
- Redis and SMTP settings
- Google OAuth configuration
- Cloudinary settings
- Razorpay values
- client URL and platform commission config
- AI embedding and LLM configuration
- Qdrant URL

For a full list, see the example file in:

```text
server/.env.example
```

## Quality & Engineering Practices

The project uses:

- strict TypeScript enforcement
- modular backend architecture
- code-splitting for frontend features
- reusable store and API patterns
- centralized configuration and environment handling
- test coverage support via Vitest
- linting and formatting automation

## Suggested Future Enhancements

Possible next steps for this platform include:

- advanced analytics dashboards
- admin audit trails
- more automated payout reconciliation
- stronger customer lifecycle flows
- expanded AI assistant capabilities
- more detailed station workforce management
- mobile app support

## License

This project currently uses the ISC license as defined at the package root.

## Summary

WashQueue is a complete business application for a modern car wash service platform. It combines user booking, queue operations, finance, settlements, notifications, issue management, and AI-powered business workflows into a single scalable solution.

It is designed to serve the operational realities of a service business while providing a strong customer experience and clear business visibility for managers and owners.
