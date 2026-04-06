FROM node:20-alpine AS base

WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

RUN apk add --no-cache libc6-compat

FROM base AS deps

COPY package.json package-lock.json ./
RUN npm ci

FROM base AS dev

ENV NODE_ENV=development
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

COPY package.json package-lock.json ./
RUN npm ci
COPY . .

EXPOSE 3000
CMD ["npm", "run", "dev"]

FROM base AS builder

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

RUN apk add --no-cache libc6-compat \
  && addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
CMD ["sh", "-c", "HOSTNAME=0.0.0.0 node server.js"]
