import express from 'express'
import cors from 'cors'
import swaggerUi from 'swagger-ui-express'

import { swaggerSpec } from './swagger'
import routes from './routes'
import authRoutes from './routes/auth.routes'
import favoriteRoutes from './routes/favorites.routes'
import { errorHandler } from './middleware/error'

const app = express()

// --- Middlewares globais ---
app.use(cors()) // permite requisições externas (frontend)
app.use(express.json()) // parseia JSON do body

// --- Swagger ---
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
app.get('/docs.json', (_req, res) => res.json(swaggerSpec))

// --- Rotas principais ---
app.use('/api', routes)

// --- Autenticação e Favoritos ---
app.use('/api/auth', authRoutes)
app.use('/api/favorites', favoriteRoutes)

// --- Health Check ---
app.get('/health', (_req, res) => res.status(200).json({ status: 'ok' }))

// --- Middleware global de erro ---
app.use(errorHandler)

// --- Catch-all 404 ---
app.use((_req, res) => res.status(404).send('not found'))

// --- Exporta para uso no server.ts e nos testes ---
export { app }
export default app
