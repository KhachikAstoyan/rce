FROM eclipse-temurin:21-alpine
WORKDIR /app
COPY . .
COPY run.sh /app/run.sh

ENTRYPOINT ["timeout", "60", "sh", "/app/run.sh"]
