import request from 'supertest';
import { app } from '../src/app';

describe('Docs (Swagger)', () => {
  it('GET /docs/ => 200 (HTML)', async () => {
    const res = await request(app).get('/docs/');
    expect(res.status).toBe(200);
    expect(res.header['content-type']).toMatch(/text\/html|charset/i);
  });

  it('GET /docs.json => 200 e contém openapi/info', async () => {
    const res = await request(app).get('/docs.json');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('openapi');
    expect(res.body).toHaveProperty('info');
  });
});
