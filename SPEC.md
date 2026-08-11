# Especificação funcional

> Documento em aberto. O designer descreve aqui o que a ferramenta deve fazer; a implementação segue esta especificação.

## 1. Objetivo

Gerar padronagens vetoriais alinhadas à identidade da Especialização em Design Gráfico (ver [BRAND.md](BRAND.md)), com controle paramétrico e exportação em PNG e SVG.

## 2. Módulo(s) da padronagem

**Decidido:** a padronagem é **desenhada por código** — geometria calculada e emitida como SVG a cada geração. Não é a repetição de um asset vetorial pronto, nem o logo carimbado numa grade. O logo e a folha de referência entram como vocabulário formal, não como peça a ser instanciada.

Consequência para a arquitetura: o módulo é uma função que recebe parâmetros e devolve geometria. Trocar o desenho é trocar essa função, não trocar um arquivo.

*A definir* — qual é a unidade que se repete, como ela é construída, quais variações admite.

## 3. Regra de repetição

*A definir* — grade ortogonal, isométrica, deslocamento entre linhas, rotação, espelhamento, densidade.

## 4. Parâmetros controláveis

*A definir* — a lista de controles expostos na interface e a faixa de valores de cada um.

| Parâmetro | Tipo de controle | Faixa / opções | Padrão |
|---|---|---|---|
| | | | |

## 5. Cor

*A definir* — quais combinações da paleta são permitidas, se há inversão, se o usuário escolhe ou se as opções são fixas.

## 6. Aleatoriedade

*A definir* — se há geração aleatória, se a semente é visível/editável, se o mesmo resultado precisa ser reproduzível.

## 7. Interface

*A definir* — organização dos controles, tamanho e proporção da área de pré-visualização, comportamento responsivo.

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
