/* ==========================================
   FUTEBOL ONLINE — jogo.js
   Página dedicada por jogo (/jogo/slug)
   ========================================== */

/* ── ANO NO FOOTER ── */
document.getElementById('ano').textContent = new Date().getFullYear();

/* ── LÊ SLUG DA URL ── */
// URL: /jogo/flamengo-vs-palmeiras
// O slug está no último segmento do pathname
const slug = location.pathname.replace(/\/$/, '').split('/').pop();

/* ── UTILS ── */
function slugify(str) {
  return (str || '')
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // tira acentos
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function esc(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function mostrarEstado(estado) {
  document.getElementById('page-loading').style.display = estado === 'loading' ? 'flex' : 'none';
  document.getElementById('page-erro').style.display    = estado === 'erro'    ? 'flex' : 'none';
  document.getElementById('jogo-content').style.display = estado === 'ok'      ? 'block': 'none';
}

/* ── ATUALIZA SEO DINAMICAMENTE ── */
function atualizarSEO(jogo) {
  const titulo  = `Assistir ${jogo.timeA} x ${jogo.timeB} Ao Vivo – ${jogo.torneio} | Futebol Online`;
  const desc    = `Assista ${jogo.timeA} x ${jogo.timeB} ao vivo e de graça! Jogo válido pelo ${jogo.torneio} às ${jogo.horario}. Transmissão em HD no Futebol Online.`;
  const url     = `https://futebolonline.site/jogo/${slug}`;

  document.getElementById('page-title').textContent     = titulo;
  document.querySelector('title').textContent            = titulo;
  document.getElementById('page-desc').setAttribute('content', desc);
  document.getElementById('page-canonical').setAttribute('href', url);
  document.getElementById('og-title').setAttribute('content', titulo);
  document.getElementById('og-desc').setAttribute('content', desc);
  document.getElementById('og-url').setAttribute('content', url);
  document.getElementById('tw-title').setAttribute('content', titulo);
  document.getElementById('tw-desc').setAttribute('content', desc);

  // Schema.org SportsEvent
  const schema = {
    "@context": "https://schema.org",
    "@type": "SportsEvent",
    "name": `${jogo.timeA} x ${jogo.timeB}`,
    "description": desc,
    "url": url,
    "sport": "Futebol",
    "startDate": jogo.horario,
    "eventStatus": "https://schema.org/EventScheduled",
    "eventAttendanceMode": "https://schema.org/OnlineEventAttendanceMode",
    "organizer": {
      "@type": "Organization",
      "name": jogo.torneio
    },
    "competitor": [
      { "@type": "SportsTeam", "name": jogo.timeA },
      { "@type": "SportsTeam", "name": jogo.timeB }
    ],
    "location": {
      "@type": "VirtualLocation",
      "url": url
    },
    "isAccessibleForFree": true,
    "inLanguage": "pt-BR"
  };
  document.getElementById('schema-jogo').textContent = JSON.stringify(schema);

  // Título da aba
  document.title = titulo;
}

/* ── PREENCHE PÁGINA ── */
function preencherPagina(jogo) {
  // Breadcrumb
  document.getElementById('bc-torneio').textContent = jogo.torneio;
  document.getElementById('bc-jogo').textContent    = `${jogo.timeA} x ${jogo.timeB}`;

  // Times bar (abaixo do player)
  setEscudo('escudo-a-bar', jogo.escudoA, jogo.timeA);
  setEscudo('escudo-b-bar', jogo.escudoB, jogo.timeB);
  document.getElementById('nome-a-bar').textContent = jogo.timeA;
  document.getElementById('nome-b-bar').textContent = jogo.timeB;

  // Info lateral
  document.getElementById('info-torneio').textContent  = jogo.torneio;
  document.getElementById('info-torneio2').textContent = jogo.torneio;
  document.getElementById('info-horario').textContent  = jogo.horario;
  document.getElementById('info-canal').textContent    = jogo.canalId;
  document.getElementById('info-nome-a').textContent   = jogo.timeA;
  document.getElementById('info-nome-b').textContent   = jogo.timeB;
  setEscudo('info-escudo-a', jogo.escudoA, jogo.timeA);
  setEscudo('info-escudo-b', jogo.escudoB, jogo.timeB);

  // Texto SEO
  document.getElementById('seo-text').innerHTML = `
    <h2>Assistir ${esc(jogo.timeA)} x ${esc(jogo.timeB)} Ao Vivo</h2>
    <p>
      O confronto entre <strong>${esc(jogo.timeA)}</strong> e <strong>${esc(jogo.timeB)}</strong>
      é válido pelo <strong>${esc(jogo.torneio)}</strong> e acontece hoje às <strong>${esc(jogo.horario)}</strong>.
      Você pode assistir ao jogo ao vivo e de graça aqui no <strong>Futebol Online</strong>,
      com transmissão em HD direto no seu navegador, sem precisar baixar nenhum aplicativo.
    </p>
    <p>
      Acompanhe todos os jogos de hoje pelo ${esc(jogo.torneio)} e outros campeonatos
      na nossa página principal. Transmissões ao vivo, gratuitas e em alta definição.
    </p>
  `;
}

function setEscudo(id, src, alt) {
  const el = document.getElementById(id);
  if (src) { el.src = src; el.alt = alt; }
  else { el.style.display = 'none'; }
}

/* ── CARREGA PLAYER ── */
async function carregarPlayer(canalId) {
  const iframe = document.getElementById('player-iframe');
  const pload  = document.getElementById('player-loading');

  try {
    const res = await fetch(`${CONFIG.WORKER_URL}/canal/${encodeURIComponent(canalId)}`);
    if (!res.ok) throw new Error('Canal não encontrado');
    const data = await res.json();

    iframe.src = data.iframe;
    iframe.onload = () => {
      pload.style.display  = 'none';
      iframe.style.display = 'block';
    };
    // fallback caso o onload não dispare (alguns iframes bloqueiam)
    setTimeout(() => {
      if (iframe.style.display === 'none') {
        pload.style.display  = 'none';
        iframe.style.display = 'block';
      }
    }, 4000);
  } catch (err) {
    pload.innerHTML = `<span style="font-size:2rem">⚠️</span><p style="color:var(--text-muted)">Canal indisponível no momento.</p>`;
  }
}

/* ── MAIN: busca todos os jogos e encontra o certo pelo slug ── */
async function init() {
  if (!slug || slug === 'jogo') {
    mostrarEstado('erro');
    return;
  }

  mostrarEstado('loading');

  try {
    const res = await fetch(`${CONFIG.WORKER_URL}/jogos`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    const jogo = (data.jogos || []).find(j => {
      const s = slugify(`${j.timeA}-vs-${j.timeB}`);
      return s === slug;
    });

    if (!jogo) {
      mostrarEstado('erro');
      return;
    }

    atualizarSEO(jogo);
    preencherPagina(jogo);
    mostrarEstado('ok');
    carregarPlayer(jogo.canalId);

  } catch (err) {
    console.error('Erro:', err);
    mostrarEstado('erro');
  }
}

/* ── COMPARTILHAR ── */
function compartilharWhatsApp() {
  const url  = encodeURIComponent(location.href);
  const txt  = encodeURIComponent(`⚽ Assista ao jogo ao vivo e de graça: ${location.href}`);
  window.open(`https://wa.me/?text=${txt}`, '_blank');
}

function copiarLink() {
  navigator.clipboard.writeText(location.href).then(() => {
    const btn = document.getElementById('btn-copiar');
    btn.classList.add('copiado');
    btn.querySelector('svg').style.display = 'none';
    btn.innerHTML += '<span> ✓ Copiado!</span>';
    setTimeout(() => location.reload(), 2000);
  });
}

init();
