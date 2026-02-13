(function(){
  var SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path fill="#0b0f14" d="M3 3h8v8H3V3zm2 2v4h4V5H5zm6-2h8v8h-8V3zm2 2v4h4V5h-4zM3 13h8v8H3v-8zm2 2v4h4v-4H5zM15 13h2v2h-2v-2zm4 0h2v2h-2v-2zm-4 4h2v2h-2v-2zm4 0h2v6h-6v-2h4v-4z"/></svg>';
  function ensureQr(cell){
    if(!cell) return null;
    var qr = cell.querySelector('.btn-compartilhar');
    var anuncio = cell.querySelector('.btn-anuncio, a[title="Anúncio"]') || cell.querySelector('a[href^="http"]');
    if(!qr){
      qr = document.createElement('button');
      qr.type='button';
      qr.className='btn-compartilhar';
      qr.setAttribute('aria-label','Gerar QR Code');
      qr.setAttribute('title','Gerar QR Code');
      if(anuncio && anuncio.getAttribute) qr.dataset.url = anuncio.getAttribute('href') || '';
      if(anuncio && anuncio.insertAdjacentElement) anuncio.insertAdjacentElement('afterend', qr);
      else cell.appendChild(qr);
    }else if((!qr.dataset.url || qr.dataset.url==='') && anuncio && anuncio.getAttribute){
      qr.dataset.url = anuncio.getAttribute('href') || '';
    }
    return qr;
  }
  function iconize(){
    document.querySelectorAll('td.actions').forEach(function(cell){
      var qr = ensureQr(cell);
      if(!qr) return;
      // Turn into icon-only and ensure visible SVG (not affected by color: transparent)
      if(!qr.querySelector('svg')){
        qr.innerHTML = SVG;
      }
      qr.classList.add('icon-only');
      // Avoid duplicate pseudo-element icons
      qr.style.setProperty('--qr-svg', 'inline', 'important');
    });
  }
  function start(){
    iconize();
    if(window.MutationObserver && !window.__qrIconObs){
      window.__qrIconObs = new MutationObserver(function(){
        clearTimeout(window.__qrIconDebounce);
        window.__qrIconDebounce = setTimeout(iconize, 120);
      });
      var t = document.body || document.documentElement;
      if(t){ window.__qrIconObs.observe(t, {childList:true, subtree:true}); }
    }
    ['hashchange','popstate'].forEach(function(ev){
      window.addEventListener(ev, function(){ setTimeout(iconize, 100); }, {passive:true});
    });
    ['click','change','input'].forEach(function(ev){
      document.addEventListener(ev, function(e){
        var x=e.target; if(!x) return;
        if(x.matches && (x.matches('.pagination *, select, input, button') || x.closest('.pagination'))){
          setTimeout(iconize, 80);
        }
      }, true);
    });
    var tries=0, i=setInterval(function(){ iconize(); if(++tries>300) clearInterval(i); }, 400);
  }
  if(document.readyState==='loading'){ document.addEventListener('DOMContentLoaded', start); } else { start(); }
  window.addEventListener('load', iconize);
})();