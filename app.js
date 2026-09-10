// ==========================================================================
// Digitale Hilfsumgebung: Brüche vergleichen (Klasse 6D)
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  initHints();
  initFractionLab();
  initMultiplesFinder();
});

// --------------------------------------------------------------------------
// Hilfsfunktion: Bruch mit Zähler oben und Nenner unten erzeugen
// --------------------------------------------------------------------------
function formatFrac(num, den) {
  return `<span class="fraction-display"><span class="num">${num}</span><span class="den">${den}</span></span>`;
}

// --------------------------------------------------------------------------
// 1. Navigation Tabs
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
// 2. Gestufte Hilfen (Kaskadierende Aufklapp-Tipps)
// --------------------------------------------------------------------------
function initHints() {
  // Accordion für Aufgaben-Karten
  const taskHeaders = document.querySelectorAll('.task-header');
  taskHeaders.forEach(header => {
    header.addEventListener('click', () => {
      const card = header.closest('.task-card');
      card.classList.toggle('open');
    });
  });

  // Tipps auf- und zuklappen
  const hintTriggers = document.querySelectorAll('.hint-trigger');
  hintTriggers.forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const step = trigger.closest('.hint-step');
      step.classList.toggle('unlocked');
      
      const btnText = trigger.querySelector('.hint-btn-text');
      if (step.classList.contains('unlocked')) {
        btnText.textContent = 'Verbergen ▲';
      } else {
        btnText.textContent = 'Aufdecken ▼';
      }
    });
  });
}

// --------------------------------------------------------------------------
// 3. Interaktives Bruchstreifen-Labor
// --------------------------------------------------------------------------
function gcd(a, b) {
  return b === 0 ? a : gcd(b, a % b);
}

function lcm(a, b) {
  return (a * b) / gcd(a, b);
}

function initFractionLab() {
  const presetSelect = document.getElementById('labPreset');
  const num1Input = document.getElementById('labNum1');
  const den1Input = document.getElementById('labDen1');
  const num2Input = document.getElementById('labNum2');
  const den2Input = document.getElementById('labDen2');

  const btnSubdivide = document.getElementById('btnSubdivide');
  const btnResetLab = document.getElementById('btnResetLab');

  let isSubdivided = false;

  const presets = {
    'aufgabe1': { n1: 3, d1: 4, n2: 5, d2: 8, label1: 'Jonas', label2: 'Amira' },
    'aufgabe2a': { n1: 2, d1: 3, n2: 5, d2: 6, label1: 'Bruch 1', label2: 'Bruch 2' },
    'aufgabe3': { n1: 2, d1: 3, n2: 3, d2: 4, label1: 'Bruch 1', label2: 'Bruch 2' },
    'aufgabe4': { n1: 3, d1: 5, n2: 4, d2: 7, label1: 'Murat', label2: 'Vergleich' },
    'aufgabe6': { n1: 3, d1: 4, n2: 4, d2: 5, label1: 'Luisa', label2: 'Vergleich' },
    'custom': null
  };

  function updateFromInputs() {
    isSubdivided = false;
    renderStrips();
  }

  if (presetSelect) {
    presetSelect.addEventListener('change', () => {
      const val = presetSelect.value;
      if (presets[val]) {
        const p = presets[val];
        num1Input.value = p.n1;
        den1Input.value = p.d1;
        num2Input.value = p.n2;
        den2Input.value = p.d2;
      }
      updateFromInputs();
    });
  }

  [num1Input, den1Input, num2Input, den2Input].forEach(inp => {
    if (inp) {
      inp.addEventListener('input', () => {
        if (presetSelect) presetSelect.value = 'custom';
        updateFromInputs();
      });
    }
  });

  if (btnSubdivide) {
    btnSubdivide.addEventListener('click', () => {
      isSubdivided = true;
      renderStrips();
    });
  }

  if (btnResetLab) {
    btnResetLab.addEventListener('click', () => {
      isSubdivided = false;
      renderStrips();
    });
  }

  function renderStrips() {
    if (!num1Input || !den1Input || !num2Input || !den2Input) return;

    const n1 = Math.max(1, parseInt(num1Input.value) || 1);
    const d1 = Math.max(1, parseInt(den1Input.value) || 1);
    const n2 = Math.max(1, parseInt(num2Input.value) || 1);
    const d2 = Math.max(1, parseInt(den2Input.value) || 1);

    const commonDenom = lcm(d1, d2);
    const factor1 = commonDenom / d1;
    const factor2 = commonDenom / d2;
    const expandedN1 = n1 * factor1;
    const expandedN2 = n2 * factor2;

    // Streifen 1 aufbauen
    const strip1El = document.getElementById('strip1');
    const strip1Info = document.getElementById('strip1Info');
    if (strip1El && strip1Info) {
      strip1El.innerHTML = '';
      
      for (let i = 0; i < d1; i++) {
        const cell = document.createElement('div');
        cell.className = `strip-cell ${i < n1 ? 'shaded' : ''}`;
        
        if (isSubdivided && factor1 > 1) {
          for (let sub = 1; sub < factor1; sub++) {
            const subLine = document.createElement('div');
            subLine.className = 'subdivision-line visible';
            subLine.style.left = `${(sub / factor1) * 100}%`;
            cell.appendChild(subLine);
          }
        }
        strip1El.appendChild(cell);
      }

      if (isSubdivided && factor1 > 1) {
        strip1Info.innerHTML = `<span><strong>${formatFrac(n1, d1)}</strong> mit <strong>${factor1}</strong> erweitert = <strong>${formatFrac(expandedN1, commonDenom)}</strong></span> <span style="color:var(--danger); font-size:0.85rem;">(in ${commonDenom} Teile verfeinert)</span>`;
      } else {
        strip1Info.innerHTML = `<span>Bruch 1: <strong>${formatFrac(n1, d1)}</strong> (${n1} von ${d1} Teilen gefärbt)</span>`;
      }
    }

    // Streifen 2 aufbauen
    const strip2El = document.getElementById('strip2');
    const strip2Info = document.getElementById('strip2Info');
    if (strip2El && strip2Info) {
      strip2El.innerHTML = '';

      for (let i = 0; i < d2; i++) {
        const cell = document.createElement('div');
        cell.className = `strip-cell ${i < n2 ? 'shaded' : ''}`;
        
        if (isSubdivided && factor2 > 1) {
          for (let sub = 1; sub < factor2; sub++) {
            const subLine = document.createElement('div');
            subLine.className = 'subdivision-line visible';
            subLine.style.left = `${(sub / factor2) * 100}%`;
            cell.appendChild(subLine);
          }
        }
        strip2El.appendChild(cell);
      }

      if (isSubdivided && factor2 > 1) {
        strip2Info.innerHTML = `<span><strong>${formatFrac(n2, d2)}</strong> mit <strong>${factor2}</strong> erweitert = <strong>${formatFrac(expandedN2, commonDenom)}</strong></span> <span style="color:var(--danger); font-size:0.85rem;">(in ${commonDenom} Teile verfeinert)</span>`;
      } else {
        strip2Info.innerHTML = `<span>Bruch 2: <strong>${formatFrac(n2, d2)}</strong> (${n2} von ${d2} Teilen gefärbt)</span>`;
      }
    }

    // Didaktischer Vergleich OHNE die Lösung vorwegzunehmen!
    const calloutEl = document.getElementById('comparisonResult');
    if (calloutEl) {
      if (isSubdivided) {
        calloutEl.innerHTML = `
          <div class="result-relation" style="font-size: 1.25rem; gap: 0.75rem; align-items:center;">
            <span>${formatFrac(expandedN1, commonDenom)}</span>
            <span style="font-size:1.3rem; color:var(--primary); font-weight:800;">und</span>
            <span>${formatFrac(expandedN2, commonDenom)}</span>
          </div>
          <div style="font-size:0.95rem; font-weight:600; color:var(--text-main); margin-top:0.4rem; line-height: 1.5;">
            ✨ Beide Streifen haben jetzt dieselbe Stückgröße (jeweils ${commonDenom}-tel)!<br>
            <span style="color:var(--primary); font-weight:700;">👉 Vergleiche nun die gefärbten Teile: Welcher Zähler ist größer?</span>
          </div>
        `;
      } else {
        calloutEl.innerHTML = `
          <div class="result-relation" style="font-size: 1.25rem; gap: 0.75rem; align-items:center;">
            <span>${formatFrac(n1, d1)}</span>
            <span style="font-size:1.3rem; color:var(--text-muted); font-weight:700;">?</span>
            <span>${formatFrac(n2, d2)}</span>
          </div>
          <div style="font-size:0.95rem; font-weight:600; color:var(--text-muted); margin-top:0.25rem;">
            Die Stücke sind verschieden groß. Klicke oben auf <strong>„Gleichnamig machen“</strong>, um die Streifen passend zu unterteilen!
          </div>
        `;
      }
    }
  }

  renderStrips();
}

// --------------------------------------------------------------------------
// 4. Gemeinsame-Nenner-Maschine (Vielfachen-Finder)
// --------------------------------------------------------------------------
function initMultiplesFinder() {
  const d1Input = document.getElementById('multDen1');
  const d2Input = document.getElementById('multDen2');
  const outputContainer = document.getElementById('multiplesOutput');

  if (!d1Input || !d2Input || !outputContainer) return;

  function calculateMultiples() {
    const d1 = Math.max(1, parseInt(d1Input.value) || 1);
    const d2 = Math.max(1, parseInt(d2Input.value) || 1);
    const common = lcm(d1, d2);

    const mults1 = [];
    const mults2 = [];
    const count = 10;

    for (let i = 1; i <= count; i++) {
      mults1.push(d1 * i);
      mults2.push(d2 * i);
    }

    let html = `
      <div class="multiples-row">
        <div class="multiples-label">Reihe von ${d1}:</div>
        <div class="multiples-numbers">
          ${mults1.map(m => `<span class="number-chip ${m === common ? 'match' : ''}">${m}</span>`).join('')}
        </div>
      </div>
      <div class="multiples-row">
        <div class="multiples-label">Reihe von ${d2}:</div>
        <div class="multiples-numbers">
          ${mults2.map(m => `<span class="number-chip ${m === common ? 'match' : ''}">${m}</span>`).join('')}
        </div>
      </div>
      <div style="margin-top:1rem; padding:0.85rem; background:#ecfdf5; border:1.5px solid #22c55e; border-radius:8px; font-weight:600; color:#15803d;">
        🎯 <strong>Gemeinsamer Hauptnenner gefunden: ${common}</strong><br>
        <span style="font-size:0.9rem; color:#166534;">
          Erweitere den ersten Bruch mit <strong>${common / d1}</strong> (${d1} · ${common / d1} = ${common}) und den zweiten mit <strong>${common / d2}</strong> (${d2} · ${common / d2} = ${common}).
        </span>
      </div>
    `;

    outputContainer.innerHTML = html;
  }

  d1Input.addEventListener('input', calculateMultiples);
  d2Input.addEventListener('input', calculateMultiples);

  calculateMultiples();
}
