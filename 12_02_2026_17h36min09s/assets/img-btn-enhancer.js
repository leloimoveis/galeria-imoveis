// img-btn-enhancer.js — insere botão IMG ao lado do QR (mantém lógica do QR intacta).
(function(){
  function ensureImgButton(){
    document.querySelectorAll('td.actions').forEach(function(cell){
      const qr = cell.querySelector('.btn-compartilhar');
      if(!qr) return;
      if(cell.querySelector('.btn-img')) return; // já existe
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn-img';
      btn.setAttribute('title','Imagem');
      btn.setAttribute('aria-label','Imagem');
      btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" role="img"><path fill="currentColor" d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm0 2v9.586l-3.293-3.293a1 1 0 0 0-1.414 0L10 15.586l-1.293-1.293a1 1 0 0 0-1.414 0L5 15.586V5h14zM5 19v-1.586l2.293-2.293 4 4H5zm6.414 0-2-2L14 12.414 19 17v2h-7.586zM8 9a2 2 0 1 1 4 0a2 2 0 0 1-4 0z"/></svg>';
      qr.insertAdjacentElement('afterend', btn);
    });
  }
  document.addEventListener('DOMContentLoaded', ensureImgButton);
  window.addEventListener('load', ensureImgButton);
  var tries=0, i=setInterval(function(){ ensureImgButton(); if(++tries>30) clearInterval(i); }, 400);
})();