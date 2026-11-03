// Azure Functions giriş noktası (Static Web Apps yönetilen API). Tüm /api/* istekleri tek işleve gelir.
const { app } = require('@azure/functions');
const { handler } = require('./handler');

app.http('api', {
  methods: ['GET', 'POST'],
  authLevel: 'anonymous',
  route: '{*path}',
  handler: async (request) => handler(request)
});
