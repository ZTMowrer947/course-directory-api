ARG NODE_VERSION=20

FROM node:${NODE_VERSION}-bookworm as base
RUN apt update && apt install -y libssl-dev ca-certificates

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

USER node

COPY --chown=node:node package.json pnpm-lock.yaml /app/
WORKDIR /app

FROM base as prod-deps
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile

FROM base as build

COPY --chown=node:node . .

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm build
RUN pnpm prisma generate

FROM gcr.io/distroless/nodejs${NODE_VERSION}-debian12 as prod

WORKDIR /app

ENV NODE_ENV=production

COPY --from=build /app/package.json /app/package.json
COPY --from=build /app/dist /app/dist
COPY --from=prod-deps /app/node_modules node_modules

CMD ["dist/index.js"]
