// ==========================================================================
// SPORTFEST-STATIONSDUELL - Game Hub & Mini-Games (Klasse 6D)
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
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc.start(now);
    osc.stop(now + 0.3);
  } else if (type === 'fanfare') {
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const o = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      o.connect(g);
      g.connect(audioCtx.destination);
      o.frequency.setValueAtTime(freq, now + idx * 0.12);
      g.gain.setValueAtTime(0.15, now + idx * 0.12);
      g.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.4);
      o.start(now + idx * 0.12);
      o.stop(now + idx * 0.12 + 0.4);
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
  currentStation: null,
  activeGame: null
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
    hint: 'Tipp: 10 von 20 ist genau die Hälfte!'
  },
  2: {
    title: '🔄 Station 2: Bruch-Zwillinge',
    prompt: 'Löst <strong>Buch S. 232, Nr. 4a</strong>:<br>Mit welcher Zahl wurde bei <strong>3/5 = 9/15</strong> erweitert?',
    validator: (val) => {
      const clean = val.toLowerCase().replace(/[^\d]/g, '');
      return clean === '3';
    },
    hint: 'Tipp: 3 mal wie viel ist 9?'
  },
  3: {
    title: '⚖️ Station 3: Wer war besser?',
    prompt: 'Löst <strong>Buch S. 233, Nr. 11a</strong>:<br>Welcher Bruch ist größer: <strong>5/11</strong> oder <strong>5/12</strong>?<br>(Tippe den größeren Bruch ein!)',
    validator: (val) => {
      const clean = val.replace(/\s+/g, '');
      return clean === '5/11';
    },
    hint: 'Tipp: Gleicher Zähler! Wo sind die Stücke größer?'
  },
  4: {
    title: '⏱️ Station 4: Sportfest-Zeitplan',
    prompt: 'Löst <strong>Buch S. 232, Nr. 6 / Pause</strong>:<br>Wie viele <strong>Minuten</strong> dauert eine Pause von <strong>3/4 einer Stunde (60 min)</strong>?',
    validator: (val) => {
      const clean = val.toLowerCase().replace(/[^\d]/g, '');
      return clean === '45';
    },
    hint: 'Tipp: 60 : 4 = 15, und 15 mal 3 = ?'
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
    }, 800);
  } else {
    playSound('wrong');
    feedback.className = 'feedback-msg error';
    feedback.textContent = `❌ Nicht ganz! ${config.hint}`;
  }
}

// ==========================================================================
// GAME ARENA LOGIK
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

// --- SPIEL 1: PROZENT-TREFFER ---
function initGame1() {
  document.getElementById('arenaTitle').textContent = '🎯 Station 1: Prozent-Treffer';
  let score = 0;
  const targetScore = 5;
  const tasks = [
    { frac: '1/2', ans: '50 %', opts: ['50 %', '25 %', '20 %', '75 %'] },
    { frac: '1/4', ans: '25 %', opts: ['25 %', '40 %', '50 %', '10 %'] },
    { frac: '3/4', ans: '75 %', opts: ['75 %', '34 %', '50 %', '80 %'] },
    { frac: '2/5', ans: '40 %', opts: ['40 %', '25 %', '50 %', '20 %'] },
    { frac: '4/5', ans: '80 %', opts: ['80 %', '45 %', '90 %', '75 %'] },
    { frac: '1/10', ans: '10 %', opts: ['10 %', '1 %', '20 %', '50 %'] },
    { frac: '7/10', ans: '70 %', opts: ['70 %', '7 %', '75 %', '80 %'] }
  ];
  let currentIdx = 0;
  tasks.sort(() => Math.random() - 0.5);

  function renderRound() {
    document.getElementById('arenaScore').textContent = `Treffer: ${score} / ${targetScore}`;
    if (score >= targetScore) {
      winStation(1, '🎯', 'Treffsicher bei Anteilen & Prozenten!');
      return;
    }

    const t = tasks[currentIdx % tasks.length];
    const [num, den] = t.frac.split('/');

    const content = document.getElementById('arenaContent');
    content.innerHTML = `
      <div class="quiz-box">
        <div class="quiz-prompt">Welcher Prozentwert gehört zu diesem Bruch?</div>
        <div class="fraction-display">
          <span class="num">${num}</span>
          <span class="den">${den}</span>
        </div>
        <div class="options-grid" id="optGrid"></div>
      </div>
    `;

    const grid = document.getElementById('optGrid');
    t.opts.sort(() => Math.random() - 0.5).forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'choice-btn';
      btn.textContent = opt;
      btn.onclick = () => {
        if (opt === t.ans) {
          playSound('correct');
          btn.classList.add('correct');
          score++;
          currentIdx++;
          setTimeout(renderRound, 600);
        } else {
          playSound('wrong');
          btn.classList.add('wrong');
          setTimeout(() => btn.classList.remove('wrong'), 500);
        }
      };
      grid.appendChild(btn);
    });
  }
  renderRound();
}

// --- SPIEL 2: ZWILLINGS-DETEKTIV ---
function initGame2() {
  document.getElementById('arenaTitle').textContent = '🔄 Station 2: Der Zwillings-Detektiv';
  let score = 0;
  const targetScore = 4;
  const tasks = [
    { target: '3/5', correct: '9/15', opts: ['9/15', '6/15', '3/10', '5/3'], note: 'Erweitert mit 3' },
    { target: '2/3', correct: '6/9', opts: ['6/9', '4/9', '5/6', '3/2'], note: 'Erweitert mit 3' },
    { target: '15/20', correct: '3/4', opts: ['3/4', '5/4', '1/2', '4/5'], note: 'Gekürzt durch 5' },
    { target: '1/4', correct: '25/100', opts: ['25/100', '10/40', '4/100', '14/100'], note: 'Erweitert mit 25' },
    { target: '14/35', correct: '2/5', opts: ['2/5', '7/5', '1/5', '4/10'], note: 'Gekürzt durch 7' }
  ];
  tasks.sort(() => Math.random() - 0.5);
  let idx = 0;

  function renderRound() {
    document.getElementById('arenaScore').textContent = `Zwillinge: ${score} / ${targetScore}`;
    if (score >= targetScore) {
      winStation(2, '🔄', 'Bruch-Zwillinge-Meister!');
      return;
    }

    const t = tasks[idx % tasks.length];
    const [num, den] = t.target.split('/');

    const content = document.getElementById('arenaContent');
    content.innerHTML = `
      <div class="quiz-box">
        <div class="quiz-prompt">Finde den echten Bruch-Zwilling (gleichwertig)!</div>
        <div>
          <span>Gesucht wird ein Zwilling zu:</span>
          <div class="fraction-display">
            <span class="num">${num}</span>
            <span class="den">${den}</span>
          </div>
        </div>
        <div class="options-grid" id="optGrid"></div>
      </div>
    `;

    const grid = document.getElementById('optGrid');
    t.opts.sort(() => Math.random() - 0.5).forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'choice-btn';
      btn.textContent = opt;
      btn.onclick = () => {
        if (opt === t.correct) {
          playSound('correct');
          btn.classList.add('correct');
          score++;
          idx++;
          setTimeout(renderRound, 600);
        } else {
          playSound('wrong');
          btn.classList.add('wrong');
          setTimeout(() => btn.classList.remove('wrong'), 500);
        }
      };
      grid.appendChild(btn);
    });
  }
  renderRound();
}

// --- SPIEL 3: BRUCH-EXPEDITION (VERGLEICHEN) ---
function initGame3() {
  document.getElementById('arenaTitle').textContent = '⚖️ Station 3: Bruch-Duell';
  let score = 0;
  const targetScore = 5;
  const pairs = [
    { f1: '5/11', f2: '5/12', greater: '5/11', tip: 'Gleicher Zähler: 11tel sind größer als 12tel!' },
    { f1: '5/16', f2: '7/16', greater: '7/16', tip: 'Gleicher Nenner: 7 ist mehr als 5!' },
    { f1: '7/9', f2: '8/12', greater: '7/9', tip: '8/12 = 2/3 = 6/9. 7/9 ist größer!' },
    { f1: '15/18', f2: '19/16', greater: '19/16', tip: '19/16 ist größer als 1 (echter vs. unechter Bruch)!' },
    { f1: '3/4', f2: '5/8', greater: '3/4', tip: '3/4 = 6/8. 6/8 ist größer als 5/8!' },
    { f1: '2/5', f2: '1/2', greater: '1/2', tip: '1/2 = 5/10, 2/5 = 4/10!' }
  ];
  pairs.sort(() => Math.random() - 0.5);
  let idx = 0;

  function renderRound() {
    document.getElementById('arenaScore').textContent = `Duelle: ${score} / ${targetScore}`;
    if (score >= targetScore) {
      winStation(3, '⚖️', 'Vergleichs-Profi!');
      return;
    }

    const p = pairs[idx % pairs.length];
    const [n1, d1] = p.f1.split('/');
    const [n2, d2] = p.f2.split('/');

    const content = document.getElementById('arenaContent');
    content.innerHTML = `
      <div class="quiz-box">
        <div class="quiz-prompt">Welcher Bruch ist GRÖSSER? Klicke darauf!</div>
        <div style="display:flex; justify-content:center; align-items:center; gap:28px; margin:10px 0;">
          <button class="choice-btn" id="btnF1" style="font-size:1.8rem; padding:18px 26px;">
            <div class="fraction-display"><span class="num">${n1}</span><span class="den">${d1}</span></div>
          </button>
          <span style="font-weight:900; font-size:1.4rem; color:var(--text-muted);">VS</span>
          <button class="choice-btn" id="btnF2" style="font-size:1.8rem; padding:18px 26px;">
            <div class="fraction-display"><span class="num">${n2}</span><span class="den">${d2}</span></div>
          </button>
        </div>
        <div style="font-size:0.88rem; color:var(--text-muted);">🔍 Hauptnenner-Lupe: Denkt an gleiche Stücke!</div>
      </div>
    `;

    document.getElementById('btnF1').onclick = () => checkChoice(p.f1, p);
    document.getElementById('btnF2').onclick = () => checkChoice(p.f2, p);
  }

  function checkChoice(choice, p) {
    if (choice === p.greater) {
      playSound('correct');
      score++;
      idx++;
      setTimeout(renderRound, 500);
    } else {
      playSound('wrong');
      alert(`Hoppla! ${p.tip}`);
    }
  }

  renderRound();
}

// --- SPIEL 4: SPORTFEST-SPRINT (OPERATOR) ---
function initGame4() {
  document.getElementById('arenaTitle').textContent = '⏱️ Station 4: Der Sportfest-Sprint';
  let score = 0;
  const targetScore = 4;
  const tasks = [
    { q: '1/2 von 7 m = ?', ans: '3,5 m', opts: ['3,5 m', '3 m', '4 m', '35 cm'] },
    { q: '2/5 von 1000 g = ?', ans: '400 g', opts: ['400 g', '200 g', '500 g', '250 g'] },
    { q: '3/4 von 60 min = ?', ans: '45 min', opts: ['45 min', '30 min', '15 min', '40 min'] },
    { q: '25 % von 80 € = ?', ans: '20 €', opts: ['20 €', '25 €', '40 €', '10 €'] },
    { q: '3/5 von 3 € (300 ct) = ?', ans: '1,80 €', opts: ['1,80 €', '1,50 €', '2,10 €', '0,60 €'] }
  ];
  tasks.sort(() => Math.random() - 0.5);
  let idx = 0;

  function renderRound() {
    document.getElementById('arenaScore').textContent = `Aufgaben: ${score} / ${targetScore}`;
    if (score >= targetScore) {
      winStation(4, '⏱️', 'Rechen-Champion Größen!');
      return;
    }

    const t = tasks[idx % tasks.length];
    const content = document.getElementById('arenaContent');
    content.innerHTML = `
      <div class="quiz-box">
        <div class="quiz-prompt">Berechne die Sportfest-Größe:</div>
        <div style="font-size:2rem; font-weight:800; color:var(--primary-blue); margin:12px 0;">
          ${t.q}
        </div>
        <div class="options-grid" id="optGrid"></div>
      </div>
    `;

    const grid = document.getElementById('optGrid');
    t.opts.sort(() => Math.random() - 0.5).forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'choice-btn';
      btn.textContent = opt;
      btn.onclick = () => {
        if (opt === t.ans) {
          playSound('correct');
          btn.classList.add('correct');
          score++;
          idx++;
          setTimeout(renderRound, 600);
        } else {
          playSound('wrong');
          btn.classList.add('wrong');
          setTimeout(() => btn.classList.remove('wrong'), 500);
        }
      };
      grid.appendChild(btn);
    });
  }
  renderRound();
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
