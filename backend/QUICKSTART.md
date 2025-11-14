# FerryPass Backend - Instruções Rápidas

## 1. Instalação

```bash
npm install
```

## 2. Configurar variáveis de ambiente

Crie um arquivo `.env` na raiz do backend com base em `.env.example`:

```bash
cp .env.example .env
```

## 3. Popular banco de dados (opcional)

```bash
node seed.js
```

Isso criará:
- 1 operador de teste (email: `operador@ferrypass.com`, senha: `senha123`)
- 3 rotas de exemplo
- 3 clientes de exemplo
- 3 veículos de exemplo
- Tarifas pré-configuradas

## 4. Iniciar servidor

**Desenvolvimento (com auto-reload):**
```bash
npm run dev
```

**Produção:**
```bash
npm start
```

O servidor estará em `http://localhost:3000`

## 5. Testar endpoints

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"operador@ferrypass.com","password":"senha123"}'

# Listar rotas
curl http://localhost:3000/api/routes

# Health check
curl http://localhost:3000/api/health
```

## Variáveis de Ambiente Importantes

- `DB_PATH`: Caminho do arquivo SQLite (padrão: `./ferrypass.db`)
- `JWT_SECRET`: Chave para assinar tokens JWT
- `SMTP_*`: Credenciais para envio de e-mail
- `PORT`: Porta do servidor (padrão: 3000)
- `FRONTEND_URL`: URL do frontend para CORS (padrão: `http://localhost:5173`)

## Estrutura de Pastas

```
src/
├── server.js           - Arquivo principal
├── routes/             - Endpoints da API
├── middleware/         - Middlewares (auth, etc)
├── models/             - Database
└── utils/              - Utilidades (PDF, Email)

migrations/            - Scripts SQL (futuro)
pdfs/                  - PDFs gerados dinamicamente
```

## Endpoints Principais

- `POST /api/auth/login` — Login de operador
- `GET /api/clients?cpf=...` — Buscar cliente por CPF
- `POST /api/clients` — Criar novo cliente
- `GET /api/vehicles?plate=...` — Buscar veículo por placa
- `POST /api/vehicles` — Criar novo veículo
- `GET /api/routes` — Listar rotas
- `GET /api/sailings` — Listar viagens
- `POST /api/tickets` — Emitir passagem
- `GET /api/tickets/:code/pdf` — Download do PDF

## Troubleshooting

**"Port 3000 already in use"**
```bash
# Mudar porta em .env
PORT=3001
```

**"Cannot find module"**
```bash
npm install
```

**"E-mail não funciona"**
- Verifique credenciais SMTP em `.env`
- Se Gmail, ative 2FA e use App Password
- Teste conexão com a porta 587 aberta

Sucesso! 🚀
