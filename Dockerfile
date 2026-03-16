# ─── Development Stage ────────────────────────────────────────────────────────
FROM node:20-alpine AS development

WORKDIR /app

# Install dependencies first (layer caching)
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Copy source
COPY . .

EXPOSE 3000

CMD ["yarn", "start:dev"]

# ─── Build Stage ──────────────────────────────────────────────────────────────
FROM node:20-alpine AS build

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .
RUN yarn build

# ─── Production Stage ─────────────────────────────────────────────────────────
FROM node:20-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production

COPY --from=build /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/main"]
