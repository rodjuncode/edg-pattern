# Changelog

Formato [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/), versionamento [SemVer](https://semver.org/lang/pt-BR/).

O que cada número significa neste projeto está em [README.md](README.md#versionamento).

## [Não lançado]

### Corrigido

- A grelha tremia durante as animações. `shape-rendering: crispEdges` encaixava cada linha no pixel, e esse encaixe muda quando o navegador promove e descarta a camada para animar. Grelha e realce passaram a `geometricPrecision`, e o `viewBox` da tela passou a usar as medidas exatas do elemento, sem o arredondamento que deixava uma escala diferente de 1.
- O arquivo exportado saía com espaço vazio quando o estado guardava células fora da grelha atual — restos de uma densidade maior ou de uma janela maior. Elas não são desenhadas, mas entravam na medida da caixa e a esticavam. Agora só contam as células que a grelha desenha, e o diálogo avisa quantas ficaram de fora.

### Adicionado

- **Primeira versão da ferramenta.** `index.html` com barra lateral e área de desenho ocupando a viewport.
- Barra de ferramentas com 1/24 da largura da tela, logo monocromático no topo. Vira bandeja no rodapé abaixo de 640 px.
- Grelha sobre a área de desenho, com células na proporção do arquivo de logo (1,2023), lida do `viewBox`.
- Interruptor de exibição da grelha e dois botões de densidade (2 a 48 colunas), com leitura numérica entre eles.
- **Padronagem.** Clicar numa célula vazia a preenche com uma forma sorteada; clicar de novo cicla entre as formas. Funciona por toque também.
- **Modo borracha**, com botão na barra: com ele ativo, clicar esvazia a célula. O cursor muda enquanto está ligado.
- **Micro-interação de virada.** Mudar o conteúdo de uma célula gira a forma no eixo vertical, com o desenho trocando no instante em que ela fica invisível. O eixo do giro é o centro da célula, para que espelhar leia como espelho. Célula que nasce entra abrindo; borracha continua instantânea.
- Na cascata, cada elo vira 55 ms depois do anterior, na ordem em que a propagação desceu.
- Respeita `prefers-reduced-motion`: com movimento reduzido, a troca é direta.
- A padronagem passou a ser um `<path>` por célula dentro de um `<g>` — sem isso não há como animar uma célula sozinha. Os nós são reaproveitados entre redesenhos.
- **Encaixe vertical.** Um elemento restringe o que pode entrar na célula abaixo, para que os dois formem fluxo contínuo. A regra sai das âncoras de cada forma — em que lado ela encosta em cada aresta horizontal — e não de uma tabela de pares.
- **Propagação para baixo.** Alterar um elemento reajusta a célula de baixo se ela ficou incompatível, e a verificação continua descendo pela coluna até encontrar uma junta que já encaixe ou uma célula vazia.
- Quatro formas de elemento, todas partindo do mesmo quadrado de lado igual à altura da célula: paralelogramo inclinado para a direita, o seu espelho, quadrado encostado à esquerda e quadrado encostado à direita. Ao preencher, a forma é sorteada entre as quatro e guardada na célula.
- Elementos desenhados **vazados**, só contorno — acompanha a linha fina da folha de referência.
- `js/elementos.js` — as formas, em funções puras.
- A padronagem guarda coluna e linha, não pixels: sobrevive ao redimensionamento da janela e à mudança de densidade. Células que caem fora da grelha atual somem do desenho mas ficam no estado, e voltam ao retomar a densidade.
- Realce da célula sob o cursor, anunciando que ali cabe interação. Aceso pelo tipo de ponteiro, não por `:hover`, para não deixar rastro em toque nem em laptop com tela sensível.
- Rolagem sobre a tela também controla a densidade, para cima mais denso. Roda de mouse e trackpad são distinguidos: entalhe de roda vale um passo, deltas de trackpad acumulam até fechar um passo, e a sobra é descartada após 250 ms parado.
- **Exportação.** Botão de download no fim da barra, com diálogo perguntando SVG ou PNG. O arquivo contém apenas a caixa das células ocupadas, sem grelha e sem fundo, com o traço em preto.
- No PNG, o usuário define a largura ou a altura em pixels e a outra medida sai da proporção. Fundo transparente. O diálogo mostra as medidas finais e barra tamanhos que excedem o limite do canvas do navegador.
- `js/exportar.js` — recorte, montagem do SVG e conversão para PNG.
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
