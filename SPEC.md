# Especificação funcional

> Documento em aberto. O designer descreve aqui o que a ferramenta deve fazer; a implementação segue esta especificação.

## 1. Objetivo

Gerar padronagens vetoriais alinhadas à identidade da Especialização em Design Gráfico (ver [BRAND.md](BRAND.md)), com controle paramétrico e exportação em PNG e SVG.

## 2. Módulo(s) da padronagem

**Decidido:** a padronagem é **desenhada por código** — geometria calculada e emitida como SVG a cada geração. Não é a repetição de um asset vetorial pronto, nem o logo carimbado numa grade. O logo e a folha de referência entram como vocabulário formal, não como peça a ser instanciada.

Consequência para a arquitetura: o módulo é uma função que recebe parâmetros e devolve geometria. Trocar o desenho é trocar essa função, não trocar um arquivo.

A padronagem se compõe **preenchendo células da grelha**. Cada célula preenchida recebe um *elemento*, que pode assumir formas diferentes.

**O clique tem três comportamentos**, conforme o modo e o estado da célula:

| Situação | O que acontece |
|---|---|
| Célula vazia | Preenche com uma forma **sorteada** entre as permitidas |
| Célula ocupada | **Cicla** para a próxima forma permitida |
| Borracha ligada | **Esvazia** a célula |

A borracha é um modo, ligado e desligado por um botão na barra. Com ela ativa, clicar numa célula vazia não faz nada.

A ordem da ciclagem é: torto à esquerda → reto à esquerda → torto à direita → reto à direita → e volta ao início.

Os elementos são **vazados** — só contorno, sem massa. Acompanha a folha de referência, onde a malha de cubos é desenhada em linha fina.

Ao preencher, a forma é **sorteada** entre as disponíveis. O sorteio acontece uma vez, no clique, e o resultado fica guardado na célula: redesenhar não pode re-sortear, ou a padronagem se reembaralharia a cada resize.

> Pendência de reprodutibilidade. O sorteio usa `Math.random()`, sem semente. Isso conflita com a regra de versionamento (README): mesma entrada, mesmo resultado. Enquanto não houver semente visível e editável, uma padronagem só é reproduzível se for salva, não se for redigitada. Ver seção 6.

### Forma 1 — paralelogramo, inclinado para a direita

Um quadrado do tamanho da **altura da célula**, inclinado para a direita até que dois vértices encostem em cantos opostos da célula. Numa célula de largura `W`, altura `H` e origem no canto superior esquerdo:

```
(W−H, 0) ──── (W, 0)     lado superior, comprimento H,
   ╲             ╲        vértice direito no canto superior direito
    ╲             ╲
   (0, H) ──── (H, H)    lado inferior, comprimento H,
                          vértice esquerdo no canto inferior esquerdo
```

A inclinação resulta em `W − H`. Como a célula tem a proporção do logo, isso dá `0,2023 × H` — praticamente a mesma inclinação do paralelogramo da marca, que é `0,2085 × H`. O elemento herda o gesto do logo por consequência da proporção, não por cópia.

**Como os elementos se relacionam** (decorre da geometria, não é escolha à parte):

- **Vizinhos na horizontal não se tocam.** Entre eles sobra uma fresta que é ela própria um paralelogramo, de mesma inclinação e largura `W − H`. A padronagem lê como barras ritmadas, não como faixa contínua.
- **Vizinhos na vertical se tocam** ao longo de `2H − W` (0,798 × H), cerca de 80% da aresta. O restante vira entalhe, e uma coluna de elementos empilhados ganha perfil escalonado.

Se algum dia a intenção for fundir vizinhos horizontais, o lado do elemento precisa medir `W`, não `H`.

### Forma 2 — a mesma, espelhada na horizontal

Mesma construção, refletida no eixo vertical central da célula. Os cantos de apoio passam a ser os opostos:

```
(0, 0) ──── (H, 0)          lado superior, comprimento H,
   ╱           ╱             vértice esquerdo no canto superior esquerdo
  ╱           ╱
(W−H, H) ── (W, H)          lado inferior, comprimento H,
                             vértice direito no canto inferior direito
```

A inclinação tem o mesmo módulo, sentido contrário. Misturadas pelo sorteio, as duas formas produzem uma textura de losangos e ziguezagues.

### Formas 3 e 4 — quadrado, encostado à esquerda ou à direita

Quadrado regular, ângulos retos, lado igual à altura da célula. Encosta no topo e na base, e numa das laterais:

```
forma 3                      forma 4
(0,0) ──── (H,0)  ┆          ┆  (W−H,0) ──── (W,0)
  │          │    ┆ sobra    ┆     │            │
  │          │    ┆ W−H      ┆     │            │
(0,H) ──── (H,H)  ┆          ┆  (W−H,H) ──── (W,H)
```

A faixa que sobra do lado oposto mede `W − H` — a mesma medida da inclinação dos paralelogramos. As quatro formas partem do mesmo quadrado de lado `H`: duas o inclinam, duas o deslocam.

**O que emerge da mistura:** um quadrado encostado à direita e outro à esquerda em células vizinhas se encontram exatamente na divisa, formando um par contínuo. É o único encontro sem fresta entre elementos horizontais — os paralelogramos nunca se tocam na horizontal, e quadrado com paralelogramo tampouco.

*A definir* — as demais formas.

### Encaixe vertical

Uma célula preenchida **restringe** o que pode entrar na célula diretamente abaixo dela, de modo que os dois elementos formem um fluxo contínuo:

| Elemento acima | Admite abaixo |
|---|---|
| torto à direita | torto à esquerda, reto à esquerda |
| torto à esquerda | torto à direita, reto à direita |
| reto à direita | torto à direita, reto à direita |
| reto à esquerda | torto à esquerda, reto à esquerda |

**Estas quatro regras não são arbitrárias, e não estão tabeladas no código.** Cada forma ocupa a largura `H` dentro dos `W` da célula, encostada num dos lados em cada aresta horizontal:

| Forma | Aresta superior | Aresta inferior |
|---|---|---|
| torto à direita | direita | esquerda |
| torto à esquerda | esquerda | direita |
| reto à esquerda | esquerda | esquerda |
| reto à direita | direita | direita |

A regra é simplesmente **a aresta inferior de cima cair do mesmo lado que a aresta superior de baixo**. As quatro linhas da primeira tabela saem daí. No código isso vive em `ANCORAS`, e uma forma nova entra no sistema apenas declarando suas duas âncoras.

Consequências:

- Só a vizinha **de cima** restringe. Célula vazia acima não impõe nada, e todas as quatro valem.
- Havendo restrição, sobram sempre **duas** formas — uma torta e uma reta. A ciclagem alterna entre elas.
- A relação **não é simétrica**: torto à direita admite reto à esquerda abaixo, mas reto à esquerda não admite torto à direita. Dos 16 pares ordenados, 8 encaixam.

### Propagação para baixo

Ao alterar o elemento de uma célula ocupada, se a célula diretamente abaixo estiver ocupada e tiver ficado incompatível, ela recebe uma forma nova, sorteada entre as compatíveis com a de cima.

**A verificação continua descendo.** Trocar a de baixo é, de novo, alterar uma célula ocupada — parar no primeiro nível deixaria a junta seguinte quebrada, e a continuidade do fluxo é justamente o que a regra protege. A propagação termina sozinha: para na primeira célula vazia, ou quando o sorteio calha numa forma que já encaixava.

Um buraco na coluna interrompe a propagação — o que está abaixo dele não é afetado.

Esvaziar com a borracha não dispara propagação: célula vazia não impõe restrição a ninguém.

### Traço

Fixo em 1,5 px (`--elemento-traco`), não proporcional à célula: assim a linha continua legível na densidade máxima, onde a célula fica pequena. Um pouco mais grosso que a grelha (1 px), para o desenho se destacar do guia. Provável parâmetro de interface mais adiante.

## 3. Regra de repetição

**Decidido — a grelha.** Grade ortogonal cujas células têm a **proporção do arquivo de logo**: 583,114 / 485 = **1,2023** (mais larga que alta). A proporção é lida do `viewBox` em tempo de geração, não fixada no código.

Como a proporção é fixa, não cabe um número inteiro de células nas duas direções ao mesmo tempo. A largura manda: `densidade` colunas cabem exatas na largura da tela, e as linhas transbordam. O excedente é dividido meio a meio entre topo e base, para o corte ficar simétrico e a grelha ler como padrão infinito recortado pela tela.

*A definir* — deslocamento entre linhas, rotação, espelhamento.

## 4. Parâmetros controláveis

| Parâmetro | Tipo de controle | Faixa / opções | Padrão |
|---|---|---|---|
| Exibir grelha | interruptor | ligado / desligado | ligado |
| Densidade | dois botões com leitura numérica, **ou rolagem sobre a tela** | 2 a 48 colunas | 12 |
| Borracha | interruptor | ligada / desligada | desligada |

Mexer na densidade com a grelha apagada reacende a grelha — o gesto não teria retorno visível de outro modo.

### Rolagem

Rolar sobre a área de desenho muda a densidade. Para cima, mais denso — mesmo sentido do botão `+`, que fica acima do `−`.

Roda de mouse e trackpad chegam como o mesmo evento `wheel`, mas são dispositivos diferentes, e tratá-los igual faria um gesto de trackpad varrer a faixa inteira. A distinção é feita assim:

- **Dispositivo discreto — um evento, um passo.** Ou o `deltaMode` não é pixel (linhas ou páginas só vêm de roda ou tecla; trackpad sempre reporta pixels), ou o valor em pixels é grande o bastante para ser entalhe de roda (≥ 50).
- **Trackpad** — acumula os deltas pequenos até somarem 26 px, e aí anda um passo.
- **Gestos são independentes.** Após 250 ms parado, a sobra não convertida é descartada, para não somar com o gesto seguinte.

*A definir* — os demais controles.

## 5. Cor

*A definir* — quais combinações da paleta são permitidas, se há inversão, se o usuário escolhe ou se as opções são fixas.

## 6. Aleatoriedade

**Parcialmente decidido.** Há sorteio: a forma do elemento é escolhida ao acaso no momento em que a célula é preenchida, e guardada. O desenho, uma vez feito, é estável.

*A definir* — **a semente.** Hoje o sorteio usa `Math.random()`, sem semente. A regra de versionamento (ver [README](README.md#versionamento)) promete que os mesmos parâmetros devolvem o mesmo resultado dentro de uma MAJOR, e sem semente essa promessa não se sustenta: refazer os mesmos cliques dá outra padronagem.

Três saídas possíveis, em ordem de esforço:

1. Aceitar que a padronagem só é reproduzível pelo arquivo exportado, e afrouxar a regra de versionamento para excluir o sorteio.
2. Semente interna, gravada junto com a padronagem ao exportar.
3. Semente visível e editável na interface, virando parâmetro de projeto — o designer anota o número e recupera o resultado.

A terceira é a que torna a ferramenta utilizável em aula, onde alguém pode querer retomar um resultado meses depois.

## 7. Interface

**Decidido.** Minimalista, fundo mostarda da marca (`#E6B100`). A área de desenho ocupa a viewport inteira, menos a barra de ferramentas.

**Barra de ferramentas** — vertical à esquerda, com **1/24 da largura da tela**. Do topo para baixo: logo da EDG na versão monocromática castanha, divisor, e os controles.

A largura tem trava nas duas pontas (`clamp(52px, 100vw/24, 88px)`): abaixo de ~52 px os botões deixam de ser clicáveis com precisão, e num monitor ultrawide 1/24 já não seria "fina".

**Mobile** (até 640 px) — a barra vira bandeja no rodapé, na horizontal, ao alcance do polegar. A tela mantém a largura inteira, que é o que importa numa viewport estreita. Só a direção do flex muda; a marcação é a mesma.

### Realce da célula

A célula sob o cursor recebe um preenchimento discreto, para anunciar que ali cabe uma interação. Preenchimento e não borda: uma borda competiria com as linhas da grelha. O retângulo é desenhado **antes** da grelha, para que as linhas fiquem por cima.

Só aparece com a grelha visível — sem "as demais", não há o que diferenciar, e um retângulo solto no vazio confundiria em vez de comunicar.

**Não aparece em toque.** O realce é aceso pelo tipo de ponteiro do evento (`pointerType === 'mouse'`), não por `:hover`. Duas razões:

- Navegadores móveis emulam eventos de mouse depois de um toque, e nunca mandam o `pointerleave` correspondente — o realce ficaria aceso no lugar do último toque.
- Em laptop com tela sensível, `@media (hover: hover)` acerta que existe mouse, então o CSS sozinho não distinguiria o dedo.

Dedo e caneta apagam qualquer realce herdado. Também apagam: sair da área, `pointercancel` e a janela perder o foco — este último porque não dispara `pointerleave`, e o realce ficaria aceso com o usuário em outro programa.

*A definir* — organização dos controles que ainda virão.

## 8. Exportação

- **PNG** — download. *A definir*: resolução, se o tamanho é escolhido pelo usuário, se o fundo é transparente ou pintado.
- **SVG** — cópia do código para a área de transferência. *A definir*: SVG único ou com `<pattern>` reutilizável, tratamento de `viewBox`, se o código sai comentado/legível para uso didático.

## 9. Fora de escopo

*A definir* — o que a ferramenta explicitamente não faz.

## Decisões em aberto

- [x] ~~Arquivos vetoriais do logo~~ — extraídos da folha de referência para `assets/logo/logo.svg`.
- [x] ~~Fonte Host Grotesk e licença~~ — em `assets/fonts/`, embutida em base64, OFL 1.1.
- [x] ~~O logo participa da padronagem como elemento repetível?~~ — não. A padronagem é desenhada por código (ver seção 2).
- [ ] Seções 3 a 9 deste documento.
