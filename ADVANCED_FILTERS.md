# ImuniData - Filtros Avançados e Autocomplete

## ✅ Novas Funcionalidades Implementadas

### 1. **Autocomplete Inteligente**
Novos campos agora possuem sugestões dinâmicas enquanto você digita:

- **🔍 Busca Dinâmica**: Filtra por município, estado ou vacina com sugestões em tempo real
- **💉 Tipo de Vacina**: Autocomplete com todas as vacinas disponíveis
- **📍 Estado**: Sugestões de siglas de estados com base nos dados

O componente `Autocomplete` (em `src/components/Filters.jsx`) extrai automaticamente as opções únicas dos primeiros 5000 registros do banco.

### 2. **Filtros Expandidos**

#### Seção de Filtros - Linha 1:
- **Busca Dinâmica**: Campo com autocomplete (múltiplas opções)
- **Tipo de Vacina**: Autocomplete (Coronavac, Pfizer, Astrazeneca, Moderna, Janssen)
- **Estado**: Autocomplete (SP, RJ, MG, DF, BA, CE, AM, PE, etc.)

#### Seção de Filtros - Linha 2:
- **Região**: Dropdown (Todas as regiões / NORTE / NORDESTE / CENTRO-OESTE / SUDESTE / SUL)
- **Dose**: Dropdown (Todas as doses / 1 / 2 / 3 / Reforço)
- **Sexo**: Dropdown (Ambos os sexos / Masculino / Feminino)
- **Registros por Página**: Dropdown (10 / 25 / 50 / 100 / 200)

#### Seção de Filtros - Linha 3:
- **Data Inicial**: Campo de data (desde quando visualizar registros)
- **Data Final**: Campo de data (até quando visualizar registros)
- **Idade do Paciente**: Range inputs (Mínima e Máxima de 0 a 120 anos)

### 3. **Componentes Reutilizáveis**

#### `Autocomplete` Component
```jsx
<Autocomplete 
  nome="campo"
  valor={filtrosvalor}
  onChange={handler}
  placeholder="Digite..."
  opcoes={arrayDeOpcoes}
/>
```

#### `RangeFilter` Component
```jsx
<RangeFilter 
  label="Idade"
  nomeMin="idade_min"
  nomeMax="idade_max"
  valorMin={filtros.idade_min}
  valorMax={filtros.idade_max}
  onChange={handler}
  max={120}
/>
```

### 4. **Melhorias de UX**

- **Ícones nos Placeholders**: Emojis visuais para indicar o tipo de filtro (🔍, 💉, 📍, etc.)
- **Dropdown com 200 Registros**: Para datasets maiores, opção de carregar mais dados por página
- **Layout Responsivo**: Filtros se reorganizam em telas menores
- **Sugestões Automáticas**: Ao digitar, autocomplete mostra até 10 opções
- **Debounce de 350ms**: Requisições otimizadas ao digitar nos filtros

### 5. **Estados e Variáveis Adicionadas**

```javascript
const [tamanho, setTamanho] = useState(PAGE_SIZE_DEFAULT)
const [filtros, setFiltros] = useState({
  // ... filtros antigos ...
  dose: '',
  data_inicio: '',
  data_fim: '',
  sexo: '',
  idade_min: '',
  idade_max: '',
})

// Opções para autocomplete
const [opcoesMunicipios, setOpcoesMunicipios] = useState([])
const [opcoesVacinas, setOpcoesVacinas] = useState([])
const [opcoesEstados, setOpcoesEstados] = useState([])
const [opcoesEstadosNomes, setOpcoesEstadosNomes] = useState([])
```

## 🎨 Estilos Adicionados

### Autocomplete
- `.autocomplete-container`: Wrapper relativo
- `.autocomplete-lista`: Lista flutuante com scroll
- `.autocomplete-item`: Itens com hover interativo

### Filtros
- `.filtros-linha-1/2/3`: Organização em 3 linhas responsivas
- `.filtro-select`: Styling de selectores
- `.range-idade`: Container para inputs de range
- `.separador-data`: Texto "até" entre datas

### Responsivo
- Mobile (< 768px): Todos os filtros em coluna única
- Tablet (768px - 1280px): Layout intermédio
- Desktop (> 1280px): Layout otimizado em 3 linhas

## 📡 Parâmetros de Query Enviados

Todos os novos filtros são automaticamente inclusos na query:

```
GET /vacina/consulta?
  busca={termo}
  &vacina={vacina}
  &estado={estado}
  &regiao={regiao}
  &dose={dose}
  &data_inicio={YYYY-MM-DD}
  &data_fim={YYYY-MM-DD}
  &sexo={sexo}
  &idade_min={número}
  &idade_max={número}
  &pagina={página}
  &tamanho={tamanho}
  &ordenarPor=data_registro
  &direcao=desc
```

## 🔧 Uso no App.jsx

```jsx
import { Autocomplete, RangeFilter } from './components/Filters'

// ... no JSX ...

<Autocomplete 
  nome="estado"
  valor={filtros.estado}
  onChange={onFiltroChange}
  placeholder="📍 Estado (sigla)"
  opcoes={opcoesEstados}
/>

<select name="dose" value={filtros.dose} onChange={onFiltroChange}>
  <option value="">💉 Todas as doses</option>
  {DOSES.map((dose) => (
    <option key={dose} value={dose}>Dose {dose}</option>
  ))}
</select>
```

## 🚀 Próximos Passos (Opcional)

1. **Backend**: Implementar suporte para `data_inicio`, `data_fim`, `idade_min`, `idade_max` se ainda não existir
2. **Validação**: Adicionar validações para datas (data_fim > data_inicio)
3. **LocalStorage**: Salvar filtros aplicados para recuperar ao recarregar
4. **Histórico**: Botão "Limpar Filtros" unificado
5. **Export**: Exportar dados filtrados em CSV/XLSX
6. **Presets**: Salvar combinações de filtros comuns como "favoritos"

## 📝 Arquivos Modificados

- `src/App.jsx`: Adicionado estado e lógica de novos filtros
- `src/App.css`: Estilos para autocomplete e novos filtros
- `src/components/Filters.jsx`: Novo arquivo com componentes reutilizáveis
- `front/.env.development`: Configuração de desenvolvimento (criado ou atualizado)

