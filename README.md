# FerryPass — Sistema de Venda de Passagens de Ferry Boat

## 📋 Visão Geral

**FerryPass** é um aplicativo completo para venda de passagens de ferry boat, com suporte para passageiros e veículos. O sistema oferece:

- ✅ Autenticação JWT para operadores
- ✅ Cadastro de clientes (CPF, nome, e-mail, telefone)
- ✅ Registro de veículos com tarifas dinâmicas
- ✅ Gerenciamento de viagens (sailings)
- ✅ Emissão de passagens com QR Code
- ✅ Geração de PDF para impressão/envio
- ✅ Integração com Nodemailer para envio de e-mails
- ✅ Interface web responsiva (React + Vite)

---

## 🛠️ Tecnologias Utilizadas

### Backend
- **Node.js** + **Express** — Servidor HTTP
- **SQLite3** — Banco de dados (configurável para PostgreSQL)
- **JWT** — Autenticação e autorização
- **bcryptjs** — Hash de senhas
- **Puppeteer** — Geração de PDF
- **QRCode** — Geração de códigos QR
- **Nodemailer** — Envio de e-mails

### Frontend
- **React 18** — UI component library
- **Vite** — Build tool e dev server
- **Axios** — HTTP client
- **CSS3** — Estilização responsiva

---

## 📁 Estrutura do Projeto

```
sistema/
├── backend/
│   ├── src/
│   │   ├── server.js                 # Arquivo principal
│   │   ├── middleware/
│   │   │   └── auth.js              # Middleware JWT
│   │   ├── routes/
│   │   │   ├── authRoutes.js        # Login/Register
│   │   │   ├── clientRoutes.js      # CRUD de clientes
│   │   │   ├── vehicleRoutes.js     # CRUD de veículos
│   │   │   ├── routeRoutes.js       # Rotas/trechos
│   │   │   ├── sailingRoutes.js     # Viagens
│   │   │   └── ticketRoutes.js      # Passagens
│   │   ├── models/
│   │   │   └── database.js          # Conexão e inicialização do BD
│   │   ├── controllers/             # (Opcional) Lógica de negócio
│   │   └── utils/
│   │       ├── pdfGenerator.js      # Geração de PDF com QR Code
│   │       └── emailService.js      # Serviço de e-mail
│   ├── migrations/                  # Scripts SQL
│   ├── pdfs/                        # Arquivos PDF gerados
│   ├── package.json
│   ├── .env.example
│   └── .env                         # Variáveis de ambiente (NÃO commitar)
│
└── frontend/
    ├── src/
    │   ├── main.jsx                 # Entry point
    │   ├── App.jsx                  # Componente raiz
    │   ├── App.css                  # Estilos globais
    │   ├── pages/
    │   │   ├── LoginPage.jsx
    │   │   └── DashboardOperador.jsx
    │   ├── components/
    │   │   ├── SellTicketForm.jsx   # Formulário de venda
    │   │   └── SailingsList.jsx     # Lista de viagens
    │   └── services/
    │       └── api.js               # Cliente HTTP
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── .env                         # Variáveis de ambiente
```

---

## 🚀 Instalação e Execução

### 1. Clonar/Preparar o Repositório

```bash
cd c:\Users\Gaby\Desktop\sistema
```

### 2. Configurar Backend

```bash
cd backend
npm install
```

**Criar arquivo `.env`:**

```env
# Database
DB_PATH=./ferrypass.db

# JWT
JWT_SECRET=seu_secret_super_seguro_aqui
JWT_EXPIRES_IN=24h

# Email Configuration (Nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu_email@gmail.com
SMTP_PASS=sua_senha_ou_app_password
SMTP_FROM=suaempresa@ferrypass.com

# Server
PORT=3000
NODE_ENV=development

# Frontend URL (para CORS)
FRONTEND_URL=http://localhost:5173
```

**Iniciar servidor (desenvolvimento):**

```bash
npm run dev
```

**Ou iniciar normalmente:**

```bash
npm start
```

O backend estará rodando em `http://localhost:3000`

### 3. Configurar Frontend

```bash
cd ../frontend
npm install
npm run dev
```

O frontend estará disponível em `http://localhost:5173`

---

## 📚 Banco de Dados

O banco é inicializado automaticamente ao iniciar o backend. As tabelas criadas são:

### `clients` — Clientes
```sql
CREATE TABLE clients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cpf VARCHAR(14) UNIQUE NOT NULL,
  name VARCHAR(200) NOT NULL,
  email VARCHAR(200),
  phone VARCHAR(50),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### `vehicles` — Veículos
```sql
CREATE TABLE vehicles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  plate VARCHAR(10) UNIQUE NOT NULL,
  model VARCHAR(200),
  vehicle_type VARCHAR(50),
  owner_client_id INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_client_id) REFERENCES clients(id)
);
```

### `routes` — Rotas
```sql
CREATE TABLE routes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(200),
  origin VARCHAR(100),
  destination VARCHAR(100),
  duration_minutes INTEGER
);
```

### `sailings` — Viagens
```sql
CREATE TABLE sailings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  route_id INTEGER NOT NULL,
  departure DATETIME NOT NULL,
  capacity_passengers INTEGER,
  capacity_vehicles INTEGER,
  FOREIGN KEY (route_id) REFERENCES routes(id)
);
```

### `fares` — Tarifas
```sql
CREATE TABLE fares (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  route_id INTEGER NOT NULL,
  vehicle_type VARCHAR(50),
  amount DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (route_id) REFERENCES routes(id)
);
```

### `tickets` — Passagens
```sql
CREATE TABLE tickets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sailing_id INTEGER NOT NULL,
  client_id INTEGER,
  vehicle_id INTEGER,
  seat_or_slot VARCHAR(20),
  fare_paid DECIMAL(10,2),
  code VARCHAR(100) UNIQUE NOT NULL,
  status VARCHAR(50) DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sailing_id) REFERENCES sailings(id),
  FOREIGN KEY (client_id) REFERENCES clients(id),
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id)
);
```

### `operators` — Operadores
```sql
CREATE TABLE operators (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email VARCHAR(200) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(200),
  role VARCHAR(50) DEFAULT 'operator',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🔑 Fluxo de Autenticação

1. **Operador** faz login com email + senha
2. Backend valida credenciais no banco `operators`
3. Se válidas, retorna **token JWT** com expiração de 24h
4. Token é armazenado em `localStorage` no frontend
5. Todas as requisições subsequentes incluem `Authorization: Bearer <token>`

---

## 💳 Fluxo de Venda (Operador)

1. **Selecionar viagem** (rota + horário)
2. **Digitar CPF** do cliente → sistema preenche automaticamente nome/email
3. **Digitar placa** (opcional) → sistema preenche modelo e calcula tarifa
4. **Confirmar pagamento** → emitir passagem
5. **Passagem gerada** com:
   - PDF com QR Code
   - E-mail enviado automaticamente
   - Código único para validação

---

## 🎫 Endpoints da API

### Autenticação
```
POST /api/auth/login
{
  "email": "operador@empresa.com",
  "password": "senha"
}

POST /api/auth/register
{
  "email": "novo@empresa.com",
  "password": "senha",
  "name": "Nome do Operador"
}
```

### Clientes
```
GET  /api/clients              # Listar todos
GET  /api/clients?cpf=000...   # Buscar por CPF
POST /api/clients              # Criar novo
{
  "cpf": "123.456.789-00",
  "name": "João Silva",
  "email": "joao@email.com",
  "phone": "(11) 99999-9999"
}
PUT  /api/clients/:id          # Atualizar
```

### Veículos
```
GET  /api/vehicles             # Listar todos
GET  /api/vehicles?plate=ABC1D23 # Buscar por placa
POST /api/vehicles             # Criar novo
{
  "plate": "ABC1D23",
  "model": "Honda Civic",
  "vehicle_type": "carro",
  "owner_client_id": 1
}
GET  /api/vehicles/fares?route_id=1&vehicle_type=carro
```

### Rotas
```
GET  /api/routes               # Listar todas
POST /api/routes               # Criar nova
{
  "name": "Rio-Niterói",
  "origin": "Rio de Janeiro",
  "destination": "Niterói",
  "duration_minutes": 30
}
```

### Viagens
```
GET  /api/sailings             # Listar todas
GET  /api/sailings?route_id=1  # Filtrar por rota
POST /api/sailings             # Criar nova
{
  "route_id": 1,
  "departure": "2025-01-15T10:00:00",
  "capacity_passengers": 200,
  "capacity_vehicles": 50
}
```

### Passagens
```
POST /api/tickets              # Criar (emitir passagem)
{
  "sailing_id": 1,
  "client_id": 5,
  "vehicle_id": 3,
  "seat_or_slot": "A1",
  "fare_paid": 50.00
}

GET  /api/tickets              # Listar todas
GET  /api/tickets?code=TICKET-1-... # Buscar por código
GET  /api/tickets/:code/pdf    # Download PDF
```

---

## 📧 Configuração de E-mail

### Gmail (exemplo)

1. Ativar **2FA** em sua conta Google
2. Gerar **senha de app**:
   - Ir em https://myaccount.google.com/apppasswords
   - Selecionar "Mail" e "Windows Computer"
   - Copiar senha gerada
3. Configurar `.env`:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu_email@gmail.com
SMTP_PASS=sua_app_password_aqui
SMTP_FROM=seu_email@gmail.com
```

### SendGrid ou Mailgun
Substitua credenciais conforme documentação específica.

---

## 🔐 Variáveis de Ambiente

Copie `.env.example` para `.env` e configure:

**Backend (.env)**
```env
# Banco de dados
DB_PATH=./ferrypass.db

# JWT (escolha um secret aleatório e longo)
JWT_SECRET=seu_secret_aleatorio_muito_longo_para_producao
JWT_EXPIRES_IN=24h

# SMTP (seu provedor de e-mail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu_email@gmail.com
SMTP_PASS=sua_app_password

# API
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

---

## 📱 Funcionalidades Implementadas (MVP)

✅ **Backend:**
- Autenticação JWT
- CRUD de clientes com busca por CPF
- CRUD de veículos com busca por placa
- Cálculo dinâmico de tarifas
- Emissão de passagens com código único
- Geração de PDF com QR Code (Puppeteer)
- Envio automático de e-mail (Nodemailer)
- API RESTful completa

✅ **Frontend:**
- Login de operador
- Dashboard com listagem de viagens
- Formulário de venda com autocomplete (CPF/placa)
- Feedback de sucesso/erro
- Design responsivo

---

## 🔄 Próximas Melhorias

1. **Integração WhatsApp** — Envio via Twilio ou 360dialog
2. **Painel de Validação** — Escanear QR Code no embarque
3. **Relatórios** — Vendas por data, rota, operador
4. **Checkout Online** — Clientes compram diretamente
5. **Dashboard Mobile** — App React Native
6. **Notificações** — Push notifications
7. **Integração de Pagamento** — Stripe/PagSeguro
8. **Historial de Operações** — Logs auditáveis

---

## 🐛 Troubleshooting

### "Erro: Cannot find module 'sqlite3'"
```bash
npm install sqlite3
```

### "Erro de CORS"
Verifique se `FRONTEND_URL` está correto em `.env`

### "E-mail não enviado"
- Verifique credenciais SMTP
- Se Gmail, ative **2FA** e gere **App Password**
- Verifique firewall/proxy bloqueando porta 587

### "PDF não gerado"
- Instale Puppeteer: `npm install puppeteer`
- Verifique pasta `pdfs/` tem permissões de escrita

---

## 📞 Suporte

Para dúvidas ou melhorias, consulte a documentação de cada tecnologia:
- [Express.js Docs](https://expressjs.com)
- [SQLite Docs](https://www.sqlite.org)
- [Puppeteer Docs](https://pptr.dev)
- [React Docs](https://react.dev)
- [Vite Docs](https://vitejs.dev)

---

**Versão:** 1.0.0  
**Data:** 13 de Novembro de 2025  
**Status:** MVP Funcional ✅
