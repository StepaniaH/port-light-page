// Pre-paint guards: mark JS availability and hide non-English first paint
// until applyLang runs (main.js removes the class; the timeout is the failsafe).
document.documentElement.classList.add('js');
(function () {
  var langs = ['en', 'zh-CN', 'zh-TW', 'ja', 'fr', 'de', 'es'];
  var saved = null;
  try { saved = localStorage.getItem('pl-lang'); } catch (e) {}
  var lang = saved && langs.indexOf(saved) >= 0 ? saved : null;
  if (!lang && Array.isArray(navigator.languages)) {
    for (var i = 0; i < navigator.languages.length && !lang; i++) {
      if (langs.indexOf(navigator.languages[i]) >= 0) lang = navigator.languages[i];
    }
    for (var j = 0; j < navigator.languages.length && !lang; j++) {
      if (navigator.languages[j].indexOf('zh') === 0) lang = 'zh-CN';
    }
  }
  if (lang && lang !== 'en') {
    document.documentElement.classList.add('lang-pending');
    setTimeout(function () { document.documentElement.classList.remove('lang-pending'); }, 1500);
  }
})();

// Pre-paint theme guard: follow the system preference until the visitor
// picks a theme explicitly (main.js initThemes derives the same default).
(function () {
  var saved = null;
  try { saved = localStorage.getItem('pl-theme'); } catch (e) {}
  if (!saved && window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
    document.documentElement.setAttribute('data-theme', 'light');
  }
})();
