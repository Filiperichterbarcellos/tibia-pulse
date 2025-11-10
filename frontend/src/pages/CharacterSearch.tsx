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
    <div className="retro-layout space-y-6">
      <section className="retro-hero">
        <div>
          <p className="retro-badge">Personagens</p>
          <h1>Busque qualquer personagem do Tibia</h1>
          <p>Utilizamos a API do TibiaData para trazer o nível, vocação e últimas mortes.</p>
        </div>
      </section>

      <section className="retro-panel max-w-xl">
        <form onSubmit={onSubmit} className="space-y-3">
          <label className="retro-input">
            <span>Nome do personagem</span>
            <div className="retro-input__field">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex.: Kaamez"
              />
            </div>
          </label>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" className="retro-auth w-full justify-center">
            Buscar
          </button>
        </form>
      </section>
    </div>
  )
}
