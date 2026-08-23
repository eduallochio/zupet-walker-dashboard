# zupet-walker-web

Aplicação web dedicada ao walker, hospedada em `walker.zupet.io`.
Usa o **mesmo Supabase** dos outros projetos (zupet, zupet-walker, zupet-dashboard).

## Stack
- Next.js 15 (App Router) + TypeScript + Tailwind CSS
- Supabase JS v2 (anon key para walker auth, service_role para admin)
- JWT HS256 (jose) para admin auth — mesmo padrão do zupet-dashboard

## Estrutura de rotas

| Rota | Acesso | Descrição |
|------|--------|-----------|
| `/` | Público | Landing page — hero, features, planos Free vs Pro |
| `/login` | Público | Login do walker (mesmo email/senha do app mobile) |
| `/dashboard` | Walker autenticado | Home: stats (passeios, pets, avaliação, pagamentos) |
| `/dashboard/relatorios` | Walker | Lista de relatórios de passeios (fotos, eventos, duração) |
| `/dashboard/financeiro` | Walker | Tabela de pagamentos (pago / pendente) |
| `/dashboard/perfil` | Walker | Edição de perfil (nome, bio, telefone, cidade) |
| `/dashboard/pro` | Walker | Assinatura Pro via Pix (mostra instruções e chave Pix) |
| `/admin/login` | Público | Login do admin (credenciais em variáveis de ambiente) |
| `/admin` | Admin | Visão geral: total walkers, Pro, passeios |
| `/admin/walkers` | Admin | Lista de walkers com plano e avaliação |
| `/admin/walkers/[id]` | Admin | Detalhe + ativar/remover Pro |
| `/admin/pagamentos` | Admin | Confirmar Pix pendentes → ativa Pro automaticamente |

## Auth
- **Walker**: `supabase.auth.signInWithPassword` → cookie `sb-access-token` → middleware protege `/dashboard/*`
- **Admin**: POST `/api/admin/login` → JWT HS256 no cookie `zw_admin_token` → middleware protege `/admin/*`

## Variáveis de ambiente
Ver `.env.local.example`. Nunca commitar `.env.local`.

## Tabelas Supabase usadas

> ⚠️ IMPORTANTE: Antes de referenciar qualquer coluna, consultar o schema real via MCP Supabase
> (`list_tables` ou `execute_sql SELECT column_name FROM information_schema.columns WHERE table_name='...'`).
> Nunca assumir colunas pelo CONTEXT.md — ele pode estar desatualizado.

### `walker_profiles`
| Coluna | Tipo | Obs |
|--------|------|-----|
| `id` | UUID | PK próprio (≠ auth.users.id) |
| `user_id` | UUID NOT NULL | FK para `auth.users.id` — usar este para vincular ao usuário autenticado |
| `name` | text | |
| `bio` | text | |
| `city` | text | |
| `state` | text | |
| `active` | bool | |
| `plan` | text | `'free'` ou `'pro'` |
| `rating` | numeric | |
| `price_per_hour` | numeric | |
| `experience_years` | int | |
| `services` | text[] | ex: `{walk, daycare}` |
| `avatar_url` | text | |
| `created_at` | timestamptz | |

### `walker_payments`
`id, walker_id, amount, status, description, paid_at, created_at`

### `walk_sessions` / `walk_reports`
Passeios realizados e relatórios com fotos/eventos.

## Fluxo de assinatura Pro
1. Walker acessa `/dashboard/pro` e vê a chave Pix + instruções
2. Faz o Pix e envia comprovante para contato@zupet.io informando o email
3. Admin acessa `/admin/pagamentos`, confirma o pagamento
4. Sistema atualiza `walker_profiles.plan = 'pro'` e `walker_payments.status = 'paid'`

## Projetos relacionados
- `zupet` (tutor) — `c:\Dev\Projetos\zupet`
- `zupet-walker` (app mobile walker) — `c:\Dev\Projetos\zupet-walker`
- `zupet-dashboard` (painel tutor web) — `c:\Dev\Projetos\zupet-dashboard`
