#!/bin/sh
set -e

echo "[entrypoint] Aguardando banco..."
sleep 3

echo "[entrypoint] Rodando migrations (deploy)..."
npx prisma migrate deploy

# if [ "$RUN_SEED" = "true" ]; then
#   echo "[entrypoint] Rodando seed..."
#   npm run seed
# fi

echo "[entrypoint] Iniciando aplicação..."
exec "$@"