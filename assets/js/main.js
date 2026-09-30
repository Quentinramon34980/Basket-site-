/* BC Valbrune — interactions du site */
(() => {
  'use strict';

  // Tous les effets de mouvement s'effacent si le visiteur a demandé moins d'animations.
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

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

  /* ---------- Section en cours signalée dans le menu ---------- */

  const spyLinks = [...document.querySelectorAll('.nav-links a[href^="#"], .menu-panel a[href^="#"]')];
  const spied = [...new Set(spyLinks.map((link) => link.hash))]
    .map((hash) => document.querySelector(hash))
    .filter(Boolean)
    .sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));

  if (spied.length && 'IntersectionObserver' in window) {
    const inView = new Set();
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((entry) => (entry.isIntersecting ? inView.add(entry.target) : inView.delete(entry.target)));
      const current = spied.find((section) => inView.has(section));
      spyLinks.forEach((link) => {
        if (current && link.hash === `#${current.id}`) link.setAttribute('aria-current', 'true');
        else link.removeAttribute('aria-current');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    spied.forEach((section) => spy.observe(section));
  }

  /* ---------- Apparition au défilement ---------- */
  // Chaque [data-reveal] apparaît une fois quand il entre à l'écran ; dans un [data-reveal-stagger],
  // les éléments se suivent à 90 ms d'intervalle.

  document.querySelectorAll('[data-reveal-stagger]').forEach((group) => {
    group.querySelectorAll(':scope > [data-reveal]').forEach((item, i) => {
      item.style.setProperty('--reveal-delay', `${i * 90}ms`);
    });
  });

  // Carte des tirs : les tirs s'inscrivent un par un, dans un ordre mélangé comme en séance.
  document.querySelectorAll('.feature-figure').forEach((figure) => {
    const shots = [...figure.querySelectorAll('.shots circle')];
    shots.forEach((shot, i) => shot.style.setProperty('--i', (i * 7) % shots.length));
  });

  const revealables = [...document.querySelectorAll('[data-reveal]')];
  const reveal = (element) => element.classList.add('is-revealed');

  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealables.forEach(reveal);
  } else {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        reveal(entry.target);
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -6% 0px' });
    revealables.forEach((element) => observer.observe(element));
    window.addEventListener('beforeprint', () => revealables.forEach(reveal));
  }

  /* ---------- Parallaxe ---------- */
  // data-parallax-hero="0.12" : la couche descend de 12 % du défilement (haut de page).
  // data-parallax="50" : décalage en pixels sur une hauteur d'écran ; positif = plan du fond,
  // négatif = premier plan. Mesuré sur la section parente pour ne pas mesurer son propre décalage.

  const heroLayers = [...document.querySelectorAll('[data-parallax-hero]')];
  const depthLayers = [...document.querySelectorAll('[data-parallax]')];

  if (!reduceMotion && (heroLayers.length || depthLayers.length)) {
    let queued = false;

    const update = () => {
      queued = false;
      const viewport = window.innerHeight;
      const strength = window.innerWidth < 861 ? 0.6 : 1;
      const scrolled = window.scrollY;

      if (scrolled < viewport * 1.6) {
        heroLayers.forEach((layer) => {
          layer.style.translate = `0 ${(scrolled * layer.dataset.parallaxHero * strength).toFixed(1)}px`;
        });
      }

      const boxes = depthLayers.map((layer) => layer.parentElement.getBoundingClientRect());
      depthLayers.forEach((layer, i) => {
        const box = boxes[i];
        if (box.bottom < -viewport * 0.2 || box.top > viewport * 1.2) return;
        const progress = (box.top + box.height / 2 - viewport / 2) / viewport;
        layer.style.translate = `0 ${(-progress * layer.dataset.parallax * strength).toFixed(1)}px`;
      });
    };

    const queue = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(update);
    };

    window.addEventListener('scroll', queue, { passive: true });
    window.addEventListener('resize', queue);
    update();
  }

  /* ---------- Effets liés au curseur (souris uniquement) ---------- */

  if (finePointer && !reduceMotion) {
    const follow = (area, onMove, onLeave) => {
      let frame = 0;
      area.addEventListener('pointermove', (event) => {
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => {
          const box = area.getBoundingClientRect();
          const x = event.clientX - box.left;
          const y = event.clientY - box.top;
          onMove({ x, y, rx: (x / box.width) * 2 - 1, ry: (y / box.height) * 2 - 1 });
        });
      });
      area.addEventListener('pointerleave', () => {
        cancelAnimationFrame(frame);
        onLeave();
      });
    };

    // Accueil : le ballon et le badge suivent le curseur, le badge un peu plus (il est devant).
    const hero = document.querySelector('.hero');
    if (hero) {
      follow(hero, ({ rx, ry }) => {
        hero.style.setProperty('--px', rx.toFixed(3));
        hero.style.setProperty('--py', ry.toFixed(3));
      }, () => {
        hero.style.removeProperty('--px');
        hero.style.removeProperty('--py');
      });
    }

    // Catégories : le maillot se balance vers le curseur.
    document.querySelectorAll('.card').forEach((card) => {
      follow(card, ({ rx, ry }) => {
        card.style.setProperty('--jx', rx.toFixed(3));
        card.style.setProperty('--jy', ry.toFixed(3));
      }, () => {
        card.style.removeProperty('--jx');
        card.style.removeProperty('--jy');
      });
    });

    // Le club : un projecteur éclaire la carte sous le curseur.
    document.querySelectorAll('.feature').forEach((feature) => {
      follow(feature, ({ x, y }) => {
        feature.style.setProperty('--sx', `${Math.round(x)}px`);
        feature.style.setProperty('--sy', `${Math.round(y)}px`);
      }, () => {});
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

  /* ---------- Page événements : rendez-vous passés et filtre ---------- */

  const eventItems = [...document.querySelectorAll('.event')];

  if (eventItems.length) {
    // Un rendez-vous est passé à sa fin (data-end) ou, à défaut, deux heures après son début.
    const now = Date.now();
    eventItems.forEach((item) => {
      const start = Date.parse(item.querySelector('time')?.dateTime ?? '');
      const end = item.dataset.end ? Date.parse(item.dataset.end) : start + 2 * 3600 * 1000;
      if (end < now) {
        item.classList.add('is-past');
        item.querySelector('.event-tag')?.insertAdjacentHTML('beforeend', ' <span class="event-over">· Terminé</span>');
      }
    });

    const filter = document.getElementById('filtre-evenements');
    const months = [...document.querySelectorAll('.month')];
    const count = document.getElementById('evenements-compte');

    const apply = (type) => {
      let shown = 0;
      eventItems.forEach((item) => {
        item.hidden = type !== 'tout' && item.dataset.type !== type;
        if (!item.hidden) shown += 1;
      });
      months.forEach((month) => {
        month.hidden = !month.querySelector('.event:not([hidden])');
      });
      if (count) count.textContent = `${shown} rendez-vous`;
    };

    // Les rendez-vous glissent jusqu'à leur nouvelle place (navigateurs compatibles).
    const show = (type) => {
      if (reduceMotion || !document.startViewTransition) {
        apply(type);
        return;
      }
      const moving = [...months, ...eventItems];
      moving.forEach((element, i) => { element.style.viewTransitionName = `calendrier-${i}`; });
      document.startViewTransition(() => apply(type)).finished.finally(() => {
        moving.forEach((element) => { element.style.viewTransitionName = ''; });
      });
    };

    filter?.addEventListener('change', (event) => show(event.target.value));

    // evenements.html#stages (ou #matchs, #club) ouvre le calendrier déjà filtré.
    const fromHash = () => {
      const value = decodeURIComponent(window.location.hash.slice(1));
      const radio = value && filter?.querySelector(`input[value="${CSS.escape(value)}"]`);
      if (!radio) return;
      radio.checked = true;
      apply(radio.value);
      document.getElementById('calendrier')?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
    };
    // Le compteur se calcule dès l'arrivée : il reste juste quand on ajoute un rendez-vous.
    apply(filter?.querySelector('input:checked')?.value ?? 'tout');
    fromHash();
    window.addEventListener('hashchange', fromHash);
  }

  /* ---------- Formulaires (inscription et contact) ---------- */
  // Sans attribut action sur le formulaire, rien n'est envoyé : la confirmation s'affiche seulement (voir README).

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const initForm = ({ form, success, validate, fill }) => {
    if (!form || !success) return;
    const submit = form.querySelector('[type="submit"]');
    const formError = form.querySelector('[data-form-error]');
    const fields = [...form.querySelectorAll('[data-error]')];

    const setMessage = (element, message) => {
      if (!element) return;
      element.hidden = !message;
      element.textContent = message;
    };

    const setFieldError = (input, message) => {
      setMessage(document.getElementById(input.dataset.error), message);
      if (message) input.setAttribute('aria-invalid', 'true');
      else input.removeAttribute('aria-invalid');
    };

    form.addEventListener('input', (event) => {
      if (event.target.dataset.error) setFieldError(event.target, '');
    });

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      fields.forEach((input) => setFieldError(input, ''));
      setMessage(formError, '');

      const problems = validate(form);
      if (problems.length) {
        problems.forEach(([input, message]) => setFieldError(input, message));
        problems[0][0].focus();
        return;
      }

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
          setMessage(formError, 'L’envoi n’a pas abouti. Réessaie dans un instant.');
          return;
        } finally {
          submit.disabled = false;
        }
      } else {
        console.warn(`${form.id} : aucun attribut action, le message n’a été envoyé nulle part.`);
      }

      fill(form, success);
      form.hidden = true;
      success.hidden = false;
    });
  };

  const invalidEmail = 'Ajoute une adresse e-mail valide, par exemple prenom@exemple.fr.';

  initForm({
    form: document.getElementById('form-inscription'),
    success: document.getElementById('inscription-ok'),
    validate: (form) => (EMAIL_RE.test(form.elements.email.value.trim()) ? [] : [[form.elements.email, invalidEmail]]),
    fill: (form, box) => {
      box.querySelector('[data-success-email]').textContent = form.elements.email.value.trim();
      box.querySelector('[data-success-phrase]').textContent = form.querySelector('input[name="categorie"]:checked')?.dataset.phrase ?? '';
    }
  });

  initForm({
    form: document.getElementById('form-contact'),
    success: document.getElementById('contact-ok'),
    validate: (form) => {
      const { nom, email, message } = form.elements;
      const problems = [];
      if (nom.value.trim().length < 2) problems.push([nom, 'Indique ton prénom et ton nom.']);
      if (!EMAIL_RE.test(email.value.trim())) problems.push([email, invalidEmail]);
      if (message.value.trim().length < 10) problems.push([message, 'Écris-nous au moins une phrase.']);
      return problems;
    },
    fill: (form, box) => {
      box.querySelector('[data-success-name]').textContent = form.elements.nom.value.trim().split(/\s+/)[0];
      box.querySelector('[data-success-email]').textContent = form.elements.email.value.trim();
    }
  });

  // Accueil : les liens des cartes présélectionnent la catégorie correspondante.
  const joinForm = document.getElementById('form-inscription');
  if (joinForm) {
    document.querySelectorAll('a[data-categorie]').forEach((link) => {
      link.addEventListener('click', () => {
        const radio = joinForm.querySelector(`input[name="categorie"][value="${link.dataset.categorie}"]`);
        if (radio) radio.checked = true;
      });
    });
  }

  // Contact : contact.html#partenariat, #benevolat, #boutique… présélectionne le sujet.
  const contactForm = document.getElementById('form-contact');
  if (contactForm) {
    const pickSubject = () => {
      const subject = decodeURIComponent(window.location.hash.slice(1));
      const radio = subject && contactForm.querySelector(`input[name="sujet"][value="${CSS.escape(subject)}"]`);
      if (!radio) return;
      radio.checked = true;
      document.getElementById('formulaire')?.scrollIntoView({ block: 'nearest', behavior: reduceMotion ? 'auto' : 'smooth' });
    };
    pickSubject();
    window.addEventListener('hashchange', pickSubject);
  }
})();
