# Guia de testes locais

Este passo a passo ajuda a validar o Tibia Pulse **antes de publicar no Azure**, contemplando backend, frontend e chamadas aos serviços externos (TibiaData e tibia.com).

## 1. Pré-requisitos

- Node.js 20+
- npm 10+
- PostgreSQL local ou em contêiner (pode ser `docker run -p 5432:5432 postgres:15`)
- Opcional: Thunder Client / Insomnia / cURL para testar endpoints

## 2. Variáveis de ambiente

1. Na pasta `backend/`, crie um arquivo `.env.local` baseado em `.env`:
   ```
   cp backend/.env backend/.env.local
   ```
2. Ajuste os valores principais:
   - `DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/tibiapulse`
   - `JWT_SECRET=algum-segredo-forte`
   - `TIBIADATA_BASE_URL=https://api.tibiadata.com/v4` (padrão; pode alterar se usar proxy)
3. Opcional: para testes, `.env.test` já existe e é usado pelo `npm run test`.

No frontend, copie `.env` para `.env.local` (ou use `.env` mesmo) e defina:
```
VITE_API_BASE_URL=http://localhost:4000
```

## 3. Banco de dados

1. Suba o PostgreSQL local (docker ou serviço instalado).
2. Crie o banco `tibiapulse` (ou o nome que inseriu na `DATABASE_URL`).
3. Rode as migrações/`db push`:
   ```
   cd backend
   npm install
   npx prisma db push
   ```

## 4. Backend

Para desenvolvimento:
```
cd backend
npm install
dotenv -e .env.local -- tsx -r tsconfig-paths/register src/server.ts
```

Endpoints úteis:
- `GET http://localhost:4000/health`
- `GET http://localhost:4000/api/characters/Kaamez`
- `GET http://localhost:4000/api/bosses/boostable`
- `GET http://localhost:4000/api/bosses/killstats/Issobra`

### Dicas
- Logs como `[characters] tibia profile fetched via ...` indicam qual rota/proxy foi usada.
- Se o scraping falhar por bloqueio do Tibia ou do rastreador externo, aguarde ou use uma VPN; os fallbacks (AllOrigins, Jina) já estão habilitados.
- Use `npm run test:unit` para validar controladores/serviços sem subir o servidor.

## 5. Frontend

```
cd frontend
npm install
npm run dev
```

Abra `http://localhost:5173`. O frontend irá chamar o backend em `VITE_API_BASE_URL`. Garanta que:
- Você consegue buscar um personagem e ver todos os tabs (Character, History, Experience, Time, Highscore, Deaths).
- A página de bosses lista e filtra corretamente; para testar o cenário “boss que acabou de aparecer em Issobra”, chame `GET /api/bosses/killstats/Issobra` e use os dados retornados no filtro (feature futura).

## 6. Scripts úteis

- `npm run dev` (backend) – com `dotenv-cli`, já carrega `.env.local`.
- `npm run start` – build + Prisma generate (usado em produção/Azure).
- `npm run test` – Jest com `.env.test`.

## 7. Fluxo antes do deploy

1. Rodar `npm run build` no backend para garantir que o TypeScript compila.
2. Rodar `npm run build` no frontend para confirmar bundler.
3. Executar smoke-tests locais (`curl` nas rotas críticas) e, se possível, salvar a saída para comparação pós-deploy.

Seguindo esses passos é possível validar todo o pipeline (scraping + agregação + frontend) localmente, evitando subir builds quebrados para o Azure.
