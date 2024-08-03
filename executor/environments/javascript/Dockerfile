FROM node:20-alpine
WORKDIR /app
COPY . .
COPY run.sh /app/run.sh

RUN npm install
RUN npm run build
RUN chmod +x run.sh
RUN ls -la /app  # Add this line to list files in /app
RUN cat /app/run.sh  # Add this line to display contents of run.sh

# CMD ["/app/run.sh", "/app/runner.js", "/app/test.js", "/app/testSchema.json"]
ENTRYPOINT ["sh", "/app/run.sh", "runner.js"]