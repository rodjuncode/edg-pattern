# edg-pattern

Gerador de padronagens em SVG para a identidade visual da **Especialização em Design Gráfico da Unicamp**.

Ferramenta web de página única: o usuário manipula parâmetros, vê a padronagem sendo gerada em tempo real e exporta o resultado como **PNG** (download) ou **código SVG** (copiado para a área de transferência).

## Contexto

Este repositório é material expositivo da disciplina **ART0339 — Projeto de Design Editorial Digital I**. Além de entregar uma ferramenta funcional, o código serve como exemplo didático de como um designer pode especificar e construir um artefato generativo com tecnologias abertas de navegador.

## Restrições técnicas

Decididas no início do projeto e válidas para todo o desenvolvimento:

- **HTML, CSS, JavaScript e SVG puros.** Sem frameworks, sem bibliotecas, sem build step, sem gerenciador de pacotes.
- **Zero dependências externas em runtime.** Nada de CDN — nenhuma requisição sai do arquivo. Fontes e assets, se necessários, são embarcados ou locais.
- **Roda abrindo o `index.html` no navegador**, sem servidor. (Um servidor local pode ser útil apenas para desenvolvimento.)
- **Sem back-end.** Toda a geração e exportação acontece no cliente.
- Código legível como material de aula: nomes claros, comentários onde explicam a intenção, arquivos pequenos.

## Estado

Assets prontos: logo vetorial e tipografia embarcada, documentados em [BRAND.md](BRAND.md) e conferíveis em [verificacao.html](verificacao.html). A especificação funcional da ferramenta está em [SPEC.md](SPEC.md), aguardando detalhamento.

## Estrutura

```
index.html                interface — barra de ferramentas e área de desenho
css/estilo.css            estilos
js/logo.js                GERADO a partir de assets/logo/logo.svg
js/grelha.js              geometria da grelha — funções puras, não tocam no DOM
js/app.js                 estado e ligação com a interface

assets/
  logo/logo.svg           lockup; monocromático ou duas cores via CSS
  fonts/host-grotesk.css  GERADO — Host Grotesk com os .woff2 em base64
  fonts/*.woff2, OFL.txt  originais e licença
verificacao.html          conferência visual dos assets (fora da ferramenta)
```

`js/grelha.js` não conhece o DOM: entram números, sai geometria. É essa separação que vai permitir gerar a padronagem para exportação sem passar pela tela.

## Manutenção dos arquivos gerados

Dois arquivos são derivados de outros e **não devem ser editados à mão**. Sem build step, a regeração é manual — se você mexer na origem, precisa refazer o derivado.

| Gerado | Origem | Por que existe |
|---|---|---|
| `js/logo.js` | `assets/logo/logo.svg` | `fetch` de arquivo local não funciona em `file://`, e o logo precisa estar inline no DOM para o CSS pintá-lo. Carrega também a proporção lida do `viewBox`. |
| `assets/fonts/host-grotesk.css` | `assets/fonts/*.woff2` | O Chrome bloqueia `@font-face` de arquivo local por CORS em `file://`. |

Os comandos de regeração estão no cabeçalho de cada arquivo gerado.

## Versionamento

O repositório segue [SemVer](https://semver.org/lang/pt-BR/), com o histórico em [CHANGELOG.md](CHANGELOG.md).

SemVer foi escrito para APIs, e uma ferramenta de design não tem uma. O contrato público aqui é outro — é **o que a ferramenta produz e o que ela aceita**:

| | Muda quando |
|---|---|
| **MAJOR** | O mesmo conjunto de parâmetros passa a gerar uma padronagem diferente. Também: parâmetro removido, faixa de valores reduzida, mudança na estrutura do SVG exportado. |
| **MINOR** | Parâmetro novo, módulo novo, opção de exportação nova — sem alterar nenhum resultado que já era possível gerar. |
| **PATCH** | Correção de bug, ajuste de interface, documentação. Nada que mude a geometria produzida. |

A consequência prática está na primeira linha: **um arquivo gerado pela ferramenta é reproduzível dentro de uma mesma MAJOR.** Se uma padronagem foi salva na 1.2.0, a 1.7.0 devolve exatamente a mesma imagem para os mesmos parâmetros; a 2.0.0 não promete isso. Como o material vai para uma aula e pode ser retomado meses depois, isso importa mais aqui do que em software comum — vale anotar a versão junto com os parâmetros ao guardar um resultado.

Enquanto a versão for `0.y.z`, nada disso é garantido: é desenvolvimento inicial, e a padronagem ainda vai mudar de forma.

## Licenças

O repositório tem três materiais de origens diferentes, e cada um mantém a sua licença. **Não há uma licença única que cubra tudo.**

| Material | Licença | Autoria |
|---|---|---|
| Código e documentação | [MIT](LICENSE) | Rodrigo Junqueira |
| Identidade visual — `assets/logo/` | [Direitos reservados](assets/logo/LICENSE.md) | Julio Giacomelli |
| Host Grotesk — `assets/fonts/` | [SIL OFL 1.1](assets/fonts/OFL.txt) | Element Type |

Em resumo: o código é livre, a marca não é. Clonar o repositório dá liberdade sobre a ferramenta, não sobre a identidade visual que ela desenha.

## Créditos

Identidade visual criada por **Julio Giacomelli** para o curso de Especialização em Design Gráfico da Unicamp.
