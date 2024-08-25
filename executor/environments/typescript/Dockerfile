FROM node:20-alpine
WORKDIR /app
COPY . .
COPY run.sh /app/run.sh

RUN npm install
RUN chmod +x run.sh

ENTRYPOINT ["sh", "/app/run.sh", "runner.ts"]
