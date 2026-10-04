const env = require('./config/env');
const db = require('./config/db');
const app = require('./app');

async function start() {
  if (!env.jwtSecret) throw new Error('JWT_SECRET is required (must match the Authentication module)');
  await db.init();
  const server = app.listen(env.port, () => console.log(`Module 4 API running on port ${env.port}`));

  const shutdown = async () => {
    server.close(async () => { await db.close(); process.exit(0); });
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

start().catch((err) => { console.error('Startup failed:', err.message); process.exit(1); });
