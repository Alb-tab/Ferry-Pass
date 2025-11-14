# FerryPass Frontend - Instruções Rápidas

## 1. Instalação

```bash
npm install
```

## 2. Iniciar servidor de desenvolvimento

```bash
npm run dev
```

O frontend estará em `http://localhost:5173`

## 3. Fazer build para produção

```bash
npm run build
```

Os arquivos otimizados ficarão em `dist/`

## 4. Fazer preview da build

```bash
npm run preview
```

## Estrutura de Pastas

```
src/
├── main.jsx           - Entry point
├── App.jsx            - Componente raiz
├── App.css            - Estilos globais
├── pages/             - Páginas (Login, Dashboard)
├── components/        - Componentes reutilizáveis
└── services/          - Cliente HTTP (api.js)
```

## Funcionalidades Implementadas

✅ **LoginPage**
- Login com email e senha
- Armazenamento de token em localStorage
- Validação de credenciais

✅ **DashboardOperador**
- Abas: Viagens | Vender Passagem
- Listagem de viagens disponíveis
- Capacidade de passageiros/veículos em tempo real

✅ **SellTicketForm**
- Busca de cliente por CPF (preenchimento automático)
- Busca de veículo por placa (preenchimento automático)
- Cálculo dinâmico de tarifa
- Emissão de passagem com geração de PDF

✅ **Responsivo**
- Design mobile-first
- Funciona em celulares, tablets e desktops

## Comunicação com Backend

Todos os endpoints usam o serviço `api.js`:

```javascript
import { clientAPI, vehicleAPI, ticketAPI } from '../services/api';

// Exemplo: buscar cliente por CPF
const response = await clientAPI.getByCPF('123.456.789-00');
```

O token JWT é adicionado automaticamente a todas as requisições via interceptor.

## Variáveis de Ambiente

Crie `.env` na raiz do frontend (opcional):

```env
VITE_API_URL=http://localhost:3000/api
```

## Estrutura de Componentes

```
LoginPage
└── Form com email/senha

DashboardOperador
├── Abas (Viagens / Vender)
├── SailingsList
│   └── Tabela de viagens
└── SellTicketForm
    ├── Input CPF
    ├── Input Placa
    ├── Select Viagem
    ├── Input Assento
    └── Botão Emitir
```

## Estilização

- CSS global em `App.css`
- Classes reutilizáveis (`.btn-primary`, `.alert`, etc)
- Design responsivo com media queries
- Gradiente azul para header

## Troubleshooting

**"Cannot GET /"**
- Verifique se `npm run dev` está rodando
- Acesse `http://localhost:5173`

**"API connection failed"**
- Verifique se backend está rodando em `http://localhost:3000`
- Verifique CORS em `FRONTEND_URL` do backend

**"Token inválido"**
- Limpe localStorage: `localStorage.clear()`
- Faça login novamente

Sucesso! 🚀
