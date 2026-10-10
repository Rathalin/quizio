# Quizio Backend

This is the backend service for Quizio, providing a REST API and database interactions.

## Local Development

You can start the backend locally using Docker Compose:

```bash
GO_ENV=local docker-compose --project-name quizio -f docker-compose.local.yml --env-file=.env.local up --build -d
```
