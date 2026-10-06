# Checklist de cadastro na Google Play

- [ ] Nome do app: confirmar “Paróquia São Roque”.
- [ ] Descrição curta e descrição completa: redigir e aprovar sem promessas não implementadas.
- [ ] Categoria, e-mail de contato e site: confirmar com o responsável.
- [ ] Política de Privacidade: publicar e revisar `https://app-paroquia.vercel.app/privacidade`.
- [ ] Exclusão de conta: publicar e testar `https://app-paroquia.vercel.app/excluir-conta` e o fluxo no perfil.
- [ ] Data Safety: responder com base em `docs/google-play-data-safety.md` e nas confirmações humanas pendentes.
- [ ] Classificação de conteúdo, público-alvo e declaração de anúncios: responsável deve confirmar.
- [ ] Instruções de acesso para revisão: fornecer conta de revisão separada, sem divulgar credenciais no Git.
- [ ] Play App Signing: configurar e guardar backup seguro da chave de upload e credenciais.
- [ ] Track de teste e requisitos específicos da conta de desenvolvedor: verificar na Play Console.
- [ ] Enviar AAB assinado somente após aprovação do release e das informações de loja.

## Assets

| Asset                                 | Estado                                                                                                                                 |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Ícones PWA 192/512 e maskable         | Presentes; verificar visualmente legibilidade final                                                                                    |
| Mipmap/adaptive icon Android e splash | Gerados a partir do brasão existente; tecnicamente válidos para o build, substituição por master oficial de alta resolução recomendada |
| Ícone de loja 512×512                 | Produzir versão oficial final; não usar automaticamente o raster provisório                                                            |
| Feature graphic 1024×500              | Pendente                                                                                                                               |
| Screenshots de telefone               | Pendente selecionar e revisar capturas finais sem dados pessoais                                                                       |
| Screenshots tablet                    | Pendente se a ficha oferecer/visar tablets                                                                                             |
| Monochrome icon                       | Pendente/recomendado para ícones temáticos Android                                                                                     |
| Master do brasão 1024×1024            | Pendente do responsável; preservar identidade oficial                                                                                  |

Nenhum material foi enviado ou publicado na Play Console nesta etapa.

Metadados verificados: `public/images/logo.png` mede 669×677; os ícones PWA 512 e maskable medem 512×512; o splash base Android mede 480×320. Esses rasters são tecnicamente utilizáveis, mas o brasão fonte não tem resolução de master 1024×1024 para material final de loja.
