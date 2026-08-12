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
  densidade: 12
};

// Sobra de rolagem ainda não convertida em passo, e quando ela foi atualizada.
let acumuladoRolagem = 0;
let instanteUltimaRolagem = -Infinity;

// Elementos, resolvidos uma vez só.
const el = {};

function iniciar() {
  el.marca = document.getElementById('marca');
  el.tela = document.getElementById('tela');
  el.grelha = document.getElementById('grelha');
  el.btGrelha = document.getElementById('bt-grelha');
  el.btMais = document.getElementById('bt-densidade-mais');
  el.btMenos = document.getElementById('bt-densidade-menos');
  el.leitura = document.getElementById('leitura-densidade');

  el.marca.innerHTML = LOGO_SVG;

  el.btGrelha.addEventListener('click', alternarGrelha);
  el.btMais.addEventListener('click', () => mudarDensidade(+1));
  el.btMenos.addEventListener('click', () => mudarDensidade(-1));

  // passive:false é obrigatório — sem ele o preventDefault é ignorado e o
  // navegador trata a rolagem como navegação (recuar página, no trackpad).
  el.tela.addEventListener('wheel', aoRolar, { passive: false });

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

  if (!estado.grelhaVisivel) {
    el.grelha.setAttribute('d', '');
    return;
  }

  const g = calcularGrelha({
    largura: l,
    altura: a,
    densidade: estado.densidade,
    proporcao: LOGO_PROPORCAO
  });

  el.grelha.setAttribute('d', grelhaParaPath(g));
}

function limitar(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

document.addEventListener('DOMContentLoaded', iniciar);
