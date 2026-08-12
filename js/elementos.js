// Os elementos que preenchem as células da grelha.
//
// Como grelha.js: funções puras. Entra uma célula (posição e tamanho já
// resolvidos), sai geometria. Nada aqui sabe que existe uma tela.
//
// Os elementos são desenhados vazados — só contorno, sem preenchimento. Quem
// decide isso é o CSS; daqui sai apenas o caminho.

const FORMA_PARALELOGRAMO_DIREITA = 'paralelogramo-direita';
const FORMA_PARALELOGRAMO_ESQUERDA = 'paralelogramo-esquerda';
const FORMA_QUADRADO_ESQUERDA = 'quadrado-esquerda';
const FORMA_QUADRADO_DIREITA = 'quadrado-direita';

/**
 * Todas as formas, **na ordem da ciclagem**.
 *
 * São dois pares de espelhos. Todas partem do mesmo quadrado de lado igual à
 * altura da célula: os paralelogramos o inclinam, os quadrados o encostam numa
 * das laterais. Em qualquer caso sobra a mesma faixa de W − H do lado oposto.
 *
 * A ordem não é decorativa: clicar numa célula ocupada avança nesta lista.
 */
const FORMAS = [
  FORMA_PARALELOGRAMO_ESQUERDA,  // torto para a esquerda
  FORMA_QUADRADO_ESQUERDA,       // reto à esquerda
  FORMA_PARALELOGRAMO_DIREITA,   // torto para a direita
  FORMA_QUADRADO_DIREITA         // reto à direita
];

/**
 * Onde cada forma encosta, em cima e embaixo.
 *
 * Toda forma ocupa a altura inteira da célula, mas só uma faixa de largura H
 * dentro dos W disponíveis. Estas âncoras dizem de que lado essa faixa está,
 * em cada uma das duas arestas horizontais:
 *
 *   torto p/ direita   topo à direita,   base à esquerda   (a inclinação vira)
 *   torto p/ esquerda  topo à esquerda,  base à direita
 *   reto à esquerda    topo à esquerda,  base à esquerda   (não vira)
 *   reto à direita     topo à direita,   base à direita
 *
 * É daqui que sai a regra de encaixe vertical, em vez de uma tabela de pares:
 * dois elementos empilhados formam fluxo contínuo quando a base do de cima cai
 * do mesmo lado que o topo do de baixo. Uma forma nova entra no sistema apenas
 * declarando suas duas âncoras.
 */
const ANCORAS = {
  [FORMA_PARALELOGRAMO_DIREITA]:  { topo: 'direita',  base: 'esquerda' },
  [FORMA_PARALELOGRAMO_ESQUERDA]: { topo: 'esquerda', base: 'direita'  },
  [FORMA_QUADRADO_ESQUERDA]:      { topo: 'esquerda', base: 'esquerda' },
  [FORMA_QUADRADO_DIREITA]:       { topo: 'direita',  base: 'direita'  }
};

/** Duas formas empilhadas formam fluxo contínuo? */
function saoCompativeis(formaAcima, formaAbaixo) {
  if (!formaAcima || !formaAbaixo) return true; // célula vazia não restringe
  return ANCORAS[formaAcima].base === ANCORAS[formaAbaixo].topo;
}

/**
 * Que formas podem ficar logo abaixo de `formaAcima`.
 *
 * Sem nada acima, todas valem. Com algo acima, sempre sobram duas: uma torta e
 * uma reta, as que abrem pelo mesmo lado onde a de cima terminou.
 */
function formasCompativeisAbaixo(formaAcima) {
  if (!formaAcima) return FORMAS.slice();
  return FORMAS.filter(f => saoCompativeis(formaAcima, f));
}

/**
 * A próxima forma na ciclagem, respeitando o que é permitido.
 *
 * Anda na ordem de FORMAS a partir da atual e devolve a primeira permitida.
 * Se a atual for a única permitida, devolve ela mesma — clicar não faz nada,
 * que é melhor do que quebrar o encaixe.
 */
function proximaForma(formaAtual, permitidas) {
  const lista = permitidas && permitidas.length ? permitidas : FORMAS;
  const inicio = FORMAS.indexOf(formaAtual);

  for (let passo = 1; passo <= FORMAS.length; passo++) {
    const candidata = FORMAS[(inicio + passo) % FORMAS.length];
    if (lista.indexOf(candidata) >= 0) return candidata;
  }
  return formaAtual;
}

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

/**
 * Quadrado regular, ângulos retos, lado igual à altura da célula, encostado
 * na lateral esquerda.
 *
 *   (x, y) ──── (x+H, y)
 *      │            │        Como a célula é mais larga que alta, sobra
 *      │            │        uma faixa de W − H à direita — a mesma medida
 *   (x, y+H) ── (x+H, y+H)   da inclinação dos paralelogramos.
 */
function quadradoEsquerdaParaPath(c) {
  const { x, y, altura: h } = c;

  return 'M' + arredondar(x) + ' ' + arredondar(y) +
         'H' + arredondar(x + h) +
         'V' + arredondar(y + h) +
         'H' + arredondar(x) +
         'Z';
}

/** O mesmo quadrado, encostado na lateral direita. A faixa sobra à esquerda. */
function quadradoDireitaParaPath(c) {
  const { x, y, largura: w, altura: h } = c;

  return 'M' + arredondar(x + w - h) + ' ' + arredondar(y) +
         'H' + arredondar(x + w) +
         'V' + arredondar(y + h) +
         'H' + arredondar(x + w - h) +
         'Z';
}

/** Despacha para a forma pedida. Cresce conforme novas formas entrarem. */
function elementoParaPath(celula, forma) {
  switch (forma) {
    case FORMA_PARALELOGRAMO_ESQUERDA:
      return paralelogramoEsquerdaParaPath(celula);
    case FORMA_QUADRADO_ESQUERDA:
      return quadradoEsquerdaParaPath(celula);
    case FORMA_QUADRADO_DIREITA:
      return quadradoDireitaParaPath(celula);
    case FORMA_PARALELOGRAMO_DIREITA:
    default:
      return paralelogramoDireitaParaPath(celula);
  }
}

/**
 * Sorteia uma forma, opcionalmente dentro de uma lista restrita.
 *
 * O gerador entra por parâmetro em vez de chamar Math.random direto: assim a
 * função continua pura e o teste consegue fixar o resultado. `Math.min` guarda
 * contra um gerador que devolva exatamente 1, que estouraria o índice.
 */
function sortearForma(aleatorio, permitidas) {
  const lista = permitidas && permitidas.length ? permitidas : FORMAS;
  const r = (aleatorio || Math.random)();
  return lista[Math.min(lista.length - 1, Math.floor(r * lista.length))];
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
