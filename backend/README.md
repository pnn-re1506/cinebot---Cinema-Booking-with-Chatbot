# CineBot backend

Java 21 and Spring Boot API for the cinema booking demo. PostgreSQL owns sales. Redis owns holds, rate limits and job locks.

## Run locally

Docker Desktop must be running.

```powershell
# from the repository root
docker compose up -d

cd backend
.\mvnw.cmd spring-boot:run "-Dspring-boot.run.profiles=local"
```

The local profile talks to PostgreSQL and Redis on `localhost` (`cinebot` / `cinebot`) and turns Flyway `out-of-order` on. Copy `.env.example` to `.env` when you want to override `JWT_SECRET` or the other variables from `docs/ARCHITECTURE.md` section 12. The local profile has a development-only JWT default so the command above can start without an env file. Do not use that default outside your machine.

- API: `http://localhost:8080`
- Health (PostgreSQL and Redis): `http://localhost:8080/actuator/health`
- OpenAPI: `http://localhost:8080/v3/api-docs`
- Swagger UI: `http://localhost:8080/swagger-ui.html`

Profiles: `local`, `test`, `demo`, `prod`.

## Tests

```powershell
cd backend
.\mvnw.cmd -B verify
```

Integration tests start PostgreSQL 16 and Redis 7 with Testcontainers, so Docker must be running. They read the shared rule fixtures from `../shared/fixtures`.
