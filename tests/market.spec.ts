import request from 'supertest';
import { app } from '../src/app';

describe('Market', () => {
  it('GET /api/market => 200 e items', async () => {
    const res = await request(app).get('/api/market');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.items)).toBe(true);
    if (res.body.items.length > 0) {
      expect(res.body.items[0]).toHaveProperty('name');
      expect(res.body.items[0]).toHaveProperty('avgPrice');
    }
  });
});
