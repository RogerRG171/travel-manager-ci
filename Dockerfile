FROM node:20.16.0 as base

RUN npm i -g npm

FROM base as dependencies

WORKDIR /usr/src/app

COPY package.json package-lock.json ./

RUN npm install

FROM base as build

WORKDIR /usr/src/app

COPY . .

COPY --from=dependencies /usr/src/app/node_modules ./node_modules

RUN npm run build
RUN npm prune --prod

FROM node:20.16.0-alpine3.20 as deploy

WORKDIR /usr/src/app

RUN npm i -g prisma

COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/package.json ./package.json
COPY --from=build /usr/src/app/prisma  ./prisma

RUN npx prisma generate

EXPOSE 3333 5555

CMD [ "npm","run","start" ]