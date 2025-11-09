import request from 'supertest'
import { app } from '../src/app'

describe('Bosses (integração real)', () => {
  it('GET /api/bosses/boostable => 200 ou 404; se 200, deve haver um array em algum lugar', async () => {
    const res = await request(app).get('/api/bosses/boostable')
    expect([200, 404]).toContain(res.status)

    if (res.status === 200) {
      const body = res.body
      const hasArray =
        Array.isArray(body) ||
        Array.isArray(body?.bosses) ||
        Object.values(body || {}).some((v) => Array.isArray(v))
      expect(hasArray).toBe(true)
    }
  })

  it('GET /api/bosses/killstats/:world => 200 ou 404; se 200, entries é array e total é objeto', async () => {
    const res = await request(app).get('/api/bosses/killstats/Antica')
    expect([200, 404]).toContain(res.status)

    if (res.status === 200) {
      expect(Array.isArray(res.body.entries)).toBe(true)
      expect(typeof res.body.total).toBe('object')
      // não assertamos valores exatos (pois variam em tempo real)
      // apenas garantimos a presença de algumas chaves comuns:
      expect(res.body.total).toHaveProperty('last_week_killed')
    }
  })
})
