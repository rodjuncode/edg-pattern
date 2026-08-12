# Especificação funcional

> Documento em aberto. O designer descreve aqui o que a ferramenta deve fazer; a implementação segue esta especificação.

## 1. Objetivo

Gerar padronagens vetoriais alinhadas à identidade da Especialização em Design Gráfico (ver [BRAND.md](BRAND.md)), com controle paramétrico e exportação em PNG e SVG.

## 2. Módulo(s) da padronagem

**Decidido:** a padronagem é **desenhada por código** — geometria calculada e emitida como SVG a cada geração. Não é a repetição de um asset vetorial pronto, nem o logo carimbado numa grade. O logo e a folha de referência entram como vocabulário formal, não como peça a ser instanciada.

Consequência para a arquitetura: o módulo é uma função que recebe parâmetros e devolve geometria. Trocar o desenho é trocar essa função, não trocar um arquivo.

*A definir* — qual é a unidade que se repete, como ela é construída, quais variações admite.

## 3. Regra de repetição

**Decidido — a grelha.** Grade ortogonal cujas células têm a **proporção do arquivo de logo**: 583,114 / 485 = **1,2023** (mais larga que alta). A proporção é lida do `viewBox` em tempo de geração, não fixada no código.

Como a proporção é fixa, não cabe um número inteiro de células nas duas direções ao mesmo tempo. A largura manda: `densidade` colunas cabem exatas na largura da tela, e as linhas transbordam. O excedente é dividido meio a meio entre topo e base, para o corte ficar simétrico e a grelha ler como padrão infinito recortado pela tela.

*A definir* — deslocamento entre linhas, rotação, espelhamento.

## 4. Parâmetros controláveis

| Parâmetro | Tipo de controle | Faixa / opções | Padrão |
|---|---|---|---|
| Exibir grelha | interruptor | ligado / desligado | ligado |
| Densidade | dois botões com leitura numérica, **ou rolagem sobre a tela** | 2 a 48 colunas | 12 |

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

*A definir* — se há geração aleatória, se a semente é visível/editável, se o mesmo resultado precisa ser reproduzível.

## 7. Interface

**Decidido.** Minimalista, fundo mostarda da marca (`#E6B100`). A área de desenho ocupa a viewport inteira, menos a barra de ferramentas.

**Barra de ferramentas** — vertical à esquerda, com **1/24 da largura da tela**. Do topo para baixo: logo da EDG na versão monocromática castanha, divisor, e os controles.

A largura tem trava nas duas pontas (`clamp(52px, 100vw/24, 88px)`): abaixo de ~52 px os botões deixam de ser clicáveis com precisão, e num monitor ultrawide 1/24 já não seria "fina".

**Mobile** (até 640 px) — a barra vira bandeja no rodapé, na horizontal, ao alcance do polegar. A tela mantém a largura inteira, que é o que importa numa viewport estreita. Só a direção do flex muda; a marcação é a mesma.

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
