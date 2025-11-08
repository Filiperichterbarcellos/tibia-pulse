import request from 'supertest'
import { app } from '../src/app'

describe('Market (routes)', () => {
  beforeAll(() => {
    const svc = require('../src/services/marketService')
    jest.spyOn(svc, 'getAuctions').mockResolvedValue([
      {
        name: 'Pro Player',
        level: 300,
        vocation: 'Royal Paladin',
        world: 'Antica',
        currentBid: 5000000,
        hasBid: true,
        endTime: '2025-01-01T00:00:00Z',
        url: 'https://www.tibia.com/charactertrade/?some-auction',
      },
    ])
  })

  it('GET /api/market => 200', async () => {
    const res = await request(app).get('/api/market')
    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('ok', true)
  })

  it('GET /api/market/auctions => 200 com array', async () => {
    const res = await request(app).get('/api/market/auctions?minLevel=200')
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body.auctions)).toBe(true)
    expect(res.body.auctions[0]).toHaveProperty('name')
    expect(res.body.auctions[0]).toHaveProperty('currentBid')
  })

  it('400 se query inválida', async () => {
    const res = await request(app).get('/api/market/auctions?minLevel=abc')
    expect(res.status).toBe(400)
  })
})
