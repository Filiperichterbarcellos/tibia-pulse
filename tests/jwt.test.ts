import { signToken, verifyToken } from '../src/utils/jwt'


const payload = { userId: '123', email: 'teste@tibiapulse.com' }

try {
  const token = signToken(payload)
  console.log('Token gerado:', token)

  const decoded = verifyToken<typeof payload>(token)
  console.log('Token verificado:', decoded)
} catch (err) {
  console.error(' Erro ao gerar/verificar token:', err)
}
