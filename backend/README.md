# Quizio Backend

## Docker

```bash
GO_ENV=production docker-compose --project-name quizio up --build -d
PGPASSWORD=mysecretpassword psql -h localhost -p 5432 -U root -d quizio
git diff --shortstat $(git rev-list --max-parents=0 HEAD)
openssl rand -hex 32

```
