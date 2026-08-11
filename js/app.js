// Estado da ferramenta e ligação com a interface.
//
// Este arquivo é o único que toca no DOM. A geometria vem de grelha.js, que não
// sabe que existe uma tela — trocar a interface não deveria exigir mexer lá.

const DENSIDADE_MIN = 2;
const DENSIDADE_MAX = 48;

const estado = {
  grelhaVisivel: true,
  densidade: 12
};

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
