# CineBot – Cinema Booking with Chatbot

Portfolio demo of a single cinema (5 rooms): browse movies, pick seats on a live seat map, pay (VNPay sandbox or Demo Pay), earn points and VIP status, plus an admin site. A booking chatbot and a check-in kiosk are planned for later.

**Stack:** Java 21 + Spring Boot 3.5, PostgreSQL 16, Redis 7 (seat holds) · Vite + React 18 + TypeScript, Tailwind v4, shadcn/ui.

> Work in progress – see [`docs/PROGRESS.md`](docs/PROGRESS.md).

## Run locally (Windows / PowerShell)

Requirements: JDK 21, Docker Desktop, Node.js 22, pnpm 12.

```powershell
docker compose up -d                       # PostgreSQL 16 + Redis 7

cd backend
.\mvnw.cmd spring-boot:run "-Dspring-boot.run.profiles=local"   # http://localhost:8080

cd ..\frontend
pnpm install
pnpm dev                                   # http://localhost:5173, proxies /api to :8080
```

Details: [`backend/README.md`](backend/README.md), [`frontend/README.md`](frontend/README.md).

## Checks

```powershell
cd backend;  .\mvnw.cmd -B verify
cd frontend; pnpm lint; pnpm typecheck; pnpm test --run; pnpm build
```

## Documentation

| File | Content |
| --- | --- |
| [`docs/PRD.md`](docs/PRD.md) | What is being built |
| [`docs/RULES.md`](docs/RULES.md) | Business (`BR-*`) and engineering (`ER-*`) rules |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | Modules, schema, Redis seat holds, API |
| [`docs/DESIGN.md`](docs/DESIGN.md) | Design system and screens |
| [`docs/api/openapi.yaml`](docs/api/openapi.yaml) | API contract |
| [`docs/AGENT-EXECUTION-PLAN.md`](docs/AGENT-EXECUTION-PLAN.md) | Parallel build plan |
| [`docs/PROGRESS.md`](docs/PROGRESS.md) | Status, decisions, open questions |
