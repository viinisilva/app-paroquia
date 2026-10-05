# Release Android

O aplicativo Android usa a aplicação hospedada em `https://app-paroquia.vercel.app`. O bundle não inclui o backend, credenciais do Neon nem a configuração local do Next.js.

## Pré-requisitos

- JDK 21, Android SDK 36 e Build Tools 36.
- pnpm 11.19.0 e o lockfile do projeto.
- Uma chave de **upload** Android em local seguro fora do repositório. Não use `debug.keystore`.
- As variáveis de ambiente locais `ANDROID_KEYSTORE_PATH`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS` e `ANDROID_KEY_PASSWORD`. Nunca as grave em arquivos versionados ou em `build.gradle`.

## Build reproduzível

No diretório do projeto, com as quatro variáveis disponíveis **somente no processo local**:

```powershell
pnpm install --frozen-lockfile
pnpm typecheck
pnpm test
pnpm build
pnpm mobile:sync
cd android
.\gradlew.bat bundleRelease assembleRelease
```

O AAB fica em `android/app/build/outputs/bundle/release/app-release.aab`. O APK Release para teste local fica em `android/app/build/outputs/apk/release/app-release.apk`. Ambos são ignorados pelo Git. A assinatura de Release falha quando as variáveis de assinatura estão ausentes; Debug permanece separado.

Verifique o AAB com `jarsigner -verify` e o APK com `apksigner verify`. Confira o certificado público da chave de upload e o `applicationId` antes de enviar à Play Console. Faça backup seguro do keystore e de suas credenciais: eles serão necessários para futuras atualizações.

Esta configuração usa `server.url` remoto para carregar a aplicação Production. O AAB não publica a aplicação Web nem modifica o banco. Não envie o bundle à Google Play sem revisar os requisitos da Play Console, a política de privacidade, a solicitação de exclusão de conta, os dados de segurança e os materiais da loja.
