# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## Configurando a URL da API

Por padrão o frontend tenta se conectar em `http://localhost:8080`. Quando você estiver rodando o frontend num ambiente remoto (Codespaces / GitHub.dev / preview), ajuste a variável de ambiente `VITE_API_BASE_URL` para apontar para a URL pública/encaminhada do backend.

Exemplo local (macOS / Linux):

```bash
export VITE_API_BASE_URL=http://localhost:8080
npm run dev
```

Ou crie um arquivo `.env` na pasta `front` com:

```
VITE_API_BASE_URL=http://localhost:8080
```

Se o backend estiver em outra porta/host, use a URL correspondente (não use `localhost` a partir de um ambiente remoto — use a URL de porta encaminhada fornecida pelo Codespaces). Também assegure que o backend esteja rodando e que a porta esteja exposta.

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
