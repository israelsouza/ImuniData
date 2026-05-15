# ImuniData - Sistema de Monitoramento de Vacinação

## 1. Problema e Solução
**Problema:** A falta de conscientização e a dificuldade de acesso a dados claros sobre a cobertura vacinal dificultam a gestão de saúde pública e a percepção do cidadão sobre a importância da imunização. A dispersão de informações torna complexo o acompanhamento de quais regiões estão com baixa adesão.

**Solução:** O ImuniData resolve este problema através de uma API robusta e simplificada que centraliza o registro e a consulta de doses aplicadas. Ao organizar os dados por município, estado e tipo de vacina, o sistema permite que gestores e usuários visualizem rapidamente a cobertura vacinal, facilitando a identificação de gargalos e promovendo a conscientização sobre a necessidade de atualização do ciclo vacinal de forma intuitiva e eficiente.

## 2. Dicionário de Dados
A entidade principal do sistema é a `RegistroVacinacao`, que representa um registro de aplicação de imunizante.

| Campo | Tipo | Descrição | Restrições |
| :--- | :--- | :--- | :--- |
| `id` | Integer | Identificador único do registro (gerado automaticamente). | Chave Primária |
| `municipio` | String | Nome da cidade onde a vacina foi aplicada. | Obrigatório |
| `estado` | String | Sigla do estado da aplicação. | Obrigatório |
| `estado_nome` | String | Nome completo do estado da aplicação. | Obrigatório |
| `vacina` | String | Nome do imunizante aplicado (ex: Vacina Varíola Bavarian Nordic). | Obrigatório |
| `vacina_sigla` | String | Sigla do imunizante aplicado (ex: VVBN). | Obrigatório |
| `dose` | String | Identificação da dose (ex: 1ª dose, Reforço). | Obrigatório |
| `sexo_paciente` | String | Sexo do paciente (ex: M, F). | Obrigatório |
| `idade_paciente` | Integer | Idade do paciente em anos. | Obrigatório, $> 0$ |
| `data_registro` | String | Data em que a vacinação foi registrada. | Obrigatório |

```json 
{
  "municipio": "FLORIANOPOLIS",
  "estado": "SC",
  "estado_nome": "SANTA CATARINA",
  "vacina": "Vacina Varíola Bavarian Nordic",
  "vacina_sigla": "VVBN",
  "dose": "2ª Dose",
  "sexo_paciente": "M",
  "idade_paciente": 28,
  "data_registro": "2026-01-22 14:54:53-03",
  "id": 199
}
```

## 3. Mapeamento de Rotas (API)
Todas as rotas seguem o prefixo `/vacina`.

| Método | Endpoint | Descrição | Corpo da Requisição | Retorno Sucesso | Retorno Erro |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **GET** | `/vacina` | Lista todas as vacinas | N/A | `200 OK` + `List<RegistroVacinacao>` | `500 Internal Server Error` |
| **GET** | `/vacina/consulta` | Consulta registros com filtros e paginação | N/A | `200 OK` + `ConsultaVacinaResponseDTO` | `500 Internal Server Error` |
| **GET** | `/vacina/resumo/estados` | Resumo de aplicações por estado | N/A | `200 OK` + `List<EstadoResumoDTO>` | `500 Internal Server Error` |
| **GET** | `/vacina/resumo/vacinas` | Resumo de aplicações por vacina | N/A | `200 OK` + `List<VacinaResumoDTO>` | `500 Internal Server Error` |
| **GET** | `/vacina/{id}` | Busca vacina por ID | N/A | `200 OK` + `RegistroVacinacao` | `404 Not Found` |
| **GET** | `/vacina/filtro/sexo/{sexo}` | Filtra registros por sexo do paciente | N/A | `200 OK` + `List<RegistroVacinacao>` | `404 Not Found` |
| **GET** | `/vacina/filtro/estado/{sigla}` | Filtra registros por sigla de estado | N/A | `200 OK` + `List<RegistroVacinacao>` | `404 Not Found` |
| **POST** | `/vacina` | Cadastra novo registro de vacinação | JSON da entidade `RegistroVacinacao` | `201 Created` + `RegistroVacinacao` | `400 Bad Request` |
| **POST** | `/vacina/importacao/manual` | Importa registros em lote (contrato API externa) | Lista JSON de `VacinaApiDTO` | `201 Created` + `ImportacaoResponse` | `400 Bad Request` |
| **PATCH** | `/vacina/{id}` | Atualiza dados parciais | JSON com campos a alterar | `200 OK` + `RegistroVacinacao` | `404 Not Found` |
| **DELETE** | `/vacina/{id}` | Remove registro | N/A | `204 No Content` | `404 Not Found` |
| **GET** | `/vacina/importacao/2026` | Importa dados da API externa | N/A | `200 OK` + `ImportacaoResponse` | `500 Internal Server Error` |

## 4. Justificativa Técnica

### Arquitetura MVC (Model-View-Controller)
O projeto foi implementado seguindo o padrão **MVC**, garantindo a separação de responsabilidades e facilitando a manutenção do código:
- **Model (`RegistroVacinacao`)**: Define a estrutura de dados e as regras de validação da entidade, isolando a representação dos dados do restante da aplicação.
- **View (JSON/ResponseEntity)**: Como se trata de uma API REST, a "View" é a representação dos dados em formato JSON retornada ao cliente através de `ResponseEntity`, permitindo que diferentes front-ends consumam a mesma lógica.
- **Controller (`VacinaController`)**: Atua como a camada de entrada, gerenciando as requisições HTTP, validando os inputs e direcionando as chamadas para a camada de serviço.
- **Service (`VacinaService`)**: Camada de lógica de negócio, onde residem as regras de atualização, processamento e consultas especializadas, evitando que o Controller tenha conhecimento de como os dados são manipulados no banco.
- **Integração externa (`VacinaApiClient` + `VacinaImportService`)**: A importação automática e a importação manual em lote usam o mesmo fluxo de mapeamento de `VacinaApiDTO` para `RegistroVacinacao`, centralizando a conversão e a persistência em massa com `saveAll(...)`.
- **Contrato de entrada (`VacinaApiDTO`)**: O DTO funciona como fronteira entre o JSON recebido e a entidade persistida, permitindo ignorar campos extras da exportação sem acoplar a API ao payload bruto.

### Segurança contra Valores Nulos com `Optional`
Para evitar o erro clássico `NullPointerException` e tornar o código mais expressivo, foi utilizado o tipo `Optional<T>` em métodos de busca e atualização:
- **Prevenção de Erros**: Em vez de retornar `null` quando um registro não é encontrado, o método retorna um `Optional`. Isso obriga o desenvolvedor a tratar explicitamente a ausência do valor.
- **Fluidez**: O uso de métodos como `.map()` e `.orElseGet()` no Controller permite transformar a presença ou ausência de um objeto diretamente em respostas HTTP (`200 OK` ou `404 Not Found`) de forma concisa e segura.
### Consistência em Importação em Lote
O fluxo de importação, tanto automática quanto manual, retorna um objeto `ImportacaoResponse` estruturado em snake_case com a mensagem descritiva, total de registros processados, timestamp e status. Isso mantém o contrato padronizado mesmo em operações em lote, melhorando a experiência do cliente API.

### Tratamento de Erros Centralizado
A implementação do `TratadorDeErros` utilizando `@RestControllerAdvice` permite que a API capture exceções de validação (`MethodArgumentNotValidException`) de forma global. Isso garante que o cliente receba sempre uma resposta padronizada e amigável em caso de erro de preenchimento (400 Bad Request), independentemente de qual endpoint foi acessado.
