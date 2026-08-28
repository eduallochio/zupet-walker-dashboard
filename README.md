<div align="center">

# Zupet Walker — Painel Web

**O painel de gestão para walkers e cuidadores de pets.**

Acompanhe seus atendimentos, financeiro, relatórios de passeio e muito mais pelo navegador.

[![Versão](https://img.shields.io/badge/Versão-1.31.0-40E0D0?style=for-the-badge)](#)
[![Next.js](https://img.shields.io/badge/Next.js-15-000000?style=for-the-badge&logo=next.js&logoColor=white)](#)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](#)

</div>

---

## 🌐 O que é?

O Zupet Walker Web é o painel administrativo para walkers que preferem gerenciar seu negócio pelo computador ou celular via browser. Complementa o [app Zupet Walker](https://github.com/eduallochio/Zupet-Walker) com uma visão mais completa de relatórios e financeiro.

---

## ✨ Funcionalidades

**📊 Dashboard**
Visão geral do mês: faturamento, passeios realizados, clientes ativos e distância percorrida.

**💰 Financeiro**
Histórico de pagamentos com status (Pago / Pendente / Sem registro), método de pagamento e atendimentos concluídos dos últimos 6 meses. Registro manual de lançamentos.

**📋 Relatórios**
Relatórios detalhados de passeios (rota, fotos, eventos) e histórico de todos os serviços concluídos (adestramento, banho, hospedagem, etc.).

**👤 Perfil**
Edição do perfil público: foto, bio, diferenciais, serviços e preços.

**📱 Responsivo**
Menu lateral com drawer no mobile — funciona bem em qualquer tamanho de tela.

---

## 🛠 Stack

| Camada | Tecnologia |
|--------|-----------|
| Framework | Next.js 15 (App Router) |
| Backend | Supabase (PostgreSQL + Auth + Storage) |
| Estilo | CSS Modules + CSS customizado |
| Deploy | Vercel |

---

## 🚀 Rodando localmente

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env.local
# Preencher NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY

# Iniciar servidor de desenvolvimento
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

---

## 🔗 Projetos relacionados

| Projeto | Descrição |
|---------|-----------|
| [Zupet](https://github.com/eduallochio/Zupet) | App do tutor (React Native) |
| [Zupet Walker](https://github.com/eduallochio/Zupet-Walker) | App do walker (React Native) |

---

<div align="center">

Feito com 🐾 para quem faz a diferença na vida dos pets.

</div>
