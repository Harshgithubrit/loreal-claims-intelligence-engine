# L'Oréal Claims Intelligence Engine

**AI-powered cosmetic product claims evaluation using clinical evidence, statistical analysis, and Large Language Models (LLMs).**

[![Node.js](https://img.shields.io/badge/Node.js-22-green)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-Vite-blue)](https://react.dev/)
[![NestJS](https://img.shields.io/badge/Backend-NestJS-red)](https://nestjs.com/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-blue)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/ORM-Prisma-2D3748)](https://www.prisma.io/)
[![OpenAI](https://img.shields.io/badge/AI-OpenAI-black)](https://platform.openai.com/)

## Overview

The **L'Oréal Claims Intelligence Engine** is a full-stack application designed to streamline the evaluation of cosmetic product claims through structured clinical evidence and AI-assisted analysis.

Cosmetic product claims such as skin hydration improvement, wrinkle reduction, and skin appearance enhancement need appropriate scientific evidence before they can be substantiated.

This application provides a centralized workflow for registering product claims, attaching clinical study data, and evaluating whether the available evidence supports the proposed claim.

The system combines a NestJS backend, PostgreSQL database, React frontend, and OpenAI-powered assessment capabilities.

## Key Features

### 1. Product Claims Management
- Create and manage cosmetic product claims.
- Define claim categories, target metrics, target values, and evaluation durations.
- Track claim status throughout the evaluation workflow.
- View individual claim details.

### 2. Clinical Evidence Management
- Associate clinical studies with product claims.
- Record study design, population, sample size, and duration.
- Capture baseline and follow-up measurements.
- Store control group measurements.
- Record p-values, confidence intervals, and study limitations.
- Identify synthetic or simulated evidence.

### 3. AI-Powered Claim Assessment
- Evaluate clinical evidence against proposed product claims.
- Analyze treatment and control group changes.
- Calculate net treatment effects where sufficient measurements are available.
- Use OpenAI structured outputs for assessment results.
- Generate assessment status, confidence score, reasoning, limitations, and recommendations.
- Preserve assessment history.

### 4. Dashboard
- Monitor total registered claims.
- View pending and assessed claims.
- Review recent claim activity.
- Navigate between application modules.

### 5. Application Navigation
- Dashboard
- Claims Management
- Clinical Evidence
- AI Assessments
- Settings

## Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | React.js, Vite, JavaScript |
| UI | CSS, Lucide React |
| Backend | Node.js, NestJS, TypeScript |
| API | REST APIs |
| Database | PostgreSQL |
| ORM | Prisma |
| AI Integration | OpenAI API |
| Validation | class-validator, class-transformer |
| HTTP Client | Axios |
| Version Control | Git, GitHub |

## System Architecture

```mermaid
flowchart TD
    A[React Frontend] --> B[REST API]
    B --> C[NestJS Backend]

    C --> D[Claims Module]
    C --> E[Clinical Evidence Module]
    C --> F[Assessment Module]

    D --> G[(PostgreSQL)]
    E --> G
    F --> G

    F --> H[Evidence Analysis]
    H --> I[OpenAI API]
    I --> J[Structured Assessment]
    J --> G
    G --> A
```

### Assessment Workflow

```mermaid
flowchart TD
    A[Create Product Claim] --> B[Submit Claim]
    B --> C[Attach Clinical Evidence]
    C --> D[Validate Evidence]
    D --> E[Analyze Study Measurements]
    E --> F[AI Assessment]
    F --> G[Evaluate Claim Support]
    G --> H[Generate Assessment]
    H --> I[Save Assessment]
    I --> J[Display Results]
```

The assessment workflow evaluates the available evidence against the exact claim requirements. Synthetic evidence is identified separately and must not be treated as genuine clinical substantiation.

## Project Structure

```text
loreal-claims-intelligence-engine/
│
├── backend/
│   ├── prisma/
│   │   ├── migrations/
│   │   ├── schema.prisma
│   │   └── prisma.module.ts
│   │
│   ├── src/
│   │   ├── assessments/
│   │   │   ├── assessments.controller.ts
│   │   │   ├── assessments.service.ts
│   │   │   └── assessments.module.ts
│   │   │
│   │   ├── claims/
│   │   │   ├── dto/
│   │   │   ├── claims.controller.ts
│   │   │   ├── claims.service.ts
│   │   │   └── claims.module.ts
│   │   │
│   │   ├── prisma/
│   │   ├── app.module.ts
│   │   └── main.ts
│   │
│   ├── prisma.config.ts
│   └── package.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Claims.jsx
│   │   │   ├── ClaimDetails.jsx
│   │   │   ├── CreateClaim.jsx
│   │   │   ├── ClinicalEvidence.jsx
│   │   │   ├── Assessments.jsx
│   │   │   └── Settings.jsx
│   │   │
│   │   ├── services/
│   │   │   └── api.js
│   │   │
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   └── package.json
│
├── .gitignore
└── README.md
```

## Database Design

The application uses PostgreSQL with Prisma ORM.

Core database entities include:

| Entity | Purpose |
|---|---|
| Claim | Stores product claims and evaluation targets |
| ClinicalEvidence | Stores clinical study information and measurements |
| Assessment | Stores AI assessment results and recommendations |

### Relationships

- A claim can have multiple clinical evidence records.
- A claim can have multiple assessment records.
- Each assessment is associated with a specific claim.
- Evidence and assessment information is persisted in PostgreSQL.

## API Endpoints

Base URL:

```text
http://localhost:3000/api
```

### Claims

| Method | Endpoint | Description |
|---|---|---|
| POST | `/claims` | Create a claim |
| GET | `/claims` | Retrieve all claims |
| GET | `/claims/:id` | Retrieve claim details |
| PATCH | `/claims/:id` | Update a draft claim |
| PATCH | `/claims/:id/submit` | Submit a claim |

### Clinical Evidence

| Method | Endpoint | Description |
|---|---|---|
| POST | `/claims/:id/evidence` | Add clinical evidence |
| GET | `/claims/:id/evidence` | Retrieve claim evidence |

### Assessments

| Method | Endpoint | Description |
|---|---|---|
| POST | `/claims/:id/assess` | Run claim assessment |
| GET | `/claims/:id/assessments` | Retrieve assessment history |

## Getting Started

### Prerequisites

Install the following:

- Node.js 22 or compatible version
- npm
- PostgreSQL 17 or compatible version
- Git
- OpenAI API key (for OpenAI-powered assessment)

### 1. Clone the Repository

```bash
git clone https://github.com/Harshgithubrit/loreal-claims-intelligence-engine.git

cd loreal-claims-intelligence-engine
```

### 2. Backend Setup

Navigate to the backend:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file in the backend directory:

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/loreal_claims?schema=public"

PORT=3000

AI_PROVIDER=openai
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4.1-mini
```

Replace the database credentials with your local PostgreSQL configuration.

Create the database before running migrations.

Run Prisma migrations:

```bash
npx prisma migrate dev
```

Generate the Prisma client:

```bash
npx prisma generate
```

Start the backend development server:

```bash
npm run start:dev
```

Backend API:

```text
http://localhost:3000/api
```

### 3. Frontend Setup

Open another terminal and navigate to the frontend:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file:

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

Start the frontend:

```bash
npm run dev
```

Frontend application:

```text
http://localhost:5173
```

## AI Assessment Configuration

The application supports configuring an AI provider through backend environment variables.

### OpenAI Configuration

```env
AI_PROVIDER=openai
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4.1-mini
```

### Mock Configuration

```env
AI_PROVIDER=mock
OPENAI_MODEL=gpt-4.1-mini
```

Mock mode is intended for development and testing without making external AI API calls.

**Important:** Synthetic study data is for software testing only. It must not be represented as authentic clinical evidence or used to establish real-world product efficacy.

## Running the Application

Run the backend and frontend in separate terminals.

| Application | URL |
|---|---|
| React Frontend | http://localhost:5173 |
| NestJS Backend | http://localhost:3000 |
| API Base URL | http://localhost:3000/api |

## Security Considerations

- Environment variables are excluded from version control.
- API credentials must be stored in local environment files.
- Input validation is implemented using class-validator.
- Database access is managed through Prisma ORM.
- Synthetic evidence is explicitly identified.

Never commit API keys, database passwords, or other sensitive credentials.

## Current Implementation Status

| Feature | Status |
|---|---|
| Claims Management APIs | Implemented |
| Clinical Evidence APIs | Implemented |
| Assessment APIs | Implemented |
| PostgreSQL Integration | Implemented |
| Prisma Database Migrations | Implemented |
| React Dashboard | Implemented |
| Claims UI | Implemented |
| Clinical Evidence UI | Implemented |
| Assessments UI | Implemented |
| Settings UI | Basic frontend implementation |
| OpenAI Assessment Integration | Implemented in backend; requires API configuration |

## Future Enhancements

- Advanced evidence search and filtering.
- Persistent application settings.
- User authentication and role-based authorization.
- Automated test coverage and CI/CD pipeline.
- Assessment explainability and evidence traceability.
- Production deployment and monitoring.

## Author

**Harshvardhan Govinda**

GitHub: [@Harshgithubrit](https://github.com/Harshgithubrit)

Project Repository:

https://github.com/Harshgithubrit/loreal-claims-intelligence-engine

---

*Built as a full-stack AI application exploring the integration of clinical evidence, backend engineering, and LLM-assisted decision support.*