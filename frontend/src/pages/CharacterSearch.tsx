import Container from '@/components/Container'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function CharacterSearch() {
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      setError('Informe o nome do personagem')
      return
    }
    setError(null)
    navigate(`/characters/${encodeURIComponent(name.trim())}`)
  }

  return (
    <Container>
      <h1 className="text-xl font-semibold mb-3">Buscar personagem</h1>

      <form onSubmit={onSubmit} className="card p-4 space-y-3 max-w-xl">
        <input
          className="input"
          placeholder="Ex.: Kaamez"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        {error && <p className="text-rose-300 text-sm">{error}</p>}
        <button className="btn" type="submit">Buscar</button>
      </form>
    </Container>
  )
}
