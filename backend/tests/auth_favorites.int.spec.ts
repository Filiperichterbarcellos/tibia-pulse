import request from 'supertest'
import { app } from '../src/app'
import { prisma } from '../src/lib/prisma'
import crypto from 'crypto'

describe('Auth + Favorites (integração real com DB)', () => {
  const email = `test_${crypto.randomBytes(6).toString('hex')}@tibiapulse.com`
  const password = '12345678'
  let token = ''
  let favoriteId = ''

  beforeAll(async () => {
    // Confirma que estamos num DB de teste
    if (!process.env.DATABASE_URL || !/(_test|localhost|127\.0\.0\.1)/i.test(process.env.DATABASE_URL)) {
      throw new Error(`DATABASE_URL não parece de teste: ${process.env.DATABASE_URL}`)
    }
    // Garante que migrations rodaram antes (no CI hacemos prisma migrate dev/reset)
  })

  afterAll(async () => {
    // limpa por e-mail
    await prisma.favorite.deleteMany({ where: { user: { email } } })
    await prisma.user.deleteMany({ where: { email } })
    await prisma.$disconnect()
  })

  it('POST /api/auth/register => 201', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email, password, name: 'Tester' })
    expect([200, 201, 409]).toContain(res.status) // 409 se rodar duas vezes
  })

  it('POST /api/auth/login => 200 e retorna token', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email, password })
    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('token')
    token = res.body.token
  })

  it('GET /api/auth/me => 200 com bearer', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('user.email', email)
  })

  it('POST /api/favorites => 201 cria favorito', async () => {
    const res = await request(app)
      .post('/api/favorites')
      .set('Authorization', `Bearer ${token}`)
      .send({ type: 'BOSS', key: 'oratam', notes: 'monitorar spawn' })
    expect([200, 201]).toContain(res.status)
    expect(res.body).toHaveProperty('favorite.id')
    favoriteId = res.body.favorite.id
  })

  it('GET /api/favorites => 200 lista', async () => {
    const res = await request(app)
      .get('/api/favorites')
      .set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body.favorites)).toBe(true)
    const found = res.body.favorites.find((f: any) => f.id === favoriteId)
    expect(Boolean(found)).toBe(true)
  })

  it('DELETE /api/favorites/:id => 204', async () => {
    const res = await request(app)
      .delete(`/api/favorites/${favoriteId}`)
      .set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(204)
  })
})
