# Paróquia São Roque

MVP acadêmico de extensão para organizar a vida paroquial e aproximar a comunidade. A aplicação reúne missas, eventos, avisos, calendário, leituras e perfis em uma experiência responsiva, com áreas distintas para administração e membros.

O projeto preserva a base original em Next.js e a identidade visual da Paróquia São Roque. A persistência em `localStorage` foi substituída por PostgreSQL, com autenticação e autorização no servidor.

## Funcionalidades

### Administrador

- Dashboard com totais reais de membros, próximas missas, eventos e avisos publicados.
- CRUD de missas, membros, eventos, avisos e leituras.
- Pesquisa de membros por nome, e-mail e telefone.
- Pesquisa, data e local como filtros de missas.
- Calendário mensal integrado de missas e eventos.
- Publicação ou agendamento de avisos.
- Cadastro de leituras com fonte editorial obrigatória.
- Proteção das ações e rotas administrativas por perfil no servidor.

### Membro

- Cadastro, login, sessão persistente e logout.
- Home própria com próxima missa, leitura, eventos e avisos recentes.
- Consulta de missas, eventos, avisos, calendário e leituras.
- Edição segura de nome, telefone e comunidade.
- O perfil `MEMBER` não pode alterar o próprio papel nem executar ações administrativas.

### Interface e PWA

- Navegação lateral recolhível no desktop e menu adaptado no celular.
- Estados de carregamento, vazio, erro e feedback de sucesso.
- Layout validado em 375, 430, 768, 1024 e 1440 px.
- Manifest, ícones `any` e `maskable`, prompt de instalação e página pública para falta de conexão.
- O service worker não armazena páginas autenticadas, APIs ou dados pessoais.

## Arquitetura

```text
Navegador
  ├─ Server Components: leitura de dados
  ├─ Server Actions: CRUD administrativo
  └─ Route Handler: login, cadastro e logout
          │
          ├─ sessão opaca em cookie HttpOnly
          ├─ autorização ADMIN/MEMBER no servidor
          └─ Drizzle ORM
                  │
                  └─ Neon PostgreSQL
```

A senha recebe hash `scrypt` com salt aleatório. O cookie contém somente um token aleatório; o banco armazena o hash desse token e sua expiração. O login possui limitação persistente de tentativas por e-mail e, na Vercel, por endereço encaminhado pela plataforma.

## Schema do banco

- `users`: nome, e-mail único, telefone, hash da senha, comunidade e role.
- `sessions`: hash do token, usuário e expiração.
- `masses`: data, horário, local, celebrante e descrição.
- `events`: título, descrição, data, horário e local.
- `notices`: título, conteúdo e data de publicação.
- `readings`: data, título, tipo, referência, conteúdo e fonte.
- `auth_attempts`: contador e janela de expiração para limitar autenticações.

O schema tipado está em [lib/db/schema.ts](lib/db/schema.ts) e a migração SQL em [drizzle/0000_public_cassandra_nova.sql](drizzle/0000_public_cassandra_nova.sql).

## Tecnologias

- Next.js 15.5.27, App Router, React 19 e TypeScript.
- Tailwind CSS, Radix UI, Lucide, React Hook Form, Zod e Sonner.
- PostgreSQL Neon, Drizzle ORM e driver `pg` com pool de conexões.
- Playwright e axe-core para fluxos, responsividade e acessibilidade.
- PGlite somente como PostgreSQL local isolado para testes.

## Variáveis de ambiente

Copie `.env.example` para `.env.local` e preencha:

```dotenv
DATABASE_URL=postgresql://USER:PASSWORD@HOST-pooler.neon.tech/neondb?sslmode=verify-full
APP_URL=http://localhost:3000
# Opcional, somente para testes E2E contra um Preview:
PLAYWRIGHT_BASE_URL=
SEED_ADMIN_NAME=Administrador
SEED_ADMIN_EMAIL=seu-email@exemplo.com
SEED_ADMIN_PASSWORD=uma-senha-forte-com-10-ou-mais-caracteres
SEED_DEMO=false
# Somente para uma branch Neon Preview isolada:
DEMO_MEMBER_EMAIL=
DEMO_MEMBER_PASSWORD=
DEMO_SEED_TARGET=
ALLOW_PREVIEW_DEMO_SEED=
PREVIEW_DATABASE_HOST=
```

- Use a URL de conexão **pooled** do Neon em `DATABASE_URL`. Troque `sslmode=require` da URL copiada por `sslmode=verify-full` para manter a verificação completa explícita no driver PostgreSQL.
- Em produção, `APP_URL` deve ser a URL HTTPS canônica do site.
- `PLAYWRIGHT_BASE_URL` não é variável de runtime da aplicação. Use-a apenas ao executar Playwright contra um Preview remoto.
- `SEED_*` é usado apenas pelo comando de seed executado manualmente; não é necessário no runtime da Vercel.
- Nunca versione `.env.local` ou segredos.

## Configurar o Neon

1. Crie um projeto gratuito no [Neon](https://console.neon.tech/).
2. Copie a string de conexão com pool e use `sslmode=verify-full`.
3. Configure `DATABASE_URL` em `.env.local`.
4. Aplique a migração:

```bash
pnpm db:migrate
```

5. Defina `SEED_ADMIN_NAME`, `SEED_ADMIN_EMAIL` e `SEED_ADMIN_PASSWORD`.
6. Crie o primeiro administrador:

```bash
pnpm db:seed
pnpm db:verify
```

O seed é idempotente por e-mail: ele não substitui senha nem perfil de uma conta existente. `SEED_DEMO=true` adiciona uma missa, um evento e um aviso explicitamente fictícios. Nenhuma leitura litúrgica é inventada pelo seed.

### Ambiente demonstrativo do Preview

O seed completo de homologação é exclusivo para uma branch Neon Preview isolada. Ele preserva o ADMIN existente e cria, de forma idempotente, cinco MEMBERs fictícios, quatro missas futuras, três eventos, três avisos e leituras editoriais curtas identificadas como conteúdo não litúrgico.

Configure as variáveis DEMO somente em um arquivo local ignorado pelo Git. `PREVIEW_DATABASE_HOST` deve conter apenas o hostname previamente conferido no painel Neon para a branch `preview`. A execução também exige `DEMO_SEED_TARGET=preview` e `ALLOW_PREVIEW_DEMO_SEED=CREATE_OR_UPDATE_DEMO_DATA`.

```bash
pnpm db:seed:demo
pnpm db:verify:demo
pnpm db:cleanup:demo-auth
```

O script recusa Vercel Production, conexão sem pooling/SSL completo, banco diferente de `neondb` e qualquer hostname que não corresponda ao endpoint Preview confirmado. Ele usa IDs reservados para atualizar apenas o conjunto DEMO e nunca remove outros registros.

Após uma homologação automatizada, `db:cleanup:demo-auth` invalida somente as sessões das cinco contas MEMBER demonstrativas e remove o limite de login associado à conta MEMBER usada no teste. A rotina preserva o ADMIN e também exige todas as confirmações de segurança do Preview.

## Executar localmente

Requisitos: Node.js 20 ou superior e pnpm.

```bash
pnpm install --frozen-lockfile
copy .env.example .env.local
pnpm db:migrate
pnpm db:seed
pnpm dev
```

Acesse `http://localhost:3000`.

Para usar o banco local isolado em vez do Neon durante testes:

```bash
pnpm db:local
```

Em outro terminal, use `DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:54329/postgres`, execute a migração e o seed. O PGlite local não deve ser usado em produção.

## Qualidade e testes

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
pnpm test:e2e
pnpm audit
```

Os testes E2E alteram dados e, por padrão, recusam qualquer banco remoto. Execute-os com a aplicação de produção local (`pnpm build` e `pnpm start`) e o banco PGlite de teste ativos. O smoke test remoto exige uma confirmação explícita no ambiente e deve ser usado somente em uma branch Neon Preview isolada.

## Deploy na Vercel

1. No painel Neon, crie uma branch `preview` derivada de `production`; use a conexão pooled própria dessa branch.
2. Na Vercel, configure `DATABASE_URL` e `APP_URL` no ambiente **Preview**, limitando-os à branch Git desejada quando possível.
3. Aplique `pnpm db:migrate`, `pnpm db:seed` e `pnpm db:verify` localmente, apontando temporariamente para a conexão Neon Preview.
4. Faça o Preview Deployment e valide login, roles, CRUDs, responsividade e PWA.
5. Em **Production**, configure somente `DATABASE_URL` e `APP_URL` como variáveis de runtime.
6. Antes de promover uma versão, aplique `pnpm db:migrate` manualmente no banco Production e execute `pnpm db:verify`.
7. Use `SEED_*` localmente apenas quando for necessário criar o primeiro administrador; não mantenha a senha na Vercel.
8. Confirme o domínio HTTPS, o manifest e o service worker no navegador.

Não execute migrations na inicialização nem no comando de build: dois deploys simultâneos poderiam disputar a mesma alteração de schema. A sequência correta é migration manual, verificação do banco, Preview e somente depois promoção autorizada.

O build padrão é `pnpm build`; não existem flags que ocultem erros de TypeScript ou ESLint. A aplicação usa Server Components e Server Actions, compatíveis com o deploy Next.js da Vercel.

## Conteúdo litúrgico

As leituras antigas de 2025 do protótipo foram preservadas em `data/legacy-readings.ts` e aparecem apenas como **arquivo demonstrativo sem fonte editorial validada**. Para publicar uma leitura real, um administrador deve cadastrar data, tipo, referência, texto e fonte confiável. Confirme também a autorização de reprodução do conteúdo.

## Credenciais de demonstração

Não há senha fixa ou credencial hardcoded no repositório. Para a apresentação, crie uma conta administrativa com o seed e uma conta `MEMBER` pela tela de cadastro. Guarde as credenciais fora do Git e teste ambas em janela anônima antes da banca.

Quando o ambiente DEMO do Preview for utilizado, a credencial MEMBER permanece somente nas variáveis locais `DEMO_MEMBER_EMAIL` e `DEMO_MEMBER_PASSWORD`; ela não deve ser cadastrada na Vercel nem incluída em commits, screenshots ou relatórios.

## Rotina de manutenção

Remova sessões e limites expirados quando necessário:

```bash
pnpm db:cleanup
```

Antes de cada entrega, execute o checklist de qualidade e faça um Preview da Vercel com banco separado.
