(function(){
  try{
    // Early apply theme to avoid FOUC
    var saved = null;
    try { saved = localStorage.getItem('theme'); } catch(_) {}
    var prefersLight = false;
    try { prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches; } catch(_) {}
    var theme = saved || (prefersLight ? 'light' : 'dark');
    document.documentElement.setAttribute('data-theme', theme);
  }catch(_){}

  function setTheme(next){
    document.documentElement.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch(_){}
    var btn = document.getElementById('themeToggleBtn');
    if (btn) {
      btn.setAttribute('aria-pressed', String(next === 'light'));
      btn.setAttribute('data-state', next);
      var txt = next === 'light' ? 'Claro' : 'Escuro';
      var icon = next === 'light' ? '☀️' : '🌙';
      var label = btn.querySelector('.label');
      if(label) label.textContent = txt;
      var ico = btn.querySelector('.icon');
      if(ico) ico.textContent = icon;
    }
  }

  function makeToggle(){
    // Bottom floating toggle disabled: theme selector apenas no topo.
    return;

    if (document.getElementById('themeToggleBtn')) return; // idempotent
    var btn = document.createElement('button');
    btn.id = 'themeToggleBtn';
    btn.className = 'theme-toggle';
    btn.type = 'button';
    btn.setAttribute('role','switch');
    btn.setAttribute('aria-label','Alternar tema claro/escuro');
    btn.innerHTML = '<span class="icon" aria-hidden="true"></span><span class="label"></span><span class="knob" aria-hidden="true"></span>';
    btn.addEventListener('click', function(){
      var current = document.documentElement.getAttribute('data-theme') || 'dark';
      setTheme(current === 'light' ? 'dark' : 'light');
    });
    document.body.appendChild(btn);
    // Sync UI state
    var current = document.documentElement.getAttribute('data-theme') || 'dark';
    setTheme(current);
  }

  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', makeToggle);
  }else{
    makeToggle();
  }
})();


(function(){
  function setThemeStateTo(btn, theme){
    if (!btn) return;
    btn.setAttribute('aria-pressed', String(theme === 'light'));
    btn.setAttribute('data-state', theme);
    var label = btn.querySelector('.label'); if (label) label.textContent = theme === 'light' ? 'Claro' : 'Escuro';
    var icon = btn.querySelector('.icon'); if (icon) icon.textContent = theme === 'light' ? '☀️' : '🌙';
  }
  function getTheme(){ return document.documentElement.getAttribute('data-theme') || 'dark'; }
  function setThemeBoth(next){
    document.documentElement.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch(_){}
    setThemeStateTo(document.getElementById('themeToggleBtn'), next);
    setThemeStateTo(document.getElementById('themeToggleBtnTop'), next);
  }
  function makeTopbarToggle(){
    var mount = document.getElementById('themeToggleMount');
    if (!mount || document.getElementById('themeToggleBtnTop')) return;
    var btn = document.createElement('button');
    btn.id = 'themeToggleBtnTop';
    btn.className = 'theme-toggle topbar';
    btn.type = 'button';
    btn.setAttribute('role','switch');
    btn.setAttribute('aria-label','Alternar tema claro/escuro');
    btn.innerHTML = '<span class="icon" aria-hidden="true"></span><span class="label"></span><span class="knob" aria-hidden="true"></span>';
    btn.addEventListener('click', function(){
      setThemeBoth( getTheme()==='light' ? 'dark':'light');
    });
    mount.parentNode.insertBefore(btn, mount.nextSibling);
    setThemeStateTo(btn, getTheme());
  }
  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', makeTopbarToggle);
  }else{
    makeTopbarToggle();
  }
})();


(function(){
  var SUN = '<svg class="ico ico-sun" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 6a6 6 0 1 1 0 12A6 6 0 0 1 12 6Zm0-4h2v3h-2V2Zm0 17h2v3h-2v-3ZM2 11h3v2H2v-2Zm17 0h3v2h-3v-2ZM4.2 4.2l1.4-1.4L8 5.2 6.6 6.6 4.2 4.2Zm11.8 11.8 2.4 2.4-1.4 1.4-2.4-2.4 1.4-1.4ZM4.2 19.8l2.4-2.4 1.4 1.4-2.4 2.4-1.4-1.4Zm13.6-13.6 1.4 1.4-2.4 2.4-1.4-1.4 2.4-2.4Z"/></svg>';
  var MOON = '<svg class="ico ico-moon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2c1.5 0 3 .3 4.2.9A8.5 8.5 0 1 0 21.1 14 8.5 8.5 0 0 1 12 2Z"/></svg>';
  function setIcon(node, theme){
    if(!node) return;
    node.innerHTML = theme === 'light' ? SUN : MOON;
  }
  function sync(){
    var theme = document.documentElement.getAttribute('data-theme') || 'dark';
    setIcon(document.querySelector('#themeToggleBtn .icon'), theme);
    setIcon(document.querySelector('#themeToggleBtnTop .icon'), theme);
  }
  if (document.readyState === 'loading'){ document.addEventListener('DOMContentLoaded', sync); } else { sync(); }
  document.addEventListener('click', function(e){
    if(e.target.closest && (e.target.closest('#themeToggleBtn') || e.target.closest('#themeToggleBtnTop'))){
      setTimeout(sync, 0);
    }
  });
})();


(function(){
  function setIconImg(node, theme){
    if(!node) return;
    var src = theme === 'light' ? 'assets/icons/sun.svg' : 'assets/icons/moon.svg';
    node.innerHTML = '<img class="ico ' + (theme==='light'?'ico-sun':'ico-moon') + '" src="'+src+'" alt="" aria-hidden="true">';
  }
  function sync(){
    var theme = document.documentElement.getAttribute('data-theme') || 'dark';
    setIconImg(document.querySelector('#themeToggleBtn .icon'), theme);
    setIconImg(document.querySelector('#themeToggleBtnTop .icon'), theme);
  }
  if (document.readyState === 'loading'){ document.addEventListener('DOMContentLoaded', sync); } else { sync(); }
  document.addEventListener('click', function(e){
    if(e.target.closest && (e.target.closest('#themeToggleBtn') || e.target.closest('#themeToggleBtnTop'))){
      setTimeout(sync, 0);
    }
  });
})();
