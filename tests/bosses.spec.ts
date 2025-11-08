import request from 'supertest';
import { app } from '../src/app';

describe('Bosses', () => {
  it('GET /api/bosses => 200 e array de bosses', async () => {
    const res = await request(app).get('/api/bosses');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.bosses)).toBe(true);
    if (res.body.bosses.length > 0) {
      expect(res.body.bosses[0]).toHaveProperty('name');
      expect(res.body.bosses[0]).toHaveProperty('location');
    }
  });
});
