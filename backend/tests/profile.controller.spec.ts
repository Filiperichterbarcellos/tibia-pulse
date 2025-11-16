import type { Response } from 'express'
import { ProfileController } from '../src/controllers/profile.controller'
import { prisma } from '../src/lib/prisma'
import type { AuthRequest } from '../src/middleware/requireAuth'
import { resolveCharacterSummary } from '../src/routes/characters'

jest.mock('../src/lib/prisma', () => ({
  prisma: {
    user: {
      update: jest.fn(),
      findUnique: jest.fn(),
    },
  },
}))

jest.mock('../src/routes/characters', () => ({
  resolveCharacterSummary: jest.fn(),
}))

const prismaMock = prisma as any
const resolveSummaryMock = resolveCharacterSummary as jest.MockedFunction<typeof resolveCharacterSummary>

function createResponse() {
  const res: Partial<Response> = {}
  res.status = jest.fn().mockReturnValue(res)
  res.json = jest.fn().mockReturnValue(res)
  return res as Response & {
    status: jest.Mock
    json: jest.Mock
  }
}

describe('ProfileController.update', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('valida payload', async () => {
    const res = createResponse()
    await ProfileController.update({ user: { id: 'user-1' }, body: { name: 123 } } as unknown as AuthRequest, res)
    expect(res.status).toHaveBeenCalledWith(400)
  })

  it('normaliza campos e atualiza usuário', async () => {
    const user = { id: 'user-1', email: 'mail@tibia.com', name: 'Tester', mainCharacter: 'Kaamez', avatarUrl: null, createdAt: new Date().toISOString() }
    prismaMock.user.update.mockResolvedValueOnce(user)
    const res = createResponse()
    await ProfileController.update(
      {
        user: { id: 'user-1' },
        body: { name: '  Nova ', mainCharacter: '  Dodad ' },
      } as unknown as AuthRequest,
      res,
    )
    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: { name: 'Nova', mainCharacter: 'Dodad' },
      select: expect.any(Object),
    })
    expect(res.json).toHaveBeenCalledWith({ user })
  })

  it('converte string vazia em null', async () => {
    const user = { id: 'user-1', email: 'mail@tibia.com', name: null, mainCharacter: null, avatarUrl: null, createdAt: new Date().toISOString() }
    prismaMock.user.update.mockResolvedValueOnce(user)
    const res = createResponse()
    await ProfileController.update(
      {
        user: { id: 'user-1' },
        body: { name: '', mainCharacter: '' },
      } as unknown as AuthRequest,
      res,
    )
    expect(prismaMock.user.update).toHaveBeenLastCalledWith({
      where: { id: 'user-1' },
      data: { name: null, mainCharacter: null },
      select: expect.any(Object),
    })
    expect(res.json).toHaveBeenCalledWith({ user })
  })
})

describe('ProfileController.trackedCharacter', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('retorna 400 quando usuário não configurou personagem', async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce({ mainCharacter: null })
    const res = createResponse()
    await ProfileController.trackedCharacter({ user: { id: 'user-1' } } as AuthRequest, res)
    expect(res.status).toHaveBeenCalledWith(400)
  })

  it('retorna personagem monitorado', async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce({ mainCharacter: 'Kaamez' })
    const summary = { name: 'Kaamez' }
    resolveSummaryMock.mockResolvedValueOnce(summary as any)
    const res = createResponse()
    await ProfileController.trackedCharacter({ user: { id: 'user-1' } } as AuthRequest, res)
    expect(resolveSummaryMock).toHaveBeenCalledWith('Kaamez')
    expect(res.json).toHaveBeenCalledWith({ character: summary })
  })

  it('retorna 404 quando personagem não encontrado', async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce({ mainCharacter: 'Kaamez' })
    const err: any = new Error('not-found')
    err.code = 404
    resolveSummaryMock.mockRejectedValueOnce(err)
    const res = createResponse()
    await ProfileController.trackedCharacter({ user: { id: 'user-1' } } as AuthRequest, res)
    expect(res.status).toHaveBeenCalledWith(404)
  })

  it('retorna 502 para outros erros', async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce({ mainCharacter: 'Kaamez' })
    resolveSummaryMock.mockRejectedValueOnce(new Error('timeout'))
    const res = createResponse()
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    await ProfileController.trackedCharacter({ user: { id: 'user-1' } } as AuthRequest, res)
    errorSpy.mockRestore()
    expect(res.status).toHaveBeenCalledWith(502)
  })
})
