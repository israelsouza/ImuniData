import { useEffect, useMemo, useState } from 'react'
import './App.css'
import { Autocomplete, RangeFilter } from './components/Filters'

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? ''
const PAGE_SIZE_DEFAULT = 50

const REGIOES = ['NORTE', 'NORDESTE', 'CENTRO-OESTE', 'SUDESTE', 'SUL']
const DOSES = ['1', '2', '3', 'Reforço']
const SEXOS = ['M', 'F']
const TAMANHOS_PAGINA = [10, 25, 50, 100, 200]

const FORMULARIO_INICIAL = {
  municipio: '',
  estado: '',
  estado_nome: '',
  vacina: '',
  vacina_sigla: '',
  dose: '',
  sexo_paciente: '',
  idade_paciente: '',
  data_registro: '',
}

function montarQuery(params) {
  const query = new URLSearchParams()
  Object.entries(params).forEach(([chave, valor]) => {
    if (valor !== null && valor !== undefined && String(valor).trim() !== '') {
      query.append(chave, String(valor).trim())
    }
  })
  return query.toString()
}

function formatarData(valor) {
  if (!valor) return '-'
  const normalizada = valor.replace(' ', 'T')
  const data = new Date(normalizada)
  if (Number.isNaN(data.getTime())) return valor
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(data)
}

function normalizarPayload(formulario) {
  return {
    ...formulario,
    idade_paciente: Number(formulario.idade_paciente),
  }
}

function App() {
  const [pagina, setPagina] = useState(0)
  const [tamanho, setTamanho] = useState(PAGE_SIZE_DEFAULT)
  const [filtros, setFiltros] = useState({
    busca: '',
    vacina: '',
    estado: '',
    regiao: '',
    dia: '',
    dose: '',
    data_inicio: '',
    data_fim: '',
    sexo: '',
    idade_min: '',
    idade_max: '',
  })
  const [filtrosDebounced, setFiltrosDebounced] = useState(filtros)

  const [registros, setRegistros] = useState([])
  const [meta, setMeta] = useState({
    totalElementos: 0,
    totalPaginas: 0,
    limiteGlobal: 5000,
  })

  const [resumoEstados, setResumoEstados] = useState([])
  const [resumoVacinas, setResumoVacinas] = useState([])

  // Opções para autocomplete
  const [opcoesMunicipios, setOpcoesMunicipios] = useState([])
  const [opcoesVacinas, setOpcoesVacinas] = useState([])
  const [opcoesEstados, setOpcoesEstados] = useState([])
  const [opcoesEstadosNomes, setOpcoesEstadosNomes] = useState([])

  const [carregandoTabela, setCarregandoTabela] = useState(false)
  const [carregandoResumo, setCarregandoResumo] = useState(false)
  const [erro, setErro] = useState('')

  const [formulario, setFormulario] = useState(FORMULARIO_INICIAL)
  const [editandoId, setEditandoId] = useState(null)
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setFiltrosDebounced(filtros)
      setPagina(0)
    }, 350)

    return () => clearTimeout(timer)
  }, [filtros])

  // Carregar opções para autocomplete
  useEffect(() => {
    const carregarOpcoes = async () => {
      try {
        // Carregar todos os registros (ou pelo menos muito mais) para extrair opções únicas
        const response = await fetch(`${API_BASE}/vacina/consulta?pagina=0&tamanho=5000`)
        if (!response.ok) return
        const data = await response.json()
        const registros = data.registros ?? []

        // Extrair opções únicas
        const municipios = [...new Set(registros.map(r => r.municipio))].sort()
        const vacinas = [...new Set(registros.map(r => r.vacina))].sort()
        const estados = [...new Set(registros.map(r => r.estado))].sort()
        const estadosNomes = [...new Set(registros.map(r => r.estado_nome))].sort()

        setOpcoesMunicipios(municipios)
        setOpcoesVacinas(vacinas)
        setOpcoesEstados(estados)
        setOpcoesEstadosNomes(estadosNomes)
      } catch (err) {
        console.error('Erro ao carregar opções:', err)
      }
    }

    carregarOpcoes()
  }, [])

  useEffect(() => {
    const abortController = new AbortController()
    const carregarDados = async () => {
      setCarregandoTabela(true)
      setErro('')
      try {
        const query = montarQuery({
          busca: filtrosDebounced.busca,
          vacina: filtrosDebounced.vacina,
          estado: filtrosDebounced.estado,
          regiao: filtrosDebounced.regiao,
          dia: filtrosDebounced.dia,
          dose: filtrosDebounced.dose,
          data_inicio: filtrosDebounced.data_inicio,
          data_fim: filtrosDebounced.data_fim,
          sexo: filtrosDebounced.sexo,
          idade_min: filtrosDebounced.idade_min,
          idade_max: filtrosDebounced.idade_max,
          pagina,
          tamanho: tamanho,
          ordenarPor: 'data_registro',
          direcao: 'desc',
        })
        const url = `${API_BASE}/vacina/consulta?${query}`
        console.log('📊 Buscando dados:', url)
        const response = await fetch(url, {
          signal: abortController.signal,
        })
        console.log('📊 Resposta status:', response.status)
        if (!response.ok) {
          throw new Error(`Falha ao carregar o histórico de vacinação. Status: ${response.status}`)
        }
        const data = await response.json()
        console.log('📊 Dados recebidos:', data)
        setRegistros(data.registros ?? [])
        setMeta({
          totalElementos: data.totalElementos ?? 0,
          totalPaginas: data.totalPaginas ?? 0,
          limiteGlobal: data.limiteGlobal ?? 5000,
        })
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('❌ Erro ao carregar dados:', error)
          setErro(error.message)
        }
      } finally {
        setCarregandoTabela(false)
      }
    }

    carregarDados()
    return () => abortController.abort()
  }, [filtrosDebounced, pagina, tamanho])

  useEffect(() => {
    const abortController = new AbortController()
    const carregarResumo = async () => {
      setCarregandoResumo(true)
      try {
        const urlEstados = `${API_BASE}/vacina/resumo/estados?${montarQuery({ vacina: filtrosDebounced.vacina })}`
        const urlVacinas = `${API_BASE}/vacina/resumo/vacinas?${montarQuery({ estado: filtrosDebounced.estado })}`
        console.log('📈 Buscando resumos:', { urlEstados, urlVacinas })
        const [estadosResponse, vacinasResponse] = await Promise.all([
          fetch(urlEstados, { signal: abortController.signal }),
          fetch(urlVacinas, { signal: abortController.signal }),
        ])

        if (!estadosResponse.ok || !vacinasResponse.ok) {
          throw new Error(`Falha ao carregar os resumos. Estados: ${estadosResponse.status}, Vacinas: ${vacinasResponse.status}`)
        }

        const [dadosEstados, dadosVacinas] = await Promise.all([
          estadosResponse.json(),
          vacinasResponse.json(),
        ])

        console.log('📈 Resumos recebidos:', { dadosEstados, dadosVacinas })
        setResumoEstados(dadosEstados.slice(0, 7))
        setResumoVacinas(dadosVacinas.slice(0, 7))
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('❌ Erro ao carregar resumos:', error)
          setResumoEstados([])
          setResumoVacinas([])
        }
      } finally {
        setCarregandoResumo(false)
      }
    }

    carregarResumo()
    return () => abortController.abort()
  }, [filtrosDebounced.vacina, filtrosDebounced.estado])

  const paginasTotais = useMemo(() => Math.max(meta.totalPaginas, 1), [meta.totalPaginas])

  const onFiltroChange = (event) => {
    if (typeof event === 'object' && event.target) {
      const { name, value } = event.target
      setFiltros((estadoAtual) => ({ ...estadoAtual, [name]: value }))
    }
  }

  const onFormChange = (event) => {
    const { name, value } = event.target
    setFormulario((estadoAtual) => ({ ...estadoAtual, [name]: value }))
  }

  const limparFormulario = () => {
    setFormulario(FORMULARIO_INICIAL)
    setEditandoId(null)
  }

  const editarRegistro = (registro) => {
    setEditandoId(registro.id)
    setFormulario({
      municipio: registro.municipio,
      estado: registro.estado,
      estado_nome: registro.estado_nome,
      vacina: registro.vacina,
      vacina_sigla: registro.vacina_sigla,
      dose: registro.dose,
      sexo_paciente: registro.sexo_paciente,
      idade_paciente: String(registro.idade_paciente),
      data_registro: registro.data_registro,
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const salvarRegistro = async (event) => {
    event.preventDefault()
    setSalvando(true)
    setErro('')
    const payload = normalizarPayload(formulario)

    try {
      const isEdicao = editandoId !== null
      const endpoint = isEdicao ? `${API_BASE}/vacina/${editandoId}` : `${API_BASE}/vacina`
      const method = isEdicao ? 'PATCH' : 'POST'

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error('Não foi possível salvar o registro. Verifique os dados informados.')
      }

      limparFormulario()
      setFiltrosDebounced((estadoAtual) => ({ ...estadoAtual }))
      setPagina(0)
    } catch (error) {
      setErro(error.message)
    } finally {
      setSalvando(false)
    }
  }

  const excluirRegistro = async (id) => {
    const confirmou = window.confirm('Deseja realmente excluir este registro?')
    if (!confirmou) return

    try {
      const response = await fetch(`${API_BASE}/vacina/${id}`, { method: 'DELETE' })
      if (!response.ok) {
        throw new Error('Falha ao excluir registro.')
      }
      if (registros.length === 1 && pagina > 0) {
        setPagina((valor) => valor - 1)
      } else {
        setFiltrosDebounced((estadoAtual) => ({ ...estadoAtual }))
      }
    } catch (error) {
      setErro(error.message)
    }
  }

  return (
    <main className="pagina">
      <header className="cabecalho">
        <div>
          <span className="selo">ImuniData</span>
          <h1>Painel de Vacinação</h1>
          <p>
            Gestão completa de aplicações com consulta otimizada, filtro em tempo real e limite
            inteligente de {meta.limiteGlobal.toLocaleString('pt-BR')} registros por consulta.
          </p>
        </div>
        <div className="metricas">
          <article>
            <strong>{meta.totalElementos.toLocaleString('pt-BR')}</strong>
            <span>Registros filtrados</span>
          </article>
          <article>
            <strong>{registros.length.toLocaleString('pt-BR')}</strong>
            <span>Itens na página</span>
          </article>
          <article>
            <strong>{pagina + 1}</strong>
            <span>Página atual</span>
          </article>
        </div>
      </header>

      <section className="grade-superior">
        <form className="card formulario" onSubmit={salvarRegistro}>
          <div className="card-topo">
            <h2>{editandoId ? 'Editar Aplicação' : 'Nova Aplicação'}</h2>
            {editandoId && (
              <button type="button" className="botao-secundario" onClick={limparFormulario}>
                Cancelar edição
              </button>
            )}
          </div>
          <div className="campos-formulario">
            <input name="vacina" value={formulario.vacina} onChange={onFormChange} placeholder="Tipo de vacina" required />
            <input name="dose" value={formulario.dose} onChange={onFormChange} placeholder="Dose" required />
            <input name="idade_paciente" type="number" min="1" value={formulario.idade_paciente} onChange={onFormChange} placeholder="Idade" required />
            <input name="sexo_paciente" value={formulario.sexo_paciente} onChange={onFormChange} placeholder="Sexo do paciente" required />
            <input name="municipio" value={formulario.municipio} onChange={onFormChange} placeholder="Município" required />
            <input name="estado" value={formulario.estado} onChange={onFormChange} placeholder="Estado (sigla)" maxLength={2} required />
            {/* <input name="estado_nome" value={formulario.estado_nome} onChange={onFormChange} placeholder="Nome do estado" required /> */}
            {/* <input name="vacina_sigla" value={formulario.vacina_sigla} onChange={onFormChange} placeholder="Sigla da vacina" required /> */}
            <input name="data_registro" value={formulario.data_registro} onChange={onFormChange} placeholder="Data de registro (YYYY-MM-DD HH:mm:ss-03)" required />
          </div>
          <button type="submit" className="botao-principal" disabled={salvando}>
            {salvando ? 'Salvando...' : editandoId ? 'Atualizar registro' : 'Cadastrar registro'}
          </button>
        </form>

        <div className="card resumo">
          <div className="bloco-resumo">
            <h3>Aplicações por Estado</h3>
            {carregandoResumo ? (
              <p>Atualizando...</p>
            ) : (
              <ul>
                {resumoEstados.map((item) => (
                  <li key={`${item.estado}-${item.estadoNome}`}>
                    <span>{item.estado} - {item.estadoNome}</span>
                    <strong>{item.totalAplicacoes.toLocaleString('pt-BR')}</strong>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="bloco-resumo">
            <h3>Aplicações por Vacina</h3>
            {carregandoResumo ? (
              <p>Atualizando...</p>
            ) : (
              <ul>
                {resumoVacinas.map((item) => (
                  <li key={`${item.vacina}-${item.vacinaSigla}`}>
                    <span>{item.vacinaSigla} - {item.vacina}</span>
                    <strong>{item.totalAplicacoes.toLocaleString('pt-BR')}</strong>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      <section className="card filtros">
        <h2>Filtros de Consulta</h2>
        
        <div className="filtros-linha-1">
          {/* <Autocomplete 
            nome="busca"
            valor={filtros.busca}
            onChange={onFiltroChange}
            placeholder="🔍 Busca dinâmica por município, estado ou vacina"
            opcoes={[...opcoesMunicipios, ...opcoesEstados, ...opcoesVacinas]}
          /> */}
          
          <Autocomplete 
            nome="vacina"
            valor={filtros.vacina}
            onChange={onFiltroChange}
            placeholder="💉 Tipo de vacina"
            opcoes={opcoesVacinas}
          />

          <select name="regiao" value={filtros.regiao} onChange={onFiltroChange} className="filtro-select">
            <option value="">🌍 Todas as regiões</option>
            {REGIOES.map((regiao) => (
              <option key={regiao} value={regiao}>
                {regiao}
              </option>
            ))}
          </select>
          
          <Autocomplete 
            nome="estado"
            valor={filtros.estado}
            onChange={onFiltroChange}
            placeholder="📍 Estado (sigla)"
            opcoes={opcoesEstados}
          />
        </div>

        <div className="filtros-linha-2">
          

          <select name="dose" value={filtros.dose} onChange={onFiltroChange} className="filtro-select">
            <option value="">💉 Todas as doses</option>
            {DOSES.map((dose) => (
              <option key={dose} value={dose}>
                Dose {dose}
              </option>
            ))}
          </select>

          <select name="sexo" value={filtros.sexo} onChange={onFiltroChange} className="filtro-select">
            <option value="">👥 Ambos os sexos</option>
            {SEXOS.map((sexo) => (
              <option key={sexo} value={sexo}>
                {sexo === 'M' ? 'Masculino' : 'Feminino'}
              </option>
            ))}
          </select>

          <select value={tamanho} onChange={(e) => setTamanho(Number(e.target.value))} className="filtro-select">
            <option value="">Registros por página</option>
            {TAMANHOS_PAGINA.map((tam) => (
              <option key={tam} value={tam}>
                {tam} registros
              </option>
            ))}
          </select>
        </div>

        {/* <div className="filtros-linha-3">
          <input 
            type="date" 
            name="data_inicio"
            value={filtros.data_inicio} 
            onChange={onFiltroChange}
            placeholder="Data de início"
            className="filtro-date"
            title="Data de início da vacinação"
          />
          <span className="separador-data">até</span>
          <input 
            type="date" 
            name="data_fim"
            value={filtros.data_fim} 
            onChange={onFiltroChange}
            placeholder="Data de fim"
            className="filtro-date"
            title="Data de fim da vacinação"
          />

          <div className="range-idade">
            <label>Idade do paciente</label>
            <input 
              type="number"
              name="idade_min"
              value={filtros.idade_min}
              onChange={onFiltroChange}
              placeholder="Mín"
              min="0"
              max="120"
              className="range-idade-input"
              title="Idade mínima"
            />
            <span>-</span>
            <input 
              type="number"
              name="idade_max"
              value={filtros.idade_max}
              onChange={onFiltroChange}
              placeholder="Máx"
              min="0"
              max="120"
              className="range-idade-input"
              title="Idade máxima"
            />
          </div>
        </div> */}
      </section>

      <section className="card tabela-card">
        <div className="card-topo">
          <h2>Histórico de Vacinação</h2>
          <div className="paginacao">
            <button type="button" onClick={() => setPagina((p) => Math.max(p - 1, 0))} disabled={pagina === 0 || carregandoTabela}>
              Anterior
            </button>
            <span>
              Página {pagina + 1} de {paginasTotais}
            </span>
            <button
              type="button"
              onClick={() => setPagina((p) => p + 1)}
              disabled={carregandoTabela || pagina + 1 >= meta.totalPaginas}
            >
              Próxima
            </button>
          </div>
        </div>

        {erro && <p className="erro">{erro}</p>}
        {carregandoTabela ? (
          <p className="loading">Carregando dados...</p>
        ) : (
          <div className="tabela-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Município</th>
                  <th>UF</th>
                  <th>Vacina</th>
                  <th>Dose</th>
                  <th>Sexo</th>
                  <th>Idade</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {registros.length === 0 && (
                  <tr>
                    <td colSpan="8" className="vazio">
                      Nenhum registro encontrado para os filtros atuais.
                    </td>
                  </tr>
                )}
                {registros.map((registro) => (
                  <tr key={registro.id}>
                    <td>{formatarData(registro.data_registro)}</td>
                    <td>{registro.municipio}</td>
                    <td>{registro.estado}</td>
                    <td>{registro.vacina_sigla} - {registro.vacina}</td>
                    <td>{registro.dose}</td>
                    <td>{registro.sexo_paciente}</td>
                    <td>{registro.idade_paciente}</td>
                    <td className="acoes">
                      <button type="button" onClick={() => editarRegistro(registro)}>
                        Editar
                      </button>
                      <button type="button" className="destrutivo" onClick={() => excluirRegistro(registro.id)}>
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  )
}

export default App
