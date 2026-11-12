FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev --no-audit --no-fund
COPY --chown=node:node src ./src
COPY --chown=node:node scripts ./scripts
USER node
EXPOSE 3001
CMD ["node", "src/server.js"]
