#!/usr/bin/env node
const { execSync } = require('node:child_process')
const path = require('node:path')
const dotenv = require('dotenv')

// carrega .env.test para fornecer DATABASE_URL etc.
dotenv.config({ path: path.resolve(__dirname, '../.env.test') })

const skip = ['1', 'true'].includes(String(process.env.SKIP_DB_MIGRATIONS || '').toLowerCase())

if (skip) {
  console.log('[pretest] SKIP_DB_MIGRATIONS ativo - pulando prisma migrate')
  process.exit(0)
}

function run(command) {
  execSync(command, {
    stdio: 'inherit',
    env: { ...process.env },
  })
}

try {
  run('npx prisma migrate deploy')
} catch (err) {
  console.warn('[pretest] migrate falhou, tentando prisma db push...')
  try {
    run('npx prisma db push')
  } catch (pushErr) {
    console.error('[pretest] não foi possível preparar o banco de testes.')
    throw pushErr
  }
}
