import 'dotenv/config'
import app from './app'

const HOST = '127.0.0.1'
const PORT = Number(process.env.PORT) || 4000

console.log('[server] booting...')
app.listen(PORT, HOST, () => {
  console.log(`[server] listening on http://${HOST}:${PORT}`)
})
