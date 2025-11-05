import request from 'supertest';
import { app } from '../src/app';

describe('Calculator (tibia-coin)', () => {
  it('computes coins', async () => {
    const res = await request(app)
      .get('/api/calculator/tibia-coin')
      .query({ price: 600000, tc: 25000 }); // 600k / 25k = 24 -> ceil = 24
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ coins: 24 });
  });

  it('400 on invalid params', async () => {
    const res = await request(app)
      .get('/api/calculator/tibia-coin')
      .query({ price: 600000, tc: 0 });
    expect(res.status).toBe(400);
  });
});
