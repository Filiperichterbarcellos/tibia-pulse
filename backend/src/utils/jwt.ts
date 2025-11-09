// src/utils/jwt.ts
import jwt, { JwtPayload, SignOptions } from 'jsonwebtoken'

// ✅ Obtém a chave secreta, com fallback para testes
function getSecret(): string {
  const secret =
    process.env.JWT_SECRET ||
    (process.env.NODE_ENV === 'test' ? 'test-secret' : '')

  if (!secret) {
    throw new Error('JWT_SECRET não definido no .env')
  }
  return secret
}

// Payload padrão do token (ajuste conforme necessário)
export interface AuthPayload extends JwtPayload {
  userId: string
  email?: string
}

// Usa o tipo correto de expiresIn do pacote
type Expires = SignOptions['expiresIn']

// Gera um token JWT assinado
export function signToken(
  payload: object,
  expiresIn: Expires = '7d'
): string {
  const secret = getSecret()
  return jwt.sign(payload as object, secret, { expiresIn } as SignOptions)
}

// Verifica e decodifica um token JWT
export function verifyToken<T = any>(token: string): T {
  const secret = getSecret()
  return jwt.verify(token, secret) as T
}
