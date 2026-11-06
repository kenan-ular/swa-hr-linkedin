#!/usr/bin/env bash
# Derimod TalentX uçtan uca test: derler, yerel sunucuyu ve sahte Azure OpenAI'yi başlatır, testi çalıştırır.
# İlk kez: (cd tests && npm install && npx playwright install chromium) ; (cd api && npm install)
set -e
cd "$(dirname "$0")/.."
python3 source/build.py
PORT=${PORT:-4291}; MOCK_PORT=${MOCK_PORT:-4399}
MOCK_PORT=$MOCK_PORT node tests/mock-openai.js > /dev/null 2>&1 & M=$!
( cd api && exec env DEV_SHOW_CODES=1 PORT=$PORT AZURE_OPENAI_ENDPOINT=http://localhost:$MOCK_PORT AZURE_OPENAI_KEY=test AZURE_OPENAI_DEPLOYMENT=test node dev-server.js > /dev/null 2>&1 ) & D=$!
trap 'kill $M $D 2>/dev/null || true' EXIT
sleep 2
BASE=http://localhost:$PORT/ NODE_PATH="$PWD/tests/node_modules${NODE_PATH:+:$NODE_PATH}" node tests/e2e-server.js | tee build/e2e.log
grep -q '^errs \[\]' build/e2e.log && echo "SONUÇ: sayfa hatası yok" || { echo "SONUÇ: sayfa hatası var"; exit 1; }
