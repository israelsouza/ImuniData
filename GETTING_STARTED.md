# ImuniData - Guia Rápido

## Pré-requisitos

- **Java 21+** instalado (ou use `/home/codespace/java/current` no Codespaces)
- **Node.js 18+** com npm

## Executar Backend

```bash
cd api
JAVA_HOME=/home/codespace/java/current ./mvnw -DskipTests spring-boot:run
```

O backend estará disponível em `http://localhost:8080`.

### Endpoints principais:
- `GET /vacina/consulta` - Lista registros com filtros e paginação
- `GET /vacina/resumo/estados` - Resumo de aplicações por estado
- `GET /vacina/resumo/vacinas` - Resumo de aplicações por vacina
- `POST /vacina` - Cadastrar novo registro
- `PATCH /vacina/{id}` - Editar registro
- `DELETE /vacina/{id}` - Deletar registro

## Executar Frontend

```bash
cd front
npm install
npm run dev
```

O frontend estará disponível em `http://localhost:5173` ou `http://localhost:5174` (se 5173 estiver ocupada).

### Configuração

O frontend usa **proxy Vite** para redirecionar `/vacina/*` ao backend em `http://localhost:8080`.

Se quiser usar uma URL remota (Codespaces/GitHub.dev), edite `front/.env.development`:

```
VITE_API_BASE_URL=https://8080-xxxxx.preview.app.github.dev
```

## Dados

O banco de dados está vazio por padrão (H2 in-memory). Para popular com dados de teste, use:

```bash
# Inserir um registro individual
curl -X POST "http://localhost:8080/vacina" \
  -H "Content-Type: application/json" \
  -d '{"municipio":"São Paulo","estado":"SP","estado_nome":"São Paulo","vacina":"Pfizer","vacina_sigla":"PF","dose":"1","sexo_paciente":"M","idade_paciente":35,"data_registro":"2026-05-13 10:30:00-03"}'
```

## CORS

CORS está ativado no backend com origem `*` e headers:
- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Methods: GET,POST,PUT,PATCH,DELETE,OPTIONS`
- `Access-Control-Allow-Headers: Origin,Content-Type,Accept,Authorization`

## Debug

Abra o console do navegador (F12) para ver logs de requisições:
- `📊 Buscando dados: ...` - URL que está sendo acessada
- `📊 Dados recebidos: ...` - Dados que chegaram
- `❌ Erro ao carregar dados: ...` - Se houver erro

## Troubleshooting

### Erro: "records are not supported in -source"
- Verifique que `java.version` é 21 no `pom.xml`
- Use `JAVA_HOME=/home/codespace/java/current ./mvnw` para forçar Java 21

### Erro: CORS bloqueado
- Certifique-se que o proxy Vite está ativo (dev server rodando em 5173/5174)
- Ou configure `VITE_API_BASE_URL` com a URL correta do backend

### Dados não aparecem
- Verifique os logs do navegador (F12 → Console)
- Teste diretamente: `curl http://localhost:8080/vacina/consulta`
