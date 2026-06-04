/* ==========================================
   FUTEBOL ONLINE — app.js
   ========================================== */

/* ── DATA HOJE ── */
(function setDataHoje() {
  const el = document.getElementById('dataHoje');
  const ano = document.getElementById('ano');
  const now = new Date();
  const opts = { weekday: 'long', day: '2-digit', month: 'long' };
  if (el) el.textContent = now.toLocaleDateString('pt-BR', opts);
  if (ano) ano.textContent = now.getFullYear();
})();

/* ── FETCH JOGOS ── */
async function carregarJogos() {
  mostrar('loading');
  try {
    const res = await fetch(`${CONFIG.WORKER_URL}/jogos`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.jogos || data.jogos.length === 0) {
      mostrar('sem-jogos');
    } else {
      renderJogos(data.jogos);
      mostrar('jogos-grid');
    }
  } catch (err) {
    console.error('Erro ao carregar jogos:', err);
    mostrar('erro');
  }
}

/* ── RENDER CARDS ── */
function renderJogos(jogos) {
  const grid = document.getElementById('jogos-grid');
  grid.innerHTML = '';

  jogos.forEach((jogo, i) => {
    const card = document.createElement('article');
    card.className = 'jogo-card';
    card.style.animationDelay = `${i * 60}ms`;
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', `Assistir ${jogo.timeA} x ${jogo.timeB}`);

    const escudoA = jogo.escudoA
      ? `<img src="${esc(jogo.escudoA)}" alt="Escudo ${esc(jogo.timeA)}" class="card-escudo" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='block'" /><span class="card-escudo-placeholder" style="display:none">⚽</span>`
      : `<span class="card-escudo-placeholder">⚽</span>`;

    const escudoB = jogo.escudoB
      ? `<img src="${esc(jogo.escudoB)}" alt="Escudo ${esc(jogo.timeB)}" class="card-escudo" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='block'" /><span class="card-escudo-placeholder" style="display:none">⚽</span>`
      : `<span class="card-escudo-placeholder">⚽</span>`;

    card.innerHTML = `
      <div class="card-top">
        <span class="card-torneio">${esc(jogo.torneio)}</span>
        <span class="card-horario">${esc(jogo.horario)}</span>
      </div>
      <div class="card-body">
        <div class="card-time">
          <div class="card-escudo-wrap">${escudoA}</div>
          <span class="card-nome">${esc(jogo.timeA)}</span>
        </div>
        <span class="card-vs">VS</span>
        <div class="card-time">
          <div class="card-escudo-wrap">${escudoB}</div>
          <span class="card-nome">${esc(jogo.timeB)}</span>
        </div>
      </div>
      <div class="card-footer">
        <button class="btn-assistir" aria-label="Assistir ao vivo">
          <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
          ASSISTIR AO VIVO
        </button>
      </div>
    `;

    const irParaJogo = () => {
      const slug = slugify(`${jogo.timeA}-vs-${jogo.timeB}`);
      window.location.href = `/jogo/${slug}`;
    };
    card.addEventListener('click', irParaJogo);
    card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') irParaJogo(); });

    grid.appendChild(card);
  });
}

/* ── SLUGIFY ── */
function slugify(str) {
  return (str || '')
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/* ── UTILS ── */
function mostrar(id) {
  ['loading', 'erro', 'sem-jogos', 'jogos-grid'].forEach(k => {
    const el = document.getElementById(k);
    if (el) el.style.display = k === id ? (k === 'jogos-grid' ? 'grid' : 'flex') : 'none';
  });
}

function esc(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/* ── INIT ── */
carregarJogos();
