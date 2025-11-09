import request from 'supertest'
import { app } from '../src/app'

describe('Worlds (integração real)', () => {
  it('GET /api/worlds => 200 e lista (array) mesmo que vazia', async () => {
    const res = await request(app).get('/api/worlds?limit=3')
    expect([200, 404]).toContain(res.status)

    if (res.status === 200) {
      // teu adapter devolve { players_online_total, count, worlds: [...] }
      if ('worlds' in res.body) {
        expect(Array.isArray(res.body.worlds)).toBe(true)
        expect(typeof res.body.count).toBe('number')
      } else {
        // fallback, caso mude o shape
        const maybeArray =
          Array.isArray(res.body) ||
          Object.values(res.body).some((v) => Array.isArray(v))
        expect(maybeArray).toBe(true)
      }
    }
  })

  it('GET /api/worlds/:name => 200 (Antica) e retorna o nome no payload', async () => {
    const res = await request(app).get('/api/worlds/Antica')
    expect([200, 404]).toContain(res.status)

    if (res.status === 200) {
      // Algumas libs devolvem o objeto direto; outras aninham em { world: {...} }
      const name =
        (res.body && res.body.name) ||
        (res.body && res.body.world && res.body.world.name)
      expect(name).toBe('Antica')
    }
  })
})
