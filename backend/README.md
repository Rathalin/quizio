# Quizio Backend

## Docker

```bash
GO_ENV=local docker-compose --project-name quizio -f docker-compose.local.yml --env-file=.env.local up --build -d
PGPASSWORD=mysecretpassword psql -h localhost -p 5432 -U root -d quizio
git diff --shortstat $(git rev-list --max-parents=0 HEAD)
openssl rand -hex 32

```
