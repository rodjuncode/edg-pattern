// Os elementos que preenchem as células da grelha.
//
// Como grelha.js: funções puras. Entra uma célula (posição e tamanho já
// resolvidos), sai geometria. Nada aqui sabe que existe uma tela.

const FORMA_PARALELOGRAMO = 'paralelogramo';

/**
 * Paralelogramo — um quadrado do tamanho da altura da célula, inclinado para
 * a direita até que dois de seus vértices encostem em cantos opostos da célula.
 *
 *      (x+W−H, y) ───── (x+W, y)      lado superior, comprimento H,
 *          ╲               ╲          vértice direito no canto superior
 *           ╲               ╲         direito da célula
 *            ╲               ╲
 *        (x, y+H) ───── (x+H, y+H)    lado inferior, comprimento H,
 *                                     vértice esquerdo no canto inferior
 *                                     esquerdo da célula
 *
 * A inclinação é W − H, o que sobra da largura da célula depois de descontada
 * a altura. Como a célula tem a proporção do logo (1,2023), a inclinação sai
 * 0,2023 × altura — quase a mesma do paralelogramo da marca, que inclina
 * 0,2085 × altura. O elemento herda o gesto do logo por consequência da
 * proporção, não por cópia.
 *
 * Os extremos horizontais são x e x+W: o elemento ocupa a largura inteira da
 * célula, ainda que só encoste nos cantos em dois pontos.
 */
function paralelogramoParaPath(c) {
  const { x, y, largura: w, altura: h } = c;
  const inclinacao = w - h;

  return 'M' + arredondar(x + inclinacao) + ' ' + arredondar(y) +
         'H' + arredondar(x + w) +
         'L' + arredondar(x + h) + ' ' + arredondar(y + h) +
         'H' + arredondar(x) +
         'Z';
}

/** Despacha para a forma pedida. Cresce conforme novas formas entrarem. */
function elementoParaPath(celula, forma) {
  switch (forma) {
    case FORMA_PARALELOGRAMO:
    default:
      return paralelogramoParaPath(celula);
  }
}

/**
 * Junta todos os elementos da padronagem num único `d`.
 *
 * `preenchidas` é um Map de "coluna,linha" para o nome da forma. Células que
 * caíram fora da grelha atual — porque a densidade mudou desde que foram
 * preenchidas — são puladas no desenho, mas continuam no estado: voltando à
 * densidade anterior, elas reaparecem.
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
