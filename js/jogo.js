/* ==========================================
   FUTEBOL ONLINE — jogo.js
   ========================================== */

document.getElementById('ano').textContent = new Date().getFullYear();

const slug = location.pathname.replace(/\/$/, '').split('/').pop();

function slugify(str) {
  return (str || '')
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
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

/* ── SEO ── */
function atualizarSEO(jogo) {
  const titulo = `Assistir ${jogo.timeA} x ${jogo.timeB} Ao Vivo – ${jogo.torneio} | Futebol Online`;
  const desc   = `Assista ${jogo.timeA} x ${jogo.timeB} ao vivo e de graça! Jogo válido pelo ${jogo.torneio} às ${jogo.horario}. Transmissão em HD no Futebol Online.`;
  const url    = `https://futebolonline.site/jogo/${slug}`;

  document.querySelector('title').textContent = titulo;
  document.getElementById('page-title').textContent = titulo;
  document.getElementById('page-desc').setAttribute('content', desc);
  document.getElementById('page-canonical').setAttribute('href', url);
  document.getElementById('og-title').setAttribute('content', titulo);
  document.getElementById('og-desc').setAttribute('content', desc);
  document.getElementById('og-url').setAttribute('content', url);
  document.getElementById('tw-title').setAttribute('content', titulo);
  document.getElementById('tw-desc').setAttribute('content', desc);

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
    "organizer": { "@type": "Organization", "name": jogo.torneio },
    "competitor": [
      { "@type": "SportsTeam", "name": jogo.timeA, "logo": jogo.escudoA || "" },
      { "@type": "SportsTeam", "name": jogo.timeB, "logo": jogo.escudoB || "" }
    ],
    "location": { "@type": "VirtualLocation", "url": url },
    "isAccessibleForFree": true,
    "inLanguage": "pt-BR"
  };
  document.getElementById('schema-jogo').textContent = JSON.stringify(schema);
  document.title = titulo;
}

/* ── ESCUDOS: tenta múltiplas fontes ── */
function setEscudo(id, src, nomeTime) {
  const el = document.getElementById(id);
  if (!el) return;

  // Se já tem URL direto (ex: thesportsdb), usa ele
  if (src && src.startsWith('http')) {
    el.src = src;
    el.alt = nomeTime || '';
    el.style.display = '';
    el.onerror = function() {
      // Fallback: tenta buscar pelo nome via API aberta do TheSportsDB
      const nomeBusca = encodeURIComponent(nomeTime || '');
      const fallbackUrl = `https://www.thesportsdb.com/api/v1/json/3/searchteams.php?t=${nomeBusca}`;
      fetch(fallbackUrl)
        .then(r => r.json())
        .then(d => {
          const badge = d.teams && d.teams[0] && d.teams[0].strTeamBadge;
          if (badge) { el.src = badge + '/tiny'; el.onerror = () => { el.style.display='none'; }; }
          else el.style.display = 'none';
        })
        .catch(() => { el.style.display = 'none'; });
    };
  } else if (nomeTime) {
    // Sem URL: busca direto pelo nome
    el.style.display = 'none';
    const nomeBusca = encodeURIComponent(nomeTime);
    fetch(`https://www.thesportsdb.com/api/v1/json/3/searchteams.php?t=${nomeBusca}`)
      .then(r => r.json())
      .then(d => {
        const badge = d.teams && d.teams[0] && d.teams[0].strTeamBadge;
        if (badge) {
          el.src = badge + '/tiny';
          el.alt = nomeTime;
          el.style.display = '';
          el.onerror = () => { el.style.display = 'none'; };
        }
      })
      .catch(() => {});
  } else {
    el.style.display = 'none';
  }
}

/* ── PREENCHE PÁGINA ── */
function preencherPagina(jogo) {
  document.getElementById('bc-torneio').textContent = jogo.torneio;
  document.getElementById('bc-jogo').textContent    = `${jogo.timeA} x ${jogo.timeB}`;

  setEscudo('escudo-a-bar', jogo.escudoA, jogo.timeA);
  setEscudo('escudo-b-bar', jogo.escudoB, jogo.timeB);
  document.getElementById('nome-a-bar').textContent = jogo.timeA;
  document.getElementById('nome-b-bar').textContent = jogo.timeB;

  document.getElementById('info-torneio').textContent  = jogo.torneio;
  document.getElementById('info-torneio2').textContent = jogo.torneio;
  document.getElementById('info-horario').textContent  = jogo.horario;
  document.getElementById('info-canal').textContent    = jogo.canalId || 'Sem canal';
  document.getElementById('info-nome-a').textContent   = jogo.timeA;
  document.getElementById('info-nome-b').textContent   = jogo.timeB;
  setEscudo('info-escudo-a', jogo.escudoA, jogo.timeA);
  setEscudo('info-escudo-b', jogo.escudoB, jogo.timeB);

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

/* ── PLAYER ── */
async function carregarPlayer(canalId) {
  const iframe = document.getElementById('player-iframe');
  const pload  = document.getElementById('player-loading');

  // Mostra banner de interstitial ao carregar o canal
  mostrarInterstitial();

  try {
    const res = await fetch(`${CONFIG.WORKER_URL}/canal/${encodeURIComponent(canalId)}`);
    if (!res.ok) throw new Error('Canal não encontrado');
    const data = await res.json();

    iframe.src = data.iframe;
    iframe.onload = () => {
      pload.style.display  = 'none';
      iframe.style.display = 'block';
    };
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

/* ── INTERSTITIAL (banner central ao carregar o canal) ── */
function mostrarInterstitial() {
  const overlay = document.getElementById('ad-interstitial');
  if (!overlay) return;
  overlay.style.display = 'flex';
  // Fecha após 8 segundos automaticamente se não fechar antes
  setTimeout(() => fecharInterstitial(), 8000);
}

function fecharInterstitial() {
  const overlay = document.getElementById('ad-interstitial');
  if (overlay) overlay.style.display = 'none';
}

/* ── VIDEO SLIDER a cada 6 minutos ── */
let videoSliderTimer = null;

function iniciarVideoSlider() {
  const SEIS_MINUTOS = 6 * 60 * 1000;
  videoSliderTimer = setInterval(() => {
    const el = document.getElementById('ad-video-slider');
    if (el) {
      el.style.display = 'block';
      // Recarrega o script do ad para re-exibir
      const old = document.getElementById('video-slider-script');
      if (old) old.remove();
      const s = document.createElement('script');
      s.id = 'video-slider-script';
      s.src = "//sophisticatedpin.com/bwXDVPs.dWGplq0kYqWjcx/OeJmW9LuPZrUIl-kIPvT/cxx/MwTRII1yMvzUMPt-NWzDEcx/M/jvUpzRNvwM";
      s.async = true;
      s.referrerPolicy = 'no-referrer-when-downgrade';
      document.body.appendChild(s);
    }
  }, SEIS_MINUTOS);
}

/* ── POPUNDER (só PC) ── */
function iniciarPopunder() {
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  if (isMobile) return;

  let popunderDisparado = false;
  document.addEventListener('click', function dispararPopunder() {
    if (popunderDisparado) return;
    popunderDisparado = true;
    const pop = window.open('', '_blank');
    if (pop) {
      pop.location.href = 'https://sorrowfulpsychology.com/7YQ2ye';
    }
    document.removeEventListener('click', dispararPopunder);
  }, { once: true });
}

/* ── MAIN ── */
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
    iniciarVideoSlider();
    iniciarPopunder();

  } catch (err) {
    console.error('Erro:', err);
    mostrarEstado('erro');
  }
}

/* ── COMPARTILHAR ── */
function compartilharWhatsApp() {
  const txt = encodeURIComponent(`⚽ Assista ao jogo ao vivo e de graça: ${location.href}`);
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
