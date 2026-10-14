# Agent Guidelines for Quizio

## API Schema & Types
- **NEVER update `app/src/api-client/schema.d.ts` directly.**
- Always use the `pnpm api-types` script (run from `app/`, with the backend running on `localhost:8080`) to regenerate API types from `http://localhost:8080/docs/openapi.json`.

