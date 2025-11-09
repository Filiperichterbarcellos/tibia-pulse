import request from 'supertest';
import { app } from '../src/app';

describe('Calculator (tibia-coin)', () => {
  it('200 e calcula coins', async () => {
    const res = await request(app)
      .get('/api/calculator/tibia-coin')
      .query({ price: 600000, tc: 25000 }); // 24
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ coins: 24 });
  });

  it('400 se params inválidos', async () => {
    const res = await request(app)
      .get('/api/calculator/tibia-coin')
      .query({ price: 600000, tc: 0 });
    expect(res.status).toBe(400);
  });

  it('400 se params faltando', async () => {
    const res = await request(app)
      .get('/api/calculator/tibia-coin')
      .query({ price: '' });
    expect(res.status).toBe(400);
  });
});
