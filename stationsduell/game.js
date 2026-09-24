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
// UNLOCK LOGIK (PFLICHTAUFGABEN-PRÜFUNG: ERGEBNIS DER LETZTEN TEILAUFGABE)
// ==========================================================================
let pendingStation = null;

const unlockConfigs = {
  1: {
    title: '🧭 Station 1: Anteile & Prozente',
    intro: 'Löst <strong>Buch S. 32, Nr. 1 (a–c)</strong> im Heft.<br>Gebt das Ergebnis der letzten Pflichtaufgabe <strong>1c</strong> ein (7 von 28 = ? %):',
    placeholder: 'z. B. 25',
    answer: v => {
      const c = v.trim().replace(/\s|%/g, '');
      return c === '25' || c === '1/4';
    },
    hint: 'Tipp: 7 von 28 ist 1/4 = 25 %!'
  },
  2: {
    title: '🔄 Station 2: Bruch-Zwillinge',
    intro: 'Löst <strong>Buch S. 32, Nr. 4 (a, b, d)</strong> im Heft.<br>Gebt das Ergebnis der letzten Pflichtaufgabe <strong>4d</strong> ein (14/35 = ?/5 &rarr; gekürzt durch welche Zahl?):',
    placeholder: 'z. B. 7',
    answer: v => {
      const c = v.trim().replace(/\s/g, '');
      return c === '7';
    },
    hint: 'Tipp: Welche Zahl teilt 14 und 35? 14 ÷ 7 = 2!'
  },
  3: {
    title: '🔍 Station 3: Wer war besser?',
    intro: 'Löst <strong>Buch S. 33, Nr. 11 (a–c)</strong> im Heft.<br>Gebt den <strong>größeren Bruch aus 11c</strong> (15/18 oder 19/16) ein:',
    placeholder: 'z. B. 19/16',
    answer: v => {
      const c = v.trim().replace(/\s/g, '');
      return c === '19/16';
    },
    hint: 'Tipp: 15/18 ist kleiner als 1, 19/16 ist größer als 1!'
  },
  4: {
    title: '🁣 Station 4: Größen berechnen',
    intro: 'Löst <strong>Buch S. 32, Nr. 6</strong> im Heft.<br>Gebt das Ergebnis der letzten Pflichtaufgabe ein (z. B. 2/5 von 1 kg oder Pause: 3/4 von 60 min):',
    placeholder: 'z. B. 400 oder 45',
    answer: v => {
      const c = v.trim().replace(/\s|g|min/g, '');
      return c === '400' || c === '45';
    },
    hint: 'Tipp: 2/5 von 1000 g = 400 g oder 3/4 von 60 min = 45 min!'
  }
};

function openUnlockModal(stationId) {
  playSound('click');
  pendingStation = stationId;
  const config = unlockConfigs[stationId];
  document.getElementById('modalTitle').textContent = config.title;
  document.getElementById('modalPrompt').innerHTML = config.intro;

  const inp = document.getElementById('unlockSingleInput');
  inp.value = '';
  inp.placeholder = config.placeholder;
  
  inp.onkeydown = (e) => {
    if (e.key === 'Enter') {
      verifyUnlock();
    }
  };

  const fb = document.getElementById('modalFeedback');
  fb.textContent = '';
  fb.className = 'feedback-msg';

  document.getElementById('unlockModal').style.display = 'flex';
  setTimeout(() => inp.focus(), 150);
}

function closeUnlockModal() {
  playSound('click');
  document.getElementById('unlockModal').style.display = 'none';
}

function verifyUnlock() {
  if (!pendingStation) return;
  const config = unlockConfigs[pendingStation];
  const inp = document.getElementById('unlockSingleInput');
  const val = (inp?.value || '').trim();
  const feedback = document.getElementById('modalFeedback');

  if (config.answer(val)) {
    playSound('correct');
    feedback.className = 'feedback-msg success';
    feedback.textContent = '🎉 Richtig! Station ist freigeschaltet!';
    state.stations[pendingStation].unlocked = true;
    saveState();
    setTimeout(() => {
      closeUnlockModal();
      startStationGame(pendingStation);
    }, 600);
  } else {
    playSound('wrong');
    feedback.className = 'feedback-msg error';
    feedback.textContent = `❌ Noch nicht ganz! ${config.hint}`;
  }
}



// ==========================================================================
// GAME LIVES & GAME OVER SYSTEM
// ==========================================================================
let currentStationRestartFn = null;

function getHeartString(lives, max = 3) {
  let str = '';
  for (let i = 0; i < max; i++) {
    str += i < lives ? '❤️' : '🤍';
  }
  return str;
}

function showGameOver(title, msg, restartFn) {
  playSound('wrong');
  currentStationRestartFn = restartFn;
  const modal = document.getElementById('gameOverModal');
  const titleEl = document.getElementById('gameOverTitle');
  const msgEl = document.getElementById('gameOverMsg');
  if (titleEl) titleEl.textContent = title || 'KEINE LEBEN MEHR!';
  if (msgEl) msgEl.innerHTML = msg || 'Du hast alle 3 Leben verloren. Du musst mit neuen Aufgaben von vorne anfangen!';
  if (modal) modal.style.display = 'flex';
}

function handleGameOverRestart() {
  playSound('click');
  const modal = document.getElementById('gameOverModal');
  if (modal) modal.style.display = 'none';
  if (currentStationRestartFn) {
    currentStationRestartFn();
  }
}

function showExplanation(title, html) {
  const modal = document.getElementById('explanationModal');
  const t = document.getElementById('expTitle');
  const c = document.getElementById('expContent');
  if (t) t.textContent = title;
  if (c) c.innerHTML = html;
  if (modal) modal.style.display = 'flex';
}

function closeExplanationModal() {
  playSound('click');
  const modal = document.getElementById('explanationModal');
  if (modal) modal.style.display = 'none';
}

function gcd(a, b) {
  a = Math.abs(Math.round(a));
  b = Math.abs(Math.round(b));
  while (b) { let t = b; b = a % b; a = t; }
  return a || 1;
}

function lcm(a, b) {
  if (!a || !b) return 1;
  return Math.abs(Math.round((a * b) / gcd(a, b)));
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
// 1. SPIEL 🧭 BRUCH-EXPEDITION: DER PFAD DES KLEINEREN BRUCHS
// Aus "Brüche vergleichen 2" – angepasst:
// - Immer den KLEINEREN Bruch wählen!
// - Nur Brüche <= 1 (keine unechten Brüche)
// - 3 Leben! Bei 0 Leben -> Neustart mit neuen Brüchen
// ==========================================================================
function initGame1(preferredLevel = 'meister') {
  document.getElementById('arenaTitle').textContent = '🧭 Station 1: Bruch-Expedition';
  const livesEl = document.getElementById('arenaLives');
  const scoreEl = document.getElementById('arenaScore');
  livesEl.style.display = 'inline-flex';

  let currentLevel = preferredLevel; // 'meister' (schwierig) oder 'forscher'
  let lives = 3;
  let steps = 0;
  let jokerFiftyUsed = false;
  let jokerHintUsed = false;
  let eliminatedNodes = new Set();

  livesEl.textContent = getHeartString(lives);
  scoreEl.textContent = 'Schritte: 0 / 5';

  // 1. Mathematische Hilfsfunktionen
  function buildFractionPool(denoms) {
    let list = [];
    denoms.forEach(d => {
      for (let n = 1; n < d; n++) {
        if (gcd(n, d) === 1) {
          list.push({ num: n, den: d, val: n / d, str: `${n}/${d}` });
        }
      }
    });
    list.sort((a, b) => a.val - b.val);
    let unique = [];
    let lastVal = -1;
    list.forEach(item => {
      if (Math.abs(item.val - lastVal) > 1e-5) {
        unique.push(item);
        lastVal = item.val;
      }
    });
    return unique;
  }

  // Schwierige Meister-Stufe (UPP-Niveau): Nenner bis 25, über 100 Brüche, keine Brüche > 1
  const POOL_MEISTER = buildFractionPool([3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 15, 16, 18, 20, 21, 24, 25]);
  // Forscher-Stufe: Glattere Nenner
  const POOL_FORSCHER = buildFractionPool([2, 3, 4, 5, 6, 8, 10, 12]);

  const NODES = {
    'start':  { id: 'start',  col: 0, x: 80,  y: 240, isStart: true },
    'c1_top': { id: 'c1_top', col: 1, x: 245, y: 145 },
    'c1_bot': { id: 'c1_bot', col: 1, x: 245, y: 335 },
    'c2_top': { id: 'c2_top', col: 2, x: 410, y: 95 },
    'c2_mid': { id: 'c2_mid', col: 2, x: 410, y: 240 },
    'c2_bot': { id: 'c2_bot', col: 2, x: 410, y: 385 },
    'c3_top': { id: 'c3_top', col: 3, x: 575, y: 145 },
    'c3_bot': { id: 'c3_bot', col: 3, x: 575, y: 335 },
    'c4_top': { id: 'c4_top', col: 4, x: 740, y: 145 },
    'c4_bot': { id: 'c4_bot', col: 4, x: 740, y: 335 },
    'goal':   { id: 'goal',   col: 5, x: 890, y: 240, isGoal: true }
  };

  const EDGES = [
    ['start', 'c1_top'], ['start', 'c1_bot'],
    ['c1_top', 'c2_top'], ['c1_top', 'c2_mid'],
    ['c1_bot', 'c2_mid'], ['c1_bot', 'c2_bot'],
    ['c2_top', 'c3_top'], ['c2_mid', 'c3_top'], ['c2_mid', 'c3_bot'], ['c2_bot', 'c3_bot'],
    ['c3_top', 'c4_top'], ['c3_bot', 'c4_top'], ['c3_bot', 'c4_bot'],
    ['c4_top', 'goal'], ['c4_bot', 'goal']
  ];

  const ADJ = {};
  Object.keys(NODES).forEach(id => ADJ[id] = []);
  EDGES.forEach(([u, v]) => {
    if (NODES[u].col < NODES[v].col) ADJ[u].push(v);
    else ADJ[v].push(u);
  });

  const CHORDLESS_PATHS = [
    ['start', 'c1_top', 'c2_top', 'c3_top', 'c4_top', 'goal'],
    ['start', 'c1_top', 'c2_mid', 'c3_top', 'c4_top', 'goal'],
    ['start', 'c1_top', 'c2_mid', 'c3_bot', 'c4_bot', 'goal'],
    ['start', 'c1_bot', 'c2_mid', 'c3_top', 'c4_top', 'goal'],
    ['start', 'c1_bot', 'c2_mid', 'c3_bot', 'c4_bot', 'goal'],
    ['start', 'c1_bot', 'c2_bot', 'c3_bot', 'c4_bot', 'goal']
  ];

  let chosenPath = [];
  let pathNodes = [];
  let nodeFracs = {};
  let currentNode = 'start';
  let visitedPath = ['start'];

  function generateBoardData() {
    const activePool = (currentLevel === 'meister') ? POOL_MEISTER : POOL_FORSCHER;
    chosenPath = CHORDLESS_PATHS[Math.floor(Math.random() * CHORDLESS_PATHS.length)];
    pathNodes = chosenPath.slice(0, -1); // 5 Knoten ohne 'goal'

    // Wähle 5 echt absteigende Brüche für den Pfad:
    // P0 in [0.82, 0.94], P1 in [0.68, 0.78], P2 in [0.52, 0.64], P3 in [0.36, 0.48], P4 in [0.18, 0.32]
    const p0Cands = activePool.filter(x => x.val >= 0.82 && x.val <= 0.94);
    const p1Cands = activePool.filter(x => x.val >= 0.68 && x.val <= 0.78);
    const p2Cands = activePool.filter(x => x.val >= 0.52 && x.val <= 0.64);
    const p3Cands = activePool.filter(x => x.val >= 0.36 && x.val <= 0.48);
    const p4Cands = activePool.filter(x => x.val >= 0.18 && x.val <= 0.32);

    const p0 = p0Cands.length ? p0Cands[Math.floor(Math.random() * p0Cands.length)] : activePool[activePool.length - 2];
    const p1 = p1Cands.length ? p1Cands[Math.floor(Math.random() * p1Cands.length)] : activePool[Math.floor(activePool.length * 0.7)];
    const p2 = p2Cands.length ? p2Cands[Math.floor(Math.random() * p2Cands.length)] : activePool[Math.floor(activePool.length * 0.5)];
    const p3 = p3Cands.length ? p3Cands[Math.floor(Math.random() * p3Cands.length)] : activePool[Math.floor(activePool.length * 0.3)];
    const p4 = p4Cands.length ? p4Cands[Math.floor(Math.random() * p4Cands.length)] : activePool[Math.floor(activePool.length * 0.15)];

    const sorted5 = [p0, p1, p2, p3, p4];
    nodeFracs = {};
    pathNodes.forEach((nodeId, i) => {
      nodeFracs[nodeId] = sorted5[i];
    });

    // Knifflige Distraktoren:
    // An jeder Verzweigung muss der falsche Weg >= dem aktuellen Bruch sein.
    // Für echte mathematische Schwierigkeit: Distraktor soll NAH am aktuellen Bruch liegen (+0.02 bis +0.15)!
    pathNodes.forEach((u, i) => {
      let nextNode = chosenPath[i + 1];
      let uVal = nodeFracs[u].val;
      for (let v of ADJ[u]) {
        if (v === 'goal' || v === nextNode || nodeFracs[v]) continue;
        // Nahe Distraktoren (knapp größer als uVal)
        let closeItems = activePool.filter(item => item.val >= uVal && item.val <= uVal + 0.15 && item.str !== nodeFracs[u].str);
        if (closeItems.length > 0) {
          nodeFracs[v] = closeItems[Math.floor(Math.random() * closeItems.length)];
        } else {
          let geItems = activePool.filter(item => item.val >= uVal && item.str !== nodeFracs[u].str);
          nodeFracs[v] = geItems.length > 0 ? geItems[0] : activePool[activePool.length - 1];
        }
      }
    });

    // Restliche Hintergrund-Knoten auffüllen
    Object.keys(NODES).forEach(nodeId => {
      if (nodeId === 'goal') {
        NODES[nodeId].frac = { num: 0, den: 1, val: 0, str: 'Ziel' };
        return;
      }
      if (!nodeFracs[nodeId]) {
        nodeFracs[nodeId] = activePool[Math.floor(Math.random() * activePool.length)];
      }
      NODES[nodeId].frac = nodeFracs[nodeId];
    });

    currentNode = 'start';
    visitedPath = ['start'];
    steps = 0;
    eliminatedNodes.clear();
    jokerFiftyUsed = false;
    jokerHintUsed = false;
  }

  generateBoardData();

  const content = document.getElementById('arenaContent');
  content.style.padding = '12px';
  content.style.alignItems = 'center';

  content.innerHTML = `
    <div class="expedition-arena">
      <div class="expedition-toolbar">
        <div class="level-toggle-group">
          <button class="lvl-btn ${currentLevel === 'meister' ? 'active' : ''}" id="lvlMeisterBtn" title="Ungleichnamige Brüche & Prim-Nenner (UPP-Niveau)">⚡ Meister-Stufe (Schwierig 🔥)</button>
          <button class="lvl-btn ${currentLevel === 'forscher' ? 'active' : ''}" id="lvlForscherBtn" title="Glattere Nenner">🌱 Forscher-Stufe</button>
        </div>
        <div class="jokers-group">
          <button class="joker-btn" id="jokerFiftyBtn" title="Streicht einen falschen Weg">✂️ 50:50</button>
          <button class="joker-btn" id="jokerHintBtn" title="Verrät den Hauptnenner">🔍 Lupe</button>
          <button class="joker-btn" id="shuffleBoardBtn" title="Neues Gitter mit neuen Zufallsbrüchen">🎲 Neu mischen</button>
        </div>
      </div>

      <div class="expedition-toast" id="expeditionToast" style="display: none;"></div>

      <div class="expedition-instruction">
        🧭 <strong>Regel:</strong> Wählt immer einen <strong>kleineren</strong> Bruch nach rechts!
      </div>

      <div class="board-wrapper">
        <svg id="boardSvg" viewBox="0 0 980 480" preserveAspectRatio="xMidYMid meet">
          <g id="edgesLayer"></g>
          <g id="teamPathLayer"></g>
          <g id="nodesLayer"></g>
          <g id="tokensLayer"></g>
        </svg>
      </div>
    </div>
  `;

  function showExpToast(msg) {
    const t = document.getElementById('expeditionToast');
    if (!t) return;
    t.innerHTML = msg;
    t.style.display = 'block';
    setTimeout(() => {
      t.style.display = 'none';
    }, 4500);
  }

  // Level Buttons
  document.getElementById('lvlMeisterBtn').onclick = () => {
    if (currentLevel === 'meister') return;
    initGame1('meister');
  };
  document.getElementById('lvlForscherBtn').onclick = () => {
    if (currentLevel === 'forscher') return;
    initGame1('forscher');
  };

  // Joker 50:50
  document.getElementById('jokerFiftyBtn').onclick = () => {
    if (jokerFiftyUsed) return;
    let candidateIds = ADJ[currentNode] || [];
    let currNode = NODES[currentNode];
    let wrongCandidates = candidateIds.filter(id => {
      if (NODES[id].isGoal || eliminatedNodes.has(id)) return false;
      return NODES[id].frac.val >= currNode.frac.val; // Falscher Weg
    });

    if (wrongCandidates.length === 0) {
      showExpToast('💡 Alle verbleibenden Wege führen zum Ziel!');
      return;
    }

    let toEliminate = wrongCandidates[Math.floor(Math.random() * wrongCandidates.length)];
    eliminatedNodes.add(toEliminate);
    jokerFiftyUsed = true;
    document.getElementById('jokerFiftyBtn').disabled = true;
    playSound('correct');
    showExpToast(`✂️ <strong>50:50:</strong> Knoten <strong>${NODES[toEliminate].frac.str}</strong> ist eine Falle und wurde gestrichen!`);
    renderBoard();
  };

  // Joker Lupe (Hauptnenner)
  document.getElementById('jokerHintBtn').onclick = () => {
    if (jokerHintUsed) return;
    let candidateIds = ADJ[currentNode] || [];
    if (candidateIds.length === 0) return;
    let currNode = NODES[currentNode];
    let dens = [currNode.frac.den];
    candidateIds.forEach(id => {
      let n = NODES[id];
      if (n && !n.isGoal && !eliminatedNodes.has(id)) dens.push(n.frac.den);
    });

    let overallLCM = dens.reduce((acc, d) => lcm(acc, d), 1);
    jokerHintUsed = true;
    document.getElementById('jokerHintBtn').disabled = true;
    playSound('correct');
    showExpToast(`🔍 <strong>Hauptnenner-Lupe:</strong> Erweitert die Brüche an dieser Kreuzung auf <strong>${overallLCM}</strong>!`);
  };

  // Neu mischen Button
  document.getElementById('shuffleBoardBtn').onclick = () => {
    generateBoardData();
    renderBoard();
    showExpToast('🎲 <strong>Neues Spielfeld:</strong> Frische Zufallsbrüche generiert!');
  };

  function renderBoard() {
    scoreEl.textContent = `Schritte: ${steps} / 5`;
    livesEl.textContent = getHeartString(lives);

    const edgesLayer = document.getElementById('edgesLayer');
    const teamPathLayer = document.getElementById('teamPathLayer');
    const nodesLayer = document.getElementById('nodesLayer');
    const tokensLayer = document.getElementById('tokensLayer');

    edgesLayer.innerHTML = '';
    teamPathLayer.innerHTML = '';
    nodesLayer.innerHTML = '';
    tokensLayer.innerHTML = '';

    let candidateIds = ADJ[currentNode] || [];

    // 1. Kanten
    EDGES.forEach(([u, v]) => {
      let nU = NODES[u];
      let nV = NODES[v];
      let line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', nU.x);
      line.setAttribute('y1', nU.y);
      line.setAttribute('x2', nV.x);
      line.setAttribute('y2', nV.y);

      let isCandidateEdge = (u === currentNode && candidateIds.includes(v)) ||
                            (v === currentNode && candidateIds.includes(u));

      line.setAttribute('class', isCandidateEdge ? 'edge-line edge-candidate' : 'edge-line');
      edgesLayer.appendChild(line);
    });

    // 2. Pfad
    if (visitedPath.length >= 2) {
      for (let i = 0; i < visitedPath.length - 1; i++) {
        let u = NODES[visitedPath[i]];
        let v = NODES[visitedPath[i + 1]];
        let line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', u.x);
        line.setAttribute('y1', u.y);
        line.setAttribute('x2', v.x);
        line.setAttribute('y2', v.y);
        line.setAttribute('class', 'edge-line edge-team-path');
        teamPathLayer.appendChild(line);
      }
    }

    // 3. Knoten
    Object.values(NODES).forEach(node => {
      let g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.setAttribute('transform', `translate(${node.x}, ${node.y})`);
      g.setAttribute('id', `node_${node.id}`);

      let cls = ['node-g'];
      if (node.isStart) cls.push('is-start');
      if (node.isGoal) cls.push('is-goal');
      if (candidateIds.includes(node.id) && !eliminatedNodes.has(node.id)) cls.push('is-candidate');
      if (eliminatedNodes.has(node.id)) cls.push('is-eliminated');
      if (currentNode === node.id) cls.push('pos-team');
      g.setAttribute('class', cls.join(' '));

      g.addEventListener('click', (e) => {
        e.preventDefault();
        handleNodeClick(node.id);
      });

      let c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      c.setAttribute('r', '32');
      c.setAttribute('class', 'node-base-circle');
      g.appendChild(c);

      // Textbeschriftung
      if (node.isStart) {
        let tStart = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        tStart.setAttribute('class', 'node-txt');
        tStart.setAttribute('y', '-13');
        tStart.setAttribute('style', 'font-size: 11px; fill: #059669; font-weight: 800;');
        tStart.textContent = 'START';
        g.appendChild(tStart);

        drawNodeFraction(g, node.frac, 5);
      } else if (node.isGoal) {
        let tGoal = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        tGoal.setAttribute('class', 'node-txt single');
        tGoal.setAttribute('y', '2');
        tGoal.setAttribute('style', 'fill: #b45309; font-size: 15px; font-weight: 900;');
        tGoal.textContent = 'ZIEL 🏁';
        g.appendChild(tGoal);
      } else {
        drawNodeFraction(g, node.frac, 0);
      }

      nodesLayer.appendChild(g);
    });

    // 4. Spielfigur
    let activeNode = NODES[currentNode];
    if (activeNode) {
      let token = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      token.setAttribute('x', activeNode.x);
      token.setAttribute('y', activeNode.y - 32);
      token.setAttribute('class', 'team-token');
      token.setAttribute('text-anchor', 'middle');
      token.setAttribute('dominant-baseline', 'central');
      token.textContent = '🧭';
      tokensLayer.appendChild(token);
    }
  }

  function drawNodeFraction(g, frac, yOffset) {
    if (!frac.den || frac.den === 1) {
      let tInt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      tInt.setAttribute('class', 'node-txt single');
      tInt.setAttribute('y', `${yOffset + 2}`);
      tInt.textContent = frac.str;
      g.appendChild(tInt);
      return;
    }

    let tNum = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    tNum.setAttribute('class', 'node-txt num');
    tNum.setAttribute('y', `${yOffset - 9}`);
    tNum.textContent = frac.num;
    g.appendChild(tNum);

    let bar = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    bar.setAttribute('x1', '-14');
    bar.setAttribute('x2', '14');
    bar.setAttribute('y1', `${yOffset - 2}`);
    bar.setAttribute('y2', `${yOffset - 2}`);
    bar.setAttribute('class', 'node-frac-bar');
    g.appendChild(bar);

    let tDen = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    tDen.setAttribute('class', 'node-txt den');
    tDen.setAttribute('y', `${yOffset + 12}`);
    tDen.textContent = frac.den;
    g.appendChild(tDen);
  }

  function handleNodeClick(targetId) {
    let candidateIds = ADJ[currentNode] || [];
    if (!candidateIds.includes(targetId) || eliminatedNodes.has(targetId)) return;

    if (targetId === 'goal') {
      playSound('fanfare');
      winStation(1, '🧭', 'Meister-Pfadfinder der Brüche!');
      return;
    }

    let currNode = NODES[currentNode];
    let targetNode = NODES[targetId];

    // Regel: Der nächste Bruch MUSS kleiner sein!
    if (targetNode.frac.val < currNode.frac.val) {
      // RICHTIG!
      playSound('correct');
      visitedPath.push(targetId);
      currentNode = targetId;
      steps++;
      renderBoard();
    } else {
      // FALSCH: Bruch ist nicht kleiner!
      playSound('wrong');
      lives--;
      livesEl.textContent = getHeartString(lives);

      let H = lcm(currNode.frac.den, targetNode.frac.den);
      let factorCurr = H / currNode.frac.den;
      let factorTarget = H / targetNode.frac.den;
      let expCurr = currNode.frac.num * factorCurr;
      let expTarget = targetNode.frac.num * factorTarget;

      let explanationHtml = `
        <div class="comp-row">
          <div class="comp-card">
            <small>Bisheriger Bruch:</small>
            <div class="comp-frac-big">
              <span>${currNode.frac.num}</span>
              <div class="bar"></div>
              <span>${currNode.frac.den}</span>
            </div>
            <div class="expansion-box">
              Erweitert mit <strong>${factorCurr}</strong>: <strong>${expCurr}/${H}</strong>
            </div>
          </div>
          <div class="comp-sign">${targetNode.frac.val === currNode.frac.val ? '=' : '‹'}</div>
          <div class="comp-card">
            <small>Gewählte Abzweigung:</small>
            <div class="comp-frac-big">
              <span>${targetNode.frac.num}</span>
              <div class="bar"></div>
              <span>${targetNode.frac.den}</span>
            </div>
            <div class="expansion-box">
              Erweitert mit <strong>${factorTarget}</strong>: <strong>${expTarget}/${H}</strong>
            </div>
          </div>
        </div>
        <div class="didactic-conclusion">
          <strong>⚠️ Halt! Keine Vorwärtsbewegung möglich:</strong><br>
          Der gewählte Bruch <strong>${targetNode.frac.str}</strong> (${expTarget}/${H}) ist <strong>${targetNode.frac.val === currNode.frac.val ? 'gleich groß wie' : 'größer als'}</strong> euer bisheriger Bruch <strong>${currNode.frac.str}</strong> (${expCurr}/${H})!<br>
          Gesucht war ein <strong>kleinerer</strong> Bruch.<br><br>
          Verbleibende Leben: <strong>${getHeartString(lives)}</strong> (${lives} von 3)
        </div>
      `;

      showExplanation('⚠️ Bruch ist nicht kleiner!', explanationHtml);

      if (lives <= 0) {
        setTimeout(() => {
          closeExplanationModal();
          showGameOver('KEINE LEBEN MEHR!', 'Ihr habt alle 3 Leben verloren. Der Pfad startet mit neuen kniffligen Zufallsbrüchen von vorne!', () => initGame1(currentLevel));
        }, 800);
      }
    }
  }

  renderBoard();
}

// ==========================================================================
// 2. SPIEL 🔄 BRUCH-ZWILLINGE SPEED-MEMORY
// - Gemischte Darstellungen: Quotienten, Brüche, Prozente
// - Größeres Deck: 6 Paare (12 Karten)
// - Realistische 15 Versuche! Bei 0 Versuchen -> Neustart mit neu gemischtem Deck
// ==========================================================================
function initGame2() {
  document.getElementById('arenaTitle').textContent = '🔄 Station 2: Bruch-Zwillinge Memory';
  const livesEl = document.getElementById('arenaLives');
  const scoreEl = document.getElementById('arenaScore');
  livesEl.style.display = 'inline-flex';

  let attempts = 15;
  let matchedPairs = 0;
  const targetPairs = 6;
  let flippedCards = [];
  let isLocked = false;

  livesEl.textContent = `🎯 ${attempts} Versuche`;
  scoreEl.textContent = `Paare: 0 / ${targetPairs}`;

  // Pool an gemischten Paaren (Quotient, Bruch, Prozent)
  const PAIRS_POOL = [
    {
      pairId: 1,
      note: '1 : 2 = 50 % (die Hälfte!)',
      c1: { type: 'Quotient', html: '<span class="mem-value-quotient">1 : 2</span>', badge: 'badge-quotient' },
      c2: { type: 'Prozent',  html: '<span class="mem-value-pct">50 %</span>',        badge: 'badge-prozent' }
    },
    {
      pairId: 2,
      note: '3/4 = 75 % (drei Viertel!)',
      c1: { type: 'Bruch',   html: '<div class="fraction-display"><span class="num">3</span><span class="den">4</span></div>', badge: 'badge-bruch' },
      c2: { type: 'Prozent', html: '<span class="mem-value-pct">75 %</span>', badge: 'badge-prozent' }
    },
    {
      pairId: 3,
      note: '2 : 5 = 2/5 (oder 40 %)',
      c1: { type: 'Quotient', html: '<span class="mem-value-quotient">2 : 5</span>', badge: 'badge-quotient' },
      c2: { type: 'Bruch',    html: '<div class="fraction-display"><span class="num">2</span><span class="den">5</span></div>', badge: 'badge-bruch' }
    },
    {
      pairId: 4,
      note: '1 : 4 = 25 % (ein Viertel!)',
      c1: { type: 'Quotient', html: '<span class="mem-value-quotient">1 : 4</span>', badge: 'badge-quotient' },
      c2: { type: 'Prozent',  html: '<span class="mem-value-pct">25 %</span>', badge: 'badge-prozent' }
    },
    {
      pairId: 5,
      note: '4/5 = 80 % (vier Fünftel!)',
      c1: { type: 'Bruch',   html: '<div class="fraction-display"><span class="num">4</span><span class="den">5</span></div>', badge: 'badge-bruch' },
      c2: { type: 'Prozent', html: '<span class="mem-value-pct">80 %</span>', badge: 'badge-prozent' }
    },
    {
      pairId: 6,
      note: '3 : 5 = 60 % (drei Fünftel!)',
      c1: { type: 'Quotient', html: '<span class="mem-value-quotient">3 : 5</span>', badge: 'badge-quotient' },
      c2: { type: 'Prozent',  html: '<span class="mem-value-pct">60 %</span>', badge: 'badge-prozent' }
    },
    {
      pairId: 7,
      note: '1 : 5 = 20 % (ein Fünftel!)',
      c1: { type: 'Quotient', html: '<span class="mem-value-quotient">1 : 5</span>', badge: 'badge-quotient' },
      c2: { type: 'Prozent',  html: '<span class="mem-value-pct">20 %</span>', badge: 'badge-prozent' }
    },
    {
      pairId: 8,
      note: '1 : 10 = 10 % (ein Zehntel!)',
      c1: { type: 'Quotient', html: '<span class="mem-value-quotient">1 : 10</span>', badge: 'badge-quotient' },
      c2: { type: 'Prozent',  html: '<span class="mem-value-pct">10 %</span>',  badge: 'badge-prozent' }
    },
    {
      pairId: 9,
      note: '1 : 3 = 1/3 (ein Drittel!)',
      c1: { type: 'Quotient', html: '<span class="mem-value-quotient">1 : 3</span>', badge: 'badge-quotient' },
      c2: { type: 'Bruch',    html: '<div class="fraction-display"><span class="num">1</span><span class="den">3</span></div>', badge: 'badge-bruch' }
    },
    {
      pairId: 10,
      note: '7 : 10 = 70 % (sieben Zehntel!)',
      c1: { type: 'Quotient', html: '<span class="mem-value-quotient">7 : 10</span>', badge: 'badge-quotient' },
      c2: { type: 'Prozent',  html: '<span class="mem-value-pct">70 %</span>',  badge: 'badge-prozent' }
    }
  ];

  // 6 Paare zufällig auswählen
  let chosenPairs = [...PAIRS_POOL].sort(() => Math.random() - 0.5).slice(0, targetPairs);

  let deck = [];
  chosenPairs.forEach(p => {
    deck.push({ pairId: p.pairId, note: p.note, ...p.c1 });
    deck.push({ pairId: p.pairId, note: p.note, ...p.c2 });
  });
  deck.sort(() => Math.random() - 0.5);

  const content = document.getElementById('arenaContent');
  content.innerHTML = `
    <div class="memory-arena">
      <div class="memory-header-info">
        Finde die Paare mit gleichem Wert (Quotient ↔ Bruch ↔ Prozent)!
      </div>
      <div class="memory-factor-banner" id="memBanner">
        Tippe auf zwei Karten zum Aufdecken!
      </div>
      <div class="memory-grid" id="memGrid" style="grid-template-columns: repeat(4, 1fr);"></div>
    </div>
  `;

  const grid = document.getElementById('memGrid');

  deck.forEach((card, index) => {
    const cardEl = document.createElement('div');
    cardEl.className = 'mem-card';
    cardEl.dataset.index = index;

    cardEl.innerHTML = `
      <div class="mem-card-face mem-card-back">
        <div class="card-logo">🔄</div>
        <div class="card-label">Mathe</div>
      </div>
      <div class="mem-card-face mem-card-front">
        <div class="mem-card-type-badge ${card.badge}">${card.type}</div>
        ${card.html}
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
      attempts--;
      livesEl.textContent = `🎯 ${attempts} Versuche`;

      const [c1, c2] = flippedCards;

      if (c1.card.pairId === c2.card.pairId) {
        // MATCH!
        playSound('correct');
        c1.el.classList.add('matched');
        c2.el.classList.add('matched');
        matchedPairs++;
        scoreEl.textContent = `Paare: ${matchedPairs} / ${targetPairs}`;
        document.getElementById('memBanner').innerHTML = `🎉 <strong>Treffer!</strong> ${c1.card.note}`;

        flippedCards = [];
        isLocked = false;

        if (matchedPairs >= targetPairs) {
          setTimeout(() => {
            winStation(2, '🔄', 'Bruch-Zwillinge Meister!');
          }, 700);
        }
      } else {
        // NO MATCH
        playSound('wrong');
        document.getElementById('memBanner').textContent = '❌ Keine Übereinstimmung!';
        setTimeout(() => {
          c1.el.classList.remove('flipped');
          c2.el.classList.remove('flipped');
          flippedCards = [];
          isLocked = false;

          if (attempts <= 0 && matchedPairs < targetPairs) {
            showGameOver(
              'KEINE VERSUCHE MEHR!',
              'Du hast alle 15 Versuche aufgebraucht. Das Memory-Deck wird neu gemischt!',
              () => initGame2()
            );
          }
        }, 900);
      }
    }
  }
}

// ==========================================================================
// 3. SPIEL 🔍 WELCHER PASST NICHT? (ODD-ONE-OUT)
// - 7 Runden (länger & abwechslungsreicher)
// - 3 Leben! Bei falscher Wahl -> 1 Leben verloren
// - Bei 0 Leben -> Neustart mit neuen Aufgaben
// ==========================================================================
function initGame3() {
  document.getElementById('arenaTitle').textContent = '🔍 Station 3: Welcher passt nicht?';
  const livesEl = document.getElementById('arenaLives');
  const scoreEl = document.getElementById('arenaScore');
  livesEl.style.display = 'inline-flex';

  let lives = 3;
  let score = 0;
  const targetScore = 7;

  livesEl.textContent = getHeartString(lives);
  scoreEl.textContent = `Runde: 1 / ${targetScore}`;

  function fracHtml3(n, d) {
    return `<div class="oon-frac"><span class="oon-num">${n}</span><span class="oon-den">${d}</span></div>`;
  }

  function barSvg3(num, den) {
    const total = Math.min(den, 8);
    const filled = Math.round((num / den) * total);
    const cells = Array.from({length: total}, (_, i) =>
      `<rect x="${i*(100/total)+1}" y="6" width="${100/total-2}" height="18" rx="3"
             fill="${i < filled ? '#16a34a' : '#e2e8f0'}"/>`
    ).join('');
    return `<svg viewBox="0 0 100 30" width="80" height="24">${cells}</svg>`;
  }

  const ALL_ROUNDS = [
    {
      question: 'Drei Karten zeigen denselben Wert – welche passt NICHT?',
      cards: [
        { label: 'Quotient',  html: '1 : 2',           correct: true  }, // 1/2
        { label: 'Prozent',   html: '50 %',            correct: true  }, // 50%
        { label: 'Bild',      html: barSvg3(1,2),      correct: true  }, // 1/2
        { label: 'Bruch',     html: fracHtml3(3,5),    correct: false }, // 3/5 ≠ 1/2
      ],
      explanation: '3/5 = 60 % – das passt nicht! Die anderen zeigen alle ½ = 50 %.'
    },
    {
      question: 'Drei Karten zeigen denselben Wert – welche passt NICHT?',
      cards: [
        { label: 'Bruch',     html: fracHtml3(3,4),    correct: true  }, // 3/4
        { label: 'Quotient',  html: '3 : 4',           correct: true  }, // 3/4
        { label: 'Prozent',   html: '75 %',            correct: true  }, // 75%
        { label: 'Prozent',   html: '60 %',            correct: false }, // 60% ≠ 3/4
      ],
      explanation: '60 % ≠ ¾! 3 : 4 ist 75 %, und der Bruch 3/4 ist ebenfalls 75 %.'
    },
    {
      question: 'Drei Karten zeigen denselben Wert – welche passt NICHT?',
      cards: [
        { label: 'Prozent',   html: '25 %',            correct: true  }, // 25%
        { label: 'Bild',      html: barSvg3(1,4),      correct: true  }, // 1/4
        { label: 'Quotient',  html: '1 : 4',           correct: true  }, // 1/4
        { label: 'Bruch',     html: fracHtml3(2,5),    correct: false }, // 2/5 = 40% ≠ 1/4
      ],
      explanation: '2/5 = 40 % – das passt nicht! Alle anderen zeigen ¼ = 25 %.'
    },
    {
      question: 'Drei Karten zeigen denselben Wert – welche passt NICHT?',
      cards: [
        { label: 'Quotient',  html: '2 : 5',           correct: true  }, // 2/5
        { label: 'Bruch',     html: fracHtml3(2,5),    correct: true  }, // 2/5
        { label: 'Bild',      html: barSvg3(2,5),      correct: true  }, // 2/5
        { label: 'Prozent',   html: '50 %',            correct: false }, // 50% ≠ 2/5
      ],
      explanation: '50 % = ½ – das passt nicht! Die anderen zeigen alle 2/5 = 40 %.'
    },
    {
      question: 'Drei Karten zeigen denselben Wert – welche passt NICHT?',
      cards: [
        { label: 'Bruch',     html: fracHtml3(1,5),    correct: true  }, // 1/5
        { label: 'Quotient',  html: '1 : 5',           correct: true  }, // 1/5
        { label: 'Prozent',   html: '20 %',            correct: true  }, // 20%
        { label: 'Prozent',   html: '30 %',            correct: false }, // 30% ≠ 1/5
      ],
      explanation: '30 % passt nicht! 1 : 5 = 1/5 = 20 %.'
    },
    {
      question: 'Drei Karten zeigen denselben Wert – welche passt NICHT?',
      cards: [
        { label: 'Quotient',  html: '4 : 5',           correct: true  }, // 4/5
        { label: 'Bild',      html: barSvg3(4,5),      correct: true  }, // 4/5
        { label: 'Prozent',   html: '80 %',            correct: true  }, // 80%
        { label: 'Bruch',     html: fracHtml3(3,4),    correct: false }, // 3/4 = 75% ≠ 4/5
      ],
      explanation: '3/4 = 75 % – das passt nicht! Die anderen zeigen alle 4/5 = 80 %.'
    },
    {
      question: 'Drei Karten zeigen denselben Wert – welche passt NICHT?',
      cards: [
        { label: 'Bruch',     html: fracHtml3(3,5),    correct: true  }, // 3/5
        { label: 'Quotient',  html: '3 : 5',           correct: true  }, // 3/5
        { label: 'Prozent',   html: '60 %',            correct: true  }, // 60%
        { label: 'Bruch',     html: fracHtml3(1,2),    correct: false }, // 1/2 = 50% ≠ 3/5
      ],
      explanation: '1/2 = 50 % – das passt nicht! 3 : 5 = 3/5 = 60 %.'
    },
    {
      question: 'Drei Karten zeigen denselben Wert – welche passt NICHT?',
      cards: [
        { label: 'Quotient',  html: '1 : 10',          correct: true  }, // 1/10
        { label: 'Bruch',     html: fracHtml3(1,10),   correct: true  }, // 1/10
        { label: 'Prozent',   html: '10 %',            correct: true  }, // 10%
        { label: 'Prozent',   html: '25 %',            correct: false }, // 25% ≠ 1/10
      ],
      explanation: '25 % = ¼ – das passt nicht! 1 : 10 = 1/10 = 10 %.'
    },
    {
      question: 'Drei Karten zeigen denselben Wert – welche passt NICHT?',
      cards: [
        { label: 'Quotient',  html: '1 : 3',           correct: true  }, // 1/3
        { label: 'Bruch',     html: fracHtml3(1,3),    correct: true  }, // 1/3
        { label: 'Bild',      html: barSvg3(1,3),      correct: true  }, // 1/3
        { label: 'Prozent',   html: '40 %',            correct: false }, // 40% ≠ 1/3
      ],
      explanation: '40 % = 2/5 – das passt nicht! Die anderen zeigen alle ⅓ ≈ 33 %.'
    },
    {
      question: 'Drei Karten zeigen denselben Wert – welche passt NICHT?',
      cards: [
        { label: 'Quotient',  html: '7 : 10',          correct: true  }, // 7/10
        { label: 'Prozent',   html: '70 %',            correct: true  }, // 70%
        { label: 'Bild',      html: barSvg3(7,10),     correct: true  }, // 7/10
        { label: 'Prozent',   html: '75 %',            correct: false }, // 75% ≠ 70%
      ],
      explanation: '75 % = ¾ – das passt nicht! 7 : 10 = 7/10 = 70 %.'
    }
  ];

  let rounds = [...ALL_ROUNDS].sort(() => Math.random() - 0.5).slice(0, targetScore);
  let roundIdx = 0;

  function renderRound() {
    scoreEl.textContent = `Runde: ${score + 1} / ${targetScore}`;
    livesEl.textContent = getHeartString(lives);

    if (score >= targetScore) {
      winStation(3, '🔍', 'Ausreißer-Detektor – Meisterlevel!');
      return;
    }

    const r = rounds[roundIdx % rounds.length];
    const shuffled = [...r.cards].sort(() => Math.random() - 0.5);
    const content = document.getElementById('arenaContent');

    content.innerHTML = `
      <div class="oon-arena">
        <div class="oon-question">${r.question}</div>
        <div class="oon-grid" id="oonGrid"></div>
        <div class="oon-feedback" id="oonFeedback"></div>
      </div>
    `;

    const grid = document.getElementById('oonGrid');
    shuffled.forEach(card => {
      const el = document.createElement('div');
      el.className = 'oon-card';
      el.innerHTML = `
        <div class="oon-type-label">${card.label}</div>
        <div class="oon-value">${card.html}</div>
      `;
      el.onclick = () => {
        if (card.correct) {
          // FALSCHE WAHL: Karte gehört zur Gruppe, ist kein Ausreißer!
          playSound('wrong');
          el.classList.add('oon-wrong');
          lives--;
          livesEl.textContent = getHeartString(lives);
          document.getElementById('oonFeedback').innerHTML =
            `❌ Das gehört dazu! ${r.explanation}`;

          grid.querySelectorAll('.oon-card').forEach((c, i) => {
            if (!shuffled[i].correct) c.classList.add('oon-highlight');
          });

          if (lives <= 0) {
            setTimeout(() => {
              showGameOver(
                'KEINE LEBEN MEHR!',
                'Du hast alle 3 Leben verloren. Neue Aufgaben werden geladen!',
                () => initGame3()
              );
            }, 1200);
          } else {
            setTimeout(() => {
              roundIdx++;
              renderRound();
            }, 1800);
          }
        } else {
          // RICHTIG: Ausreißer gefunden!
          playSound('correct');
          el.classList.add('oon-correct');
          score++;
          document.getElementById('oonFeedback').innerHTML =
            `✅ Genau! ${r.explanation}`;
          setTimeout(() => {
            roundIdx++;
            renderRound();
          }, 1200);
        }
      };
      grid.appendChild(el);
    });
  }

  renderRound();
}

// ==========================================================================
// 4. SPIEL 🁣 BRUCH-DOMINO (GLEICHWERTIGE DARSTELLUNGEN)
// - Mit vorgelegtem Startstein
// - Längere Kette: 6 Schritte (7 Kacheln)
// - Gemischte Darstellungen: Quotient, Bruch, Prozent, Bild
// - 3 Leben! Bei falscher Kachel -> 1 Leben verloren, bei 0 Leben Neustart
// ==========================================================================
function initGame4() {
  document.getElementById('arenaTitle').textContent = '🁣 Station 4: Bruch-Domino';
  const livesEl = document.getElementById('arenaLives');
  const scoreEl = document.getElementById('arenaScore');
  livesEl.style.display = 'inline-flex';

  let lives = 3;
  let step = 0;
  const totalSteps = 6;

  livesEl.textContent = getHeartString(lives);
  scoreEl.textContent = `Gelegt: 0 / ${totalSteps}`;

  function makeCell(type, eq) {
    const MAP = {
      1: { frac: '1/2', quot: '1 : 2',  pct: '50 %', svg: svgBar(1,2) },
      2: { frac: '1/4', quot: '1 : 4',  pct: '25 %', svg: svgBar(1,4) },
      3: { frac: '3/4', quot: '3 : 4',  pct: '75 %', svg: svgBar(3,4) },
      4: { frac: '2/5', quot: '2 : 5',  pct: '40 %', svg: svgBar(2,5) },
      5: { frac: '1/5', quot: '1 : 5',  pct: '20 %', svg: svgBar(1,5) },
      6: { frac: '4/5', quot: '4 : 5',  pct: '80 %', svg: svgBar(4,5) }
    };
    const d = MAP[eq] || MAP[1];
    if (type === 'frac') return `<div class="dom-cell dom-frac">${fracHtml(d.frac)}</div>`;
    if (type === 'quot') return `<div class="dom-cell dom-quot"><span class="mem-value-quotient" style="font-size:1.15rem;">${d.quot}</span></div>`;
    if (type === 'pct')  return `<div class="dom-cell dom-pct">${d.pct}</div>`;
    if (type === 'img')  return `<div class="dom-cell dom-img">${d.svg}</div>`;
    return '';
  }

  function fracHtml(str) {
    const [n, d] = str.split('/');
    return `<div class="dom-fraction"><span class="dom-num">${n}</span><span class="dom-den">${d}</span></div>`;
  }

  function svgBar(num, den) {
    const total = Math.min(den, 8);
    const filled = Math.round((num / den) * total);
    const cells = Array.from({length: total}, (_, i) =>
      `<rect x="${i*(100/total)+1}" y="8" width="${100/total-2}" height="14" rx="2"
             fill="${i < filled ? '#16a34a' : '#e2e8f0'}"/>`
    ).join('');
    return `<svg viewBox="0 0 100 30" width="72" height="22" class="dom-bar-svg">${cells}</svg>`;
  }

  // 7 Kacheln Kette: chain[0] ist der vorgelegte Startstein!
  const chain = [
    { leftEq: 1, leftType: 'frac', rightEq: 2, rightType: 'pct'  }, // Startstein: 1/2 | 25%
    { leftEq: 2, leftType: 'quot', rightEq: 3, rightType: 'frac' }, // 1:4 | 3/4
    { leftEq: 3, leftType: 'pct',  rightEq: 4, rightType: 'quot' }, // 75% | 2:5
    { leftEq: 4, leftType: 'img',  rightEq: 5, rightType: 'pct'  }, // Bild 2/5 | 20%
    { leftEq: 5, leftType: 'quot', rightEq: 6, rightType: 'frac' }, // 1:5 | 4/5
    { leftEq: 6, leftType: 'pct',  rightEq: 1, rightType: 'quot' }, // 80% | 1:2
    { leftEq: 1, leftType: 'img',  rightEq: 3, rightType: 'pct'  }  // Bild 1/2 | 75%
  ];

  const distractors = [
    { leftEq: 3, leftType: 'frac', rightEq: 5, rightType: 'pct' },
    { leftEq: 1, leftType: 'img',  rightEq: 4, rightType: 'quot'},
    { leftEq: 4, leftType: 'pct',  rightEq: 2, rightType: 'frac'},
    { leftEq: 5, leftType: 'frac', rightEq: 1, rightType: 'quot'},
    { leftEq: 2, leftType: 'pct',  rightEq: 3, rightType: 'img' },
    { leftEq: 4, leftType: 'quot', rightEq: 6, rightType: 'pct' }
  ];

  const content = document.getElementById('arenaContent');

  function renderDomino() {
    scoreEl.textContent = `Gelegt: ${step} / ${totalSteps}`;
    livesEl.textContent = getHeartString(lives);

    if (step >= totalSteps) {
      winStation(4, '🁣', 'Domino-Meister der gleichwertigen Brüche!');
      return;
    }

    const prevTile = chain[step];
    const correct  = chain[step + 1];
    const dist1    = distractors[step % distractors.length];
    const dist2    = distractors[(step + 2) % distractors.length];

    const startBadge = step === 0
      ? `<div class="dom-startbadge">🟢 Startstein</div>` : '';

    const chainHtml = `
      <div class="dom-placed-wrap">
        <div class="dom-tile-wrap">
          ${startBadge}
          <div class="dom-tile dom-tile-placed">
            ${makeCell(prevTile.leftType, prevTile.leftEq)}
            <div class="dom-divider"></div>
            ${makeCell(prevTile.rightType, prevTile.rightEq)}
          </div>
        </div>
        <div class="dom-arrow">➜</div>
        <div class="dom-tile dom-tile-next">
          <div class="dom-cell dom-cell-open">${makeCell(prevTile.rightType, prevTile.rightEq)}</div>
          <div class="dom-divider"></div>
          <div class="dom-cell dom-cell-question">?</div>
        </div>
      </div>`;

    const allOpts = [correct, dist1, dist2].sort(() => Math.random() - 0.5);

    content.innerHTML = `
      <div class="domino-arena">
        <div class="dom-chain-area">
          <div class="dom-step-label">Kachel ${step + 1} von ${totalSteps}: Welche Kachel passt als Nächstes?</div>
          ${chainHtml}
        </div>
        <div class="dom-options-grid" id="domOptions"></div>
        <div class="dom-hint" id="domHint"></div>
      </div>
    `;

    const grid = document.getElementById('domOptions');
    allOpts.forEach(opt => {
      const tile = document.createElement('div');
      tile.className = 'dom-tile dom-tile-option';
      const isCorrect = (opt === correct);

      tile.innerHTML = `
        ${makeCell(opt.leftType, opt.leftEq)}
        <div class="dom-divider"></div>
        ${makeCell(opt.rightType, opt.rightEq)}
      `;

      tile.onclick = () => {
        if (isCorrect) {
          playSound('correct');
          tile.classList.add('dom-tile-correct');
          step++;
          setTimeout(renderDomino, 550);
        } else {
          playSound('wrong');
          tile.classList.add('dom-tile-wrong');
          lives--;
          livesEl.textContent = getHeartString(lives);
          const hint = document.getElementById('domHint');
          hint.textContent = `❌ Passt nicht! Verbleibende Leben: ${getHeartString(lives)}`;

          if (lives <= 0) {
            setTimeout(() => {
              showGameOver(
                'KEINE LEBEN MEHR!',
                'Du hast alle 3 Leben verloren. Das Domino startet mit neuen Kacheln von vorne!',
                () => initGame4()
              );
            }, 1000);
          } else {
            setTimeout(() => {
              tile.classList.remove('dom-tile-wrong');
              hint.textContent = '';
            }, 1100);
          }
        }
      };

      grid.appendChild(tile);
    });
  }

  renderDomino();
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
