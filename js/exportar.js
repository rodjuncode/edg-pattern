// Exportação da padronagem em SVG e PNG.
//
// A parte que monta geometria é pura, como em grelha.js e elementos.js. Só as
// duas últimas funções tocam no navegador, porque converter para PNG exige
// canvas e baixar exige um <a>.

// Preto por ora, conforme combinado. Quando a cor virar parâmetro, é o único
// lugar a mexer.
const EXPORT_COR = '#000000';

/**
 * A caixa que contém todas as células ocupadas, em índices de coluna e linha.
 *
 * Devolve null se não houver nada preenchido — não existe recorte de vazio.
 */
function limitesDaPadronagem(preenchidas) {
  if (!preenchidas || preenchidas.size === 0) return null;

  let minColuna = Infinity, maxColuna = -Infinity;
  let minLinha = Infinity, maxLinha = -Infinity;

  preenchidas.forEach(function (forma, chave) {
    const partes = chave.split(',');
    const coluna = Number(partes[0]);
    const linha = Number(partes[1]);

    if (coluna < minColuna) minColuna = coluna;
    if (coluna > maxColuna) maxColuna = coluna;
    if (linha < minLinha) minLinha = linha;
    if (linha > maxLinha) maxLinha = linha;
  });

  return {
    minColuna, maxColuna, minLinha, maxLinha,
    colunas: maxColuna - minColuna + 1,
    linhas: maxLinha - minLinha + 1
  };
}

/**
 * Monta o SVG de exportação: só os elementos, recortados na caixa das células
 * ocupadas. Sem grelha, sem fundo.
 *
 * O `viewBox` é a caixa das células **mais meia espessura de traço em cada
 * borda**. O contorno em SVG é centrado no caminho, então metade dele fica
 * para fora do retângulo da célula; um recorte exato cortaria ao meio a linha
 * externa de todo o contorno — e num PNG ampliado isso apareceria como meia
 * linha ao redor do desenho inteiro.
 *
 * Devolve `{ texto, largura, altura, celulas }`, ou null se não houver nada a
 * exportar. `largura` e `altura` já incluem a sangria e são o que define a
 * proporção do PNG.
 *
 * Espera receber **apenas células desenháveis**. Quem chama filtra antes: uma
 * célula guardada fora da grelha atual não aparece no traço, e se entrasse na
 * conta esticaria a caixa com vazio.
 */
function padronagemParaSVG(preenchidas, larguraCelula, alturaCelula, traco) {
  const lim = limitesDaPadronagem(preenchidas);
  if (!lim) return null;

  const largura = arredondar(lim.colunas * larguraCelula + traco);
  const altura = arredondar(lim.linhas * alturaCelula + traco);
  const margem = arredondar(-traco / 2);

  // Desloca os índices para a caixa começar em (0,0) e monta uma grelha do
  // tamanho exato do recorte. Com isso a exportação reusa padronagemParaPath,
  // em vez de repetir aqui a travessia das células.
  const deslocadas = new Map();
  preenchidas.forEach(function (forma, chave) {
    const p = chave.split(',');
    deslocadas.set((Number(p[0]) - lim.minColuna) + ',' + (Number(p[1]) - lim.minLinha), forma);
  });

  const grelhaDoRecorte = {
    colunas: lim.colunas,
    linhas: lim.linhas,
    larguraCelula: larguraCelula,
    alturaCelula: alturaCelula,
    deslocY: 0
  };

  const texto =
    '<svg xmlns="http://www.w3.org/2000/svg"' +
    ' width="' + largura + '" height="' + altura + '"' +
    ' viewBox="' + margem + ' ' + margem + ' ' + largura + ' ' + altura + '">\n' +
    '  <path d="' + padronagemParaPath(grelhaDoRecorte, deslocadas) + '"\n' +
    '        fill="none" stroke="' + EXPORT_COR + '"' +
    ' stroke-width="' + arredondar(traco) + '" stroke-linejoin="miter"/>\n' +
    '</svg>\n';

  return { texto, largura, altura, celulas: preenchidas.size };
}

/**
 * A dimensão que falta, a partir da que foi informada.
 *
 * Arredonda para inteiro e nunca devolve zero: um PNG de altura 0 não abre.
 */
function dimensaoComplementar(qual, valor, largura, altura) {
  const proporcao = largura / altura;
  if (qual === 'largura') {
    return { largura: Math.round(valor), altura: Math.max(1, Math.round(valor / proporcao)) };
  }
  return { largura: Math.max(1, Math.round(valor * proporcao)), altura: Math.round(valor) };
}

/**
 * Converte o texto SVG num PNG do tamanho pedido.
 *
 * O SVG entra como `data:` URI, não como `blob:`. Imagem SVG vinda de blob
 * contamina o canvas em alguns navegadores, e aí `toBlob` falha com erro de
 * segurança. Em data URI, e sem nenhuma referência externa dentro do SVG, o
 * canvas continua limpo.
 */
function svgParaPNG(svgTexto, largura, altura) {
  return new Promise(function (resolve, reject) {
    const img = new Image();

    img.onload = function () {
      const canvas = document.createElement('canvas');
      canvas.width = largura;
      canvas.height = altura;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, largura, altura);

      canvas.toBlob(function (blob) {
        if (blob) resolve(blob);
        else reject(new Error('o navegador não gerou o PNG'));
      }, 'image/png');
    };

    img.onerror = function () { reject(new Error('o SVG não pôde ser lido como imagem')); };
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgTexto);
  });
}

/** Dispara o download de um blob com o nome dado. */
function descarregar(blob, nome) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');

  a.href = url;
  a.download = nome;
  document.body.appendChild(a);
  a.click();
  a.remove();

  // Revogar na hora cancelaria o download em alguns navegadores.
  setTimeout(function () { URL.revokeObjectURL(url); }, 10000);
}
