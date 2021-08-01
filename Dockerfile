# --------------> The build image
FROM node:latest AS build
WORKDIR /usr/src/app
COPY src /usr/src/app/src
COPY package.json /usr/src/app/
COPY tsconfig.json /usr/src/app/
COPY .env /usr/src/app/
RUN yarn global add typescript
RUN yarn global add yarn
RUN yarn install

# --------------> The production image
FROM node:lts-alpine
RUN apk add dumb-init
ENV NODE_ENV production
USER node
WORKDIR /usr/src/app
COPY --chown=node:node --from=build /usr/src/app/node_modules /usr/src/app/node_modules
COPY --chown=node:node . /usr/src/app
CMD ["yarn", "start"]