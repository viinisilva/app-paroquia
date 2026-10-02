# Checklist da apresentação

## Antes da banca

- [ ] Criar um projeto Neon e aplicar `pnpm db:migrate`.
- [ ] Criar o ADMIN com `pnpm db:seed`; remover `SEED_ADMIN_PASSWORD` da Vercel depois.
- [ ] Criar um MEMBER pela interface e guardar as duas credenciais fora do Git.
- [ ] Configurar `DATABASE_URL` e `APP_URL` em Preview e Production.
- [ ] Confirmar `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build` e `pnpm audit`.
- [ ] Ensaiar no mesmo navegador, computador e conexão usados na apresentação.
- [ ] Abrir uma janela anônima para o MEMBER e outra normal para o ADMIN.
- [ ] Cadastrar uma missa, um evento e um aviso identificados como demonstração.
- [ ] Conferir se nenhuma leitura demonstrativa será apresentada como conteúdo oficial.
- [ ] Testar o domínio da Vercel no celular e no desktop.
- [ ] Confirmar que o brasão, o manifest e o menu mobile carregam.

## Roteiro sugerido

1. Explique o problema: dados locais no navegador impediam colaboração e segurança.
2. Mostre o login como ADMIN e o dashboard com contagens reais.
3. Crie, visualize, edite, pesquise e exclua uma missa.
4. Cadastre um membro, pesquise e edite o cadastro.
5. Crie um evento e mostre a mesma informação no calendário.
6. Publique um aviso.
7. Entre como MEMBER em outra janela e mostre Home, missa, evento, aviso, calendário, leituras e perfil.
8. Digite diretamente uma URL administrativa para demonstrar a autorização no servidor.
9. Atualize a página e mostre que os dados continuam no PostgreSQL.
10. Encerre com responsividade, PWA e a arquitetura simples Next.js + Neon.

## Plano de contingência

- [ ] Manter um vídeo curto ou capturas das telas em `artifacts/` fora do Git.
- [ ] Levar a URL do Preview e a URL de Production.
- [ ] Não expor o painel do Neon, variáveis ou senha na projeção.
- [ ] Se a rede falhar, usar as capturas para explicar o fluxo e deixar claro que dados atualizados exigem conexão.
- [ ] Ter um registro demonstrativo pronto caso o tempo não permita executar o CRUD completo.

## Perguntas que a equipe deve saber responder

- Por que PostgreSQL/Neon? Persistência central, plano gratuito, compatibilidade com Vercel e SQL conhecido.
- Onde a senha fica? Apenas o hash scrypt com salt fica no banco.
- Como ADMIN e MEMBER são protegidos? A role é consultada no servidor em cada página ou mutação protegida.
- Por que não há leitura automática? O projeto evita inventar conteúdo e exige fonte editorial confiável.
- O que o PWA faz offline? Exibe uma página informativa; dados privados e agenda não são guardados no cache.
- O que ainda seria evolução futura? Recuperação de senha por e-mail, logs administrativos e integração editorial de leituras.
