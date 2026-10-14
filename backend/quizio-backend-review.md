# Quizio backend review

**Scope:**
- `backend/` (Go API) and `db/` (Postgres schema and migrations) in full.
- Wherever they affect the backend: `infra/`, `.github/`, and the NextAuth config in `app/`.

**Snapshot:** commit `6d6f015` (`main`), reviewed 2026-10-07.

**Method:** this is a static review. Every file in scope was read by hand. Two swaggest behaviours were checked against upstream source: error bodies and schema validation. Nothing was executed. `govulncheck`, tests and live exploit attempts were **not** run.

---

## TL;DR

The backend is about 3k lines of Go and easy to read. It gets several fundamentals right:
- Every SQL query is parameterised.
- Ownership checks on `/me/quizzes/{uuid}` are consistent.
- Writes that span several tables run in one transaction.
- The OpenAPI contract is generated from the code and drives a typed frontend client.

That's a better baseline than most side projects.

The weak spots are at the edges: **file handling**, **token handling** and **input bounds**. Two issues are serious enough to fix before anything else:

1. **Any registered user can delete arbitrary files** in the container, such as other users' uploads or the server binary, via `DELETE /me/upload?filename=../../…` ([S1](#s1--critical--arbitrary-file-deletion-via-delete-meupload)).
2. **Refresh tokens are accepted as access tokens, and the frontend exposes them to browser JS.** A leaked session therefore becomes a 7-day bearer token that sign-out doesn't revoke ([S3](#s3--high--refresh-tokens-double-as-access-tokens-and-the-browser-can-read-them)).

**Top 5 fixes, in order:**
1. Generate upload filenames on the server and confine all file operations with `os.OpenRoot` (S1, S2).
2. Require `type == "access"` in the auth middleware. Enforce `is_blocked`, and revoke refresh tokens on password change (S3, S6).
3. Cap the request body size, stop serving SVG inline, and turn off directory listing (S4, S5, S9).
4. Map errors in one place: user errors become 4xx, `sql.ErrNoRows` becomes 404, and internal errors become a generic 500 (S7, B4, B5).
5. Stop CI from pushing `:latest` on pull requests, and gate builds on vet, tests and govulncheck (S13).

---

## 1. Stack and concepts

### Backend

| Area | Technology | How it's used |
|---|---|---|
| Language | Go 1.24 (built with 1.25.5) | One module, split into `handlers`, `models`, `auth`, `db`, `env` and `middlewares` |
| Router | [chi v5](https://github.com/go-chi/chi) | Route groups: public, `/me` (JWT), `/seo` (API key) and `/docs` (basic auth) |
| API framework | [swaggest rest + usecase](https://github.com/swaggest/rest) | Each endpoint is a typed **interactor** `func(ctx, input, *output) error`. swaggest decodes requests, enforces the JSON schema (`required`, `enum`, …) and generates OpenAPI 3 by reflection |
| API docs | swgui (Swagger UI v5) | `/docs`, behind HTTP basic auth (open in `local`) |
| Validation | go-playground/validator v10 | `validate:"…"` tags, on top of swaggest's schema validation |
| Auth | go-chi/jwtauth v5 (lestrrat jwx), HS256 | Access JWT valid 3h, refresh JWT valid 7d. Refresh tokens are also stored in Postgres |
| Passwords | bcrypt (`x/crypto`), default cost 10 | |
| Data access | `database/sql` + `lib/pq` | Hand-written SQL, no ORM or query builder |
| Logging | zerolog, std `log` and `fmt` | See [P1](#6-patterns-and-maintainability) |
| Config | godotenv | Loads `.env.<GO_ENV>`, falls back to process env, fails fast if anything is missing |
| CORS | rs/cors | `AllowAll` |
| File storage | Local FS | `./public/uploads/<userUuid>/` on a Docker volume, served by `http.FileServer` |
| Tooling | air (hot reload), Taskfile | Includes `task audit` (govulncheck) and `task outdated` |

### Database

| Area | Details |
|---|---|
| Engine | PostgreSQL 17 |
| Migrations | golang-migrate, sequential `up`/`down` SQL files (3 so far) |
| Identity | `BIGSERIAL` internal primary keys, plus `UUID DEFAULT gen_random_uuid()` as the public ID |
| Integrity | FK chain user → quiz → question → answer with `ON DELETE CASCADE`; `order_index` for ordering |
| Housekeeping | An `update_updated_at_column()` trigger on every table |
| Analytics | `play_protocol_entry`: one row per play, with an optional user |
| Content | `alert` holds banner messages with DE/EN markdown and a visibility rule |

### Infra and CI
- A multi-stage Docker build produces a static binary (`CGO_ENABLED=0`) on alpine.
- docker compose for local and prod. Prod joins an external `web-net` network behind a reverse proxy, with CPU and memory limits.
- GitHub Actions build and push images to GHCR. Adminer gets its own image with a custom theme.
- A shell script backs up the Docker volumes.

### Frontend integration
- Next.js 16 with a next-auth **credentials provider**. Its `authorize` calls `/sign-in`, and its `jwt` callback refreshes through `/refresh-token`.
- `openapi-typescript` generates `schema.d.ts` from `/docs/openapi.json`, and `openapi-fetch` is the client. **The Go struct tags are the API contract.**

### Concepts worth naming
- **One interactor per endpoint, one file per handler.**
- **Ownership-scoped routes.** Everything under `/me` takes the user from the JWT, never from the request body.
- **Diff-based nested update.** `UpdateMyQuiz` upserts questions and answers by UUID and deletes the ones missing from the payload, all in one transaction.
- **A bridge for legacy analytics.** Plays migrated from Strapi carry a fixed `played_at`. The trends endpoint spreads them out as a daily average so the chart stays continuous.

---

## 2. What's done well

- **No SQL injection surface.** Every value goes through `$n` placeholders. The two dynamic `ORDER BY` clauses are built from hard-coded whitelists, and the input is also constrained by an `enum` that swaggest enforces. See [get_quizzes.go:58-65](../backend/handlers/get_quizzes.go#L58-L65) and [get_my_quizzes.go:45-52](../backend/handlers/get_my_quizzes.go#L45-L52).
- **Consistent ownership checks.** Every `/me/quizzes/{uuid}` handler calls `QuizExistsForUser` before touching data, and the user ID always comes from the token. `UpdateMyQuiz` only updates child rows whose UUIDs were loaded from *this* quiz ([update_my_quiz.go:109](../backend/handlers/update_my_quiz.go#L109), [:176](../backend/handlers/update_my_quiz.go#L176)), so another quiz's question UUID can't be smuggled in. I looked specifically for an IDOR here and didn't find one.
- **Internal and public IDs are separate.** Sequential keys stay internal and the API only exposes UUIDv4s. That's good for joins and makes enumeration impossible.
- **Password storage.** Passwords are hashed with bcrypt. Sign-in returns the same "invalid username or password" whether the username or the password was wrong.
- **Transactions where they matter.** Creating and updating a quiz each run in a single transaction with `defer tx.Rollback()`. That's the correct idiom, since a rollback after commit does nothing.
- **Contract-first in practice.** The `required`/`nullable` tags produce precise OpenAPI types, and the frontend generates its client from them. Handlers return `make([]T, 0)` instead of `nil`, so arrays are always `[]` and never `null`. The frontend benefits directly from that attention to detail.
- **Config hygiene:**
  - Missing env vars stop the app at startup.
  - Secrets are logged as `(hidden)`.
  - The docs use chi's `BasicAuth`, which compares in constant time.
  - No real secrets turned up in git history. The old `my-quiz-app/.env*` files held only public URLs.
- **Schema basics.** The schema has `updated_at` triggers, cascading deletes and versioned up/down migrations. Aggregates use `COUNT(DISTINCT …)` so joins don't inflate the counts.
- **Ops basics.** The build produces a static binary, prod compose sets resource limits, and there's a backup script and a govulncheck task.
- **Frontend choices that cover backend gaps.** `prefixWithBackendUrl` means a user-supplied image URL can never become a `javascript:` URL. Alert markdown is rendered with `react-markdown` without `rehype-raw`.
- **Readability.** One handler per file, descriptive names and small packages make the code easy to navigate.

---

## 3. Security findings

**Scale:**
- **Critical**: any user can exploit it, with serious impact.
- **High**: serious impact, or very easy abuse.
- **Medium**: needs extra conditions, or has limited impact.
- **Low**: hardening.

| ID | Severity | Finding |
|---|---|---|
| S1 | **Critical** | Path traversal leads to arbitrary file deletion (`DELETE /me/upload`) |
| S2 | High | Path traversal leads to arbitrary file creation (`POST /me/upload`) |
| S3 | High | Refresh tokens are accepted as access tokens, and browser JS can read them |
| S4 | High | Stored XSS through SVG uploads |
| S5 | High | Upload size is unbounded and there's no quota |
| S6 | High | Sessions can't be revoked, and blocked users can still sign in |
| S7 | Medium | Internal error details are returned to clients |
| S8 | Medium | No rate limiting anywhere |
| S9 | Medium | Every upload directory can be listed |
| S10 | Medium | The trends endpoint has an unbounded date range (DoS) |
| S11 | Medium | Pagination is unbounded |
| S12 | Medium | The HTTP server has no timeouts and no graceful shutdown |
| S13 | Medium | CI publishes `:latest` from pull requests |
| S14 | Medium | Infra: DB and Adminer sit on the shared proxy network, the container runs as root, and local Postgres is exposed |
| S15 | Low | Draft quizzes can be read publicly by UUID |
| S16 | Low | The profile image endpoint is a file-existence oracle |
| S17 | Low | Password and username policy gaps |
| S18 | Low | Refresh tokens are stored in plaintext and never rotated or purged |
| S19 | Low | Timing side channels in sign-in and the SEO key check |
| S20 | Low | CORS allows every origin |
| S21 | Low | The example config contains real-looking secrets |
| S22 | Info | Correct answers are sent to the client |

### S1 · Critical — Arbitrary file deletion via `DELETE /me/upload`

**Where:** [delete_my_file.go:15](../backend/handlers/delete_my_file.go#L15), [delete_my_file.go:37](../backend/handlers/delete_my_file.go#L37), [file_utils.go:17-20](../backend/handlers/file_utils.go#L17-L20)

The `filename` query parameter goes straight into `filepath.Join("./public/uploads/<you>/", filename)`. `Join` resolves `..` segments, so these requests all work:

```
DELETE /me/upload?filename=../<victimUuid>/avatar.png   → deletes another user's file
DELETE /me/upload?filename=../../../main                → deletes the server binary (/app/main)
DELETE /me/upload?filename=../../../../etc/passwd       → deletes anything the process can delete
```

**Why it's critical:**
- Registration is open, so any visitor can do this.
- The container runs as root.
- Victims' user UUIDs are public: they appear in profile URLs and quiz listings, and the directory listing in S9 shows all of them.
- Deleting `/app/main` survives `restart: always`, because the container's writable layer keeps the deletion. The API stays down until someone recreates the container.

**Fix:** never let the client choose a path. Accept only a bare filename, and do every file operation through an `os.Root` (Go 1.24+), which refuses to leave its directory:

```go
root, err := os.OpenRoot(filepath.Join("public", "uploads", userUuid))
if err != nil { /* … */ }
defer root.Close()

if input.Filename != filepath.Base(input.Filename) {
	return status.Wrap(errors.New("invalid filename"), status.InvalidArgument)
}
if err := root.Remove(input.Filename); err != nil { /* … */ }
```

Use the same approach in `DeleteFile` ([file_utils.go:33](../backend/handlers/file_utils.go#L33)). That function already applies `path.Base`, but routing every file operation through one confined helper keeps the code safe after future refactors.

### S2 · High — Arbitrary file creation via `POST /me/upload`

**Where:** [upload_my_file.go:19](../backend/handlers/upload_my_file.go#L19), [upload_my_file.go:54-72](../backend/handlers/upload_my_file.go#L54-L72)

This is the same `filepath.Join` pattern with a `filename` from the client:
- `../<victimUuid>/x.png` writes into another user's folder.
- `../../../../<anywhere>/x.png` writes anywhere root can write.

Today it can't overwrite existing files, but only because the de-duplication loop switches to `x_1.png` when the name is taken. That loop is check-then-act: it calls `os.Stat`, then `os.Create`, and `os.Create` truncates. Two concurrent uploads with the same name can therefore overwrite each other.

**Why it's High and not Critical:** the extension allowlist and the no-overwrite behaviour limit the damage today. A single careless refactor would remove those limits.

**Fix:** generate the name on the server and create the file exclusively. This also removes the de-duplication loop:

```go
ext := strings.ToLower(filepath.Ext(input.Filename))
if !slices.Contains(AllowedFileTypes, strings.TrimPrefix(ext, ".")) {
	return status.Wrap(errors.New("invalid file type"), status.InvalidArgument)
}
name := uuid.NewString() + ext
f, err := root.OpenFile(name, os.O_WRONLY|os.O_CREATE|os.O_EXCL, 0o644)
```

Also, `os.MkdirAll(uploadDir, os.ModePerm)` creates world-writable `0777` directories. Use `0o755` instead.

### S3 · High — Refresh tokens double as access tokens, and the browser can read them

**Where:** [auth.go:15](../backend/auth/auth.go#L15), [jwt_utils.go:19-52](../backend/handlers/jwt_utils.go#L19-L52), [main.go:72-75](../backend/main.go#L72-L75), [`[...nextauth].page.ts:97-100`](<../app/src/pages/api/auth/[...nextauth].page.ts#L97-L100>)

Both token types are HS256 JWTs signed with the same key. The only difference is a `type` claim. `jwtauth.Authenticator` checks just the signature and `exp`, and no code anywhere checks `type`. **The 7-day refresh token therefore works on every `/me/*` route.**

On the frontend, the NextAuth `session` callback copies the whole JWT, including `accessToken` and `refreshToken`, into `session.user`. Client JS can read that via `useSession()` or `/api/auth/session`.

**What that adds up to:**
- Any XSS in the Next app, or a malicious browser extension, gets a 7-day API credential.
- Signing out doesn't help. `/me/signout` deletes the DB row, but the token is a JWT and stays valid until `exp`.

**Fix:**
- After `jwtauth.Authenticator`, add a middleware that rejects anything that isn't an access token:
  ```go
  func RequireAccessToken(next http.Handler) http.Handler {
  	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
  		_, claims, err := jwtauth.FromContext(r.Context())
  		if err != nil || claims["type"] != "access" {
  			http.Error(w, http.StatusText(http.StatusUnauthorized), http.StatusUnauthorized)
  			return
  		}
  		next.ServeHTTP(w, r)
  	})
  }
  ```
- Better still, make refresh tokens opaque random strings (32 bytes from `crypto/rand`) instead of JWTs, and store only a hash (see S18). A refresh token then can't be used as a bearer token at all.
- In NextAuth, give the client only what it needs: the UUID and the short-lived access token. **Never expose the refresh token.** It belongs only in the encrypted next-auth JWT cookie.

### S4 · High — Stored XSS through SVG uploads

**Where:** [file_utils.go:56](../backend/handlers/file_utils.go#L56) (`svg` is allowed), [main.go:52](../backend/main.go#L52) (`http.FileServer`)

The only check on uploads is the file extension; the content is never inspected. `http.FileServer` serves SVGs from `go.quizio.flockert.at` as `Content-Type: image/svg+xml`. An SVG containing `<script>` runs when someone opens the image URL directly, for example from a link posted in a quiz description or a chat.

The impact is limited because the API runs on a different origin from the app (`quizio.flockert.at`) and authenticates with a header, not a cookie. A script there can't simply use someone's session. It's still arbitrary JS on your domain:
- It can host a convincing fake sign-in page under `go.quizio.flockert.at/public/...`.
- Because it's on the same *site* as the app, it can set cookies for `.flockert.at` (cookie tossing), and SameSite cookie rules don't stop that.

**Fix:**
- The simplest fix is to drop SVG from the allowlist.
- Otherwise, serve uploads with `Content-Security-Policy: sandbox; default-src 'none'` and `X-Content-Type-Options: nosniff`, ideally from a separate domain that holds no cookies.
- In both cases, check the real content type with `http.DetectContentType` (or `gabriel-vasile/mimetype`, which is already an indirect dependency) instead of trusting the extension.

### S5 · High — Unbounded upload size, no quota

**Where:** [upload_my_file.go:20](../backend/handlers/upload_my_file.go#L20), [upload_my_file.go:76](../backend/handlers/upload_my_file.go#L76)

Uploads arrive as base64 inside JSON (`File []byte`). There's no `http.MaxBytesReader`, no size check and no per-user quota:
- **Memory:** a single request with a multi-GB body is decoded entirely into memory. Base64 adds about 33%, and the decoder briefly holds both copies. The prod container is capped at 2 GB, so the process gets OOM-killed.
- **Disk:** many small uploads fill the volume, and nothing tracks or cleans up the files (see B9).

**Fix:**
- Apply `http.MaxBytesReader` globally with a small limit, and allow a larger one (for example 5 MB) only on `/me/upload`.
- Switch uploads to `multipart/form-data` and stream them to disk.
- Record uploads in a table with owner and size. That makes quotas and cleanup possible.

### S6 · High — Sessions can't be revoked, and blocked users can still sign in

**Where:** [sign_in.go:50-58](../backend/handlers/sign_in.go#L50-L58), [refresh_token.go:28-32](../backend/handlers/refresh_token.go#L28-L32), [change_my_password.go:60-64](../backend/handlers/change_my_password.go#L60-L64)

- **Blocked users aren't blocked.** `is_blocked` and `is_confirmed` are written at registration and returned by `GetMyAccount`, but nothing ever checks them. The seed data even contains a blocked user, `petro_zwackel` ([seed.sql:15](../db/scripts/seed.sql#L15)), who can sign in normally.
- **Changing the password doesn't end other sessions.** The user's refresh tokens aren't deleted, so a stolen session survives the one step users take to recover from a compromise.
- **There's no kill switch.** Access tokens are stateless for 3 hours and, because of S3, refresh tokens act the same way for 7 days. The server has no way to end a session.

**Fix:**
- Check `is_blocked` in sign-in and in refresh.
- On password change, run `DELETE FROM refresh_token WHERE user_account_id = $1` in the same transaction as the password update.
- If you need immediate revocation, add a `token_version` claim and compare it on each request. A cheap variant is a version column read in the auth middleware.

### S7 · Medium — Internal error details are returned to clients

**Where:** [utils.go:11-19](../backend/handlers/utils.go#L11-L19), and every `return logAndReturnError(err)`

swaggest's `rest.Err` puts `err.Error()` into the response body for **every** error. Any error not wrapped with `status.Wrap` becomes a 500. Raw driver and filesystem errors therefore reach the client word for word:

| Request | Response body contains |
|---|---|
| `POST /create-play-protocol-entry {"quizUuid":"x"}` | `pq: invalid input syntax for type uuid: "x"` |
| `POST /create-play-protocol-entry` with an unknown UUID | `sql: no rows in result set` |
| A failed upload | `failed to create file: open public/uploads/<uuid>/…` (internal paths) |

**Fix:** map errors in one helper that replaces `logAndReturnError`:
- `sql.ErrNoRows` becomes a 404.
- Validation errors become a 400.
- Everything else becomes a generic 500 with a request ID.
- The full error goes only to the logs.

### S8 · Medium — No rate limiting

`/sign-in`, `/register`, `/refresh-token` and the anonymous `/create-play-protocol-entry` have no throttling. That allows:
- password guessing against any account
- mass account creation
- inflating any quiz's play count with a simple loop, which also grows `play_protocol_entry` without limit. This works on unpublished quizzes too.

**Fix:**
- Add [`go-chi/httprate`](https://github.com/go-chi/httprate) per IP on the public route group, with tighter limits on the auth endpoints.
- De-duplicate plays, for example one per IP or session per quiz every N minutes.

### S9 · Medium — Every upload directory can be listed

**Where:** [main.go:52](../backend/main.go#L52)

`http.FileServer` renders an index page for any directory:
- `GET /public/uploads/` lists every user's UUID.
- `GET /public/uploads/<uuid>/` lists all of that user's files. That includes images from unpublished quizzes and files that were removed from quizzes but never deleted from disk.

It also hands an S1 attacker a complete list of victims.

**Fix:** wrap the filesystem in a small `http.FileSystem` that returns `os.ErrNotExist` for directories, or move uploads to object storage.

### S10 · Medium — Trends endpoint: unbounded date range

**Where:** [get_my_quiz_trends.go:16-17](../backend/handlers/get_my_quiz_trends.go#L16-L17), [get_my_quiz_trends.go:175](../backend/handlers/get_my_quiz_trends.go#L175)

`from` and `to` have no bounds, and the loop that fills in missing days runs once per day in the range. `from=0001-01-01&to=9999-12-31` builds about 3.65 million entries per request, hundreds of MB of JSON. A handful of concurrent requests is enough to exceed the 2 GB container limit. Any registered user can do this against their own quiz.

**Fix:** reject ranges longer than about 366 days, and reject requests where `to` is before `from`.

### S11 · Medium — Unbounded pagination

**Where:** [get_quizzes.go:18-19](../backend/handlers/get_quizzes.go#L18-L19), [get_quizzes.go:99-101](../backend/handlers/get_quizzes.go#L99-L101), [get_quizzes.go:112](../backend/handlers/get_quizzes.go#L112)

`page` and `pageSize` have no bounds:
- `pageSize=100000` returns the whole catalogue, with joins and aggregation on every row.
- `pageSize=0` sets `totalPages` to `int(+Inf)`, which is a garbage value.
- Negative values cause a Postgres error, returned as a 500 that includes the message (see S7).

**Fix:** add swaggest `minimum`/`maximum` tags, which are enforced at decode time. For example `minimum:"1" maximum:"50"` on `pageSize` and `minimum:"0"` on `page`.

### S12 · Medium — No server timeouts and no graceful shutdown

**Where:** [main.go:135](../backend/main.go#L135)

`http.ListenAndServe` runs a server with no timeouts. Clients that send headers or bodies slowly (Slowloris) can hold connections open indefinitely. There's also no graceful shutdown, so every deploy cuts off requests in flight, including half-written uploads.

**Fix:**

```go
srv := &http.Server{
	Addr:              ":8080",
	Handler:           service,
	ReadHeaderTimeout: 5 * time.Second,
	ReadTimeout:       30 * time.Second,
	WriteTimeout:      30 * time.Second,
	IdleTimeout:       120 * time.Second,
}
ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
defer stop()
go func() { _ = srv.ListenAndServe() }()
<-ctx.Done()
shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
defer cancel()
_ = srv.Shutdown(shutdownCtx)
```

### S13 · Medium — CI publishes `:latest` from pull requests

**Where:** [docker-build-backend.yml:9](../.github/workflows/docker-build-backend.yml#L9), [docker-build-backend.yml:34](../.github/workflows/docker-build-backend.yml#L34). The Adminer workflow has the same problem.

Both workflows run on `pull_request` and always run `docker push …:latest`. For a PR from a branch in this repo, an image built from unreviewed, unmerged code becomes `latest`, which is exactly what production compose pulls. Other gaps:
- Nothing gates the build: no `go vet`, no tests, no `govulncheck`.
- Images are tagged only `latest`, so there's no older image to roll back to.
- Login uses a long-lived `GHCR_PAT`, even though the job already declares `packages: write`, so `GITHUB_TOKEN` would do.

**Fix:**
- Build on PRs, but push only on `push` to `main` (`if: github.event_name == 'push'`).
- Tag images with `${{ github.sha }}` as well as `latest`.
- Log in with `GITHUB_TOKEN`.
- Add a job that runs `go vet ./...`, `go test ./...` and `govulncheck ./...` before the build.

### S14 · Medium — Infrastructure exposure

**Where:** [docker-compose.production.yml:27-51](../infra/docker-compose.production.yml#L27-L51), [docker-compose.local.yml:28](../infra/docker-compose.local.yml#L28), [Dockerfile](../backend/Dockerfile), [db.go:15](../backend/db/db.go#L15)

- **Postgres and Adminer share the external `web-net` network** with the reverse proxy and possibly other stacks. Every container on that network can reach Postgres, protected only by the password. Give the DB an internal network that only the backend joins.
- **Adminer runs in production.** It's a full DB admin UI. If the proxy routes to it, the DB has a public login page; if not, it's still a service you don't need. Use an SSH tunnel to a local Adminer or psql instead.
- **Local compose publishes `5432` on every interface.** On a laptop using public Wi-Fi, that exposes a Postgres whose password is `password`. Use `127.0.0.1:5432:5432`.
- **The backend container runs as root**, because the Dockerfile has no `USER`. That's why S1 and S2 reach the whole filesystem. Run as a non-root user, or use `gcr.io/distroless/static:nonroot`.
- `sslmode=disable` is fine on a private Docker network, but not if the DB ever moves to another host.

### S15 · Low — Draft quizzes can be read publicly by UUID

**Where:** [get_quiz.go:62](../backend/handlers/get_quiz.go#L62), [get_quiz.go:99](../backend/handlers/get_quiz.go#L99), [create_my_play_protocol_entry.go:53](../backend/handlers/create_my_play_protocol_entry.go#L53)

`GET /quizzes/{uuid}` and the play-protocol endpoints never check `is_published`. Anyone with a draft's UUID can fetch the draft, correct answers included. UUIDv4s can't be guessed, so in practice drafts behave like "unlisted" links.

**Fix:**
- If that's intentional, for example so authors can share a quiz before publishing, document it.
- If not, add `AND q.is_published` to the query, and give authors an authenticated preview route instead.

### S16 · Low — File-existence oracle in `/me/update-image`

**Where:** [update_my_user_profile_image.go:29-37](../backend/handlers/update_my_user_profile_image.go#L29-L37), [utils.go:21-23](../backend/handlers/utils.go#L21-L23)

`fileExists` calls `os.Stat("." + profileImageUrl)` without checking where the path leads:
- Sending `"/../../etc/shadow"` reveals whether any given path exists in the container.
- Whatever value is sent gets stored as the profile URL.
- Users can also set another user's upload as their own avatar.

**Fix:** require the value to start with `/public/uploads/<own uuid>/`, and check it through that user's `os.Root`.

### S17 · Low — Password and username policy

**Where:** [validators.go:13-29](../backend/handlers/validators.go#L13-L29), [register.go:28-47](../backend/handlers/register.go#L28-L47), [change_my_password.go:16](../backend/handlers/change_my_password.go#L16)

**Passwords:**
- **Composition rules with too few special characters.** The special-character class doesn't include `-`, `_` or space, so `Pass-word1`, `Pass_word1` and `Pass word1` are all rejected. NIST SP 800-63B favours length (12 or more characters) over composition rules.
- **No upper limit.** bcrypt rejects passwords longer than 72 bytes, so a long passphrase gets a 500.
- **Register and change-password disagree.** `change-password` caps passwords at 50 characters. It also declares `min=6`, which `isValidPassword` overrides with 8.
- **Wasted hashing.** The password is hashed before the username is checked for duplicates. Every attempt with a taken username costs a bcrypt hash, which is cheap to abuse without rate limiting.

**Usernames:**
- **Length is checked before trimming.** `"  a  "` passes the "at least 3 characters" check and is stored as `"a"`. There's also no maximum.
- **Uniqueness is case-sensitive.** `Rathalin` and `rathalin` can both exist, which allows impersonation. Use `citext`, or a unique index on `lower(username)`.

### S18 · Low — Refresh token storage

**Where:** [000001_init.up.sql:24-31](../db/migrations/000001_init.up.sql#L24-L31), [sign_in.go:81-84](../backend/handlers/sign_in.go#L81-L84), [refresh_token.go:28-32](../backend/handlers/refresh_token.go#L28-L32)

- **Stored in plaintext.** Anyone who can read the DB, for example through a leaked backup or Adminer access, gets working sessions. Store `sha256(token)` instead.
- **Never rotated.** `/refresh-token` issues a new access token but keeps the same refresh token for 7 days. Rotating it, with reuse detection, limits the damage from a leak.
- **Never purged.** Every sign-in adds a row, and expired rows are never deleted.
- **Indexed the wrong way.** The `UNIQUE (user_account_id, token)` index leads with the user ID, so it can't serve `WHERE token = $1` efficiently. Index `token` (or its hash) on its own.

### S19 · Low — Timing side channels

- **Sign-in timing reveals whether a username exists.** Sign-in returns immediately for an unknown username, but runs bcrypt (roughly 50–100 ms) for a known one ([sign_in.go:39-41](../backend/handlers/sign_in.go#L39-L41)). Usernames are public on profiles and in quiz listings, so the impact is low.
- **The SEO API key isn't compared in constant time.** It uses `!=` ([api_token_middleware.go:17](../backend/middlewares/api_token_middleware.go#L17)). Use `subtle.ConstantTimeCompare`.

### S20 · Low — CORS allows every origin

**Where:** [main.go:47](../backend/main.go#L47)

Auth uses the `Authorization` header rather than cookies, and `AllowAll` doesn't allow credentials, so this can't be exploited directly. Limiting `AllowedOrigins` to `https://quizio.flockert.at`, plus localhost in dev, is free defence in depth.

### S21 · Low — Example config with real-looking secrets

**Where:** [backend/.env.example:2](../backend/.env.example#L2), [backend/.env.example:11-12](../backend/.env.example#L11-L12)

`JWT_SECRET` is a real-looking 64-character hex value, and the docs credentials are `admin`/`admin`. If anyone sets up an environment from the example, the JWT key is public and anyone can mint a token for any `userId`.

**Fix:**
- Use obvious placeholders such as `JWT_SECRET=change-me`.
- Outside `local`, refuse to start if the secret equals the example or is shorter than 32 bytes.

### S22 · Info — Correct answers are sent to the client

**Where:** [get_quiz.go:93](../backend/handlers/get_quiz.go#L93), [get_quiz.go:169](../backend/handlers/get_quiz.go#L169)

The play endpoint includes `isCorrect` for every answer, and the play page checks answers locally, so anyone can read the answers in the network tab. That's a reasonable trade-off for a casual quiz app, because play counts aren't scores. If you add scores or leaderboards later, answer checking has to move to the server.

---

## 4. Bugs and correctness

**B1. A quiz without a description can't be opened in the editor.**
[get_my_quiz.go:30](../backend/handlers/get_my_quiz.go#L30) declares `Description string`, and [:130](../backend/handlers/get_my_quiz.go#L130) scans the nullable `description_text` into it. That fails with "converting NULL to string is unsupported", which becomes a 500. The create and update APIs explicitly allow `description: null`. Use `*string`, as every other handler does.

**B2. An answer's `updatedAt` is taken from its question.**
[get_quiz.go:165](../backend/handlers/get_quiz.go#L165) uses `row.Question.UpdatedAt`. The copy of this code in `GetMyQuiz` is correct ([get_my_quiz.go:181](../backend/handlers/get_my_quiz.go#L181)). This is a typical copy-paste divergence (see P3).

**B3. Validation of questions and answers never runs.**
- validator doesn't descend into slices unless the tag includes `dive` ([create_my_quiz.go:24](../backend/handlers/create_my_quiz.go#L24), [:32](../backend/handlers/create_my_quiz.go#L32); [update_my_quiz.go:28](../backend/handlers/update_my_quiz.go#L28), [:37](../backend/handlers/update_my_quiz.go#L37)). All the per-question and per-answer `min`/`max` rules are dead. Titles are effectively unlimited, and the DB columns are unlimited `TEXT` too.
- `validation:"max=400"` is a typo for `validate:` ([create_my_quiz.go:22](../backend/handlers/create_my_quiz.go#L22), [update_my_quiz.go:26](../backend/handlers/update_my_quiz.go#L26)). Explanation length won't be checked even after adding `dive`.
- **Two tags will break things as soon as `dive` is added:**
  - `IsCorrect bool validate:"required"` ([create_my_quiz.go:15](../backend/handlers/create_my_quiz.go#L15)) rejects `false`, because `required` means "not the zero value".
  - `UUID *string validate:"required,uuid4"` ([update_my_quiz.go:14](../backend/handlers/update_my_quiz.go#L14), [:22](../backend/handlers/update_my_quiz.go#L22)) rejects `null`, which is what every newly added question or answer sends. Use `omitempty,uuid4` instead.
- Nothing checks that a question has at least one correct answer.

**B4. User errors are reported as 500.**
Errors not wrapped in `status.Wrap` default to 500. That includes "username too short", "password too weak", "invalid refresh token" and upload I/O errors ([register.go:28-36](../backend/handlers/register.go#L28-L36), [refresh_token.go:34](../backend/handlers/refresh_token.go#L34), [change_my_password.go:33](../backend/handlers/change_my_password.go#L33), [upload_my_file.go:50](../backend/handlers/upload_my_file.go#L50)). An invalid refresh token should be a 401. As a 500, the frontend can't tell "logged out" from "server down".

**B5. Unknown or malformed UUIDs return 500 instead of 404.**
`GetQuizId` passes `sql.ErrNoRows` or a pq syntax error straight up ([create_my_play_protocol_entry.go:27](../backend/handlers/create_my_play_protocol_entry.go#L27), [:53](../backend/handlers/create_my_play_protocol_entry.go#L53)).

**B6. Pagination is off.**
- [get_quizzes.go:51-54](../backend/handlers/get_quizzes.go#L51-L54) counts *all* quizzes, with no `WHERE is_published`. `totalItems` and `totalPages` are too high, and the last pages come back empty.
- `ORDER BY play_count` (and `created_at`) has no tie-breaker, so rows with equal values can repeat or disappear between pages. Add `, q.id`.

**B7. Trends logic** ([get_my_quiz_trends.go](../backend/handlers/get_my_quiz_trends.go)):
- **The migrated daily average depends on the chosen window.** The total of migrated plays is divided by the length of the *requested* range ([:150-151](../backend/handlers/get_my_quiz_trends.go#L150-L151)). The same day in the past shows a different "average" in a 7-day view than in a 1-year view. Divide by the number of days between quiz creation and the migration date instead.
- **A zero-length range crashes.** When `from == to`, `daysBetween` is 0 and the average becomes `NaN`/`+Inf`. If that day is before the migration date, the value is serialised, `encoding/json` refuses it, and the request fails with a 500.
- **The requested range is ignored.** The query hard-codes `NOW() - INTERVAL '1 year'` ([:129](../backend/handlers/get_my_quiz_trends.go#L129)) instead of using `from`/`to`, so older ranges show zeros.
- **A database connection can leak.** `entriesPerDayRows` is closed by hand at [:171](../backend/handlers/get_my_quiz_trends.go#L171), so the early returns at [:147](../backend/handlers/get_my_quiz_trends.go#L147) and [:162-167](../backend/handlers/get_my_quiz_trends.go#L162-L167) leave it open and hold a pool connection. Use `defer`.
- **Off-by-one days around midnight.** `played_at` is a `TIMESTAMP` without time zone, unlike every other column, and days are bucketed with `TO_CHAR` in the server's time zone while `from`/`to` come in the client's.

**B8. Ignored or late error checks.**
- [get_alerts.go:43](../backend/handlers/get_alerts.go#L43) ignores the error from `rows.Scan` entirely.
- These append the scanned value *before* checking `err`: [update_my_quiz.go:98-102](../backend/handlers/update_my_quiz.go#L98-L102), [:166-170](../backend/handlers/update_my_quiz.go#L166-L170) and [get_seo_published_quizzes_uuids.go:32-36](../backend/handlers/get_seo_published_quizzes_uuids.go#L32-L36).
- No handler checks `rows.Err()` after the loop. If the connection drops mid-stream, truncated data goes out as a success.

**B9. File lifecycle.**
- **Orphaned files.** `UpdateMyQuiz` never deletes images that were replaced or that belonged to removed questions or answers. They stay on disk forever.
- **`DeleteMyQuiz` deletes in the wrong order** ([delete_my_quiz.go:45-123](../backend/handlers/delete_my_quiz.go#L45-L123)):
  - It deletes the files *before* the DB row, outside any transaction. If the `DELETE` fails, the quiz survives with broken images.
  - It runs one query per question (N+1).
  - `defer answerRows.Close()` sits inside the loop ([:102](../backend/handlers/delete_my_quiz.go#L102)), so every result set stays open until the handler returns. `UpdateMyQuiz` has the same problem ([update_my_quiz.go:163](../backend/handlers/update_my_quiz.go#L163)).
- **Uploads aren't recorded in the DB.** There's no way to find orphans, enforce quotas or know which files a user owns. A `file` table (owner, path, size, mime type, created_at) referenced from quiz, question and answer would solve all three.

**B10. Upload type list.**
- `"acc"` should be `"aac"` ([file_utils.go:62](../backend/handlers/file_utils.go#L62)).
- The extension check is case-sensitive, so `photo.JPG` is rejected.

**B11. Small inconsistencies:**
- [sign_in.go:84](../backend/handlers/sign_in.go#L84) hard-codes `7*24*time.Hour` instead of using `auth.RefreshTokenTTL`.
- [env.go:69](../backend/env/env.go#L69) says `POSTGRES_PW`, but the variable is `POSTGRES_PASSWORD`.
- The security scheme format is misspelled `"baerer"` ([main.go:44](../backend/main.go#L44), [:70](../backend/main.go#L70), [:103](../backend/main.go#L103)) and ends up in the OpenAPI spec.
- [models/answer.go:7-8](../backend/models/answer.go#L7-L8) uses `created_at`/`updated_at` as JSON names; every other model uses camelCase.
- The comment at [jwt_utils.go:60](../backend/handlers/jwt_utils.go#L60) says the claims are int64, but they're `float64`, which is why the cast exists.
- Typos: "wtih" ([get_my_quiz.go:77](../backend/handlers/get_my_quiz.go#L77), [get_my_quiz_trends.go:59](../backend/handlers/get_my_quiz_trends.go#L59)) and "does not exists" in several messages.

---

## 5. Database and migrations

**D1. golang-migrate can't apply migration 1.**
- [000001_init.up.sql:1-9](../db/migrations/000001_init.up.sql#L1-L9) runs `CREATE DATABASE` inside `BEGIN`, which Postgres doesn't allow in a transaction block.
- It also uses `\c`, which is a psql meta-command, not SQL.
- The file only works when pasted into psql. The migrate URL already selects the database, so both lines can go.
- The down migration tries to `DROP DATABASE quizio` and drop the extension ([000001_init.down.sql:28-31](../db/migrations/000001_init.down.sql#L28-L31)). Neither belongs in a migration.

**D2. Migration 3 broke `alert` in two ways.**
[000003…up.sql:3-22](../db/migrations/000003_add_markdown_with_locale_to_alert.up.sql#L3-L22) rebuilds the table: it creates `alert_new`, copies the rows, drops `alert` and renames. As a result:
- **The trigger is gone.** `set_updated_at_alert` was dropped along with the old table, so `alert.updated_at` no longer updates.
- **Inserts collide.** A new `alert_new_id_seq` starts at 1, but the copied rows kept their IDs. The next insert without an explicit `id` fails with `duplicate key value violates unique constraint` until the sequence passes the highest existing ID.

The same change could have been a rename and an added column:

```sql
ALTER TABLE alert RENAME COLUMN markdown_content TO markdown_de;
ALTER TABLE alert ADD COLUMN markdown_en TEXT;
UPDATE alert SET markdown_en = markdown_de;
ALTER TABLE alert ALTER COLUMN markdown_en SET NOT NULL;
```

The damage can be repaired with a new migration, which can also fix D3 and D4:

```sql
-- 000004_repair_alert_and_indexes.up.sql
BEGIN;

SELECT setval(pg_get_serial_sequence('alert', 'id'), COALESCE(MAX(id), 0) + 1, false) FROM alert;
DROP TRIGGER IF EXISTS set_updated_at_alert ON alert;
CREATE TRIGGER set_updated_at_alert BEFORE UPDATE ON alert
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_quiz_user_account_id ON quiz(user_account_id);
CREATE INDEX IF NOT EXISTS idx_question_quiz_id ON question(quiz_id);
CREATE INDEX IF NOT EXISTS idx_answer_question_id ON answer(question_id);
CREATE INDEX IF NOT EXISTS idx_play_protocol_entry_quiz_id ON play_protocol_entry(quiz_id, played_at);
CREATE INDEX IF NOT EXISTS idx_refresh_token_token ON refresh_token(token);

DROP INDEX IF EXISTS idx_user_account_uuid;
DROP INDEX IF EXISTS idx_quiz_uuid;

COMMIT;
```

**D3. Foreign-key columns have no indexes.**
Postgres doesn't index FK columns automatically. `quiz.user_account_id`, `question.quiz_id`, `answer.question_id`, `play_protocol_entry.quiz_id` and `refresh_token.user_account_id` are all used in joins and filters on hot paths, and every cascading delete scans them. That's fine at today's size, but it'll show as `play_protocol_entry` grows.

**D4. Duplicate indexes.**
The `UNIQUE` constraint on `uuid` already creates an index. `idx_user_account_uuid` and `idx_quiz_uuid` ([000001_init.up.sql:96-97](../db/migrations/000001_init.up.sql#L96-L97)) are second copies that only slow down writes.

**D5. No constraints on enum-like or length-limited columns.**
`alert.severity`, `alert.visible_to` and `alert.image_size` are free `TEXT`, even though the Go model declares them as enums. Titles and descriptions have no length limits, and because of B3 the app doesn't enforce any either. Add checks such as `CHECK (severity IN (…))` and `CHECK (char_length(title) <= 100)`. The DB is the last line of defence.

**D6. `played_at` has no time zone.**
`play_protocol_entry.played_at` is `TIMESTAMP` while every other column is `TIMESTAMPTZ` ([000001_init.up.sql:77](../db/migrations/000001_init.up.sql#L77)). This causes the midnight issue in B7.

**D7. The setup files have drifted from the migrations.**
- `db/scripts/init.sql` still has `markdown_content` and no `visible_to`.
- Local compose mounts `../backend/sql-scripts/init.sql` ([docker-compose.local.yml:30](../infra/docker-compose.local.yml#L30)), a path that no longer exists.
- [seed.sql:50](../db/scripts/seed.sql#L50) inserts into `alert.markdown_content`, which migration 3 removed.

Keep one source of truth:
- Delete `init.sql`.
- Run the migrations automatically, either as a `migrate` service in compose or on startup through golang-migrate's Go API.
- Update the seed to the current schema.

**D8. Migrated data is identified by a magic timestamp.**
Plays migrated from Strapi are recognised by `played_at = '2025-01-27 00:00:00'` ([get_my_quiz_trends.go:72](../backend/handlers/get_my_quiz_trends.go#L72), [:131](../backend/handlers/get_my_quiz_trends.go#L131), [:144](../backend/handlers/get_my_quiz_trends.go#L144)). A real play at that exact moment would be misclassified, and the rule exists only in Go code. A `source TEXT NOT NULL DEFAULT 'app'` (or `is_migrated BOOLEAN`) column makes it explicit.

**D9. Minor:**
- `pgcrypto` isn't needed for `gen_random_uuid()` since PG 13.
- `refresh_token.user_account_id` is nullable.
- `play_protocol_entry` has a `uuid`, an `updated_at` and an update trigger that are never used.

---

## 6. Patterns and maintainability

**P1. Three logging systems.**
The code uses `log` (main, env, db, the file handlers), `fmt.Printf` ([change_my_password.go:69](../backend/handlers/change_my_password.go#L69)) and zerolog ([utils.go](../backend/handlers/utils.go)). Their output formats differ, and none of them carry request context. `logAndReturnError` logs every *client* mistake at `error` level, which buries real errors.

**Fix:**
- Pick one logger. `log/slog` is in the standard library.
- Add chi's `middleware.RequestID` and a request logger.
- Log 4xx responses at info or warn.

**P2. Handlers do everything.**
Each handler mixes HTTP concerns, business rules, raw SQL and filesystem I/O. `DBWrapper` is effectively "the app" holding the dependencies, which is fine apart from the name. What's missing is any layer between the handlers and the SQL, which leads directly to P3.

**P3. Duplicated queries.**
- The profile queries are identical in [get_my_user_profile.go](../backend/handlers/get_my_user_profile.go) and [get_user_profile.go](../backend/handlers/get_user_profile.go).
- The 22-column "quiz with questions and answers" query and its row-folding loop are copied between [get_quiz.go](../backend/handlers/get_quiz.go) and [get_my_quiz.go](../backend/handlers/get_my_quiz.go). The copies have already diverged (B2).
- The quiz list aggregate appears three times.

A small repository package would fix this. Another option is **[sqlc](https://sqlc.dev)**: it suits your raw-SQL style and generates typed Go from `.sql` files.

**P4. Check-then-fetch round trips.**
`QuizExistsForUser` + `GetQuizId`, or `UserExists` + `GetUserId` + the actual query, is 2–4 queries where one would do. A single `SELECT id FROM quiz WHERE uuid = $1 AND user_account_id = $2`, with `sql.ErrNoRows` mapped to 404, replaces them. It also closes small TOCTOU windows.

**P5. Context isn't passed consistently.**
About half the handlers call `QueryRow`, `Query` or `Exec` without `Context`, so a client disconnect or timeout doesn't cancel the query. `GetQuiz` even names its context `_`.

**P6. Validation noise.**
- `validate.Struct` is called on empty request structs, as in `GetMyAccount` and `GetSeoPublishedQuizzesUuids`.
- `isValidUUID` duplicates `validate:"uuid4"`.
- The password regexes are compiled on every check ([validators.go:20-26](../backend/handlers/validators.go#L20-L26)). Move them to package-level `var`s, or drop the composition rules altogether (S17).

**P7. No basic middleware.**
There's no `Recoverer`, `RequestID`, `RealIP`, request logging, security headers or body-size limit. chi includes all of these except security headers, which take a few lines.

**P8. Globals and initialisation order.**
- `env.Config`, `db.DB` and `auth.TokenAuth` are package globals that `main` has to initialise in the right order, and `db` reads `env.Config` implicitly. Passing a config struct into constructors makes the dependencies explicit and testable.
- The connection pool isn't tuned (no `SetMaxOpenConns` or `SetConnMaxLifetime`). That matters with Postgres limited to 1 GB.

**P9. No tests.**
There isn't a single `_test.go` file. The diff logic in `UpdateMyQuiz`, the auth flow and the trends gap-filling are exactly the kind of code that breaks silently. `testcontainers-go` with its Postgres module plus `httptest` would give real integration tests in a few hundred lines.

**P10. Dockerfile.**
- **Build-time `go mod tidy`** ([Dockerfile:5](../backend/Dockerfile#L5)) can make dependencies differ between your machine and CI. Use `go mod download`, and fail CI when `go.mod` isn't tidy.
- **No dependency caching.** `COPY . .` happens before modules are downloaded, so layer caching can't help, and `-a` forces a full rebuild every time.
- **Runtime image.** `alpine:latest` isn't pinned, the container runs as root, and there's no `HEALTHCHECK`.
- **`infra/.dockerignore` is never used.** Docker reads `.dockerignore` from the root of the build context, which is `backend/`. Local builds therefore copy `.env.local` and `public/uploads` into the builder stage.

**P11. Backups.**
[backup-volumes.sh](../infra/backup-volumes.sh) tars the Postgres data directory while the DB is running. Such a copy isn't guaranteed to be consistent, so it may not restore.
- Use `pg_dump -Fc` (or `pg_basebackup`) for the database, and keep the tar for the uploads volume.
- Add retention and an off-host copy.

**P12. Leftovers.**
- Commented-out debug code at [jwt_utils.go:65-69](../backend/handlers/jwt_utils.go#L65-L69).
- A debug `log.Printf` at [update_my_user_profile_image.go:30](../backend/handlers/update_my_user_profile_image.go#L30).
- A backend README that is mostly scratch commands.
- `/` redirects to `/docs` with a *permanent* 301 ([main.go:131](../backend/main.go#L131)), which browsers cache aggressively.

---

## 7. Roadmap

### Now: security (about 1–2 days)
- [ ] **S1/S2:** generate filenames on the server, route every file operation through `os.OpenRoot`, and create files with `O_EXCL`.
- [ ] **S3:** add the `RequireAccessToken` middleware, and take `refreshToken` out of the NextAuth session.
- [ ] **S6:** check `is_blocked` on sign-in and refresh, and delete refresh tokens on password change.
- [ ] **S4/S5/S9:** add `MaxBytesReader`, drop SVG (or serve it with a sandbox CSP and `nosniff`), and turn off directory listing.
- [ ] **S13:** push images only from `main`, and tag them by SHA.

### Next: robustness
- [ ] **S7/B4/B5:** map errors in one place, with no internal details in 500s.
- [ ] **S8:** add `httprate` on the public routes, and de-duplicate play events.
- [ ] **S10/S11/S12:** bound `pageSize` and date ranges; add `http.Server` timeouts and graceful shutdown.
- [ ] **B1–B3, B6–B8:** fix the correctness bugs. Most are one-line changes.
- [ ] **D1/D2/D3/D7:** add migration 000004, clean up migration 1, delete `init.sql`, and run migrations automatically.
- [ ] **S14:** put Postgres on an internal network, take Adminer out of prod, and run the container as non-root.

### Later: structure
- [ ] **P2–P4:** add a repository layer or sqlc, with one query per lookup.
- [ ] **P1/P7:** move to `slog`, and add request IDs and a recoverer.
- [ ] **P9:** write integration tests with testcontainers. Gate CI on `go vet`, `staticcheck` or `golangci-lint`, and `govulncheck`.
- [ ] **B9:** track uploads in a `file` table (quotas, cleanup, ownership), or move to S3-compatible object storage.
- [ ] **S17/S18:** opaque, hashed, rotating refresh tokens; `citext` usernames; a NIST-style password policy.
- [ ] **P11:** `pg_dump` backups with retention.
