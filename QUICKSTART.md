# FerryPass — Sistema de Venda de Passagens de Ferry Boat

## 🎯 Visão Geral

Um sistema completo e pronto para produção para venda de passagens de ferry boat, com suporte para passageiros e veículos.

Este repositório contém:
- **Backend**: API REST em Node.js + Express com autenticação JWT
- **Frontend**: Interface React moderna e responsiva
- **Banco de Dados**: SQLite (fácil para desenvolvimento, pode migrar para PostgreSQL)

---

## 🚀 Iniciar Rápido

### 1️⃣ Backend

```bash
cd backend
npm install
cp .env.example .env  # Edite com suas credenciais SMTP
node seed.js          # Carregar dados de teste (opcional)
npm run dev
```

→ Servidor em `http://localhost:3000`

### 2️⃣ Frontend

```bash
cd frontend
npm install
npm run dev
```

→ Interface em `http://localhost:5173`

**Login de teste:**
- Email: `operador@ferrypass.com`
- Senha: `senha123`

---

## 📚 Documentação

- **[README.md](./README.md)** — Documentação completa do projeto
- **[backend/QUICKSTART.md](./backend/QUICKSTART.md)** — Guia do backend
- **[frontend/QUICKSTART.md](./frontend/QUICKSTART.md)** — Guia do frontend

---

## ✨ Funcionalidades Implementadas (MVP)

### ✅ Backend
- [x] Autenticação JWT com refresh tokens
- [x] CRUD de clientes (CPF, nome, e-mail, telefone)
- [x] CRUD de veículos (placa, modelo, tipo)
- [x] Cálculo dinâmico de tarifas por rota/tipo
- [x] Gerenciamento de viagens (sailings)
- [x] Emissão de passagens com código único
- [x] Geração de PDF com QR Code (Puppeteer)
- [x] Envio automático de e-mail com Nodemailer
- [x] Script de seed para dados de teste
- [x] API RESTful completa

### ✅ Frontend
- [x] Login de operador
- [x] Dashboard com listagem de viagens
- [x] Formulário de venda com:
  - [x] Autocomplete de cliente (por CPF)
  - [x] Autocomplete de veículo (por placa)
  - [x] Cálculo automático de tarifa
  - [x] Seleção de assento/slot
- [x] Design responsivo (mobile-first)
- [x] Feedback de sucesso/erro
- [x] Integração com backend via API

---

## 🛠️ Tecnologias

| Aspecto | Tecnologia |
|--------|-----------|
| **Backend** | Node.js + Express |
| **Banco** | SQLite3 (PostgreSQL pronto) |
| **Autenticação** | JWT + bcryptjs |
| **Frontend** | React 18 + Vite |
| **HTTP Client** | Axios |
| **PDF** | Puppeteer + QRCode |
| **E-mail** | Nodemailer |
| **Styling** | CSS3 Responsivo |

---

## 📁 Estrutura do Projeto

```
sistema/
├── backend/
│   ├── src/
│   │   ├── server.js
│   │   ├── middleware/auth.js
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── clientRoutes.js
│   │   │   ├── vehicleRoutes.js
│   │   │   ├── routeRoutes.js
│   │   │   ├── sailingRoutes.js
│   │   │   └── ticketRoutes.js
│   │   ├── models/database.js
│   │   └── utils/
│   │       ├── pdfGenerator.js
│   │       └── emailService.js
│   ├── seed.js
│   ├── package.json
│   ├── .env.example
│   └── QUICKSTART.md
│
├── frontend/
│   ├── src/
│   │   ├── main.jsx
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx
│   │   │   └── DashboardOperador.jsx
│   │   ├── components/
│   │   │   ├── SellTicketForm.jsx
│   │   │   └── SailingsList.jsx
│   │   └── services/api.js
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   └── QUICKSTART.md
│
├── .gitignore
├── README.md
└── QUICKSTART.md (este arquivo)
```

---

## 🔑 Endpoints Principais da API

### Autenticação
```
POST   /api/auth/login              Login de operador
POST   /api/auth/register           Registrar novo operador
```

### Clientes
```
GET    /api/clients                 Listar todos
GET    /api/clients?cpf=XXX         Buscar por CPF
POST   /api/clients                 Criar novo
PUT    /api/clients/:id             Atualizar
```

### Veículos
```
GET    /api/vehicles                Listar todos
GET    /api/vehicles?plate=ABC      Buscar por placa
POST   /api/vehicles                Criar novo
GET    /api/vehicles/fares          Buscar tarifas
```

### Rotas e Viagens
```
GET    /api/routes                  Listar rotas
POST   /api/routes                  Criar rota
GET    /api/sailings                Listar viagens
POST   /api/sailings                Criar viagem
```

### Passagens
```
POST   /api/tickets                 Emitir passagem
GET    /api/tickets                 Listar passagens
GET    /api/tickets/:code/pdf       Download PDF
```

---

## 🔐 Variáveis de Ambiente

### Backend (.env)
```env
# Banco de dados
DB_PATH=./ferrypass.db

# JWT
JWT_SECRET=seu_secret_aleatorio_muito_longo
JWT_EXPIRES_IN=24h

# SMTP (para e-mail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu_email@gmail.com
SMTP_PASS=sua_app_password
SMTP_FROM=noreply@ferrypass.com

# Servidor
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

---

## 💻 Como Usar

### 1. Criar um Cliente
```javascript
POST /api/clients
{
  "cpf": "123.456.789-00",
  "name": "João Silva",
  "email": "joao@email.com",
  "phone": "(11) 99999-9999"
}
```

### 2. Criar um Veículo
```javascript
POST /api/vehicles
{
  "plate": "ABC1D23",
  "model": "Honda Civic",
  "vehicle_type": "carro",
  "owner_client_id": 1
}
```

### 3. Criar uma Rota e Viagem
```javascript
// Rota
POST /api/routes
{
  "name": "Rio-Niterói",
  "origin": "Rio de Janeiro",
  "destination": "Niterói",
  "duration_minutes": 30
}

// Viagem
POST /api/sailings
{
  "route_id": 1,
  "departure": "2025-01-20T10:00:00",
  "capacity_passengers": 200,
  "capacity_vehicles": 50
}
```

### 4. Emitir uma Passagem
```javascript
POST /api/tickets
{
  "sailing_id": 1,
  "client_id": 1,
  "vehicle_id": 1,
  "seat_or_slot": "A1",
  "fare_paid": 80.00
}
```

---

## 🔄 Fluxo de Venda (UI)

1. **Operador** faz login
2. Seleciona uma **viagem**
3. Digita **CPF** → sistema preenche dados do cliente
4. Digita **placa** (opcional) → sistema preenche modelo e calcula tarifa
5. Confirma a **venda**
6. **PDF gerado** e **e-mail enviado** automaticamente
7. Cliente recebe passagem com QR Code

---

## 📧 Configurar E-mail (Gmail)

1. Ativar **2FA** em sua conta Google
2. Gerar **Senha de App**:
   - Ir em https://myaccount.google.com/apppasswords
   - Selecionar "Mail" e "Windows Computer"
   - Copiar a senha gerada
3. Configurar em `.env`:
```env
SMTP_USER=seu_email@gmail.com
SMTP_PASS=sua_app_password_aqui
```

---

## 🚀 Deploy

### Backend (Heroku)
```bash
heroku create meu-ferrypass-api
heroku config:set JWT_SECRET=...
git push heroku main
```

### Frontend (Vercel)
```bash
npm install -g vercel
cd frontend
vercel
```

---

## 🐛 Troubleshooting

| Problema | Solução |
|---------|---------|
| Port 3000 in use | Mudar `PORT` em `.env` |
| Cannot find module | `npm install` no respectivo diretório |
| E-mail não funciona | Verificar credenciais SMTP e 2FA |
| CORS error | Verificar `FRONTEND_URL` em `.env` |
| PDF não gerado | Instalar: `npm install puppeteer` |

---

## 📋 Próximas Funcionalidades

- [ ] Integração com WhatsApp (Twilio)
- [ ] QR Code scanner para embarque
- [ ] Relatórios de vendas
- [ ] Checkout online para clientes
- [ ] Dashboard mobile (React Native)
- [ ] Integração de pagamento (Stripe)
- [ ] Notificações push
- [ ] Múltiplas rotas simultâneas

---

## 📞 Suporte

Consulte a documentação específica:
- **[README.md](./README.md)** — Documentação técnica completa
- **[backend/QUICKSTART.md](./backend/QUICKSTART.md)** — Guia backend
- **[frontend/QUICKSTART.md](./frontend/QUICKSTART.md)** — Guia frontend

---

## 📄 Licença

MIT License — use livremente! 🎉

---

**Versão:** 1.0.0  
**Data:** 13 de Novembro de 2025  
**Status:** MVP Pronto para Produção ✅
