# Vehicle API — Quickstart (Yarn e Docker)

Guia curto para subir o projeto com Yarn (local) e com Docker (dev).

## Requisitos
- Node.js 20+
- Yarn 1.x
- Docker e Docker Compose
- PostgreSQL e RabbitMQ (via Docker)

## Variáveis de ambiente
Crie um arquivo .env (para uso local) e/ou .env.docker (para uso nos containers) na raiz:

```env
# Porta da API
PORT=3000

# Postgres (no Docker, aponte para o serviço "db")
DATABASE_URL=postgresql://postgres:postgres@db:5432/vehicle_api?schema=public

# RabbitMQ (no Docker, aponte para o serviço "rabbitmq")
RMQ_URL=amqp://guest:guest@rabbitmq:5672
RMQ_QUEUE=vehicles.events
```

Observação:
- Em execução local sem Docker para DB/RabbitMQ, ajuste DATABASE_URL e RMQ_URL (ex.: localhost).

---

## Rodando com Docker (dev)
1) Build e subir os serviços:
```bash
docker compose up --build
```

2) A API ficará disponível em:
- Swagger: http://localhost:3000/docs
- Rotas (com prefixo global): http://localhost:3000/api

3) Banco de dados (Prisma):
- Primeira vez (aplicar schema):
```bash
docker compose exec api yarn prisma migrate dev --name init
# ou, para aplicar sem criar nova migration:
docker compose exec api yarn prisma db push
```
- (Opcional) Seed:
```bash
docker compose exec api yarn prisma db seed
```

Dicas:
- Se aparecer “relation ... does not exist”, rode as migrations (comandos acima).
- Se o RabbitMQ desconectar com PRECONDITION_FAILED de reply, garanta que o Client RMQ está com `noAck: true`.

---

## Rodando localmente com Yarn
1) Instalar dependências e gerar Prisma Client:
```bash
yarn install
yarn prisma generate
```

2) Subir Postgres e RabbitMQ com Docker (opcional, se não tiver localmente):
```bash
docker compose up -d db rabbitmq
```

3) Aplicar schema do banco:
```bash
yarn prisma migrate dev --name init
# ou
yarn prisma db push
```

4) Iniciar a API (watch):
```bash
yarn start:dev
```

Acesse:
- http://localhost:3000/docs
- http://localhost:3000/api

---

## Testes
```bash
yarn test
# ou em watch:
yarn test:watch
```

---

## Problemas comuns (rápido)
- ERR_EMPTY_RESPONSE ao abrir “/”: acesse “/docs” ou “/api/...”; a raiz não tem handler.
- Conexão Postgres (P1001): confira `DATABASE_URL` (no Docker, host deve ser `db`, não `localhost`).
- RabbitMQ 406 PRECONDITION_FAILED: use `noAck: true` no Client RMQ (reply-to).
- Prisma Client ausente: rode `yarn prisma generate`.
