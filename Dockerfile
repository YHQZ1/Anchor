FROM node:20-slim AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# Runner stage
FROM node:20-slim AS runner
WORKDIR /app
COPY --from=builder /app/package.json /app/package-lock.json ./
RUN npm ci --omit=dev   # <-- this won't install typescript
RUN npm install typescript  # <-- manually add TS so next.config.ts works
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./next.config.ts
EXPOSE 3000
CMD ["npm", "start"]

