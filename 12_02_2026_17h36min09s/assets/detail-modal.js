
// detail-modal.js — abre modal fullscreen via delegação de eventos
(function(){
  
// === [GALLERY HELPERS] =======================================================
function extractGallery(it){
  var urls = [];
  function push(u){
    if(!u) return;
    u = String(u).trim();
    if(!u) return;
    if(!/\.(jpg|jpeg|png|webp|gif)(\?.*)?$/i.test(u)) return;
    if(!urls.includes(u)) urls.push(u);
  }
  if(it && it.thumb) push(it.thumb);
  if(it){
    var keys = Object.keys(it);
    keys = keys.filter(k => k !== 'thumb');
    keys.sort(function(a,b){
      function ord(k){
        var m = String(k).toLowerCase().match(/(foto|image|img|galeria|photo)[^\d]*(\d+)?/i);
        return m ? parseInt(m[2]||'9999',10) : 99999;
      }
      return ord(a) - ord(b);
    });
    keys.forEach(k=>{
      const v = it[k];
      if (typeof v === 'string') push(v);
    });
  }
  if(it && Array.isArray(it.fotos)){
    it.fotos.forEach(push);
  }
  return urls;
}

function initCarousel(root){
  var car = root.querySelector('.carousel'); if(!car) return;
  var slides = Array.from(car.querySelectorAll('.slide'));
  var dots = Array.from(car.querySelectorAll('.dot'));
  var idx = 0;

  function show(i){
    if(!slides.length) return;
    idx = (i + slides.length) % slides.length;
    car.dataset.idx = String(idx);
    slides.forEach((s, n)=>{ s.style.transform = `translateX(${(n-idx)*100}%)`; });
    dots.forEach((d, n)=>{ d.classList.toggle('active', n===idx); });
    [idx-1, idx+1].forEach(n=>{ if(slides[(n+slides.length)%slides.length]){
      var img = slides[(n+slides.length)%slides.length].querySelector('img'); if(img && img.dataset.src){ img.src = img.dataset.src; delete img.dataset.src; }
    }});
  }
  function next(){ show(idx+1); }
  function prev(){ show(idx-1); }
  car.querySelector('.nav.prev')?.addEventListener('click', prev);
  car.querySelector('.nav.next')?.addEventListener('click', next);

  var onKey = (e)=>{
    if(!document.querySelector('#detailOverlay.open')) return;
    if(e.key==='ArrowRight') next();
    else if(e.key==='ArrowLeft') prev();
  };
  document.addEventListener('keydown', onKey);

  var startX = 0, dx = 0, touching = false;
  var touchArea = car.querySelector('.slides');
  touchArea.addEventListener('touchstart', e=>{ touching=true; startX=e.touches[0].clientX; dx=0; }, {passive:true});
  touchArea.addEventListener('touchmove', e=>{ if(!touching) return; dx = e.touches[0].clientX - startX; }, {passive:true});
  touchArea.addEventListener('touchend', e=>{
    if(!touching) return; touching=false;
    if(Math.abs(dx) > 40){ (dx<0 ? next : prev)(); }
    dx=0;
  });

  show(0);
}

function getRowAnchor(tr){
    return tr && (tr.querySelector('.actions a[title="Anúncio"]') || tr.querySelector('.actions a[href^="http"]'));
  }
  function lookupByUrl(url){
    try{
      return (window.DATA||[]).find(it => String(it.url||'')===String(url));
    }catch(e){ return null; }
  }
  function fmtMoney(v){
  try{
    if (v == null) return '';
    const s = String(v).trim();
    // If already formatted like "R$ 1.234,56", keep it
    if (/^\s*R\$/.test(s) || (/,/.test(s) && /\d[.,]\d/.test(s))) {
      return s.replace(/^\s+|\s+$/g,'');
    }
    // Normalize: keep digits, comma and dot; drop thousands dot; convert comma->dot
    const clean = s.replace(/[^0-9,.-]/g,'').replace(/\.(?=\d{3}(\D|$))/g,'').replace(',', '.');
    const n = (typeof v==='number') ? v : parseFloat(clean);
    if(!isFinite(n)) return s || '';
    return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }catch(e){ return String(v||''); }
}
  function fmtArea(v){ const n=parseFloat(v); return isFinite(n)? (Math.round(n)+' m²') : ''; }
  function sanitizeTitle(s){
  return String(s||'').replace(/\b(ENTROU|SAIU)\b/gi,'').replace(/\s{2,}/g,' ').trim();
}

function buildCard(it, row){
  var tipRaw = (it && it.tipo) ? String(it.tipo) : '';
  if(!tipRaw && row){
    var h = row.querySelector('.title-col h4'); tipRaw = h ? h.textContent : '';
  }
  var tip = sanitizeTitle(tipRaw).toUpperCase();
  var edif = (it && it.edificio) ? String(it.edificio).trim() : '';
  var edificioHtml = edif ? `<span class="edif">${edif}</span>` : '';

  var addrParts = [];
  if(it && it.endereco) addrParts.push(it.endereco);
  if(it && it.bairro) addrParts.push(it.bairro);
  if(it && it.cidade) addrParts.push(it.cidade);
  if(it && it.uf) addrParts.push(it.uf);
  var addr = addrParts.join(' · ');

  var preco  = fmtMoney(it && it.preco);

  function kv(label, val){ return val ? `<div class="kv"><span>${label}</span><strong>${val}</strong></div>` : ''; }
  var chips = ''
    + kv('Útil', fmtArea(it && it.area_util))
    + kv('Total', fmtArea(it && it.area_total))
    + kv('Terreno', fmtArea(it && it.area_terreno))
    + kv('Quartos', (it && it.quartos) || (it && it.qtd_quartos) || '')
    + kv('Suítes', (it && it.suites) || (it && it.qtd_suites) || '')
    + kv('Banheiros', (it && it.bwc) || (it && it.banheiros) || '')
    + kv('Vagas', (it && it.vagas) || (it && it.garagens) || '');

  var small = ''
    + kv('Anunciante', (it && it.anunciante) || '—')
    + kv('Código Sub100', (it && it.cod_sub_any) || (it && it.cod_sub100) || '—')
    + kv('Ref. Anunciante', (it && it.cod_anunc) || '—');

  var link = (it && it.url) ? String(it.url) : '#';
  var btns = `<div class="btns"><a class="btn open-link" href="${link}" target="_blank" rel="noopener">Abrir anúncio</a></div>`;

  var gallery = extractGallery(it);
  if((!gallery || !gallery.length) && row){
    var im = row.querySelector('img.thumb'); if(im && im.src) gallery = [im.src];
  }
  gallery = (gallery||[]).filter(Boolean);
  var slides = gallery.map((u, i)=>`<div class="slide" style="transform:translateX(${i*100}%);"><img ${i?('data-src="'+u+'"'):('src="'+u+'"')} alt="Foto ${i+1}"></div>`).join('');
  var dots = gallery.map((u, i)=>`<div class="dot${i===0?' active':''}"></div>`).join('');
  var mediaHtml = gallery.length
    ? `<div class="media"><div class="carousel" data-idx="0">
          <div class="slides">${slides}</div>
          ${gallery.length>1?'<button class="nav prev" aria-label="Anterior">‹</button><button class="nav next" aria-label="Próxima">›</button>':''}
          ${gallery.length>1?'<div class="dots">'+dots+'</div>':''}
        </div></div>`
    : `<div class="media"><div class="noimg">Sem imagem</div></div>`;

  return `
    <div class="detail-card">
      ${mediaHtml}
      <div class="info">
        <h2>${tip} ${edificioHtml}</h2>
        <div class="addr">${addr}</div>
        <div class="price">${preco || ''}</div>
        <div class="grid">${chips}</div>
        <div class="grid small">${small}</div>
        ${btns}
      </div>
    </div>`;
}

function ensureModal(){
    if(document.getElementById('detailOverlay')) return;
    const wrap=document.createElement('div'); wrap.id='detailOverlay'; wrap.className='detail-overlay';
    wrap.innerHTML=`<div class="detail-backdrop"></div>
      <div class="detail-window" role="dialog" aria-modal="true" aria-label="Detalhes do imóvel">
        <button class="detail-close" aria-label="Fechar">×</button>
        <div class="detail-content"></div></div>`;
    document.body.appendChild(wrap);
    
  // Inject minimal carousel CSS once
  if(!document.getElementById('carouselStyles')){
    var st = document.createElement('style'); st.id='carouselStyles';
    st.textContent = `
    .detail-overlay .media { position: relative; background:#0a0f1a; border-radius:12px; overflow:hidden; }
    .carousel { position: relative; width:100%; height: 60vh; min-height:300px; }
    .carousel .slides { position:absolute; inset:0; }
    .carousel .slide { position:absolute; inset:0; transition: transform .35s ease; }
    .carousel .slide img { width:100%; height:100%; object-fit:contain; display:block; background:#0a0f1a; }
    .carousel .nav { position:absolute; top:50%; transform: translateY(-50%); border:none; background:rgba(0,0,0,.35); color:#fff; width:44px; height:44px; border-radius:999px; font-size:28px; line-height:1; display:flex; align-items:center; justify-content:center; cursor:pointer; }
    .carousel .nav:hover { background:rgba(0,0,0,.5); }
    .carousel .nav.prev { left:10px; }
    .carousel .nav.next { right:10px; }
    .carousel .dots { position:absolute; left:0; right:0; bottom:8px; display:flex; gap:6px; justify-content:center; }
    .carousel .dot { width:8px; height:8px; border-radius:50%; background:#6b7280; opacity:.7; }
    .carousel .dot.active { background:#fff; opacity:1; }
    @media (max-width: 768px){
      .carousel { height: 48vh; min-height:240px; }
    }`;
    document.head.appendChild(st);
  }

wrap.addEventListener('click', e=>{
      if(e.target.classList.contains('detail-backdrop')||e.target.classList.contains('detail-close')){
        wrap.classList.remove('open');
      }
    });
    document.addEventListener('keydown', e=>{ if(e.key==='Escape') wrap.classList.remove('open'); });
  }
  
function openDetailFor(btn){
    ensureModal();
    const tr = btn.closest('tr');
    const a  = getRowAnchor(tr);
    const url = a ? a.href : null;
    let it = url ? lookupByUrl(url) : null;
    if(!it){
      // Fallback: montar a partir do DOM da linha
      const getTxt = sel => (tr.querySelector(sel)?.textContent || '').trim();
      const getNum = sel => { const t=getTxt(sel).replace(/\D+/g,''); return t?parseInt(t,10):''; };
      const imgEl = tr.querySelector('img.thumb');
      const foto = (imgEl && (imgEl.getAttribute('src')||'')) || '';
      it = {
        url: url || '',
        tipo: getTxt('.title-col h4') || 'Imóvel',
        edificio: '',
        endereco: getTxt('.title-col .sub'),
        bairro: '',
        cidade: '',
        uf: '',
        preco: (tr.querySelector('.price') ? tr.querySelector('.price').textContent : ''),
        area_util: getTxt('td:nth-child(3) .pill') || '',
        area_total: getTxt('td:nth-child(4) .pill') || '',
        area_terreno: getTxt('td:nth-child(5) .pill') || '',
        quartos: getNum('.badges .chip:nth-child(1)'),
        suites: getNum('.badges .chip:nth-child(2)'),
        bwc: getNum('.badges .chip:nth-child(3)'),
        vagas: getNum('.badges .chip:nth-child(4)'),
        anunciante: getTxt('td:nth-last-child(2)'),
        thumb: foto
      };
      try{ console.info('[modal-fallback] usando dados do DOM da linha para exibir detalhes.'); }catch(e){}
    }
    const overlay = document.getElementById('detailOverlay');
    overlay.querySelector('.detail-content').innerHTML = buildCard(it);
    overlay.classList.add('open');
  try{ initCarousel(overlay); }catch(e){}
}

  // Delegação global: funciona mesmo se o botão for criado depois
  document.addEventListener('click', function(e){
    const b = e.target.closest('.btn-img'); if(!b) return;
    e.preventDefault(); e.stopPropagation();
    openDetailFor(b);
  }, true);
})();