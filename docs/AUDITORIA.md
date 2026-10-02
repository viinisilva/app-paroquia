# Auditoria inicial — 01/10/2026

Origem: `viinisilva/app-paroquia`, branch `main`, commit `83072d5`.
Implementação isolada na branch `codex/mvp-paroquia`. Nenhum push/deploy realizado.

- Instalação congelada falhou: lockfile continha apenas cabeçalho, sem dependências.
- Instalação sem congelamento recuperou o lockfile; sharp exigiu aprovação de script no pnpm 11. Instalação inicial concluída com scripts desativados.
- TypeScript inicial: passou (`tsc --noEmit`).
- Lint inicial: não configurado; `next lint` abriu assistente interativo.
- Build inicial: passou, mas **ignorando tipos e lint**, com avisos de `themeColor`.
- Todas as páginas de negócio eram Client Components. Dados e senhas em localStorage; conta administrativa pública; nenhuma autorização no servidor.
- Leituras de 2025 sem fonte editorial identificada; não considerar calendário litúrgico oficial.
- Assets referenciados inexistentes: paroquia.jpg, biblia.jpg, church-bg.png, stained-glass.png. Service worker armazenava páginas privadas e falhava na instalação por assets ausentes.
- Biblioteca visual Radix/shadcn preservada. Hooks duplicados serão consolidados. README citava coral sem implementação correspondente.

## Decisões

PostgreSQL gerenciado Neon + Drizzle + driver pg. Sem microsserviços. Uma única aplicação Next.js; consultas e autorização no servidor. Sessões opacas revogáveis no banco, tokens aleatórios de 256 bits, hash SHA-256 do token e senhas scrypt com salt. Cookies HttpOnly, SameSite=Lax, Secure em HTTPS. Proteção de origem nas mutações e limitação persistente de tentativas de autenticação.

Next 15.5.27 confirmado no registry e no [boletim oficial de setembro](https://nextjs.org/blog/september-2026-security-release). Atualização permanece na major 15. React Day Picker 8/vaul 0 tinham peers incompatíveis com React 19; atualizar apenas esses componentes auxiliares.

O Neon foi configurado em 02/10/2026 com conexão pooled, TLS `verify-full`, database `neondb` e role `neondb_owner`. A migration versionada e o seed idempotente foram aplicados na branch Neon `production`; a verificação confirmou as sete tabelas, os enums, um ADMIN com hash scrypt, zero sessões e zero registros de negócio residuais. Dados de localStorage não são confiáveis para importar contas/senhas automaticamente; recadastrar usuários e validar agenda manualmente. Nenhum conteúdo de leitura será inventado.

Testes com escrita continuam bloqueados por padrão em bancos remotos. O fluxo funcional completo permanece validado no PostgreSQL local isolado; em Neon Production foi executado apenas o smoke seguro de autenticação e sessão. CRUDs remotos e MEMBER devem ser revalidados em uma branch Neon Preview separada.

## Sequência de validação

1. Dependências, lint e build sem supressões.
2. Banco, validações, sessões, autorização e testes de segurança.
3. Shell, dashboard e CRUD de missas/membros.
4. Eventos, avisos, calendário, leituras e perfil.
5. Fluxos de aceitação no navegador, larguras 375/430/768/1024/1440, PWA e documentação.
