
// === WA Strict Override v9 ===
(function(){
  // CSS + Modal (idempotent)
  function ensureModal(){
    if(document.getElementById('qrModal')) return;
    var css = document.createElement('style');
    css.textContent = '.qr-modal{position:fixed;inset:0;display:none;place-items:center;z-index:99999;padding:24px}'
    +'.qr-modal[aria-hidden=false]{display:grid}.qr-backdrop{position:absolute;inset:0;background:rgba(0,0,0,.78)}'
    +'.qr-sheet{position:relative;z-index:1;width:min(620px,96vw);background:#0f1216;color:#e5e7eb;border:1px solid #263041;border-radius:20px;padding:16px;box-shadow:0 20px 80px rgba(0,0,0,.6);display:flex;flex-direction:column;gap:12px;align-items:center}'
    +'.qr-title{margin:0;font-size:18px;font-weight:800;align-self:stretch;display:flex;justify-content:space-between}'
    +'.qr-title .x{background:#0b0f14;color:#e5e7eb;border:1px solid #253144;border-radius:10px;padding:6px 10px;cursor:pointer}'
    +'#qrCanvas{image-rendering:crisp-edges;width:520px;height:520px;max-width:90vw;max-height:75vh;border-radius:12px;background:#fff}';
    document.head.appendChild(css);
    var wrap = document.createElement('div');
    wrap.innerHTML = '<div class="qr-modal" id="qrModal" aria-hidden="true" role="dialog" aria-label="Compartilhar"><div class="qr-backdrop"></div><div class="qr-sheet"><div class="qr-title"><span id="qrTitle">Compartilhar</span><button class="x" id="qrClose">Fechar</button></div><canvas id="qrCanvas" width="520" height="520"></canvas></div></div>';
    document.body.appendChild(wrap.firstElementChild);
    document.addEventListener('click', function(e){
      if(e.target && (e.target.id==='qrClose' || e.target.classList.contains('qr-backdrop'))){
        document.getElementById('qrModal').setAttribute('aria-hidden','true'); document.body.style.overflow='';
      }
    });
    document.addEventListener('keydown', function(e){ if(e.key==='Escape'){ document.getElementById('qrModal').setAttribute('aria-hidden','true'); document.body.style.overflow=''; } });
  }
  function openModal(){ ensureModal(); document.getElementById('qrModal').setAttribute('aria-hidden','false'); document.body.style.overflow='hidden'; }

  // QR draw
  function loadLocalLib(){
    return new Promise(function(resolve){
      if(window.QRCode && QRCode.toCanvas){ resolve(true); return; }
      var s=document.createElement('script');
      s.src='./assets/qrcode.min.js';
      s.onload=function(){ resolve(!!(window.QRCode && QRCode.toCanvas)); };
      s.onerror=function(){ resolve(false); };
      document.head.appendChild(s);
    });
  }
  async function drawQr(url){
    await loadLocalLib();
    var canvas = document.getElementById('qrCanvas');
    var ctx = canvas.getContext('2d');
    ctx.fillStyle='#fff'; ctx.fillRect(0,0,canvas.width,canvas.height);
    if(window.QRCode && QRCode.toCanvas){
      await QRCode.toCanvas(canvas, url, {width:canvas.width, margin:1, color:{dark:'#000000', light:'#FFFFFF'}, errorCorrectionLevel:'Q'});
    }else{
      // fallback by image into canvas
      var tmp = new Image(); tmp.crossOrigin = 'anonymous';
      tmp.onload = function(){ ctx.drawImage(tmp,0,0,canvas.width,canvas.height); };
      tmp.src = 'https://api.qrserver.com/v1/create-qr-code/?size='+canvas.width+'x'+canvas.height+'&data='+encodeURIComponent(url);
    }
  }

  // Data helpers
  function norm(s){ return (s||'').replace(/\s+/g,' ').trim(); }
  function pickText(el){ return norm(el && (el.textContent||'')); }
  function findAny(tr, sels){
    for(var i=0;i<sels.length;i++){ var el=tr.querySelector(sels[i]); if(el){ var t=pickText(el); if(t) return t; } }
    return '';
  }
  function DATAlookup(url){
    try{
      var D=(window.DATA && Array.isArray(window.DATA))? window.DATA : (window.__DATA_REF||null);
      if(Array.isArray(D)){
        var it = D.find(x => x && x.url === url);
        if(!it){
          var m = (url||'').match(/\/imoveis\/(\d+)\b/); var code = m? m[1] : '';
          if(code) it = D.find(x => x && (String(x.cod_sub_any||'')===code || (x.url||'').includes(code)));
        }
        return it || null;
      }
    }catch(e){}
    return null;
  }
  function upperNoEntrou(s){ return String(s||'').replace(/\bENTROU\b/gi,'').trim().toUpperCase(); }
  function ensureED(n){ n=String(n||'').trim(); if(!n) return ''; if(/^ED\.?/i.test(n)||/^EDIF/i.test(n)) return n.replace(/^ed\.?/i,'ED.'); return 'ED. ' + n; }

  function WA_template_strict(tr, url){
    function numOnly(x){ var m=String(x||'').match(/\d+/); return m? m[0] : ''; }
    // Prefer DATA
    var it = DATAlookup(url) || {};
    var tipo = upperNoEntrou(findAny(tr, ['.tipologia','.tipo','.categoria']) || it.tipo || '');
    var edificio = ensureED(it.edificio || findAny(tr, ['.condominio','.edificio','.empreendimento']));
    var end = it.endereco || findAny(tr, ['.endereco','.address','.local']) || '';
    var bairro = it.bairro || ''; var cidade = it.cidade || ''; var uf = it.uf || '';
    var endereco = end ? end + (bairro? ', '+bairro:'') + (cidade? ', '+cidade:'') + (uf? ' - '+uf:'') : '';

    var util = it.area_util!=null ? (it.area_util + ' m²') : findAny(tr, ['.util','.area-util']);
    var total= it.area_total!=null ? (it.area_total + ' m²') : findAny(tr, ['.total','.area-total']);
    var terr = (it.area_terreno!=null||it.area_lote!=null||it.terreno!=null)? ((it.area_terreno||it.area_lote||it.terreno)+' m²') : findAny(tr, ['.terreno','.area-terreno']);

    var quartos = (it.quartos!=null? it.quartos : numOnly(findAny(tr, ['.quartos'])));
    var suites  = (it.suites!=null ? it.suites  : numOnly(findAny(tr, ['.suites'])));
    var vagas   = (it.vagas!=null  ? it.vagas   : numOnly(findAny(tr, ['.vagas','.garagem'])));

    var valor = '';
    if(it.preco!=null){
      try{ valor = Number(it.preco).toLocaleString('pt-BR',{style:'currency',currency:'BRL'}); }catch(e){ valor = 'R$ '+it.preco; }
    }else{
      valor = findAny(tr, ['.valor','.preco']) || '';
    }

    var lines = [];
    lines.push('Olha só o imóvel que acabou de entrar no Sub-100!');
    lines.push('');
    lines.push('🏷️ ' + tipo + (edificio? ' | ' + edificio : ''));
    if(endereco) lines.push('📌 ' + endereco);
    var areas=[]; if(util) areas.push('📐 Útil: ' + util); if(total) areas.push('Total: ' + total); if(terr) areas.push('Terreno: ' + terr);
    if(areas.length) lines.push(areas.join('  -  '));
    var dorms=[]; if(quartos) dorms.push('🛏️ Quartos: ' + quartos); if(suites) dorms.push('Sendo Suíte: ' + suites);
    if(dorms.length) lines.push(dorms.join('  -  '));
    if(vagas) lines.push('🚘 Vagas: ' + vagas);
    if(valor) lines.push('💲 Valor: ' + valor);
    lines.push('');
    if(url) lines.push('🔗 Anúncio: ' + url);
    return lines.join('\n');
  }

  // Find "Anúncio" link near a button
  function findAnuncioLink(tr){
    var a = tr.querySelector('.btn-anuncio, a[title="Anúncio"], a[title*="Anúncio"]');
    if(a) return a;
    a = tr.querySelector('.actions a[href^="http"]');
    if(a) return a;
    var links = Array.from(tr.querySelectorAll('a[href]'));
    a = links.find(function(x){ var href=x.getAttribute('href')||''; var t=(x.textContent||'').trim(); return /^https?:\/\//.test(href)&&/an[úu]ncio|anuncio|abrir/i.test(t); });
    if(a) return a;
    return tr.querySelector('a[href^="http"]');
  }

  // Hard override the click for "Compartilhar" button — capture phase to beat other listeners
  document.addEventListener('click', async function ev(e){
    var btn = e.target.closest && e.target.closest('.btn-compartilhar, button, a');
    if(!btn) return;
    // Heuristics: label or class name contains "compart"
    var label = (btn.textContent||btn.getAttribute('title')||btn.className||'').toLowerCase();
    if(label.indexOf('compart') === -1) return;

    // From here, we take control
    e.preventDefault(); e.stopPropagation();

    ensureModal();

    var tr = btn.closest('tr, [data-row], .row, .card, li, .list-item') || document;
    var a  = findAnuncioLink(tr) || btn;
    var url = btn.dataset && btn.dataset.url ? btn.dataset.url : (a && (a.href || a.dataset.href)) || location.href;

    var wa = 'https://wa.me/?text=' + encodeURIComponent(WA_template_strict(tr, url));
    await drawQr(wa);
    openModal();
  }, true); // <-- capture

})();
