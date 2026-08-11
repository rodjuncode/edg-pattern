// Geometria da grelha.
//
// Funções puras: entram números, sai geometria. Nada aqui toca no DOM nem sabe
// que existe uma interface. É essa separação que vai permitir, mais adiante,
// gerar a padronagem para exportação sem passar pela tela.

/**
 * Calcula a grelha que cobre uma área, com células na proporção pedida.
 *
 * A célula tem proporção fixa (a do logo), então não dá para encaixar um número
 * inteiro de células nas duas direções ao mesmo tempo. A escolha aqui é:
 * a largura manda — `densidade` colunas cabem exatas na largura — e as linhas
 * transbordam. O excedente é distribuído meio a meio em cima e embaixo, para o
 * corte ficar simétrico e a grelha ler como um padrão infinito recortado pela
 * tela, e não como um bloco encostado no topo.
 */
function calcularGrelha({ largura, altura, densidade, proporcao }) {
  const larguraCelula = largura / densidade;
  const alturaCelula = larguraCelula / proporcao;

  // uma linha a mais garante que o transbordo cubra as duas bordas
  const linhas = Math.ceil(altura / alturaCelula) + 1;
  const alturaTotal = linhas * alturaCelula;

  return {
    colunas: densidade,
    linhas,
    larguraCelula,
    alturaCelula,
    // deslocamento vertical: negativo, sobe a grelha para centralizar o corte
    deslocY: -(alturaTotal - altura) / 2,
    largura,
    altura
  };
}

/**
 * Converte a grelha num único atributo `d` de path.
 *
 * Um path só, em vez de dezenas de <line>: menos nós no DOM, menos peso no SVG
 * exportado, e o navegador redesenha mais rápido quando a densidade muda.
 */
function grelhaParaPath(g) {
  const partes = [];

  // verticais — vão de borda a borda da área visível
  for (let c = 0; c <= g.colunas; c++) {
    const x = arredondar(c * g.larguraCelula);
    partes.push(`M${x} 0V${arredondar(g.altura)}`);
  }

  // horizontais — seguem o deslocamento que centraliza o corte
  for (let l = 0; l <= g.linhas; l++) {
    const y = arredondar(g.deslocY + l * g.alturaCelula);
    if (y < -1 || y > g.altura + 1) continue; // fora da tela, não desenha
    partes.push(`M0 ${y}H${arredondar(g.largura)}`);
  }

  return partes.join('');
}

/** Três casas bastam em coordenada de tela e encurtam bastante o SVG exportado. */
function arredondar(n) {
  return Math.round(n * 1000) / 1000;
}
