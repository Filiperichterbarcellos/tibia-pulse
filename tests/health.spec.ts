import express from 'express';
import request from 'supertest';

// Importa o router, independente de como foi exportado
import * as HealthModule from '../src/routes/health';

// Fallbacks pra diferentes estilos de export
const router =
  (HealthModule as any).default ||
  (HealthModule as any).router ||
  (HealthModule as any).healthRouter ||
  (HealthModule as any);

describe('GET /health', () => {
  it('responds 200 and a payload', async () => {
    const app = express();
    app.use(router); // monta o router

    const res = await request(app).get('/'); // ajuste se sua rota for diferente
    expect(res.status).toBe(200);

    // Se seu handler retorna JSON {status:'ok'}:
    // Ajuste conforme o seu payload real
    if (res.headers['content-type']?.includes('application/json')) {
      expect(res.body).toEqual({ status: 'ok' });
    } else {
      expect(String(res.text || '').toLowerCase()).toContain('ok');
    }
  });
});

// mantém também o probe simples pra garantir cobertura de linha "pura"
if ((HealthModule as any)._healthProbe) {
  test('health probe returns ok', () => {
    expect((HealthModule as any)._healthProbe()).toBe('ok');
  });
}
