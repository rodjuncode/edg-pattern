// Estado da ferramenta e ligação com a interface.
//
// Este arquivo é o único que toca no DOM. A geometria vem de grelha.js, que não
// sabe que existe uma tela — trocar a interface não deveria exigir mexer lá.

const DENSIDADE_MIN = 2;
const DENSIDADE_MAX = 48;

// Rolagem. Roda de mouse e trackpad são dispositivos diferentes disfarçados de
// um só evento: a roda manda um deltaY grande por entalhe (~100), o trackpad
// manda uma enxurrada de valores pequenos. Tratados igual, um gesto de trackpad
// atravessaria a faixa inteira de densidade.
const ROLAGEM_ENTALHE = 50;  // acima disto é entalhe de roda: vale um passo, e só
const ROLAGEM_LIMIAR  = 26;  // abaixo, acumula até somar isto — ritmo do trackpad
const ROLAGEM_PAUSA   = 250; // ms parado que encerram o gesto e descartam a sobra

const estado = {
  grelhaVisivel: true,
  borracha: false,
  densidade: 12,

  // A padronagem. Chave "coluna,linha" para o nome da forma que preenche a
  // célula. Guardar índices, e não pixels, é o que permite a mesma padronagem
  // ser redesenhada quando a janela muda de tamanho.
  preenchidas: new Map()
};

// Sobra de rolagem ainda não convertida em passo, e quando ela foi atualizada.
let acumuladoRolagem = 0;
let instanteUltimaRolagem = -Infinity;

// Última grelha calculada. Guardada para que o realce siga o cursor sem
// precisar recalcular tudo, e para reposicioná-lo quando a densidade muda.
let grelhaAtual = null;

// Posição do cursor na tela. `ativo` só vale para mouse de verdade — ver aoMover.
const ponteiro = { x: 0, y: 0, ativo: false };

// Elementos, resolvidos uma vez só.
const el = {};

function iniciar() {
  el.marca = document.getElementById('marca');
  el.tela = document.getElementById('tela');
  el.grelha = document.getElementById('grelha');
  el.realce = document.getElementById('realce');
  el.padronagem = document.getElementById('padronagem');
  el.btGrelha = document.getElementById('bt-grelha');
  el.btMais = document.getElementById('bt-densidade-mais');
  el.btMenos = document.getElementById('bt-densidade-menos');
  el.leitura = document.getElementById('leitura-densidade');

  el.marca.innerHTML = LOGO_SVG;

  el.btBorracha = document.getElementById('bt-borracha');

  el.btGrelha.addEventListener('click', alternarGrelha);
  el.btBorracha.addEventListener('click', alternarBorracha);
  el.btMais.addEventListener('click', () => mudarDensidade(+1));
  el.btMenos.addEventListener('click', () => mudarDensidade(-1));

  // passive:false é obrigatório — sem ele o preventDefault é ignorado e o
  // navegador trata a rolagem como navegação (recuar página, no trackpad).
  el.tela.addEventListener('wheel', aoRolar, { passive: false });

  // Clique preenche ou esvazia a célula. Vale para toque também: só o realce
  // é exclusivo do mouse, preencher não.
  el.tela.addEventListener('click', aoClicar);

  // Realce da célula sob o cursor.
  el.tela.addEventListener('pointermove', aoMover);
  el.tela.addEventListener('pointerdown', aoMover);
  el.tela.addEventListener('pointerleave', soltarPonteiro);
  el.tela.addEventListener('pointercancel', soltarPonteiro);

  // A janela perder o foco não dispara pointerleave. Sem isto, o realce fica
  // aceso enquanto o usuário está em outro programa.
  window.addEventListener('blur', soltarPonteiro);

  // ResizeObserver em vez de window.resize: pega também a mudança de largura
  // causada pela barra lateral virar bandeja, que o resize da janela não
  // descreve com precisão.
  new ResizeObserver(redesenhar).observe(el.tela);

  sincronizarControles();
  redesenhar();
}

function alternarGrelha() {
  estado.grelhaVisivel = !estado.grelhaVisivel;
  sincronizarControles();
  redesenhar();
}

function alternarBorracha() {
  estado.borracha = !estado.borracha;
  sincronizarControles();
}

function mudarDensidade(passo) {
  const nova = limitar(estado.densidade + passo, DENSIDADE_MIN, DENSIDADE_MAX);
  if (nova === estado.densidade) return;
  estado.densidade = nova;

  // Mexer na densidade com a grelha escondida não daria retorno nenhum;
  // acender de volta é o que o gesto pede.
  if (!estado.grelhaVisivel) estado.grelhaVisivel = true;

  sincronizarControles();
  redesenhar();
}

/** Converte a posição de um evento em célula da grelha, ou null. */
function celulaDoEvento(ev) {
  if (!grelhaAtual) return null;
  const r = el.tela.getBoundingClientRect();
  return celulaEm(grelhaAtual, ev.clientX - r.left, ev.clientY - r.top);
}

function chaveDe(coluna, linha) {
  return coluna + ',' + linha;
}

function formaEm(coluna, linha) {
  return estado.preenchidas.get(chaveDe(coluna, linha));
}

/**
 * As formas que a célula pode receber, dado o que está diretamente acima dela.
 *
 * Só a vizinha de cima manda. A de baixo não restringe a escolha — ela é
 * ajustada depois, por propagarAbaixo.
 */
function permitidasEm(coluna, linha) {
  return formasCompativeisAbaixo(formaEm(coluna, linha - 1));
}

/**
 * Um clique na tela. Três comportamentos, conforme o modo e o estado da célula:
 *
 *   borracha ligada  → esvazia
 *   célula vazia     → preenche com uma forma sorteada entre as permitidas
 *   célula ocupada   → cicla para a próxima forma permitida
 */
function aoClicar(ev) {
  const celula = celulaDoEvento(ev);
  if (!celula) return;

  const { coluna, linha } = celula;
  const chave = chaveDe(coluna, linha);
  const atual = estado.preenchidas.get(chave);

  if (estado.borracha) {
    if (!atual) return;
    estado.preenchidas.delete(chave);
    // Esvaziar não quebra encaixe nenhum: célula vazia não impõe restrição.
  } else if (atual) {
    estado.preenchidas.set(chave, proximaForma(atual, permitidasEm(coluna, linha)));
    propagarAbaixo(coluna, linha);
  } else {
    // Sorteia aqui, uma vez, e guarda. Sortear no desenho faria a padronagem
    // se reembaralhar a cada resize ou mudança de densidade.
    estado.preenchidas.set(chave, sortearForma(null, permitidasEm(coluna, linha)));
    propagarAbaixo(coluna, linha);
  }

  desenharPadronagem();
}

/**
 * Restaura o encaixe da coluna, descendo a partir da célula alterada.
 *
 * Se a célula de baixo ficou incompatível, sorteia para ela uma forma que
 * encaixe. E como isso é, de novo, alterar uma célula ocupada, a verificação
 * continua descendo — parar no primeiro nível deixaria a junta seguinte
 * quebrada, e a continuidade do fluxo é justamente o que a regra protege.
 *
 * Termina sozinho: para na primeira célula vazia, ou quando o sorteio calha
 * numa forma que já encaixa com a de baixo.
 */
function propagarAbaixo(coluna, linha) {
  let l = linha;

  while (true) {
    const acima = formaEm(coluna, l);
    const abaixo = formaEm(coluna, l + 1);

    if (!acima || !abaixo) return;
    if (saoCompativeis(acima, abaixo)) return;

    estado.preenchidas.set(chaveDe(coluna, l + 1),
      sortearForma(null, formasCompativeisAbaixo(acima)));
    l++;
  }
}

function desenharPadronagem() {
  if (!grelhaAtual) return;
  el.padronagem.setAttribute('d', padronagemParaPath(grelhaAtual, estado.preenchidas));
}

/**
 * Move o realce para a célula sob o cursor.
 *
 * Só mouse acende o realce. Tocar a tela num celular gera um `pointermove` de
 * `pointerType: 'touch'` e, logo depois, eventos de mouse emulados — é assim
 * que nasce o realce fantasma, que fica aceso no lugar do último toque porque
 * nunca vem um `pointerleave` para apagá-lo.
 *
 * Filtrar por `pointerType` resolve os dois casos de uma vez, inclusive o do
 * laptop com tela sensível, onde `@media (hover: hover)` acerta que existe
 * mouse e mesmo assim o dedo deixaria rastro.
 */
function aoMover(ev) {
  if (ev.pointerType !== 'mouse') {
    soltarPonteiro();  // dedo ou caneta apagam qualquer realce herdado
    return;
  }

  const r = el.tela.getBoundingClientRect();
  ponteiro.x = ev.clientX - r.left;
  ponteiro.y = ev.clientY - r.top;
  ponteiro.ativo = true;
  atualizarRealce();
}

function soltarPonteiro() {
  ponteiro.ativo = false;
  atualizarRealce();
}

/**
 * Posiciona o retângulo de realce, ou o esconde.
 *
 * Chamado também no redesenho: mudar a densidade com o cursor parado tem de
 * mover o realce para a célula nova sob aquele mesmo ponto.
 */
function atualizarRealce() {
  // Sem grelha visível não há "as demais" de que a célula se diferencie —
  // um retângulo solto no vazio não comunicaria interação, confundiria.
  if (!ponteiro.ativo || !estado.grelhaVisivel || !grelhaAtual) {
    el.realce.classList.add('oculto');
    return;
  }

  const celula = celulaEm(grelhaAtual, ponteiro.x, ponteiro.y);
  if (!celula) {
    el.realce.classList.add('oculto');
    return;
  }

  el.realce.setAttribute('x', celula.x);
  el.realce.setAttribute('y', celula.y);
  el.realce.setAttribute('width', celula.largura);
  el.realce.setAttribute('height', celula.altura);
  el.realce.classList.remove('oculto');
}

/**
 * Rolagem sobre a área de desenho controla a densidade.
 *
 * Para cima, mais denso — mesma direção do botão "+", que fica acima do "−".
 */
function aoRolar(ev) {
  ev.preventDefault();
  if (ev.deltaY === 0) return;

  // Gestos são independentes: parou, a sobra do anterior é descartada. Sem
  // isto, meio passo guardado agora se somaria ao gesto de daqui a um minuto.
  if (ev.timeStamp - instanteUltimaRolagem > ROLAGEM_PAUSA) acumuladoRolagem = 0;
  instanteUltimaRolagem = ev.timeStamp;

  // Dispositivo discreto — um evento, um passo.
  //
  // Dois casos caem aqui. deltaMode diferente de zero (linhas ou páginas) só
  // vem de roda ou tecla: trackpad sempre reporta pixels, então a unidade já
  // denuncia o dispositivo, sem precisar medir. E, em pixels, um valor grande
  // é entalhe de roda. Acumular qualquer um dos dois faria um giro só valer
  // dois ou três passos.
  if (ev.deltaMode !== 0 || Math.abs(ev.deltaY) >= ROLAGEM_ENTALHE) {
    acumuladoRolagem = 0;
    mudarDensidade(ev.deltaY > 0 ? -1 : +1);
    return;
  }

  // Trackpad: soma os pedaços até fechar um passo.
  acumuladoRolagem += ev.deltaY;
  while (Math.abs(acumuladoRolagem) >= ROLAGEM_LIMIAR) {
    const sentido = Math.sign(acumuladoRolagem);
    acumuladoRolagem -= sentido * ROLAGEM_LIMIAR;
    mudarDensidade(sentido > 0 ? -1 : +1);
  }
}

/** Deixa a interface refletindo o estado — inclusive para leitores de tela. */
function sincronizarControles() {
  el.btGrelha.setAttribute('aria-pressed', String(estado.grelhaVisivel));
  el.btBorracha.setAttribute('aria-pressed', String(estado.borracha));
  el.tela.classList.toggle('apagando', estado.borracha);
  el.leitura.textContent = estado.densidade;
  el.btMenos.disabled = estado.densidade <= DENSIDADE_MIN;
  el.btMais.disabled = estado.densidade >= DENSIDADE_MAX;
}

function redesenhar() {
  const { width, height } = el.tela.getBoundingClientRect();
  if (width < 1 || height < 1) return;

  // 1 unidade do viewBox = 1 pixel de tela, sem arredondar: a largura do
  // elemento é fracionária, e arredondar aqui faria o SVG escalar de leve —
  // o bastante para a espessura sair de 1px e o crispEdges perder o efeito.
  const l = Math.round(width * 100) / 100;
  const a = Math.round(height * 100) / 100;
  el.tela.setAttribute('viewBox', `0 0 ${l} ${a}`);

  // A geometria é calculada sempre, mesmo com a grelha apagada: a padronagem
  // precisa dela para se desenhar, e o clique para saber onde caiu. Apagar a
  // grelha esconde o guia de construção, não o desenho.
  grelhaAtual = calcularGrelha({
    largura: l,
    altura: a,
    densidade: estado.densidade,
    proporcao: LOGO_PROPORCAO
  });

  el.grelha.setAttribute('d', estado.grelhaVisivel ? grelhaParaPath(grelhaAtual) : '');
  desenharPadronagem();
  atualizarRealce();
}

function limitar(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

document.addEventListener('DOMContentLoaded', iniciar);
