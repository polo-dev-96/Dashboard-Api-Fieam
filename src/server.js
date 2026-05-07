import express from 'express';
import { env } from './config/env.js';
import routes from './routes.js';

const app = express();

app.use(express.json());

app.use(routes);

app.listen(env.port, () => {
  console.log(`[SERVER] API de auditoria rodando na porta ${env.port}`);
});
