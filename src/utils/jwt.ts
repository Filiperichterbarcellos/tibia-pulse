// src/utils/jwt.ts
import jwt, { JwtPayload, SignOptions } from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET ?? ''
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET não definido no .env')
}

// Payload “padrão” do seu token (ajuste como quiser)
export interface AuthPayload extends JwtPayload {
  userId: string
  email?: string
}

// Pega exatamente o tipo aceito pelo jsonwebtoken
type Expires = SignOptions['expiresIn']

export function signToken(
  payload: object,
  expiresIn: Expires = '7d'
): string {
  // o cast garante compatibilidade com variações de tipos do pacote
  return jwt.sign(payload as object, JWT_SECRET, { expiresIn } as SignOptions)
}

export function verifyToken<T = any>(token: string): T {
  return jwt.verify(token, JWT_SECRET) as T
}
