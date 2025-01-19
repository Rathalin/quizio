# Stage 1: Build
FROM golang:1.23 as builder
WORKDIR /app
COPY . .
RUN go mod tidy
RUN go build -o main .

# Stage 2: Run
FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /root/
COPY --from=builder /app/main .
EXPOSE 8080
CMD ["./main"]
