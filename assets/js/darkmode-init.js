const globalDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
const localMode = localStorage.getItem('theme');
localStorage.setItem('theme', 'dark');
document.documentElement.setAttribute('data-dark-mode', '');


if (globalDark && (localMode === 'dark')) {

  document.documentElement.setAttribute('data-dark-mode', '');

}

if (localMode === 'dark') {

  document.documentElement.setAttribute('data-dark-mode', '');

}
