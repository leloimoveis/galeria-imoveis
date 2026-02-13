
// qr-share-min.js — apenas QR; escaneou => abre WhatsApp share (chooser).
(function(){
  function waLink(title, url){
    var msg = encodeURIComponent((title||'') + '\n' + (url||''));
    return 'https://wa.me/?text=' + msg;
  }
  function findAnuncioLink(tr){
    return tr.querySelector('.actions a[title="Anúncio"]') ||
           tr.querySelector('.actions a[href^="http"]') ||
           Array.from(tr.querySelectorAll('a[href^="http"]')).find(function(x){return /anúncio|abrir/i.test(x.textContent||'');}) ||
           tr.querySelector('a[href^="http"]');
  }
  function ensureCssModal(){
    if(!document.getElementById('qr-min-css')){ /* já está no HTML */ }
    if(!document.getElementById('qrModal')){
      var wrap = document.createElement('div');
      wrap.innerHTML = '\n<div class="qr-modal" id="qrModal" aria-hidden="true" role="dialog" aria-label="Compartilhar via QR">\n  <div class="qr-backdrop"></div>\n  <div class="qr-sheet">\n    <div class="qr-title"><span id="qrTitle">Compartilhar</span><button class="x" id="qrClose">Fechar</button></div>\n    <canvas id="qrCanvas" width="520" height="520"></canvas>\n    <img id="qrImgFallback" alt="QR">\n  </div>\n</div>\n';
      document.body.appendChild(wrap.firstElementChild);
    }
  }
  function injectButtons(){
    document.querySelectorAll('tbody tr').forEach(function(tr){
      var a = findAnuncioLink(tr);
      if(!a) return;
      var below = a.nextElementSibling;
      if(below && below.classList && below.classList.contains('btn-compartilhar')) return;
      var br = document.createElement('br'); br.style.display='block';
      a.insertAdjacentElement('afterend', br);
      var btn = document.createElement('button');
      btn.type='button'; btn.className='btn-compartilhar'; btn.textContent='Compartilhar';
      btn.dataset.url = a.getAttribute('href') || '';
      a.insertAdjacentElement('afterend', btn);
    });
  }
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
  async function drawQr(messageUrl, title){
    var canvas = document.getElementById('qrCanvas');
    var imgF   = document.getElementById('qrImgFallback');
    var ctx = canvas.getContext('2d');
    ctx.fillStyle='#fff'; ctx.fillRect(0,0,canvas.width,canvas.height);
    var ok = await loadLocalLib();
    if(ok){
      await QRCode.toCanvas(canvas, messageUrl, {width:canvas.width, margin:1, color:{dark:'#000000', light:'#FFFFFF'}, errorCorrectionLevel:'Q'});
      imgF.style.display='none'; canvas.style.display='block';
      return;
    }
    var png = 'https://api.qrserver.com/v1/create-qr-code/?size='+canvas.width+'x'+canvas.height+'&data='+encodeURIComponent(messageUrl);
    imgF.src = png; imgF.style.display='block'; canvas.style.display='none';
  }
  function openModal(){ document.getElementById('qrModal').setAttribute('aria-hidden','false'); document.body.style.overflow='hidden'; }
  function closeModal(){ document.getElementById('qrModal').setAttribute('aria-hidden','true'); document.body.style.overflow=''; }
  document.addEventListener('click', function(e){
    if(e.target && (e.target.id==='qrClose' || (e.target.classList && e.target.classList.contains('qr-backdrop')))){ closeModal(); }
  });
  document.addEventListener('click', async function(e){
    var btn = e.target.closest && e.target.closest('.btn-compartilhar'); if(!btn) return;
    e.preventDefault(); e.stopPropagation();
    ensureCssModal();
    var tr = btn.closest('tr') || document;
    var a = findAnuncioLink(tr);
    var url = btn.dataset.url || (a && a.href) || location.href;
    var t  = tr.querySelector('.title-col h4, h4, h3, .title'); var title = t? t.textContent.trim() : (document.title || 'Imóvel');
    var wa = waLink(title, url);
    document.getElementById('qrTitle').textContent = 'Compartilhar: ' + title;
    await drawQr(wa, title);
    openModal();
  });
  var root=document.querySelector('#tbody')||document.querySelector('tbody')||document.body;
  if(root && window.MutationObserver){ new MutationObserver(injectButtons).observe(root,{childList:true,subtree:true}); }
  document.addEventListener('DOMContentLoaded', injectButtons);
  window.addEventListener('load', injectButtons);
  (function(){ var t=0,i=setInterval(function(){ injectButtons(); if(++t>40) clearInterval(i); },400); })();
})();
