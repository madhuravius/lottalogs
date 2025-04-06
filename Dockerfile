FROM rust:1-slim-bookworm AS builder

RUN apt-get update && apt-get install -y \
    pkg-config \
    libssl-dev \
    nodejs \
    npm \
    git \
    && npm install -g pnpm \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY Cargo.toml Cargo.lock ./

COPY src/ ./src/
COPY migration/ ./migration/
COPY config/ ./config/
COPY frontend/ ./frontend/
COPY .rustfmt.toml ./

WORKDIR /app/frontend
RUN rm -rf node_modules
RUN pnpm install --frozen-lockfile --prefer-offline
RUN pnpm run build

WORKDIR /app
RUN cargo build --release

FROM debian:bookworm-slim

RUN apt-get update && apt-get install -y \
    ca-certificates \
    libssl-dev \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=builder /app/target/release/lottalogs-cli /app/lottalogs-cli
COPY --from=builder /app/config/ ./config/
COPY --from=builder /app/frontend/dist/ ./frontend/dist/

EXPOSE 3000

ENV RUST_LOG=info

CMD ["./lottalogs-cli", "start"]

