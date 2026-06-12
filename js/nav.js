/* ============================================================
   MOBILE NAVIGATION (Burger-Menü)
   ============================================================ */
(function(){
  const toggle = document.querySelector('.nav__toggle');
  const links = document.getElementById('navLinks');
  toggle.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    toggle.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', open);
  });
  links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    links.classList.remove('open'); toggle.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  }));
})();
