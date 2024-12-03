FROM node:20 AS build-env
WORKDIR /app
COPY . .

RUN npm i -g pnpm@9
RUN pnpm install
RUN pnpm run build

FROM node:20
COPY --from=build-env /app /app
WORKDIR /app

RUN npm i -g pnpm@9

EXPOSE 5173

CMD ["pnpm", "vite", "--host"]
