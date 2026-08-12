# Changelog

Formato [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/), versionamento [SemVer](https://semver.org/lang/pt-BR/).

O que cada número significa neste projeto está em [README.md](README.md#versionamento).

## [Não lançado]

### Adicionado

- **Primeira versão da ferramenta.** `index.html` com barra lateral e área de desenho ocupando a viewport.
- Barra de ferramentas com 1/24 da largura da tela, logo monocromático no topo. Vira bandeja no rodapé abaixo de 640 px.
- Grelha sobre a área de desenho, com células na proporção do arquivo de logo (1,2023), lida do `viewBox`.
- Interruptor de exibição da grelha e dois botões de densidade (2 a 48 colunas), com leitura numérica entre eles.
- **Padronagem.** Clicar numa célula a preenche com um elemento; clicar de novo esvazia. Funciona por toque também.
- Quatro formas de elemento, todas partindo do mesmo quadrado de lado igual à altura da célula: paralelogramo inclinado para a direita, o seu espelho, quadrado encostado à esquerda e quadrado encostado à direita. Ao preencher, a forma é sorteada entre as quatro e guardada na célula.
- Elementos desenhados **vazados**, só contorno — acompanha a linha fina da folha de referência.
- `js/elementos.js` — as formas, em funções puras.
- A padronagem guarda coluna e linha, não pixels: sobrevive ao redimensionamento da janela e à mudança de densidade. Células que caem fora da grelha atual somem do desenho mas ficam no estado, e voltam ao retomar a densidade.
- Realce da célula sob o cursor, anunciando que ali cabe interação. Aceso pelo tipo de ponteiro, não por `:hover`, para não deixar rastro em toque nem em laptop com tela sensível.
- Rolagem sobre a tela também controla a densidade, para cima mais denso. Roda de mouse e trackpad são distinguidos: entalhe de roda vale um passo, deltas de trackpad acumulam até fechar um passo, e a sobra é descartada após 250 ms parado.
- `js/grelha.js` — geometria em funções puras, sem acesso ao DOM.
- `js/logo.js`, gerado a partir de `assets/logo/logo.svg`.
- `LICENSE` — MIT para código e documentação, com exclusão explícita da marca e da tipografia.
- `assets/logo/LICENSE.md` — direitos da identidade visual reservados a Julio Giacomelli.
- Seções de licenças e de manutenção dos arquivos gerados no `README.md`.

## [0.1.0] — 2026-08-11

Digestão da identidade visual. Sem ferramenta ainda: esta versão fecha a base de assets e de decisões sobre a qual a ferramenta será construída.

### Adicionado

- Documentação da identidade em `BRAND.md` — paleta, tipografia, construção do logo e a malha de cubos isométrica da folha de referência.
- Logo vetorial em `assets/logo/logo.svg`, extraído da brand sheet. Arquivo único que atende as duas versões: monocromática por padrão, duas cores quando `--edg-logo-detalhe` é declarada.
- Host Grotesk em `assets/fonts/` — fonte variável 300–800 com itálico, os quatro subsets `.woff2` e a licença OFL 1.1.
- `assets/fonts/host-grotesk.css` com os `.woff2` embutidos em base64, para a fonte carregar em `file://`.
- `verificacao.html` — conferência visual dos assets. Não faz parte da ferramenta.
- `SPEC.md`, esqueleto da especificação funcional, e `CLAUDE.md`, com as restrições técnicas do projeto.

### Decidido

- Sem dependências, sem build step, sem servidor: HTML, CSS, JS e SVG puros, abrindo do sistema de arquivos.
- A padronagem é **desenhada por código**, não a repetição de assets vetoriais prontos. O módulo é uma função que recebe parâmetros e devolve geometria.
- As duas versões do logo diferem por cor, não por geometria — a ocorrência reduzida da folha é a grande escalada por 0,30101.

[Não lançado]: https://github.com/rodjuncode/edg-pattern/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/rodjuncode/edg-pattern/releases/tag/v0.1.0
