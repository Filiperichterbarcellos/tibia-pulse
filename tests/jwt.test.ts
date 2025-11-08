import { signToken, verifyToken } from '../src/utils/jwt'

describe('JWT utils', () => {
  it('gera e valida token JWT', () => {
    const token = signToken({ userId: '123', email: 'teste@tibiapulse.com' })
    const payload = verifyToken<{ userId: string; email: string }>(token)
    expect(payload.userId).toBe('123')
    expect(payload.email).toBe('teste@tibiapulse.com')
  })
})
