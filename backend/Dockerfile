# Stage 1: Build
FROM golang:1.25.5-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -trimpath -ldflags="-w -s" -o main .

# Stage 2: Run
FROM alpine:3.21
RUN apk --no-cache add ca-certificates && \
    addgroup -S appgroup && adduser -S appuser -G appgroup
WORKDIR /app

# Copy the built binary
COPY --from=builder /app/main .

# Ensure the binary is executable and owned by non-root user
RUN chmod +x ./main && chown -R appuser:appgroup /app

USER appuser

EXPOSE 8080

# Command to run the application
CMD ["./main"]
