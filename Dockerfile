ARG NODE_VERSION=20-slim

# --- Стадия 1: зависимости ---
FROM node:${NODE_VERSION} AS dependencies
WORKDIR /app
# Без этого Prisma CLI не может определить версию libssl и вываливает
# предупреждение на каждую команду (generate/migrate/db seed) — сама операция
# при этом отрабатывает на угаданной версии, но полагаться на угадывание не
# стоит. Слой отдельный и до COPY package.json — почти не инвалидируется кэшем.
RUN apt-get update && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
# Схема и prisma.config.ts нужны уже здесь: postinstall-скрипт запускает
# `prisma generate` (ему для генерации клиента без подключения к БД достаточно
# файла схемы), а эта же стадия переиспользуется сервисом `migrate` в
# docker-compose.yml для `prisma migrate deploy` при старте контейнеров —
# конфигурация подключения в Prisma 7 живёт в prisma.config.ts, не в schema.prisma.
COPY prisma ./prisma
COPY prisma.config.ts ./
RUN npm ci --no-audit --no-fund

# --- Стадия 2: сборка ---
FROM node:${NODE_VERSION} AS builder
WORKDIR /app
# Отдельный `FROM node:...` — apt-пакеты из стадии `dependencies` сюда не
# переезжают вместе с `COPY node_modules`, нужно ставить заново для `prisma
# generate` ниже (см. её же комментарий про libssl-warning в dependencies).
RUN apt-get update && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
ENV NODE_ENV=production
# `postinstall` стадии `dependencies` уже сгенерировал клиент в её собственном
# `/app/src/generated/prisma`, но эта стадия его не наследует (копируется
# только node_modules, а src/generated/prisma одновременно в .gitignore и
# .dockerignore — `COPY . .` его тоже не принесёт). Без повторной генерации
# здесь `npm run build` падает с "Module not found: Can't resolve
# '@/generated/prisma/client'" — найдено вживую при первом реальном
# `docker compose up --build` после перехода на Prisma 7 (задача 24), где
# генератор перестал писать клиент внутрь node_modules.
RUN npx prisma generate
RUN npm run build

# --- Стадия 3: рантайм (минимальный образ, standalone output) ---
FROM node:${NODE_VERSION} AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

COPY --from=builder --chown=node:node /app/public ./public
RUN mkdir .next && chown node:node .next
# `public/uploads` не существует в образе (в .dockerignore — не должен, иначе
# тестовые файлы с хоста утекали бы в билд), поэтому Docker создаёт точку
# монтирования именованного volume `uploads` (docker-compose.yml) с нуля от
# root, когда volume ещё пуст — а процесс работает от `USER node` ниже.
# Результат — `EACCES: permission denied, mkdir` при первой же загрузке фото
# через админку (найдено вживую в задаче 66). Директория должна существовать
# с верным владельцем ДО монтирования volume — тогда Docker инициализирует
# пустой volume именно этими правами (тот же приём, что уже используется для
# `.next` строкой выше).
RUN mkdir -p public/uploads && chown node:node public/uploads
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static

USER node
EXPOSE 3000
CMD ["node", "server.js"]
