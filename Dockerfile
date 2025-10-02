FROM node:lts as base

WORKDIR /usr/app

COPY package*.json ./

RUN yarn install --frozen-lockfile

RUN apt-get update && apt-get install -y \
  libnss3 \
  libxss1 \
  libasound2 \
  fonts-liberation \
  libappindicator3-1 \
  libgbm-dev \
  libgtk-3-0 \
  libx11-xcb1 \
  --no-install-recommends \
  && rm -rf /var/lib/apt/lists/*

COPY . .

COPY prisma ./prisma
RUN yarn prisma generate

RUN yarn build

EXPOSE 3000


CMD ["sh", "-c", "yarn prisma migrate deploy || yarn prisma db push; yarn start:dev"]