# ⚽ Futebol Online — Guia de Deploy

## Estrutura do Projeto

```
futebol-online/
├── index.html          # Página principal
├── css/
│   └── style.css       # Estilos
├── js/
│   ├── config.js       # ← URL do Worker (edite aqui!)
│   └── app.js          # Lógica principal
├── img/
│   └── logo.png        # Logo / Favicon
├── worker.js           # Cloudflare Worker (deploy separado)
├── sitemap.xml         # SEO sitemap
└── robots.txt          # SEO robots
```

---

## 1️⃣ Deixar a Planilha Pública

Na sua planilha Google Sheets:
- Clique em **Compartilhar** → **Qualquer pessoa com o link** → **Visualizador**
- Isso é obrigatório pro Worker conseguir ler os dados.

---

## 2️⃣ Deploy do Worker no Cloudflare

1. Crie uma conta em https://dash.cloudflare.com (gratuita)
2. Vá em **Workers & Pages** → **Create Application** → **Create Worker**
3. Cole o conteúdo de `worker.js` no editor
4. Clique em **Save and Deploy**
5. Copie a URL gerada (ex: `https://futebol-worker.SEU-USER.workers.dev`)

### Testando o Worker:
- `https://SEU-WORKER.workers.dev/jogos` → retorna os jogos em JSON
- `https://SEU-WORKER.workers.dev/canais` → retorna canais em JSON
- `https://SEU-WORKER.workers.dev/canal/NOME_DO_CANAL` → retorna iframe do canal

---

## 3️⃣ Atualizar a URL no Frontend

Abra `js/config.js` e troque:
```js
WORKER_URL: 'https://futebol-worker.SEU-USER.workers.dev',
```
pela URL real do seu Worker.

---

## 4️⃣ Deploy no GitHub + Vercel

### GitHub:
```bash
git init
git add .
git commit -m "first commit"
git remote add origin https://github.com/SEU-USER/futebol-online.git
git push -u origin main
```

### Vercel:
1. Acesse https://vercel.com
2. **Add New Project** → importe o repositório do GitHub
3. Deploy automático! ✅

---

## 5️⃣ Domínio Personalizado no Vercel

1. No Vercel → seu projeto → **Settings** → **Domains**
2. Adicione `futebolonline.site` e `www.futebolonline.site`
3. Configure os DNS no seu registrador de domínio com os records que o Vercel mostrar

---

## 6️⃣ Adicionar ao Google Search Console

1. Acesse https://search.google.com/search-console
2. Adicione a propriedade `https://futebolonline.site`
3. Verifique via arquivo HTML ou meta tag (o Vercel facilita isso)
4. Submeta o sitemap: `https://futebolonline.site/sitemap.xml`

---

## 7️⃣ Estrutura da Planilha (Referência)

### Aba 1 (gid=0) — Jogos do Dia:
| A | B | C | D | E | F | G |
|---|---|---|---|---|---|---|
| Time A | Time B | Torneio | Horário | ID do Canal | Escudo A (URL) | Escudo B (URL) |

### Aba 2 (gid=1324254801) — Canais:
| ... | B | ... | ... | ... | ... | G |
|-----|---|-----|-----|-----|-----|---|
| ... | Nome do Canal | ... | ... | ... | ... | Link do iFrame |

> O **ID do Canal** na coluna E da Aba 1 deve ser **idêntico** ao **Nome do Canal** na coluna B da Aba 2.

---

## 🔮 Melhorias Futuras

- Adicionar domínio próprio no Worker (CORS mais seguro)
- Favicon `.ico` gerado da logo
- Página de canal dedicada (SEO por jogo)
- Notificações push antes dos jogos
- Cache mais longo no Worker via KV Storage
