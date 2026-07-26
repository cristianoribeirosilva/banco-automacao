# Banco Automação

Aplicação bancária desenvolvida com React, Node.js/Express e MySQL.

## Funcionalidades

- Login com validação de CPF e senha
- Recuperação de senha com código de verificação
- Painel Home com saldo, atalhos e cartão de crédito
- Gestão de contas (criar, depositar, sacar)
- Transferências entre contas
- Extrato de movimentações
- Área Pix (Fazer Pix, Minhas chaves Pix)

## Estrutura do Projeto

```
banco/
├── backend/          # API REST com Node.js/Express
├── frontend/         # Interface com React
└── database/         # Scripts SQL
```

## Tecnologias

- **Frontend:** React 18, Axios
- **Backend:** Node.js, Express, MySQL2
- **Banco de Dados:** MySQL

## Deploy

### Frontend (Vercel)

1. Conectar repositório GitHub no Vercel
2. Configurar variável de ambiente:
   - `REACT_APP_API_URL`: URL do backend no Railway

### Backend (Railway)

1. Conectar repositório GitHub no Railway
2. Adicionar serviço MySQL no Railway
3. Configurar variáveis de ambiente:
   - `DB_HOST`: Host do MySQL no Railway
   - `DB_USER`: Usuário do MySQL
   - `DB_PASS`: Senha do MySQL
   - `DB_NAME`: Nome do banco
   - `DB_PORT`: 3306

## Rodar Localmente

```bash
# Backend
cd backend
npm install
npm start

# Frontend
cd frontend
npm install
npm start
```

## Usuários de Teste

| Nome | CPF | Senha |
|------|-----|-------|
| Maria Oliveira | 529.982.247-25 | 12345678 |
| Carlos Santos | 347.861.500-03 | 87654321 |
| Ana Ferreira | 847.293.610-07 | 11223344 |
