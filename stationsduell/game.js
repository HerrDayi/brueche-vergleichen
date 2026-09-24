// ==========================================================================
// SPORTFEST-STATIONSDUELL - Game Hub & 4 Varied Mini-Games (Klasse 6D)
// 100% Offline, Touch- & iPad-optimiert, Synthesized Audio
// ==========================================================================

// --- AUDIO SYNTHESIS (Zero External Audio Files) ---
let audioCtx = null;
let soundEnabled = true;

function initAudio() {
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) audioCtx = new AudioContext();
  }
}

function playSound(type) {
  if (!soundEnabled) return;
  initAudio();
  if (!audioCtx) return;

  const now = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);

  if (type === 'click') {
    osc.frequency.setValueAtTime(440, now);
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
    osc.start(now);
    osc.stop(now + 0.05);
  } else if (type === 'flip') {
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.08);
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    osc.start(now);
    osc.stop(now + 0.08);
  } else if (type === 'correct') {
    osc.frequency.setValueAtTime(523.25, now); // C5
    osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
    osc.frequency.setValueAtTime(783.99, now + 0.16); // G5
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc.start(now);
    osc.stop(now + 0.35);
  } else if (type === 'wrong') {
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.setValueAtTime(164.81, now + 0.12);
    gain.gain.setValueAtTime(0.14, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
    osc.start(now);
    osc.stop(now + 0.28);
  } else if (type === 'thud') {
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.18);
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    osc.start(now);
    osc.stop(now + 0.2);
  } else if (type === 'whoosh') {
    osc.type = 'sine';
    osc.frequency.setValueAtTime(280, now);
    osc.frequency.exponentialRampToValueAtTime(750, now + 0.15);
    osc.frequency.exponentialRampToValueAtTime(320, now + 0.3);
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc.start(now);
    osc.stop(now + 0.3);
  } else if (type === 'lupe') {
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.setValueAtTime(1174.66, now + 0.08);
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    osc.start(now);
    osc.stop(now + 0.25);
  } else if (type === 'fanfare') {
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const o = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      o.connect(g);
      g.connect(audioCtx.destination);
      o.frequency.setValueAtTime(freq, now + idx * 0.12);
      g.gain.setValueAtTime(0.16, now + idx * 0.12);
      g.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.45);
      o.start(now + idx * 0.12);
      o.stop(now + idx * 0.12 + 0.45);
    });
  }
}

// --- STATE MANAGEMENT ---
const state = {
  teamName: localStorage.getItem('stationsduell_team') || '',
  stations: JSON.parse(localStorage.getItem('stationsduell_stations')) || {
    1: { unlocked: false, completed: false },
    2: { unlocked: false, completed: false },
    3: { unlocked: false, completed: false },
    4: { unlocked: false, completed: false }
  },
  currentStation: null
};

function saveState() {
  localStorage.setItem('stationsduell_team', state.teamName);
  localStorage.setItem('stationsduell_stations', JSON.stringify(state.stations));
  updateUI();
}

// --- INITIALISIERUNG ---
document.addEventListener('DOMContentLoaded', () => {
  const nameInput = document.getElementById('teamNameInput');
  if (nameInput) {
    nameInput.value = state.teamName;
    nameInput.addEventListener('input', (e) => {
      state.teamName = e.target.value;
      localStorage.setItem('stationsduell_team', state.teamName);
    });
  }

  const soundBtn = document.getElementById('soundToggleBtn');
  if (soundBtn) {
    soundBtn.addEventListener('click', () => {
      soundEnabled = !soundEnabled;
      soundBtn.textContent = soundEnabled ? '🔊' : '🔇';
      playSound('click');
    });
  }

  updateUI();
});

function updateUI() {
  let completedCount = 0;

  for (let i = 1; i <= 4; i++) {
    const s = state.stations[i];
    const card = document.getElementById(`card${i}`);
    const statusEl = document.getElementById(`status${i}`);
    const slotEl = document.getElementById(`slot${i}`);
    const unlockBtn = card ? card.querySelector('.unlock-btn') : null;
    const playBtn = card ? card.querySelector('.play-btn') : null;

    if (!card) continue;

    if (s.completed) {
      completedCount++;
      statusEl.className = 'status-badge completed';
      statusEl.textContent = '⭐ Gemeistert';
      if (unlockBtn) unlockBtn.style.display = 'none';
      if (playBtn) {
        playBtn.style.display = 'block';
        playBtn.textContent = '🔄 Nochmal spielen';
        playBtn.className = 'action-btn play-btn replay';
      }
      if (slotEl) {
        slotEl.querySelector('.slot-circle').className = 'slot-circle earned';
      }
    } else if (s.unlocked) {
      statusEl.className = 'status-badge unlocked';
      statusEl.textContent = '🔓 Freigeschaltet';
      if (unlockBtn) unlockBtn.style.display = 'none';
      if (playBtn) {
        playBtn.style.display = 'block';
        playBtn.textContent = '🎮 Spiel starten';
        playBtn.className = 'action-btn play-btn';
      }
      if (slotEl) {
        slotEl.querySelector('.slot-circle').className = 'slot-circle unlocked-slot';
      }
    } else {
      statusEl.className = 'status-badge locked';
      statusEl.textContent = '🔒 Gesperrt';
      if (unlockBtn) unlockBtn.style.display = 'block';
      if (playBtn) playBtn.style.display = 'none';
      if (slotEl) {
        slotEl.querySelector('.slot-circle').className = 'slot-circle locked';
      }
    }
  }

  const badgeCountEl = document.getElementById('badgeCount');
  if (badgeCountEl) {
    badgeCountEl.textContent = `${completedCount} / 4 Sticker gesammelt`;
  }
}

// ==========================================================================
// UNLOCK LOGIK (PFLICHTAUFGABEN-PRÜFUNG)
// ==========================================================================
let pendingStation = null;

const unlockConfigs = {
  1: {
    title: '🎯 Station 1: Anteile & Prozente',
    prompt: 'Löst <strong>Buch S. 232, Nr. 1a</strong>:<br>Welcher <strong>Prozentwert</strong> gehört zu dem gefärbten Anteil (10 von 20 Feldern)?',
    validator: (val) => {
      const clean = val.toLowerCase().replace(/[\s%]/g, '');
      return clean === '50' || clean === '1/2';
    },
    hint: 'Tipp: 10 von 20 ist genau die Hälfte (50 %)!'
  },
  2: {
    title: '🔄 Station 2: Bruch-Zwillinge',
    prompt: 'Löst <strong>Buch S. 232, Nr. 4a</strong>:<br>Mit welcher Zahl wurde bei <strong>3/5 = 9/15</strong> erweitert?',
    validator: (val) => {
      const clean = val.toLowerCase().replace(/[^\d]/g, '');
      return clean === '3';
    },
    hint: 'Tipp: 3 mal 3 ist 9, und 5 mal 3 ist 15!'
  },
  3: {
    title: '⚖️ Station 3: Wer war besser?',
    prompt: 'Löst <strong>Buch S. 233, Nr. 11a</strong>:<br>Welcher Bruch ist größer: <strong>5/11</strong> oder <strong>5/12</strong>?<br>(Tippe den größeren Bruch ein!)',
    validator: (val) => {
      const clean = val.replace(/\s+/g, '');
      return clean === '5/11';
    },
    hint: 'Tipp: Gleicher Zähler! 11tel-Stücke sind größer als 12tel-Stücke!'
  },
  4: {
    title: '⏱️ Station 4: Sportfest-Zeitplan',
    prompt: 'Löst <strong>Buch S. 232, Nr. 6 / Pause</strong>:<br>Wie viele <strong>Minuten</strong> dauert eine Pause von <strong>3/4 einer Stunde (60 min)</strong>?',
    validator: (val) => {
      const clean = val.toLowerCase().replace(/[^\d]/g, '');
      return clean === '45';
    },
    hint: 'Tipp: 60 : 4 = 15, und 15 mal 3 = 45 min!'
  }
};

function openUnlockModal(stationId) {
  playSound('click');
  pendingStation = stationId;
  const config = unlockConfigs[stationId];
  document.getElementById('modalTitle').textContent = config.title;
  document.getElementById('modalPrompt').innerHTML = config.prompt;
  const input = document.getElementById('unlockInput');
  input.value = '';
  document.getElementById('modalFeedback').textContent = '';
  document.getElementById('modalFeedback').className = 'feedback-msg';
  document.getElementById('unlockModal').style.display = 'flex';
  setTimeout(() => input.focus(), 100);
}

function closeUnlockModal() {
  playSound('click');
  document.getElementById('unlockModal').style.display = 'none';
}

function verifyUnlock() {
  if (!pendingStation) return;
  const config = unlockConfigs[pendingStation];
  const inputVal = document.getElementById('unlockInput').value.trim();
  const feedback = document.getElementById('modalFeedback');

  if (config.validator(inputVal)) {
    playSound('correct');
    feedback.className = 'feedback-msg success';
    feedback.textContent = '🎉 Richtig! Station ist freigeschaltet!';
    state.stations[pendingStation].unlocked = true;
    saveState();
    setTimeout(() => {
      closeUnlockModal();
      startStationGame(pendingStation);
    }, 700);
  } else {
    playSound('wrong');
    feedback.className = 'feedback-msg error';
    feedback.textContent = `❌ Nicht ganz! ${config.hint}`;
  }
}

// ==========================================================================
// GAME ARENA ROUTING
// ==========================================================================
function startStationGame(stationId) {
  playSound('click');
  state.currentStation = stationId;
  document.getElementById('hubView').style.display = 'none';
  document.getElementById('gameView').style.display = 'flex';

  if (stationId === 1) initGame1();
  else if (stationId === 2) initGame2();
  else if (stationId === 3) initGame3();
  else if (stationId === 4) initGame4();
}

function returnToHub() {
  playSound('click');
  document.getElementById('gameView').style.display = 'none';
  document.getElementById('hubView').style.display = 'block';
  updateUI();
}

// ==========================================================================
// 1. SPIEL 🎯 PROZENT-TREFFER (INTERAKTIVER ZIELSCHEIBEN-SCHÜTZE)
// ==========================================================================
function initGame1() {
  document.getElementById('arenaTitle').textContent = '🎯 Station 1: Prozent-Treffer';
  let score = 0;
  const targetScore = 4;

  const rounds = [
    { frac: '1/2', num: 1, den: 2, percent: 50, ans: '50 %', opts: ['50 %', '25 %', '20 %', '75 %'] },
    { frac: '1/4', num: 1, den: 4, percent: 25, ans: '25 %', opts: ['25 %', '40 %', '50 %', '10 %'] },
    { frac: '3/4', num: 3, den: 4, percent: 75, ans: '75 %', opts: ['75 %', '34 %', '50 %', '80 %'] },
    { frac: '2/5', num: 2, den: 5, percent: 40, ans: '40 %', opts: ['40 %', '25 %', '50 %', '20 %'] },
    { frac: '4/5', num: 4, den: 5, percent: 80, ans: '80 %', opts: ['80 %', '45 %', '90 %', '75 %'] },
    { frac: '7/10', num: 7, den: 10, percent: 70, ans: '70 %', opts: ['70 %', '7 %', '75 %', '80 %'] }
  ];
  rounds.sort(() => Math.random() - 0.5);
  let roundIdx = 0;

  function renderRound() {
    document.getElementById('arenaScore').textContent = `Treffer: ${score} / ${targetScore}`;
    if (score >= targetScore) {
      winStation(1, '🎯', 'Treffsicher bei Anteilen & Prozenten!');
      return;
    }

    const cur = rounds[roundIdx % rounds.length];
    const content = document.getElementById('arenaContent');

    // SVG Pie Slice
    const circumference = 2 * Math.PI * 40; // r=40 -> ~251.3
    const dashLength = (cur.percent / 100) * circumference;
    const dashOffset = circumference * 0.25; // Rotate to 12 o'clock

    content.innerHTML = `
      <div class="target-arena">
        <div class="target-visual-board">
          <svg class="pie-chart-wrap" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" fill="#e2e8f0" />
            <circle cx="50" cy="50" r="40" fill="transparent" stroke="#22c55e" stroke-width="80"
                    stroke-dasharray="${dashLength} ${circumference}"
                    stroke-dashoffset="${dashOffset}" />
            <circle cx="50" cy="50" r="16" fill="white" />
          </svg>
          <div class="target-mission">
            <span class="target-mission-badge">Sportfest-Treffer</span>
            <div class="target-mission-text">Welche Zielscheibe trifft den Anteil?</div>
            <div class="fraction-display" style="margin: 4px 0;">
              <span class="num">${cur.num}</span>
              <span class="den">${cur.den}</span>
            </div>
          </div>
        </div>

        <div style="font-size:0.95rem; font-weight:700; color:var(--text-muted);">
          🎯 Tippe auf die passende Zielscheibe:
        </div>

        <div class="targets-row" id="targetsRow"></div>
      </div>
    `;

    const row = document.getElementById('targetsRow');
    const shuffledOpts = [...cur.opts].sort(() => Math.random() - 0.5);

    shuffledOpts.forEach(opt => {
      const disc = document.createElement('div');
      disc.className = 'target-disc';
      disc.innerHTML = `<div class="disc-inner">${opt}</div>`;

      disc.onclick = () => {
        if (opt === cur.ans) {
          playSound('correct');
          disc.classList.add('pop');
          score++;
          roundIdx++;
          setTimeout(renderRound, 500);
        } else {
          playSound('wrong');
          disc.classList.add('shake');
          setTimeout(() => disc.classList.remove('shake'), 450);
        }
      };

      row.appendChild(disc);
    });
  }

  renderRound();
}

// ==========================================================================
// 2. SPIEL 🔄 BRUCH-ZWILLINGE (SPEED-MEMORY)
// ==========================================================================
function initGame2() {
  document.getElementById('arenaTitle').textContent = '🔄 Station 2: Bruch-Zwillinge Memory';
  let matchedPairs = 0;
  const targetPairs = 4;
  let flippedCards = [];
  let isLocked = false;

  // 4 Paare (Zwillinge)
  const cardPairs = [
    { id: 1, frac: '3/5', num: 3, den: 5, val: 3/5, pairId: 1, note: '3/5 = 9/15 (erweitert mit 3)' },
    { id: 2, frac: '9/15', num: 9, den: 15, val: 3/5, pairId: 1, note: '9/15 = 3/5 (gekürzt durch 3)' },
    { id: 3, frac: '15/20', num: 15, den: 20, val: 3/4, pairId: 2, note: '15/20 = 3/4 (gekürzt durch 5)' },
    { id: 4, frac: '3/4', num: 3, den: 4, val: 3/4, pairId: 2, note: '3/4 = 15/20 (erweitert mit 5)' },
    { id: 5, frac: '14/35', num: 14, den: 35, val: 2/5, pairId: 3, note: '14/35 = 2/5 (gekürzt durch 7)' },
    { id: 6, frac: '2/5', num: 2, den: 5, val: 2/5, pairId: 3, note: '2/5 = 14/35 (erweitert mit 7)' },
    { id: 7, frac: '1/2', num: 1, den: 2, val: 1/2, pairId: 4, note: '1/2 = 12/24 (vollständig gekürzt)' },
    { id: 8, frac: '12/24', num: 12, den: 24, val: 1/2, pairId: 4, note: '12/24 = 1/2 (vollständig gekürzt)' }
  ];

  const deck = [...cardPairs].sort(() => Math.random() - 0.5);

  const content = document.getElementById('arenaContent');
  content.innerHTML = `
    <div class="memory-arena">
      <div class="memory-header-info">
        Deck aufdecken & Zwillinge (gleichwertige Brüche) verbinden!
      </div>
      <div class="memory-factor-banner" id="memBanner">
        Finde das erste Zwillings-Paar!
      </div>
      <div class="memory-grid" id="memGrid"></div>
    </div>
  `;

  document.getElementById('arenaScore').textContent = `Paare: 0 / ${targetPairs}`;
  const grid = document.getElementById('memGrid');

  deck.forEach((card, index) => {
    const cardEl = document.createElement('div');
    cardEl.className = 'mem-card';
    cardEl.dataset.index = index;

    cardEl.innerHTML = `
      <div class="mem-card-face mem-card-back">
        <div class="card-logo">🔄</div>
        <div class="card-label">Zwilling</div>
      </div>
      <div class="mem-card-face mem-card-front">
        <div class="fraction-display">
          <span class="num">${card.num}</span>
          <span class="den">${card.den}</span>
        </div>
      </div>
    `;

    cardEl.onclick = () => handleCardClick(cardEl, card);
    grid.appendChild(cardEl);
  });

  function handleCardClick(cardEl, card) {
    if (isLocked) return;
    if (cardEl.classList.contains('flipped') || cardEl.classList.contains('matched')) return;

    playSound('flip');
    cardEl.classList.add('flipped');
    flippedCards.push({ el: cardEl, card: card });

    if (flippedCards.length === 2) {
      isLocked = true;
      const [c1, c2] = flippedCards;

      if (c1.card.pairId === c2.card.pairId) {
        // MATCH!
        playSound('correct');
        c1.el.classList.add('matched');
        c2.el.classList.add('matched');
        matchedPairs++;
        document.getElementById('arenaScore').textContent = `Paare: ${matchedPairs} / ${targetPairs}`;
        document.getElementById('memBanner').innerHTML = `🎉 <strong>Treffer!</strong> ${c1.card.note}`;

        flippedCards = [];
        isLocked = false;

        if (matchedPairs >= targetPairs) {
          setTimeout(() => {
            winStation(2, '🔄', 'Bruch-Zwillinge Meister!');
          }, 800);
        }
      } else {
        // NO MATCH
        playSound('wrong');
        document.getElementById('memBanner').textContent = '❌ Keine Zwillinge! Schau genau auf Zähler & Nenner...';
        setTimeout(() => {
          c1.el.classList.remove('flipped');
          c2.el.classList.remove('flipped');
          flippedCards = [];
          isLocked = false;
        }, 900);
      }
    }
  }
}

// ==========================================================================
// 3. SPIEL ⚖️ BRUCH-BALKENWAAGE (INTERACTIVE SCALE)
// ==========================================================================
function initGame3() {
  document.getElementById('arenaTitle').textContent = '⚖️ Station 3: Die Bruch-Balkenwaage';
  let score = 0;
  const targetScore = 5;

  const duels = [
    {
      f1: { num: 5, den: 11, val: 5/11, text: '5/11' },
      f2: { num: 5, den: 12, val: 5/12, text: '5/12' },
      correct: '>',
      lupe: 'Gleicher Zähler (5)! 11tel-Stücke sind größer als 12tel-Stücke.'
    },
    {
      f1: { num: 8, den: 20, val: 8/20, text: '8/20' },
      f2: { num: 8, den: 30, val: 8/30, text: '8/30' },
      correct: '>',
      lupe: 'Gleicher Zähler (8)! 20stel sind größer als 30stel.'
    },
    {
      f1: { num: 15, den: 18, val: 15/18, text: '15/18' },
      f2: { num: 19, den: 16, val: 19/16, text: '19/16' },
      correct: '<',
      lupe: 'Stützzahl 1! 15/18 ist kleiner als 1, 19/16 ist größer als 1!'
    },
    {
      f1: { num: 13, den: 14, val: 13/14, text: '13/14' },
      f2: { num: 8, den: 9, val: 8/9, text: '8/9' },
      correct: '>',
      lupe: 'Rest zu 1! Bei 13/14 fehlt nur 1/14, bei 8/9 fehlt 1/9 (größere Lücke!).'
    },
    {
      f1: { num: 3, den: 4, val: 3/4, text: '3/4' },
      f2: { num: 6, den: 8, val: 6/8, text: '6/8' },
      correct: '=',
      lupe: 'Bruch-Zwillinge! 3/4 erweitert mit 2 ergibt exakt 6/8.'
    },
    {
      f1: { num: 2, den: 5, val: 2/5, text: '2/5' },
      f2: { num: 1, den: 2, val: 1/2, text: '1/2' },
      correct: '<',
      lupe: 'Stützzahl 1/2! 2/5 = 4/10 ist weniger als die Hälfte (5/10).'
    }
  ];

  duels.sort(() => Math.random() - 0.5);
  let duelIdx = 0;

  function renderDuel() {
    document.getElementById('arenaScore').textContent = `Duelle: ${score} / ${targetScore}`;
    if (score >= targetScore) {
      winStation(3, '⚖️', 'Vergleichs-Profi an der Balkenwaage!');
      return;
    }

    const d = duels[duelIdx % duels.length];
    const content = document.getElementById('arenaContent');

    content.innerHTML = `
      <div class="scale-arena">
        <div class="scale-stage">
          <div class="scale-beam" id="scaleBeam">
            <!-- Left Pan -->
            <div class="scale-pan-wrap pan-left">
              <div class="scale-chain"></div>
              <div class="scale-pan">
                <div class="fraction-display">
                  <span class="num">${d.f1.num}</span>
                  <span class="den">${d.f1.den}</span>
                </div>
              </div>
            </div>

            <!-- Right Pan -->
            <div class="scale-pan-wrap pan-right">
              <div class="scale-chain"></div>
              <div class="scale-pan">
                <div class="fraction-display">
                  <span class="num">${d.f2.num}</span>
                  <span class="den">${d.f2.den}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="scale-pivot-ball"></div>
          <div class="scale-fulcrum"></div>
        </div>

        <div class="scale-controls">
          <button class="scale-btn" id="btnLess" title="Rechts ist schwerer">&lt;</button>
          <button class="scale-btn" id="btnEqual" title="Beide sind gleich schwer">=</button>
          <button class="scale-btn" id="btnGreater" title="Links ist schwerer">&gt;</button>
        </div>

        <div class="lupe-bar">
          <button class="lupe-btn" id="lupeBtn">🔍 Hauptnenner-Lupe</button>
          <div class="lupe-reveal" id="lupeReveal" style="display:none;">${d.lupe}</div>
        </div>
      </div>
    `;

    document.getElementById('lupeBtn').onclick = () => {
      playSound('lupe');
      const rev = document.getElementById('lupeReveal');
      rev.style.display = rev.style.display === 'none' ? 'block' : 'none';
    };

    document.getElementById('btnLess').onclick = () => handleChoice('<', d);
    document.getElementById('btnEqual').onclick = () => handleChoice('=', d);
    document.getElementById('btnGreater').onclick = () => handleChoice('>', d);
  }

  function handleChoice(symbol, d) {
    const beam = document.getElementById('scaleBeam');
    playSound('thud');

    if (symbol === '<') beam.className = 'scale-beam tilt-right';
    else if (symbol === '>') beam.className = 'scale-beam tilt-left';
    else beam.className = 'scale-beam balanced';

    if (symbol === d.correct) {
      playSound('correct');
      score++;
      duelIdx++;
      setTimeout(renderDuel, 850);
    } else {
      playSound('wrong');
      const rev = document.getElementById('lupeReveal');
      rev.style.display = 'block';
      setTimeout(() => {
        beam.className = 'scale-beam';
      }, 1000);
    }
  }

  renderDuel();
}

// ==========================================================================
// 4. SPIEL ⏱️ SPORTFEST-HINDERNISLAUF (HURDLE RUNNER)
// ==========================================================================
function initGame4() {
  document.getElementById('arenaTitle').textContent = '⏱️ Station 4: Der Sportfest-Hindernislauf';
  let hurdleIdx = 0;
  const totalHurdles = 4;

  const hurdles = [
    {
      q: 'Hürde 1: 1/2 von 7 m = ?',
      ans: '3,5 m',
      opts: ['3,5 m', '3 m', '35 cm'],
      pos: 20,
      tip: '7 m durch 2 teilen = 3,5 m (oder 350 cm)!'
    },
    {
      q: 'Hürde 2: 2/5 von 1000 g = ?',
      ans: '400 g',
      opts: ['400 g', '200 g', '500 g'],
      pos: 42,
      tip: '1000 g : 5 = 200 g, und 200 g · 2 = 400 g!'
    },
    {
      q: 'Hürde 3: 3/4 von 60 min Pause = ?',
      ans: '45 min',
      opts: ['45 min', '30 min', '15 min'],
      pos: 64,
      tip: '60 min : 4 = 15 min, und 15 min · 3 = 45 min!'
    },
    {
      q: 'Hürde 4: 25 % von 80 € Budget = ?',
      ans: '20 €',
      opts: ['20 €', '25 €', '40 €'],
      pos: 84,
      tip: '25 % ist 1/4! 80 € : 4 = 20 €!'
    }
  ];

  function renderTrack() {
    document.getElementById('arenaScore').textContent = `Hürden: ${hurdleIdx} / ${totalHurdles}`;
    if (hurdleIdx >= totalHurdles) {
      winStation(4, '⏱️', 'Sprint-Champion beim Sportfest-Lauf!');
      return;
    }

    const cur = hurdles[hurdleIdx];
    const runnerLeft = hurdleIdx === 0 ? 4 : hurdles[hurdleIdx - 1].pos;
    const progressPercent = (hurdleIdx / totalHurdles) * 100;

    const content = document.getElementById('arenaContent');
    content.innerHTML = `
      <div class="runner-arena">
        <div class="tartan-track" id="track">
          <div class="track-lane"></div>
          <div class="track-finish-line"></div>

          <!-- Runner -->
          <div class="runner-avatar" id="runner" style="left: ${runnerLeft}%;">🏃</div>

          <!-- Hurdles -->
          ${hurdles.map((h, i) => `
            <div class="hurdle-post ${i < hurdleIdx ? 'cleared' : ''}" style="left: ${h.pos}%;"></div>
          `).join('')}
        </div>

        <div class="track-progress-bar">
          <div class="track-progress-fill" style="width: ${progressPercent}%;"></div>
        </div>

        <div class="hurdle-prompt-card">
          <div style="font-size:0.85rem; font-weight:800; color:var(--lvl-orange); text-transform:uppercase;">
            Sportfest-Hindernis ${hurdleIdx + 1}
          </div>
          <div class="hurdle-prompt-q">${cur.q}</div>
        </div>

        <div class="sprint-pads-grid" id="padsGrid"></div>
      </div>
    `;

    const padsGrid = document.getElementById('padsGrid');
    const shuffledOpts = [...cur.opts].sort(() => Math.random() - 0.5);

    shuffledOpts.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'sprint-pad-btn';
      btn.textContent = opt;

      btn.onclick = () => {
        const runner = document.getElementById('runner');

        if (opt === cur.ans) {
          playSound('whoosh');
          btn.classList.add('correct');
          runner.classList.add('jump');

          setTimeout(() => {
            playSound('correct');
            runner.style.left = `${cur.pos + 4}%`;
          }, 350);

          setTimeout(() => {
            runner.classList.remove('jump');
            hurdleIdx++;
            renderTrack();
          }, 750);
        } else {
          playSound('wrong');
          btn.classList.add('wrong');
          runner.classList.add('stumble');
          setTimeout(() => {
            btn.classList.remove('wrong');
            runner.classList.remove('stumble');
          }, 500);
        }
      };

      padsGrid.appendChild(btn);
    });
  }

  renderTrack();
}

// ==========================================================================
// SIEG & STICKER FREISCHALTUNG
// ==========================================================================
function winStation(stationId, icon, title) {
  playSound('fanfare');
  state.stations[stationId].completed = true;
  saveState();

  document.getElementById('wonSticker').textContent = icon;
  document.getElementById('wonStickerTitle').textContent = title;
  document.getElementById('victoryModal').style.display = 'flex';
}

function closeVictoryModal() {
  playSound('click');
  document.getElementById('victoryModal').style.display = 'none';
  returnToHub();
}
