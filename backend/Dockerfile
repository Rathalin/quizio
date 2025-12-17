# Stage 1: Build
FROM golang:1.25.5-alpine AS builder
WORKDIR /app
COPY . .
RUN go mod tidy
RUN CGO_ENABLED=0 GOOS=linux go build -a -o main .

# Stage 2: Run
FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /app

# Copy the built binary
COPY --from=builder /app/main .

# Ensure the binary is executable
RUN chmod +x ./main

EXPOSE 8080

# Command to run the application
CMD ["./main"]
