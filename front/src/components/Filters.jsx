import { useState, useEffect, useRef } from 'react'

export function Autocomplete({ 
  nome, 
  valor, 
  onChange, 
  placeholder, 
  opcoes = [], 
  carregando = false,
  onSelectedChange = null 
}) {
  const [aberto, setAberto] = useState(false)
  const [filtradas, setFiltradas] = useState([])
  const containerRef = useRef(null)

  useEffect(() => {
    if (!valor.trim()) {
      setFiltradas([])
      return
    }
    const valorLower = valor.toLowerCase()
    const matches = opcoes.filter(opt => 
      opt.toLowerCase().includes(valorLower)
    )
    setFiltradas(matches.slice(0, 10))
  }, [valor, opcoes])

  useEffect(() => {
    function handleClickFora(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setAberto(false)
      }
    }
    document.addEventListener('mousedown', handleClickFora)
    return () => document.removeEventListener('mousedown', handleClickFora)
  }, [])

  const handleSelect = (opcao) => {
    onChange({ target: { name: nome, value: opcao } })
    if (onSelectedChange) onSelectedChange(opcao)
    setAberto(false)
  }

  return (
    <div className="autocomplete-container" ref={containerRef}>
      <input
        name={nome}
        value={valor}
        onChange={(e) => {
          onChange(e)
          setAberto(true)
        }}
        onFocus={() => valor && setAberto(true)}
        placeholder={placeholder}
        autoComplete="off"
        className="autocomplete-input"
      />
      {aberto && filtradas.length > 0 && (
        <ul className="autocomplete-lista">
          {filtradas.map((opcao, idx) => (
            <li 
              key={idx} 
              onClick={() => handleSelect(opcao)}
              className="autocomplete-item"
            >
              {opcao}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export function RangeFilter({ label, nomeMin, nomeMax, valorMin, valorMax, onChange, max = 100 }) {
  return (
    <div className="range-filter">
      <label>{label}</label>
      <div className="range-inputs">
        <input
          type="number"
          name={nomeMin}
          value={valorMin}
          onChange={onChange}
          placeholder="Min"
          min="0"
          max={max}
          className="range-input"
        />
        <span>-</span>
        <input
          type="number"
          name={nomeMax}
          value={valorMax}
          onChange={onChange}
          placeholder="Max"
          min="0"
          max={max}
          className="range-input"
        />
      </div>
    </div>
  )
}
