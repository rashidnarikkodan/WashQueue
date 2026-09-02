FROM node:24.20.0-slim AS build

# allow docker to use package managers
RUN corepack enable

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm run build


FROM node:24.20.0-slim AS production

WORKDIR /app

COPY --from=build /app/dist ./dist

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

RUN corepack enable

# only take production deps, not dev deps
RUN pnpm install --frozen-lockfile --prod

USER node

CMD ["pnpm", "start"]