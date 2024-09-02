FROM python:3-alpine
WORKDIR /app
COPY . .
COPY run.sh /app/run.sh

ENTRYPOINT [ "timeout", "60", "sh", "/app/run.sh", "runner.py" ]
