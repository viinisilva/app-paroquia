# Spike mobile com Capacitor

Esta implementação mantém a aplicação Web/PWA como fonte única da interface. O projeto Android experimental carrega `https://app-paroquia.vercel.app` por HTTPS dentro da WebView. Esse uso de `server.url` serve somente para homologação técnica e **não é a arquitetura final recomendada para publicação em loja**.

## Requisitos locais

- Node.js 22 ou superior;
- pnpm 11;
- Android Studio com Android SDK;
- JDK fornecido pelo Android Studio ou compatível com o Gradle do projeto;
- variável `ANDROID_HOME` ou SDK configurado pelo Android Studio.

O APK não recebe `DATABASE_URL`, credenciais do Neon, senha administrativa nem qualquer segredo do servidor. Autenticação e acesso ao banco continuam no backend Next.js hospedado na Vercel.

## Instalação e sincronização

```bash
pnpm install
pnpm mobile:sync
pnpm mobile:assets
```

O projeto Android já deve existir em `android/`. O comando de adição inicial é `pnpm mobile:add:android` e só deve ser usado ao recriar a plataforma do zero.

Para abrir o projeto:

```bash
pnpm mobile:open
```

No Android Studio, aguarde a sincronização do Gradle e execute a variante `debug` em um emulador ou aparelho. Para gerar o APK pelo terminal:

```bash
cd android
./gradlew assembleDebug
```

No Windows, use `gradlew.bat assembleDebug`. O resultado esperado é `android/app/build/outputs/apk/debug/app-debug.apk`. APK, AAB, keystores, `local.properties` e saídas de build são ignorados pelo Git.

## Segurança e comportamento

- O WebView aceita somente HTTPS e navegação interna para `app-paroquia.vercel.app`.
- `allowMixedContent` e tráfego HTTP estão desativados.
- O plugin Capacitor Cookies não é usado; a sessão continua baseada no cookie HttpOnly do servidor.
- O prompt de instalação PWA não aparece dentro do aplicativo nativo.
- Não há CORS amplo, autenticação paralela, token em `localStorage` ou mudança nas validações de origem/CSRF.
- A aplicação depende de internet para autenticação e dados dinâmicos. O diretório web local permite sincronizar e validar o projeto, mas `server.url` não garante fallback automático quando a conexão falha.

Se login, cookie ou validação de origem falhar no WebView, a implementação deve ser interrompida para análise. A segurança do backend não deve ser reduzida para acomodar o spike.

## PWA e iPhone

No navegador, a PWA mantém manifest, service worker e política de cache existentes. Em iPhone/iPad, quando ainda não instalada, a interface orienta o usuário a usar **Compartilhar → Adicionar à Tela de Início**. A orientação é ocultada no modo standalone e após a dispensa temporária.

## Assets provisórios

O script `pnpm mobile:assets` reaproveita o melhor ícone PWA disponível para o APK de depuração. Antes de uma versão final, substituir a fonte por arte oficial em alta resolução e gerar:

- ícone mestre de 1024 × 1024 px;
- adaptive icon com foreground transparente e background separado;
- ícone monocromático para versões recentes do Android;
- splash screen oficial em alta resolução.

## Limitações do spike

- `server.url` mantém dependência integral da disponibilidade da Vercel e da internet;
- o comportamento sem conexão precisa ser tratado e validado em uma fase posterior; neste spike, a WebView pode exibir um erro de rede;
- login, persistência do cookie, botão voltar, teclado, rotação e links externos exigem validação em aparelho Android real;
- não há sincronização offline nem cache de páginas privadas;
- não há release assinado, keystore ou AAB;
- uma arquitetura definitiva de loja deve revisar as políticas de distribuição, comportamento de links externos e estratégia de atualização do conteúdo remoto.
