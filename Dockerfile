FROM node:20-alpine
WORKDIR /app
RUN apk add --no-cache libc6-compat openssl bash
COPY package*.json ./
RUN npm install
COPY . .

RUN npx prisma generate
EXPOSE 3000

CMD ["npm", "run", "start:dev"]