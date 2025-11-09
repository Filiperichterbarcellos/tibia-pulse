import { Router } from 'express'
import { TibiaDataClient } from '../services/tibiadata'

const characters = Router()

characters.get('/:name', async (req, res) => {
  try {
    const name = req.params.name?.trim()
    if (!name) return res.status(400).json({ error: 'missing name' })

    console.log('[characters] fetching', name)
    const data = await TibiaDataClient.character(name)

    if (!data) return res.status(404).json({ error: 'not found' })

    return res.json(data)
  } catch (e) {
    console.error('[characters] upstream error', e)
    return res.status(502).json({ error: 'upstream error' })
  }
})

export default characters
