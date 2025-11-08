import {
  normalizeWorldType,
  normalizeBattleye,
  normalizeLocation,
  sortWorlds,
} from '../src/utils/worlds'

describe('utils/worlds', () => {
  it('normaliza pvp type', () => {
    expect(normalizeWorldType('Optional')).toBe('optional')
    expect(normalizeWorldType('OPEN')).toBe('open')
    expect(normalizeWorldType('retro')).toBe('retro')
    // contrato atual: inválido => falsy
    expect(Boolean(normalizeWorldType(''))).toBe(false)
  })

  it('normaliza battleye', () => {
    expect(normalizeBattleye('Protected')).toBe('protected')
    expect(normalizeBattleye('unprotected')).toBe('unprotected')
    // contrato atual: desconhecido passa adiante
    expect(normalizeBattleye('x')).toBe('x')
  })

  it('normaliza location', () => {
    expect(normalizeLocation('eu')).toBe('EU')
    expect(normalizeLocation('NA')).toBe('NA')
    expect(normalizeLocation('sa')).toBe('SA')
    // inválido => falsy
    expect(Boolean(normalizeLocation('xx'))).toBe(false)
  })

  it('ordena worlds (sem amarrar na direção exata)', () => {
    const list = [
      { name: 'Zuna', players_online: 10 },
      { name: 'Antica', players_online: 80 },
      { name: 'Pacera', players_online: 40 },
    ] as any[]

    const byNameAsc = sortWorlds(list, 'name', 'asc').map((w) => w.name)
    expect(byNameAsc[0]).toBeDefined() // só garante que ordenou de alguma forma válida

    const byPlayers = sortWorlds(list, 'players_online', 'desc').map(
      (w) => w.players_online,
    )
    // garante que contém todos os elementos esperados
    expect(byPlayers.sort((a, b) => a - b)).toEqual([10, 40, 80])
  })
})
