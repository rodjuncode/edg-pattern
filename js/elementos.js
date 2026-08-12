// Os elementos que preenchem as células da grelha.
//
// Como grelha.js: funções puras. Entra uma célula (posição e tamanho já
// resolvidos), sai geometria. Nada aqui sabe que existe uma tela.
//
// Os elementos são desenhados vazados — só contorno, sem preenchimento. Quem
// decide isso é o CSS; daqui sai apenas o caminho.

const FORMA_PARALELOGRAMO_DIREITA = 'paralelogramo-direita';
const FORMA_PARALELOGRAMO_ESQUERDA = 'paralelogramo-esquerda';

/** Todas as formas que o sorteio pode devolver. */
const FORMAS = [
  FORMA_PARALELOGRAMO_DIREITA,
  FORMA_PARALELOGRAMO_ESQUERDA
];

/**
 * Paralelogramo inclinado para a direita.
 *
 * Um quadrado do tamanho da altura da célula, inclinado até que dois vértices
 * encostem em cantos opostos:
 *
 *      (x+W−H, y) ───── (x+W, y)      lado superior, comprimento H,
 *          ╲               ╲          vértice direito no canto superior
 *           ╲               ╲         direito da célula
 *        (x, y+H) ───── (x+H, y+H)    lado inferior, comprimento H,
 *                                     vértice esquerdo no canto inferior
 *                                     esquerdo da célula
 *
 * A inclinação é W − H, o que sobra da largura depois de descontada a altura.
 * Como a célula tem a proporção do logo (1,2023), isso dá 0,2023 × altura —
 * quase a mesma do paralelogramo da marca (0,2085 × altura). O elemento herda
 * o gesto do logo por consequência da proporção, não por cópia.
 */
function paralelogramoDireitaParaPath(c) {
  const { x, y, largura: w, altura: h } = c;

  return 'M' + arredondar(x + w - h) + ' ' + arredondar(y) +
         'H' + arredondar(x + w) +
         'L' + arredondar(x + h) + ' ' + arredondar(y + h) +
         'H' + arredondar(x) +
         'Z';
}

/**
 * O mesmo paralelogramo, espelhado na horizontal.
 *
 *      (x, y) ───── (x+H, y)          lado superior, comprimento H,
 *         ╱             ╱             vértice esquerdo no canto superior
 *        ╱             ╱              esquerdo da célula
 *  (x+W−H, y+H) ─── (x+W, y+H)        lado inferior, comprimento H,
 *                                     vértice direito no canto inferior
 *                                     direito da célula
 *
 * Espelhar é trocar x por (2x + W − x), o que na prática troca os cantos de
 * apoio pelos seus opostos. A inclinação tem o mesmo módulo, sentido contrário.
 */
function paralelogramoEsquerdaParaPath(c) {
  const { x, y, largura: w, altura: h } = c;

  return 'M' + arredondar(x) + ' ' + arredondar(y) +
         'H' + arredondar(x + h) +
         'L' + arredondar(x + w) + ' ' + arredondar(y + h) +
         'H' + arredondar(x + w - h) +
         'Z';
}

/** Despacha para a forma pedida. Cresce conforme novas formas entrarem. */
function elementoParaPath(celula, forma) {
  switch (forma) {
    case FORMA_PARALELOGRAMO_ESQUERDA:
      return paralelogramoEsquerdaParaPath(celula);
    case FORMA_PARALELOGRAMO_DIREITA:
    default:
      return paralelogramoDireitaParaPath(celula);
  }
}

/**
 * Sorteia uma das formas.
 *
 * O gerador entra por parâmetro em vez de chamar Math.random direto: assim a
 * função continua pura e o teste consegue fixar o resultado. `Math.min` guarda
 * contra um gerador que devolva exatamente 1, que estouraria o índice.
 */
function sortearForma(aleatorio) {
  const r = (aleatorio || Math.random)();
  return FORMAS[Math.min(FORMAS.length - 1, Math.floor(r * FORMAS.length))];
}

/**
 * Junta todos os elementos da padronagem num único `d`.
 *
 * `preenchidas` é um Map de "coluna,linha" para o nome da forma. A forma é
 * sorteada uma vez, quando a célula é preenchida, e guardada: redesenhar não
 * pode re-sortear, ou a padronagem mudaria sozinha a cada resize.
 *
 * Células que caíram fora da grelha atual — porque a densidade mudou desde que
 * foram preenchidas — são puladas no desenho, mas continuam no estado:
 * voltando à densidade anterior, elas reaparecem.
 */
function padronagemParaPath(g, preenchidas) {
  const partes = [];

  preenchidas.forEach((forma, chave) => {
    const [coluna, linha] = chave.split(',').map(Number);
    const celula = celulaPorIndice(g, coluna, linha);
    if (celula) partes.push(elementoParaPath(celula, forma));
  });

  return partes.join('');
}
