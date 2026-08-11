# Identidade visual — referência

Extraído do *Guia Rápido de Identidade Visual* da Especialização em Design Gráfico da Unicamp, criado por Julio Giacomelli.

## Paleta

| Nome | Hex | RGB | Uso |
|---|---|---|---|
| Amarelo | `#E6B100` | `230, 177, 0` | Cor primária. Fundo dominante, elementos de destaque. |
| Marrom | `#534432` | `83, 68, 50` | Cor secundária. Tipografia e traços sobre amarelo; fundo alternativo. |

As duas cores funcionam como par invertível: marrom sobre amarelo e amarelo (ou branco) sobre marrom. O guia também usa **branco** em traços finos sobre o marrom, na malha de cubos.

Sugestão de tokens CSS:

```css
:root {
  --edg-amarelo: #E6B100;
  --edg-marrom:  #534432;
}
```

## Tipografia

**Host Grotesk** — família única. É uma **fonte variável**, eixo de peso 300–800, com itálico verdadeiro. Desenhada pela Element Type, licenciada sob a SIL Open Font License 1.1.

Repertório mostrado no guia: caixa alta e baixa completas, algarismos e `!@#$%&*()+-/?`.

### Arquivos

Em `assets/fonts/`:

| Arquivo | O que é |
|---|---|
| `host-grotesk.css` | **É este que se usa.** Os quatro `@font-face`, com os `.woff2` embutidos em base64. |
| `HostGrotesk-*.woff2` | Os quatro subsets originais (normal/itálico × latin/latin-ext), 67 KB no total. Ficam como fonte para regerar o CSS. |
| `OFL.txt` | A licença. |

O base64 não é capricho: o Chrome bloqueia `@font-face` apontando para arquivo local por política de CORS em `file://`, e a ferramenta precisa funcionar com duplo clique. Embutida, ela carrega. O CSS fica com 91 KB — custo aceitável pela garantia.

O subset `latin` cobre todo o português (os acentos vivem no bloco Latin-1, `U+0000–00FF`); o `latin-ext` entra de brinde para outras línguas.

```html
<link rel="stylesheet" href="assets/fonts/host-grotesk.css">
```
```css
font-family: 'Host Grotesk', system-ui, sans-serif;
font-weight: 300; /* qualquer valor entre 300 e 800, inclusive fracionários */
```

## Logo

Construção, comum às duas versões:

- Lettering em quatro linhas — `ESPECIA·` / `LIZAÇÃO` / `DESIGN` (itálico, letra vazada/outline) / `GRÁFICO`.
- Marcadores quadrados substituindo o ponto de abreviação e os acentos do `Ã` e do `Á`.
- Moldura retangular atravessada por um paralelogramo inclinado — a moldura sangra o lettering, o paralelogramo cruza na diagonal.

### São duas versões

O guia traz duas, e a diferença entre elas é **cromática, não geométrica**:

**1. Monocromática** — todo o desenho numa cor só. É a versão que aparece em grande escala na folha, em marrom sobre amarelo, mas não está presa a essa combinação: funciona em qualquer cor única, sobre qualquer um dos dois fundos.

**2. Duas cores** — o desenho se divide em dois planos:

| Plano | O que entra | Na folha |
|---|---|---|
| Massa | moldura, `ESPECIA·`, `LIZAÇÃO`, `GRÁFICO`, quadrados | amarelo |
| Traço | paralelogramo, `DESIGN` | branco |

A divisão não é arbitrária: o segundo plano reúne exatamente os elementos de linha fina e contorno vazado. Separá-los do lettering de massa é o que dá a leitura de profundidade da versão de duas cores.

### Um arquivo, as duas versões

A geometria é idêntica nas duas: comparando as coordenadas da folha, a ocorrência reduzida é a grande escalada por exatamente **0,30101** — confere na moldura (485 → 145,99), no deslocamento do paralelogramo (55,882 → 16,82) e na posição do `E` inicial. Não existe desenho alternativo para escala pequena.

Por isso um único `assets/logo/logo.svg`, com `viewBox="138 191 583.114 485"`, atende as duas:

```css
/* 1. monocromática — só a cor única */
.logo { color: #534432; }

/* 2. duas cores — a segunda entra pela custom property */
.logo { color: #E6B100; --edg-logo-detalhe: #fff; }
```

Sem `--edg-logo-detalhe`, o grupo `#detalhe` cai em `currentColor` e o logo sai monocromático. É o padrão: a versão de duas cores exige um pedido explícito.

O `color="#534432"` no elemento raiz é só o padrão de quando o arquivo é aberto sozinho; sendo atributo de apresentação, perde para qualquer regra CSS quando o SVG está inline na página.

> Atenção na exportação: `currentColor` e `var()` só resolvem com o SVG inline no DOM. O código que a ferramenta exportar precisa **gravar o hex literal** — senão o arquivo abre preto no Illustrator e no Inkscape.

Confira as duas aplicações e a tipografia abrindo [verificacao.html](verificacao.html) no navegador.

## Elemento gráfico de apoio

O guia traz uma **malha de cubos em perspectiva isométrica**, desenhada apenas em contorno fino, sem preenchimento — blocos que se encaixam e se deslocam, formando uma composição modular aberta. É a pista mais direta do vocabulário formal esperado de uma padronagem para esta marca: módulo geométrico, repetição com deslocamento, linha em vez de massa.
