FROM node:20 AS build-env
COPY . /app
WORKDIR /app

RUN npm i -g pnpm@9
RUN pnpm install
RUN pnpm run build

FROM node:20
COPY --from=build-env /app /app
WORKDIR /app

RUN npm i -g pnpm@9

# Expose application port (adjust if different)
#EXPOSE 3000

CMD ["pnpm", "run", "start"]
