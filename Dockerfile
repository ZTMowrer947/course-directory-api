ARG NODE_VERSION=20

FROM node:${NODE_VERSION}-bookworm as base
RUN apt update && apt install -y libssl-dev ca-certificates

RUN corepack enable

USER node
WORKDIR /app

COPY --chown=node:node package.json yarn.lock .yarnrc.yml /app/
RUN yarn install

FROM base as build

COPY --chown=node:node . .

RUN yarn build

FROM base as prod-setup

ENV NODE_ENV=production
RUN yarn workspaces focus --production
RUN yarn install

COPY --chown=node:node prisma prisma
RUN yarn prisma generate
RUN cp -a node_modules prod_modules

FROM gcr.io/distroless/nodejs${NODE_VERSION}-debian12 as prod

WORKDIR /app

COPY --from=build /app/package.json /app/package.json
COPY --from=build /app/dist /app/dist
COPY --from=prod-setup /app/prod_modules node_modules

CMD ["dist/index.js"]
