// Apenas testes locais. Não usar como banco da Vercel.
import { PGlite } from '@electric-sql/pglite';
import { createServer } from 'pglite-server';
const db = new PGlite('./.local-db');
await db.waitReady;
const server = createServer(db);
server.listen(54329, '127.0.0.1', () => console.log('PostgreSQL de teste em 127.0.0.1:54329'));
async function stop() {
  server.close();
  await db.close();
  process.exit(0);
}
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
