#!/usr/bin/env bash
# Güvenlik testleri: sunucu tarafı temizleme, CSP ve kayıtlı XSS taraması (yönetici + aday görünümü).
set -e
cd "$(dirname "$0")/.."
python3 source/build.py
export NODE_PATH="$PWD/tests/node_modules${NODE_PATH:+:$NODE_PATH}"
node tests/sanitize.js
PORT=${PORT:-4292}
( cd api && exec env PORT=$PORT node dev-server.js > /dev/null 2>&1 ) & D=$!
trap 'kill $D 2>/dev/null || true' EXIT
sleep 2
node tests/csp-check.js http://localhost:$PORT/
node tests/xss-fuzz.js admin
node tests/xss-fuzz.js cand
