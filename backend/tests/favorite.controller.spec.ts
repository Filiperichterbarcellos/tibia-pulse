import type { Response } from 'express'
import { FavoriteController } from '../src/controllers/favorite.controller'
import { prisma } from '../src/lib/prisma'
import type { AuthRequest } from '../src/middleware/requireAuth'

jest.mock('../src/lib/prisma', () => ({
  prisma: {
    favorite: {
      findMany: jest.fn(),
      create: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
  },
}))

const prismaMock = prisma as any

function createResponse() {
  const res: Partial<Response> = {}
  res.status = jest.fn().mockReturnValue(res)
  res.json = jest.fn().mockReturnValue(res)
  res.end = jest.fn().mockReturnValue(res)
  return res as Response & {
    status: jest.Mock
    json: jest.Mock
    end: jest.Mock
  }
}

describe('FavoriteController.list', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('retorna favoritos filtrando por tipo', async () => {
    prismaMock.favorite.findMany.mockResolvedValueOnce([{ id: 'fav-1' }])
    const res = createResponse()
    await FavoriteController.list(
      { user: { id: 'user-1' }, query: { type: 'BOSS' } } as unknown as AuthRequest,
      res,
    )
    expect(prismaMock.favorite.findMany).toHaveBeenCalledWith({
      where: { userId: 'user-1', type: 'BOSS' },
      orderBy: { createdAt: 'desc' },
    })
    expect(res.json).toHaveBeenCalledWith({ favorites: [{ id: 'fav-1' }] })
  })
})

describe('FavoriteController.create', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('valida corpo da requisição', async () => {
    const res = createResponse()
    await FavoriteController.create({ user: { id: 'user-1' }, body: {} } as AuthRequest, res)
    expect(res.status).toHaveBeenCalledWith(400)
  })

  it('cria favorito', async () => {
    const favorite = { id: 'fav-1', key: 'Ferumbras' }
    prismaMock.favorite.create.mockResolvedValueOnce(favorite)
    const res = createResponse()
    await FavoriteController.create(
      {
        user: { id: 'user-1' },
        body: { type: 'BOSS', key: 'Ferumbras', notes: 'check', snapshot: { level: 999 } },
      } as unknown as AuthRequest,
      res,
    )
    expect(prismaMock.favorite.create).toHaveBeenCalledWith({
      data: { userId: 'user-1', type: 'BOSS', key: 'Ferumbras', notes: 'check', snapshot: { level: 999 } },
    })
    expect(res.status).toHaveBeenCalledWith(201)
    expect(res.json).toHaveBeenCalledWith({ favorite })
  })

  it('retorna 409 quando favorito já existe', async () => {
    prismaMock.favorite.create.mockRejectedValueOnce(new Error('duplicate'))
    const res = createResponse()
    await FavoriteController.create(
      { user: { id: 'user-1' }, body: { type: 'BOSS', key: 'Ferumbras' } } as unknown as AuthRequest,
      res,
    )
    expect(res.status).toHaveBeenCalledWith(409)
  })
})

describe('FavoriteController.remove', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('retorna 404 quando favorito não existe', async () => {
    prismaMock.favorite.findUnique.mockResolvedValueOnce(null)
    const res = createResponse()
    await FavoriteController.remove(
      { user: { id: 'user-1' }, params: { id: 'fav-1' } } as unknown as AuthRequest,
      res,
    )
    expect(res.status).toHaveBeenCalledWith(404)
  })

  it('retorna 404 quando favorito pertence a outro usuário', async () => {
    prismaMock.favorite.findUnique.mockResolvedValueOnce({ id: 'fav-1', userId: 'another' })
    const res = createResponse()
    await FavoriteController.remove(
      { user: { id: 'user-1' }, params: { id: 'fav-1' } } as unknown as AuthRequest,
      res,
    )
    expect(res.status).toHaveBeenCalledWith(404)
  })

  it('remove favorito do usuário', async () => {
    prismaMock.favorite.findUnique.mockResolvedValueOnce({ id: 'fav-1', userId: 'user-1' })
    const res = createResponse()
    await FavoriteController.remove(
      { user: { id: 'user-1' }, params: { id: 'fav-1' } } as unknown as AuthRequest,
      res,
    )
    expect(prismaMock.favorite.delete).toHaveBeenCalledWith({ where: { id: 'fav-1' } })
    expect(res.status).toHaveBeenCalledWith(204)
    expect(res.end).toHaveBeenCalled()
  })
})
