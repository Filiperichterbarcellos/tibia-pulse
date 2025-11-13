// src/app.ts
import express from 'express'
import cors from 'cors'
import swaggerUi from 'swagger-ui-express'

import { swaggerSpec } from './swagger'
import routes from './routes'
import authRoutes from './routes/auth.routes'
import favoriteRoutes from './routes/favorites.routes'
import profileRoutes from './routes/profile.routes'

// ⬇️ use os nomes dos arquivos que você já tem
import bossesRoutes from './routes/bosses'
import calculatorRoutes from './routes/calculator'
import worldsRoutes from './routes/worlds'

import { errorHandler } from './middleware/error'

const app = express()

app.use(cors())
app.use(express.json())

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
app.get('/docs.json', (_req, res) => res.json(swaggerSpec))

app.use('/api', routes)

app.use('/api/auth', authRoutes)
app.use('/api/favorites', favoriteRoutes)
app.use('/api/profile', profileRoutes)

// ⬇️ monta as rotas novas
app.use('/api/worlds', worldsRoutes)
app.use('/api/bosses', bossesRoutes)
app.use('/api/calculator', calculatorRoutes)

app.get('/health', (_req, res) => res.status(200).json({ status: 'ok' }))

app.use(errorHandler)
app.use((_req, res) => res.status(404).send('not found'))

export { app }
export default app
