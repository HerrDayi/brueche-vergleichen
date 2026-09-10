// ==========================================================================
// Digitale Lernhilfe: Brüche vergleichen (Klasse 6D)
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  initHints();
  initLabor();
});

// --------------------------------------------------------------------------
// 1. Einfache Tab-Umschaltung
// --------------------------------------------------------------------------
function initTabs() {
  const tabs = document.querySelectorAll('.tab-btn');
  const panes = document.querySelectorAll('.tab-pane');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetId = tab.getAttribute('data-tab');

      tabs.forEach(t => t.classList.remove('active'));
      panes.forEach(p => p.classList.remove('active'));

      tab.classList.add('active');
      const targetPane = document.getElementById(targetId);
      if (targetPane) {
        targetPane.classList.add('active');
      }
    });
  });
}

// --------------------------------------------------------------------------
// 2. Klickbare Aufgaben & Tipps
// --------------------------------------------------------------------------
function initHints() {
  // Aufgaben auf- und zuklappen
  const headers = document.querySelectorAll('.task-header');
  headers.forEach(h => {
    h.addEventListener('click', () => {
      const card = h.closest('.task-card');
      card.classList.toggle('open');
    });
  });

  // Einzelne Tipps aufdecken
  const buttons = document.querySelectorAll('.hint-button');
  buttons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const step = btn.closest('.hint-step');
      step.classList.toggle('unlocked');

      const toggleText = btn.querySelector('.btn-toggle-text');
      if (step.classList.contains('unlocked')) {
        toggleText.textContent = 'Verbergen ▲';
      } else {
        toggleText.textContent = 'Aufdecken ▼';
      }
    });
  });
}

// --------------------------------------------------------------------------
// 3. Bruchstreifen-Labor
// --------------------------------------------------------------------------
function fracHtml(num, den) {
  return `<span class="frac"><span class="num">${num}</span><span class="den">${den}</span></span>`;
}

function initLabor() {
  const select = document.getElementById('selectPreset');
  const bar1 = document.getElementById('bar1');
  const bar2 = document.getElementById('bar2');
  const label1 = document.getElementById('label1');
  const label2 = document.getElementById('label2');
  const btnVerfeinern = document.getElementById('btnVerfeinern');
  const btnReset = document.getElementById('btnReset');
  const labHinweis = document.getElementById('labHinweis');

  const presets = {
    'p1': { n1: 3, d1: 4, n2: 5, d2: 8, name1: 'Jonas', name2: 'Amira', cd: 8, f1: 2, f2: 1 },
    'p2': { n1: 2, d1: 3, n2: 5, d2: 6, name1: 'Bruch 1', name2: 'Bruch 2', cd: 6, f1: 2, f2: 1 },
    'p3': { n1: 2, d1: 3, n2: 3, d2: 4, name1: 'Bruch 1', name2: 'Bruch 2', cd: 12, f1: 4, f2: 3 },
    'p4': { n1: 3, d1: 5, n2: 4, d2: 7, name1: 'Murat', name2: 'Zweiter Bruch', cd: 35, f1: 7, f2: 5 }
  };

  let currentSubdivided = false;

  function render() {
    const cur = presets[select.value];
    if (!cur) return;

    // Labels mit echtem Bruch-Layout (Zähler oben, Nenner unten)
    label1.innerHTML = `${cur.name1}: ${fracHtml(cur.n1, cur.d1)}`;
    label2.innerHTML = `${cur.name2}: ${fracHtml(cur.n2, cur.d2)}`;

    // Streifen 1 aufbauen
    bar1.innerHTML = '';
    for (let i = 0; i < cur.d1; i++) {
      const cell = document.createElement('div');
      cell.className = `cell ${i < cur.n1 ? 'colored' : ''}`;
      
      if (currentSubdivided && cur.f1 > 1) {
        for (let s = 1; s < cur.f1; s++) {
          const cut = document.createElement('div');
          cut.className = 'cut-line show';
          cut.style.left = `${(s / cur.f1) * 100}%`;
          cell.appendChild(cut);
        }
      }
      bar1.appendChild(cell);
    }

    // Streifen 2 aufbauen
    bar2.innerHTML = '';
    for (let i = 0; i < cur.d2; i++) {
      const cell = document.createElement('div');
      cell.className = `cell ${i < cur.n2 ? 'colored' : ''}`;
      
      if (currentSubdivided && cur.f2 > 1) {
        for (let s = 1; s < cur.f2; s++) {
          const cut = document.createElement('div');
          cut.className = 'cut-line show';
          cut.style.left = `${(s / cur.f2) * 100}%`;
          cell.appendChild(cut);
        }
      }
      bar2.appendChild(cell);
    }

    // Didaktischer Hinweis (OHNE die Lösung zu verraten!)
    if (currentSubdivided) {
      labHinweis.classList.add('show');
      const exp1 = cur.n1 * cur.f1;
      const exp2 = cur.n2 * cur.f2;
      
      let text = `✨ <strong>Jetzt haben beide Streifen die gleiche Einteilung (${cur.cd} Teile)!</strong><br>`;
      if (cur.f1 > 1 && cur.f2 === 1) {
        text += `Aus ${fracHtml(cur.n1, cur.d1)} sind durch Verfeinern mit ${cur.f1} genau ${fracHtml(exp1, cur.cd)} geworden.<br>`;
      } else if (cur.f1 > 1 && cur.f2 > 1) {
        text += `Aus ${fracHtml(cur.n1, cur.d1)} wurden ${fracHtml(exp1, cur.cd)} und aus ${fracHtml(cur.n2, cur.d2)} wurden ${fracHtml(exp2, cur.cd)}.<br>`;
      }
      text += `👉 <em>Weil alle Stücke jetzt gleich groß sind, kannst du die Zähler einfach vergleichen: Wer hat mehr gefärbte Teile?</em>`;
      labHinweis.innerHTML = text;
    } else {
      labHinweis.classList.remove('show');
      labHinweis.innerHTML = '';
    }
  }

  select.addEventListener('change', () => {
    currentSubdivided = false;
    render();
  });

  btnVerfeinern.addEventListener('click', () => {
    currentSubdivided = true;
    render();
  });

  btnReset.addEventListener('click', () => {
    currentSubdivided = false;
    render();
  });

  render();
}
