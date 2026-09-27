// ==========================================================================
// Tippkarten: Unser Power-Drink (Klasse 6D)
// Interaktive Steuerung der gestuften Hilfen (Accordion & Reveal)
// Zweisprachige Unterstützung: Deutsch / Français
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  // --- 1. Sprachumschaltung (Deutsch / Français) ---
  const langButtons = document.querySelectorAll('.lang-btn');
  let currentLang = localStorage.getItem('tippkarten_lang') || 'de';

  function setLanguage(lang) {
    currentLang = lang;
    document.body.classList.remove('lang-de', 'lang-fr');
    document.body.classList.add(`lang-${lang}`);
    try {
      localStorage.setItem('tippkarten_lang', lang);
    } catch (e) {
      // Ignorieren bei blockiertem localStorage
    }

    langButtons.forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });

    // Aktualisiere Text der Aufdecken/Zuklappen-Buttons
    document.querySelectorAll('.hint-item').forEach((item) => {
      const hintState = item.querySelector('.hint-state');
      if (hintState) {
        const isOpen = item.classList.contains('open');
        if (lang === 'fr') {
          hintState.textContent = isOpen ? 'Fermer ▲' : 'Découvrir ▼';
        } else {
          hintState.textContent = isOpen ? 'Zuklappen ▲' : 'Aufdecken ▼';
        }
      }
    });
  }

  // Initial setzen
  setLanguage(currentLang);

  langButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      setLanguage(btn.dataset.lang);
    });
  });

  // --- 2. Aufgaben-Karten ein-/ausklappen (Task Accordion) ---
  const taskHeaders = document.querySelectorAll('.task-header');

  taskHeaders.forEach((header) => {
    header.setAttribute('role', 'button');
    header.setAttribute('tabindex', '0');

    const toggleTask = () => {
      const card = header.closest('.task-card');
      if (card) {
        card.classList.toggle('open');
      }
    };

    header.addEventListener('click', toggleTask);

    header.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleTask();
      }
    });
  });

  // --- 3. Gestufte Hilfen aufdecken / zuklappen (Hint Reveal) ---
  const hintButtons = document.querySelectorAll('.hint-btn');

  hintButtons.forEach((btn) => {
    const hintItem = btn.closest('.hint-item');
    const hintState = btn.querySelector('.hint-state');

    btn.addEventListener('click', (e) => {
      e.stopPropagation(); // Verhindert versehentliches Schließen der Aufgaben-Karte
      
      if (!hintItem) return;

      const isOpen = hintItem.classList.toggle('open');

      if (hintState) {
        if (currentLang === 'fr') {
          hintState.textContent = isOpen ? 'Fermer ▲' : 'Découvrir ▼';
        } else {
          hintState.textContent = isOpen ? 'Zuklappen ▲' : 'Aufdecken ▼';
        }
      }
    });
  });
});
