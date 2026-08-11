# CLAUDE.md

Orientações para trabalhar neste repositório.

## O que é

Gerador de padronagens SVG para a identidade visual da Especialização em Design Gráfico da Unicamp. Serve simultaneamente como ferramenta e como material expositivo da disciplina ART0339 — Projeto de Design Editorial Digital I.

Documentos de referência:
- [README.md](README.md) — visão geral e restrições
- [BRAND.md](BRAND.md) — paleta, tipografia, logo
- [SPEC.md](SPEC.md) — especificação funcional (fonte da verdade para o comportamento)

## Restrições invioláveis

Não flexibilizar sem o usuário pedir explicitamente:

1. **HTML, CSS, JS e SVG puros.** Nenhum framework, biblioteca, transpilador, bundler ou `package.json`.
2. **Zero dependências em runtime.** Nenhuma requisição a CDN ou host externo. Fontes e assets embarcados ou locais.
3. **Abre direto do sistema de arquivos.** `index.html` funciona com duplo clique, sem servidor. Evitar recursos que quebrem em `file://` (por exemplo, ES modules com `import` entre arquivos e `fetch` de arquivos locais).
4. **Sem back-end.** Geração e exportação inteiramente no cliente.

## Postura de código

Este código será lido em aula por designers, não por engenheiros. Isso é requisito, não estilo pessoal:

- Nomes de variáveis e funções descritivos, em português quando descrevem conceitos de design (`moduloCubo`, `deslocamentoLinha`), em inglês quando são termos da plataforma.
- Comentários que explicam a **intenção de design** por trás do trecho, não a mecânica óbvia da linguagem.
- Funções curtas e nomeadas por aquilo que produzem. Preferir clareza a concisão.
- Nada de esperteza que economize linhas às custas de legibilidade.

## Padrões técnicos

- Cores sempre a partir dos tokens em `:root`, nunca hex solto no meio do código.
- A geração da padronagem é uma função pura: parâmetros entram, string SVG (ou nós SVG) sai. Manter separada da manipulação de interface e da exportação.
- Exportação PNG via `<canvas>` + `XMLSerializer` + `Blob`/data URI. Atenção à contaminação do canvas: SVG serializado inline não contamina, mas imagens externas sim — mais um motivo para embarcar tudo.
- Cópia para a área de transferência via `navigator.clipboard.writeText`, com fallback, já que a Clipboard API é restrita em `file://` em alguns navegadores.
- O SVG exportado precisa abrir corretamente no Illustrator e no Inkscape: `viewBox` explícito, dimensões em unidades absolutas, sem depender de CSS externo.

## Fluxo de trabalho

A especificação vem do usuário, que é o designer do projeto. Quando um detalhe de comportamento não estiver em SPEC.md, perguntar em vez de inventar — e registrar a decisão em SPEC.md depois de tomada.

## Versionamento

SemVer, com o significado de cada número definido em [README.md](README.md#versionamento). O ponto que exige atenção:

**Mudar a geometria que a ferramenta produz é uma quebra MAJOR.** Se os mesmos parâmetros passarem a gerar um desenho diferente, não importa que nenhuma função tenha mudado de assinatura — o contrato quebrou. Refatorar a geração é seguro; ajustar uma constante que desloca o traço, não.

Toda alteração que o usuário perceba entra em `CHANGELOG.md`, sob `[Não lançado]`, no mesmo commit que a produz.
