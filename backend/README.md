# Quizio Backend

## Docker

```bash
docker-compose --project-name quizio up --build -d
PGPASSWORD=mysecretpassword psql -h localhost -p 5432 -U root -d quizio
\c
\dt

```
