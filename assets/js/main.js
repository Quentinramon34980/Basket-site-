/* [Nom du club] — interactions de la page d'accueil */
(() => {
  'use strict';

  /* ---------- Menu mobile ---------- */

  const menuBtn = document.querySelector('.menu-btn');
  const menu = document.getElementById('menu-mobile');

  if (menuBtn && menu) {
    const setMenu = (open) => {
      menu.hidden = !open;
      menuBtn.setAttribute('aria-expanded', String(open));
    };

    menuBtn.addEventListener('click', () => setMenu(menu.hidden));
    menu.addEventListener('click', (event) => {
      if (event.target.closest('a')) setMenu(false);
    });
    document.addEventListener('click', (event) => {
      if (!menu.hidden && !event.target.closest('.header')) setMenu(false);
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !menu.hidden) {
        setMenu(false);
        menuBtn.focus();
      }
    });
    window.matchMedia('(min-width: 861px)').addEventListener('change', (event) => {
      if (event.matches) setMenu(false);
    });
  }

  /* ---------- Compte à rebours du prochain match à domicile ---------- */
  // Les matchs sont lus dans l'agenda : chaque <li data-match-label="…"> et sa balise <time datetime="…">.

  const nextMatch = document.getElementById('prochain-match');
  const matches = [...document.querySelectorAll('[data-match-label]')]
    .map((item) => ({
      at: Date.parse(item.querySelector('time')?.dateTime ?? ''),
      label: item.dataset.matchLabel
    }))
    .filter((match) => !Number.isNaN(match.at))
    .sort((a, b) => a.at - b.at);

  if (nextMatch && matches.length) {
    // Afficheur 7 segments : a (haut), b et c (droite), d (bas), e et f (gauche), g (milieu)
    const SEGMENTS = {
      a: '4.2,3 7.2,0 28.8,0 31.8,3 28.8,6 7.2,6',
      b: '33,4.2 36,7.2 36,27.8 33,30.8 30,27.8 30,7.2',
      c: '33,33.2 36,36.2 36,56.8 33,59.8 30,56.8 30,36.2',
      d: '4.2,61 7.2,58 28.8,58 31.8,61 28.8,64 7.2,64',
      e: '3,33.2 6,36.2 6,56.8 3,59.8 0,56.8 0,36.2',
      f: '3,4.2 6,7.2 6,27.8 3,30.8 0,27.8 0,7.2',
      g: '4.2,32 7.2,29 28.8,29 31.8,32 28.8,35 7.2,35'
    };
    const LIT = ['abcdef', 'bc', 'abdeg', 'abcdg', 'bcfg', 'acdfg', 'acdefg', 'abc', 'abcdefg', 'abcdfg'];
    const UNITS = ['Jours', 'Heures', 'Min.', 'Sec.'];

    const digitSvg = '<svg viewBox="-8 -1 45 66" width="24" height="35"><g transform="skewX(-6)">' +
      Object.entries(SEGMENTS).map(([key, points]) => `<polygon class="seg" data-seg="${key}" points="${points}"/>`).join('') +
      '</g></svg>';

    const clock = nextMatch.querySelector('[data-clock]');
    clock.innerHTML = UNITS.map((unit) =>
      `<div class="clock-group"><div class="clock-digits">${digitSvg}${digitSvg}</div><span class="clock-label">${unit}</span></div>`
    ).join('');

    const digits = clock.querySelectorAll('svg');
    const labelEl = nextMatch.querySelector('[data-next-label]');
    const srText = nextMatch.querySelector('[data-countdown-text]');
    let timer;

    const setDigit = (svg, value) => {
      svg.querySelectorAll('.seg').forEach((seg) => {
        seg.classList.toggle('is-on', LIT[value].includes(seg.dataset.seg));
      });
    };

    const plural = (n, word) => `${n} ${word}${n > 1 ? 's' : ''}`;

    const tick = () => {
      const now = Date.now();
      const match = matches.find((m) => m.at > now);
      if (!match) {
        nextMatch.hidden = true;
        clearInterval(timer);
        return;
      }

      const rest = Math.floor((match.at - now) / 1000);
      const days = Math.floor(rest / 86400);
      const hours = Math.floor((rest % 86400) / 3600);
      const mins = Math.floor((rest % 3600) / 60);
      const secs = rest % 60;

      [days, hours, mins, secs].forEach((value, i) => {
        const shown = Math.min(value, 99);
        setDigit(digits[i * 2], Math.floor(shown / 10));
        setDigit(digits[i * 2 + 1], shown % 10);
      });

      if (labelEl.textContent !== match.label) labelEl.textContent = match.label;
      const sentence = `Coup d’envoi dans ${plural(days, 'jour')}, ${plural(hours, 'heure')} et ${plural(mins, 'minute')}.`;
      if (srText.textContent !== sentence) srText.textContent = sentence;
      nextMatch.hidden = false;
    };

    tick();
    timer = setInterval(tick, 1000);
  }

  /* ---------- Formulaire d'inscription ---------- */

  const form = document.getElementById('form-inscription');
  const success = document.getElementById('inscription-ok');

  if (form && success) {
    const email = form.elements.email;
    const error = form.querySelector('.form-error');
    const submit = form.querySelector('[type="submit"]');
    const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const showError = (message) => {
      error.hidden = !message;
      error.textContent = message;
      if (message) email.setAttribute('aria-invalid', 'true');
      else email.removeAttribute('aria-invalid');
    };

    email.addEventListener('input', () => showError(''));

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const value = email.value.trim();
      if (!EMAIL_RE.test(value)) {
        showError('Ajoute une adresse e-mail valide, par exemple prenom@exemple.fr.');
        email.focus();
        return;
      }

      // Sans attribut action sur le formulaire, la demande n'est envoyée nulle part : voir README.
      const endpoint = form.getAttribute('action');
      if (endpoint) {
        submit.disabled = true;
        try {
          const response = await fetch(endpoint, {
            method: 'POST',
            body: new FormData(form),
            headers: { Accept: 'application/json' }
          });
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
        } catch {
          showError('L’envoi n’a pas abouti. Réessaie dans un instant.');
          return;
        } finally {
          submit.disabled = false;
        }
      } else {
        console.warn('Formulaire d’inscription : aucun attribut action, la demande n’a été envoyée nulle part.');
      }

      const choice = form.querySelector('input[name="categorie"]:checked');
      success.querySelector('[data-success-email]').textContent = value;
      success.querySelector('[data-success-phrase]').textContent = choice?.dataset.phrase ?? '';
      form.hidden = true;
      success.hidden = false;
    });

    // Les liens des cartes présélectionnent la catégorie correspondante
    document.querySelectorAll('a[data-categorie]').forEach((link) => {
      link.addEventListener('click', () => {
        const radio = form.querySelector(`input[name="categorie"][value="${link.dataset.categorie}"]`);
        if (radio) radio.checked = true;
      });
    });
  }
})();
