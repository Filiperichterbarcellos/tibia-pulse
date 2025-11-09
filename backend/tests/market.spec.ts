// tests/market.spec.ts
import request from 'supertest'

// pula no CI (ou quando SKIP_MARKET_TESTS=true)
const maybeDescribe =
  process.env.SKIP_MARKET_TESTS === 'true' || process.env.CI === 'true'
    ? describe.skip
    : describe

jest.mock('../src/services/marketService', () => ({
  __esModule: true,
  getAuctions: jest.fn(),
}))

import { app } from '../src/app'
import { getAuctions } from '../src/services/marketService'

const mockAuctions = [
  {
    name: 'Pro Player',
    level: 300,
    vocation: 'Royal Paladin',
    world: 'Antica',
    currentBid: 5_000_000,
    hasBid: true,
    endTime: '2025-01-01T00:00:00Z',
    url: 'https://www.tibia.com/charactertrade/?some-auction',
  },
]

maybeDescribe('Market (routes)', () => {
  beforeAll(() => {
    ;(getAuctions as jest.Mock).mockResolvedValue(mockAuctions)
  })

  afterAll(() => {
    jest.clearAllMocks()
    jest.resetModules()
  })

  it('GET /api/market => 200', async () => {
    const res = await request(app).get('/api/market')
    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('ok', true)
  })

  it('GET /api/market/auctions => 200 (e chama o service)', async () => {
    const res = await request(app).get('/api/market/auctions?minLevel=200')
    expect(res.status).toBe(200)
    expect(getAuctions).toHaveBeenCalled()

    const body = res.body ?? {}
    if (Array.isArray(body.auctions) && body.auctions.length > 0) {
      expect(body.auctions[0]).toHaveProperty('name')
      expect(body.auctions[0]).toHaveProperty('currentBid')
    }
  })

  it('400 se query inválida', async () => {
    const res = await request(app).get('/api/market/auctions?minLevel=abc')
    expect(res.status).toBe(400)
  })
})
