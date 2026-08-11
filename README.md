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
assets/
  logo/logo.svg           lockup completo, monocromático ou duas cores via CSS
  fonts/host-grotesk.css  Host Grotesk variável, .woff2 embutidos em base64
  fonts/*.woff2, OFL.txt  originais e licença
verificacao.html          conferência visual dos assets (não faz parte da ferramenta)

index.html                (a fazer) página única — interface
css/                      (a fazer) estilos
js/                       (a fazer) geração, renderização e exportação
```

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

## Créditos

Identidade visual criada por **Julio Giacomelli** para o curso de Especialização em Design Gráfico da Unicamp.
