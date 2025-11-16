import type { Request, Response } from 'express'
import bcrypt from 'bcrypt'
import { AuthController } from '../src/controllers/auth.controller'
import { prisma } from '../src/lib/prisma'
import { signToken } from '../src/utils/jwt'
import type { AuthRequest } from '../src/middleware/requireAuth'

jest.mock('../src/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  },
}))

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}))

jest.mock('../src/utils/jwt', () => ({
  signToken: jest.fn(),
}))

const prismaMock = prisma as any
const hashMock = bcrypt.hash as jest.MockedFunction<typeof bcrypt.hash>
const compareMock = bcrypt.compare as jest.MockedFunction<typeof bcrypt.compare>
const signTokenMock = signToken as jest.MockedFunction<typeof signToken>

function createResponse() {
  const res: Partial<Response> = {}
  res.status = jest.fn().mockReturnValue(res)
  res.json = jest.fn().mockReturnValue(res)
  return res as Response & {
    status: jest.Mock
    json: jest.Mock
  }
}

describe('AuthController.register', () => {
  beforeEach(() => {
    signTokenMock.mockReturnValue('signed-token')
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('returns 400 for invalid body', async () => {
    const res = createResponse()
    await AuthController.register({ body: {} } as Request, res)
    expect(res.status).toHaveBeenCalledWith(400)
  })

  it('returns 409 when email already exists', async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce({ id: 'user-1' })
    const res = createResponse()
    await AuthController.register(
      { body: { email: 'test@tibia.com', password: '12345678' } } as Request,
      res,
    )
    expect(res.status).toHaveBeenCalledWith(409)
  })

  it('creates user and returns token', async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce(null)
    hashMock.mockResolvedValueOnce('hashed-pass')
    const createdUser = {
      id: 'user-1',
      email: 'test@tibia.com',
      name: 'Tester',
      mainCharacter: null,
      avatarUrl: null,
      createdAt: new Date().toISOString(),
    }
    prismaMock.user.create.mockResolvedValueOnce(createdUser)
    const res = createResponse()
    await AuthController.register(
      { body: { email: 'test@tibia.com', password: '12345678', name: 'Tester' } } as Request,
      res,
    )
    expect(hashMock).toHaveBeenCalled()
    expect(signToken).toHaveBeenCalledWith({ id: createdUser.id, email: createdUser.email })
    expect(res.status).toHaveBeenCalledWith(201)
    expect(res.json).toHaveBeenCalledWith({ user: createdUser, token: 'signed-token' })
  })
})

describe('AuthController.login', () => {
  beforeEach(() => {
    signTokenMock.mockReturnValue('signed-token')
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('returns 400 for invalid body', async () => {
    const res = createResponse()
    await AuthController.login({ body: {} } as Request, res)
    expect(res.status).toHaveBeenCalledWith(400)
  })

  it('returns 401 when user is missing', async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce(null)
    const res = createResponse()
    await AuthController.login(
      { body: { email: 'ghost@tibia.com', password: 'pass' } } as Request,
      res,
    )
    expect(res.status).toHaveBeenCalledWith(401)
  })

  it('returns 401 when password mismatch', async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce({
      id: 'user-1',
      email: 'test@tibia.com',
      password: 'hashed',
      createdAt: new Date().toISOString(),
    })
    compareMock.mockResolvedValueOnce(false)
    const res = createResponse()
    await AuthController.login(
      { body: { email: 'test@tibia.com', password: 'wrong' } } as Request,
      res,
    )
    expect(res.status).toHaveBeenCalledWith(401)
  })

  it('returns user and token when credentials match', async () => {
    const now = new Date().toISOString()
    prismaMock.user.findUnique.mockResolvedValueOnce({
      id: 'user-1',
      email: 'test@tibia.com',
      name: 'Tester',
      password: 'hashed',
      createdAt: now,
      avatarUrl: null,
      mainCharacter: null,
    })
    compareMock.mockResolvedValueOnce(true)
    const res = createResponse()
    await AuthController.login(
      { body: { email: 'test@tibia.com', password: '12345678' } } as Request,
      res,
    )
    expect(signToken).toHaveBeenCalledWith({ id: 'user-1', email: 'test@tibia.com' })
    expect(res.json).toHaveBeenCalledWith({
      user: {
        id: 'user-1',
        email: 'test@tibia.com',
        name: 'Tester',
        mainCharacter: null,
        avatarUrl: null,
        createdAt: now,
      },
      token: 'signed-token',
    })
  })
})

describe('AuthController.me', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('returns 401 when user missing', async () => {
    const res = createResponse()
    await AuthController.me({} as AuthRequest, res)
    expect(res.status).toHaveBeenCalledWith(401)
  })

  it('returns profile when user exists', async () => {
    const res = createResponse()
    const user = {
      id: 'user-1',
      email: 'mail@tibia.com',
      name: 'Tester',
      mainCharacter: null,
      avatarUrl: null,
      createdAt: new Date().toISOString(),
    }
    prismaMock.user.findUnique.mockResolvedValueOnce(user)
    await AuthController.me({ user: { id: 'user-1', email: 'mail@tibia.com' } } as AuthRequest, res)
    expect(res.json).toHaveBeenCalledWith({ user })
  })
})
