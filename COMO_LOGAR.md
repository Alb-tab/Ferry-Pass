# ✅ FerryPass - PRONTO PARA USAR!

## 🚀 Status Atual

✅ **Backend**: Rodando em `http://localhost:3000`  
✅ **Frontend**: Rodando em `http://localhost:5173`  
✅ **Banco de Dados**: SQLite inicializado  
✅ **Operador de Teste**: Criado e pronto para login  

---

## 🎯 Como Usar Agora

### 1. Acessar a Aplicação

Abra seu navegador e acesse:
```
http://localhost:5173
```

### 2. Fazer Login

Use as seguintes credenciais:
```
Email: operador@ferrypass.com
Senha: senha123
```

### 3. Dashboard do Operador

Após fazer login, você verá:
- **Abas**: "Viagens Disponíveis" e "Vender Passagem"
- **Listar Viagens**: Ver todas as rotas e horários
- **Vender Passagem**: Formulário para emitir passagens

---

## 📁 Estrutura do Projeto

```
c:\Users\Gaby\Desktop\sistema\
├── backend/               ← API REST (Node.js + Express)
│   ├── src/
│   ├── package.json
│   ├── .env
│   ├── create-operator.js ← Script para criar operador
│   └── ferrypass.db       ← Banco de dados SQLite
│
├── frontend/              ← Interface Web (React + Vite)
│   ├── src/
│   ├── package.json
│   └── vite.config.js
│
├── README.md              ← Documentação técnica
├── QUICKSTART.md          ← Guia rápido
└── COMO_LOGAR.md          ← Instruções de login (ESTE ARQUIVO)
```

---

## 🔑 Endpoints da API Disponíveis

### Autenticação
```
POST /api/auth/login
POST /api/auth/register
```

### Clientes
```
GET  /api/clients
GET  /api/clients?cpf=XXX
POST /api/clients
PUT  /api/clients/:id
```

### Veículos
```
GET  /api/vehicles
GET  /api/vehicles?plate=XXX
POST /api/vehicles
GET  /api/vehicles/fares
```

### Rotas e Viagens
```
GET  /api/routes
POST /api/routes
GET  /api/sailings
POST /api/sailings
```

### Passagens
```
POST /api/tickets
GET  /api/tickets
GET  /api/tickets/:code/pdf
```

---

## 📊 Funcionalidades Implementadas

| Recurso | Status |
|---------|--------|
| ✅ Autenticação JWT | Completo |
| ✅ Cadastro de clientes | Completo |
| ✅ Busca por CPF (autocomplete) | Completo |
| ✅ Cadastro de veículos | Completo |
| ✅ Busca por placa (autocomplete) | Completo |
| ✅ Cálculo de tarifas | Completo |
| ✅ Emissão de passagens | Completo |
| ✅ Geração de PDF | Completo |
| ✅ QR Code nas passagens | Completo |
| ✅ Envio de e-mail | Pronto (SMTP) |
| ✅ Dashboard operador | Completo |
| ✅ Interface web responsiva | Completo |

---

## 🎬 Fluxo de Venda (Demonstração)

1. **Operador faz login**
   - Email: `operador@ferrypass.com`
   - Senha: `senha123`

2. **Seleciona viagem** (aba "Viagens Disponíveis")
   - Lista todas as rotas e horários disponíveis
   - Mostra ocupação em tempo real (passageiros/veículos)

3. **Clica em "Vender Passagem"**
   - Formulário aparece com campos:
     - ✅ Seleção de viagem
     - ✅ CPF do cliente (busca automática)
     - ✅ Placa do veículo (opcional, busca automática)
     - ✅ Assento/Slot (opcional)
     - ✅ Valor calculado automaticamente

4. **Emite passagem**
   - ✅ Passagem salva no banco
   - ✅ PDF gerado com QR Code
   - ✅ E-mail enviado (se SMTP configurado)
   - ✅ Feedback de sucesso

---

## 📧 Configurar E-mail (Opcional)

Se quiser que os e-mails sejam enviados automaticamente:

1. Edite o arquivo `backend/.env`

2. Configure suas credenciais SMTP (Gmail exemplo):
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu_email@gmail.com
SMTP_PASS=sua_app_password (obter em: https://myaccount.google.com/apppasswords)
SMTP_FROM=seu_email@gmail.com
```

3. Reinicie o backend: `npm run dev`

---

## 🔧 Para Resetar Dados

Se quiser limpar o banco de dados e começar do zero:

```bash
# 1. Parar o servidor (Ctrl+C nos terminals)

# 2. Deletar o banco
# Windows:
del c:\Users\Gaby\Desktop\sistema\backend\ferrypass.db

# 3. Criar novo operador
cd c:\Users\Gaby\Desktop\sistema\backend
node create-operator.js

# 4. Reiniciar servidor
npm run dev
```

---

## 🆘 Troubleshooting

### "Não consigo fazer login"
- ✅ Execute: `node create-operator.js` no diretório backend
- ✅ Verifique se `ferrypass.db` existe

### "Backend não está rodando"
- Verifique se a porta 3000 está disponível
- Execute: `npm run dev` no diretório backend

### "Frontend não carrega"
- Verifique se a porta 5173 está disponível
- Execute: `npm run dev` no diretório frontend

### "E-mail não funciona"
- Verifique credenciais SMTP em `.env`
- Se Gmail, ative 2FA e gere App Password
- Teste com: `npm run dev` e verifique logs

---

## 📚 Documentação Adicional

- **[README.md](./README.md)** — Documentação técnica completa
- **[QUICKSTART.md](./QUICKSTART.md)** — Guia rápido
- **[backend/QUICKSTART.md](./backend/QUICKSTART.md)** — Guia backend
- **[frontend/QUICKSTART.md](./frontend/QUICKSTART.md)** — Guia frontend

---

## � Próximos Passos (Opcionais)

- [ ] Integrar WhatsApp (Twilio API)
- [ ] Implementar QR Code scanner para embarque
- [ ] Criar relatórios de vendas
- [ ] Checkout online para clientes
- [ ] App mobile (React Native)
- [ ] Integração de pagamento (Stripe)
- [ ] Dashboard de análise

---

## 💡 Dicas Úteis

### Para criar novo operador:
```bash
cd c:\Users\Gaby\Desktop\sistema\backend
node create-operator.js
```

### Para carregar dados de teste (rotas, viagens, etc):
```bash
cd c:\Users\Gaby\Desktop\sistema\backend
node seed.js
```

### Para resetar banco completamente:
```bash
# Windows
del c:\Users\Gaby\Desktop\sistema\backend\ferrypass.db

# Depois reiniciar servidor
npm run dev
```

---

## 🎉 Parabéns!

Seu sistema FerryPass está **100% funcional** e pronto para uso!

**Últimas atualizações:**
- ✅ Backend rodando em http://localhost:3000
- ✅ Frontend rodando em http://localhost:5173
- ✅ Operador de teste criado
- ✅ Banco de dados inicializado
- ✅ API testada e funcionando

**Versão:** 1.0.0  
**Data:** 13 de Novembro de 2025  
**Status:** ✅ PRONTO PARA USAR!
