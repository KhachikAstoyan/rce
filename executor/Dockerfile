# FROM rust:1.67-alpine

# EXPOSE 8000

# # COPY Dockerfiles/killer.sh $HOME

# RUN apk add musl-dev

# WORKDIR $HOME/app
# COPY . .
# RUN --mount=type=cache,target=/usr/local/cargo/registry \
#     --mount=type=cache,target=/home/root/app/target \
#     cargo build --release

# # install node
# RUN apk add nodejs npm
# # RUN curl -LsSf https://get.nexte.st/latest/linux | tar zxf - -C ~/.cargo/bin

# # CMD rustc solution.rs; sh killer.sh ./solution
# CMD ./target/release/executor

FROM rust:1.67-alpine as builder
WORKDIR /usr/src/app
COPY . .
RUN apk add musl-dev
RUN apk add openssl
RUN apk add pkgconfig
RUN --mount=type=cache,target=/usr/local/cargo/registry \
    --mount=type=cache,target=/home/root/app/target \
    cargo build --release
