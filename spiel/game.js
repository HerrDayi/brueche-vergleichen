// ==========================================================================
// Bruch-Expedition: Die 4 Level-Challenge (Klasse 6D)
// Mit dynamischem Zufallsgenerator, Distraktoren & Fehlerschutz
// ==========================================================================

// --- 1. MATHEMATISCHE HILFSFUNKTIONEN ---
function gcd(a, b) {
  a = Math.abs(Math.round(a));
  b = Math.abs(Math.round(b));
  while (b) {
    let t = b;
    b = a % b;
    a = t;
  }
  return a || 1;
}

function lcm(a, b) {
  if (!a || !b) return 1;
  return Math.abs(Math.round((a * b) / gcd(a, b)));
}

function formatFraction(num, den) {
  let g = gcd(num, den);
  num = Math.round(num / g);
  den = Math.round(den / g);
  if (den === 1) return `${num}`;
  if (num < den) return `${num}/${den}`;
  let whole = Math.floor(num / den);
  let rem = num % den;
  if (rem === 0) return `${whole}`;
  return `${whole} ${rem}/${den}`;
}

function parseFraction(input) {
  if (!input) return null;
  let str = String(input).trim();
  
  if (str === 'Ziel' || str.startsWith('Ziel')) {
    return { num: 9999, den: 1, val: 9999, text: 'Ziel', isGoal: true };
  }

  // Gemischter Bruch z.B. "1 2/3"
  if (str.includes(' ') && str.includes('/')) {
    let parts = str.split(' ');
    let whole = parseInt(parts[0], 10);
    let fParts = parts[1].split('/');
    let num = parseInt(fParts[0], 10);
    let den = parseInt(fParts[1], 10);
    let fullNum = whole * den + num;
    return {
      num: fullNum,
      den: den,
      whole: whole,
      origNum: num,
      val: fullNum / den,
      text: str
    };
  }

  // Ganze Zahl z.B. "1"
  if (!str.includes('/')) {
    let val = parseFloat(str);
    return { num: val, den: 1, val: val, text: str };
  }

  // Echter Bruch z.B. "7/20"
  let parts = str.split('/');
  let num = parseInt(parts[0], 10);
  let den = parseInt(parts[1], 10);
  return { num: num, den: den, val: num / den, text: str };
}

function compareFractions(fracA, fracB) {
  let A = parseFraction(fracA);
  let B = parseFraction(fracB);

  if (B.isGoal) {
    return { isLarger: true, A, B, result: -1, H: 1, factorA: 1, factorB: 1, expNumA: 1, expNumB: 9999 };
  }

  let H = lcm(A.den, B.den);
  let factorA = H / A.den;
  let factorB = H / B.den;
  let expNumA = A.num * factorA;
  let expNumB = B.num * factorB;

  let result = 0;
  if (expNumA < expNumB) result = -1; // B ist größer!
  else if (expNumA > expNumB) result = 1; // A ist größer!

  return {
    A: A,
    B: B,
    H: H,
    factorA: factorA,
    factorB: factorB,
    expNumA: expNumA,
    expNumB: expNumB,
    isLarger: result === -1,
    result: result
  };
}

// --- 2. SOUND EFFECTS (Web Audio API) ---
class SoundManager {
  constructor() {
    this.enabled = true;
    this.ctx = null;
  }
  init() {
    if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
  }
  playStep() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    let osc = this.ctx.createOscillator();
    let gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(520, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(780, this.ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.1);
  }
  playGem() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    let osc = this.ctx.createOscillator();
    let gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(660, this.ctx.currentTime);
    osc.frequency.setValueAtTime(880, this.ctx.currentTime + 0.08);
    osc.frequency.setValueAtTime(1100, this.ctx.currentTime + 0.16);
    gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.35);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.35);
  }
  playHeartLoss() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    let osc = this.ctx.createOscillator();
    let gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(320, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(160, this.ctx.currentTime + 0.28);
    gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.28);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.28);
  }
  playVictory() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    let notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, idx) => {
      let osc = this.ctx.createOscillator();
      let gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.12);
      gain.gain.setValueAtTime(0.2, this.ctx.currentTime + idx * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.12 + 0.3);
      osc.start(this.ctx.currentTime + idx * 0.12);
      osc.stop(this.ctx.currentTime + idx * 0.12 + 0.3);
    });
  }
  playJoker() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    let osc = this.ctx.createOscillator();
    let gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.18);
    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.18);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.18);
  }
}

const sfx = new SoundManager();

// --- 3. FRAKTIONS-POOLS FÜR DIE 4 STUFEN ---
function buildMasterPool() {
  const denoms = [2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 14, 15, 20, 21];
  let list = [];
  denoms.forEach(d => {
    let maxN = Math.floor(d * 1.6);
    for (let n = 1; n <= maxN; n++) {
      let g = gcd(n, d);
      list.push({ num: n / g, den: d / g, val: n / d });
    }
  });
  list.sort((a, b) => a.val - b.val);
  let unique = [];
  let lastVal = -1;
  list.forEach(item => {
    if (Math.abs(item.val - lastVal) > 1e-6) {
      unique.push(item);
      lastVal = item.val;
    }
  });
  return unique;
}

const FRACTION_POOLS = {
  1: [ // Halbe, Viertel, Achtel
    { num: 1, den: 8 }, { num: 1, den: 4 }, { num: 3, den: 8 }, { num: 1, den: 2 },
    { num: 5, den: 8 }, { num: 3, den: 4 }, { num: 7, den: 8 }, { num: 1, den: 1 },
    { num: 9, den: 8 }, { num: 5, den: 4 }, { num: 11, den: 8 }, { num: 3, den: 2 }
  ].map(x => ({ ...x, val: x.num / x.den })),

  2: [ // Drittel, Sechstel, Zwölftel
    { num: 1, den: 12 }, { num: 1, den: 6 }, { num: 1, den: 4 }, { num: 1, den: 3 },
    { num: 5, den: 12 }, { num: 1, den: 2 }, { num: 7, den: 12 }, { num: 2, den: 3 },
    { num: 3, den: 4 }, { num: 5, den: 6 }, { num: 11, den: 12 }, { num: 1, den: 1 },
    { num: 13, den: 12 }, { num: 7, den: 6 }, { num: 5, den: 4 }, { num: 4, den: 3 },
    { num: 17, den: 12 }, { num: 3, den: 2 }
  ].map(x => ({ ...x, val: x.num / x.den })),

  3: [ // Fünftel, Zehntel, Zwanzigstel
    { num: 1, den: 20 }, { num: 1, den: 10 }, { num: 3, den: 20 }, { num: 1, den: 5 },
    { num: 1, den: 4 }, { num: 3, den: 10 }, { num: 7, den: 20 }, { num: 2, den: 5 },
    { num: 9, den: 20 }, { num: 1, den: 2 }, { num: 11, den: 20 }, { num: 3, den: 5 },
    { num: 13, den: 20 }, { num: 7, den: 10 }, { num: 3, den: 4 }, { num: 4, den: 5 },
    { num: 17, den: 20 }, { num: 9, den: 10 }, { num: 19, den: 20 }, { num: 1, den: 1 },
    { num: 21, den: 20 }, { num: 11, den: 10 }, { num: 23, den: 20 }, { num: 6, den: 5 },
    { num: 5, den: 4 }, { num: 13, den: 10 }, { num: 7, den: 5 }, { num: 3, den: 2 }
  ].map(x => ({ ...x, val: x.num / x.den })),

  4: buildMasterPool()
};

// --- 4. TOPOLOGIE DER 4 LEVEL-NETZWERKE ---
const LEVEL_TOPOLOGY = {
  1: {
    id: 1,
    name: 'Basis: Halbe, Viertel & Achtel',
    nodes: {
      'start':  { id: 'start',  col: 0, x: 90,  y: 280, isStart: true },
      'c1_top': { id: 'c1_top', col: 1, x: 270, y: 170, hasGem: true },
      'c1_bot': { id: 'c1_bot', col: 1, x: 270, y: 390 },
      'c2_top': { id: 'c2_top', col: 2, x: 450, y: 110 },
      'c2_mid': { id: 'c2_mid', col: 2, x: 450, y: 280, hasGem: true },
      'c2_bot': { id: 'c2_bot', col: 2, x: 450, y: 450 },
      'c3_top': { id: 'c3_top', col: 3, x: 630, y: 170, hasGem: true },
      'c3_bot': { id: 'c3_bot', col: 3, x: 630, y: 390 },
      'c4_top': { id: 'c4_top', col: 4, x: 810, y: 170, hasGem: true },
      'c4_bot': { id: 'c4_bot', col: 4, x: 810, y: 390 },
      'goal':   { id: 'goal',   col: 5, x: 960, y: 280, isGoal: true }
    },
    edges: [
      ['start', 'c1_top'], ['start', 'c1_bot'],
      ['c1_top', 'c2_top'], ['c1_top', 'c2_mid'],
      ['c1_bot', 'c2_mid'], ['c1_bot', 'c2_bot'],
      ['c2_top', 'c3_top'], ['c2_mid', 'c3_top'], ['c2_mid', 'c3_bot'], ['c2_bot', 'c3_bot'],
      ['c3_top', 'c4_top'], ['c3_bot', 'c4_top'], ['c3_bot', 'c4_bot'],
      ['c4_top', 'goal'], ['c4_bot', 'goal']
    ]
  },

  2: {
    id: 2,
    name: 'Forscher: Drittel, Sechstel & Zwölftel',
    nodes: {
      'start':  { id: 'start',  col: 0, x: 75,  y: 280, isStart: true },
      'c1_top': { id: 'c1_top', col: 1, x: 220, y: 180, hasGem: true },
      'c1_bot': { id: 'c1_bot', col: 1, x: 220, y: 380 },
      'c2_top': { id: 'c2_top', col: 2, x: 370, y: 110 },
      'c2_mid': { id: 'c2_mid', col: 2, x: 370, y: 280, hasGem: true },
      'c2_bot': { id: 'c2_bot', col: 2, x: 370, y: 450 },
      'c3_top': { id: 'c3_top', col: 3, x: 520, y: 180, hasGem: true },
      'c3_bot': { id: 'c3_bot', col: 3, x: 520, y: 380 },
      'c4_top': { id: 'c4_top', col: 4, x: 670, y: 180, hasGem: true },
      'c4_bot': { id: 'c4_bot', col: 4, x: 670, y: 380 },
      'c5_top': { id: 'c5_top', col: 5, x: 820, y: 180, hasGem: true },
      'c5_bot': { id: 'c5_bot', col: 5, x: 820, y: 380 },
      'goal':   { id: 'goal',   col: 6, x: 970, y: 280, isGoal: true }
    },
    edges: [
      ['start', 'c1_top'], ['start', 'c1_bot'],
      ['c1_top', 'c2_top'], ['c1_top', 'c2_mid'],
      ['c1_bot', 'c2_mid'], ['c1_bot', 'c2_bot'],
      ['c2_top', 'c3_top'], ['c2_mid', 'c3_top'], ['c2_mid', 'c3_bot'], ['c2_bot', 'c3_bot'],
      ['c3_top', 'c4_top'], ['c3_bot', 'c4_top'], ['c3_bot', 'c4_bot'],
      ['c4_top', 'c5_top'], ['c4_bot', 'c5_top'], ['c4_bot', 'c5_bot'],
      ['c5_top', 'goal'], ['c5_bot', 'goal']
    ]
  },

  3: {
    id: 3,
    name: 'Profi: Fünftel, Zehntel & Zwanzigstel',
    nodes: {
      'start':  { id: 'start',  col: 0, x: 75,  y: 280, isStart: true },
      'c1_top': { id: 'c1_top', col: 1, x: 220, y: 180, hasGem: true },
      'c1_bot': { id: 'c1_bot', col: 1, x: 220, y: 380 },
      'c2_top': { id: 'c2_top', col: 2, x: 370, y: 110 },
      'c2_mid': { id: 'c2_mid', col: 2, x: 370, y: 280, hasGem: true },
      'c2_bot': { id: 'c2_bot', col: 2, x: 370, y: 450 },
      'c3_top': { id: 'c3_top', col: 3, x: 520, y: 180, hasGem: true },
      'c3_bot': { id: 'c3_bot', col: 3, x: 520, y: 380 },
      'c4_top': { id: 'c4_top', col: 4, x: 670, y: 180, hasGem: true },
      'c4_bot': { id: 'c4_bot', col: 4, x: 670, y: 380 },
      'c5_top': { id: 'c5_top', col: 5, x: 820, y: 180, hasGem: true },
      'c5_bot': { id: 'c5_bot', col: 5, x: 820, y: 380 },
      'goal':   { id: 'goal',   col: 6, x: 970, y: 280, isGoal: true }
    },
    edges: [
      ['start', 'c1_top'], ['start', 'c1_bot'],
      ['c1_top', 'c2_top'], ['c1_top', 'c2_mid'],
      ['c1_bot', 'c2_mid'], ['c1_bot', 'c2_bot'],
      ['c2_top', 'c3_top'], ['c2_mid', 'c3_top'], ['c2_mid', 'c3_bot'], ['c2_bot', 'c3_bot'],
      ['c3_top', 'c4_top'], ['c3_bot', 'c4_top'], ['c3_bot', 'c4_bot'],
      ['c4_top', 'c5_top'], ['c4_bot', 'c5_top'], ['c4_bot', 'c5_bot'],
      ['c5_top', 'goal'], ['c5_bot', 'goal']
    ]
  },

  4: {
    id: 4,
    name: 'Meister: Das Original-Netzwerk',
    nodes: {
      'start':   { id: 'start',   col: 0, x: 70,  y: 280, isStart: true },
      'c1_r2':   { id: 'c1_r2',   col: 1, x: 165, y: 200, hasGem: true },
      'c1_r4':   { id: 'c1_r4',   col: 1, x: 165, y: 360 },
      'c2_r1':   { id: 'c2_r1',   col: 2, x: 260, y: 120 },
      'c2_r3':   { id: 'c2_r3',   col: 2, x: 260, y: 280 },
      'c2_r5':   { id: 'c2_r5',   col: 2, x: 260, y: 440, hasGem: true },
      'c3_r0':   { id: 'c3_r0',   col: 3, x: 355, y: 40 },
      'c3_r2':   { id: 'c3_r2',   col: 3, x: 355, y: 200, hasGem: true },
      'c3_r4':   { id: 'c3_r4',   col: 3, x: 355, y: 360 },
      'c3_r6':   { id: 'c3_r6',   col: 3, x: 355, y: 520 },
      'c4_r1':   { id: 'c4_r1',   col: 4, x: 450, y: 120 },
      'c4_r3':   { id: 'c4_r3',   col: 4, x: 450, y: 280, hasGem: true },
      'c4_r5':   { id: 'c4_r5',   col: 4, x: 450, y: 440 },
      'c5_r0':   { id: 'c5_r0',   col: 5, x: 545, y: 40 },
      'c5_r2':   { id: 'c5_r2',   col: 5, x: 545, y: 200, hasGem: true },
      'c5_r4':   { id: 'c5_r4',   col: 5, x: 545, y: 360 },
      'c5_r6':   { id: 'c5_r6',   col: 5, x: 545, y: 520 },
      'c6_r1':   { id: 'c6_r1',   col: 6, x: 640, y: 120 },
      'c6_r3':   { id: 'c6_r3',   col: 6, x: 640, y: 280, hasGem: true },
      'c6_r5':   { id: 'c6_r5',   col: 6, x: 640, y: 440 },
      'c7_r0':   { id: 'c7_r0',   col: 7, x: 735, y: 40 },
      'c7_r2':   { id: 'c7_r2',   col: 7, x: 735, y: 200, hasGem: true },
      'c7_r4':   { id: 'c7_r4',   col: 7, x: 735, y: 360 },
      'c7_r6':   { id: 'c7_r6',   col: 7, x: 735, y: 520 },
      'c8_r1':   { id: 'c8_r1',   col: 8, x: 830, y: 120 },
      'c8_r3':   { id: 'c8_r3',   col: 8, x: 830, y: 280, hasGem: true },
      'c8_r5':   { id: 'c8_r5',   col: 8, x: 830, y: 440 },
      'c9_r2':   { id: 'c9_r2',   col: 9, x: 925, y: 200, hasGem: true },
      'c9_r4':   { id: 'c9_r4',   col: 9, x: 925, y: 360 },
      'goal':    { id: 'goal',    col: 10, x: 995, y: 360, isGoal: true }
    },
    edges: [
      ['start', 'c1_r2'], ['start', 'c1_r4'],
      ['c1_r2', 'c2_r1'], ['c1_r2', 'c2_r3'],
      ['c1_r4', 'c2_r3'], ['c1_r4', 'c2_r5'],
      ['c2_r1', 'c3_r0'], ['c2_r1', 'c3_r2'],
      ['c2_r3', 'c3_r2'], ['c2_r3', 'c3_r4'],
      ['c2_r5', 'c3_r4'], ['c2_r5', 'c3_r6'],
      ['c2_r3', 'c4_r3'],
      ['c3_r0', 'c4_r1'], ['c3_r2', 'c4_r1'], ['c3_r2', 'c4_r3'],
      ['c3_r4', 'c4_r3'], ['c3_r4', 'c4_r5'], ['c3_r6', 'c4_r5'],
      ['c3_r0', 'c5_r0'], ['c3_r6', 'c5_r6'],
      ['c4_r1', 'c5_r0'], ['c4_r1', 'c5_r2'],
      ['c4_r3', 'c5_r2'], ['c4_r3', 'c5_r4'],
      ['c4_r5', 'c5_r4'], ['c4_r5', 'c5_r6'],
      ['c4_r3', 'c6_r3'],
      ['c5_r0', 'c6_r1'], ['c5_r2', 'c6_r1'], ['c5_r2', 'c6_r3'],
      ['c5_r4', 'c6_r3'], ['c5_r4', 'c6_r5'],
      ['c5_r6', 'c6_r5'],
      ['c5_r0', 'c7_r0'], ['c5_r6', 'c7_r6'],
      ['c6_r1', 'c7_r0'], ['c6_r1', 'c7_r2'],
      ['c6_r3', 'c7_r2'], ['c6_r3', 'c7_r4'],
      ['c6_r5', 'c7_r4'], ['c6_r5', 'c7_r6'],
      ['c6_r3', 'c8_r3'],
      ['c7_r0', 'c8_r1'], ['c7_r2', 'c8_r1'], ['c7_r2', 'c8_r3'],
      ['c7_r4', 'c8_r3'], ['c7_r4', 'c8_r5'],
      ['c7_r6', 'c8_r5'],
      ['c8_r1', 'c9_r2'], ['c8_r3', 'c9_r2'], ['c8_r3', 'c9_r4'],
      ['c8_r5', 'c9_r4'],
      ['c9_r2', 'goal'], ['c9_r4', 'goal']
    ]
  }
};

// --- 5. ALGORITHMUS FÜR SEHNENFREIE WEGE (CHORDLESS PATHS) ---
function findChordlessPaths(nodes, edges) {
  let adj = {};
  Object.keys(nodes).forEach(id => adj[id] = []);
  edges.forEach(([u, v]) => {
    let nU = nodes[u];
    let nV = nodes[v];
    if (nU && nV) {
      if (nU.col < nV.col) adj[u].push(v);
      else if (nV.col < nU.col) adj[v].push(u);
    }
  });

  let paths = [];
  function dfs(u, currentPath) {
    if (u === 'goal') {
      paths.push(currentPath);
      return;
    }
    let neighbors = adj[u] || [];
    for (let v of neighbors) {
      dfs(v, currentPath.concat(v));
    }
  }
  dfs('start', ['start']);

  let chordless = [];
  for (let p of paths) {
    let nodeSet = new Set(p);
    let hasChord = false;
    for (let i = 0; i < p.length - 1; i++) {
      let u = p[i];
      let nextNode = p[i + 1];
      for (let v of (adj[u] || [])) {
        if (nodeSet.has(v) && v !== nextNode) {
          hasChord = true;
          break;
        }
      }
      if (hasChord) break;
    }
    if (!hasChord) {
      chordless.push(p);
    }
  }
  return chordless.length > 0 ? chordless : paths;
}

// Prekompiliere sehnenfreie Pfade für jedes Level
const LEVEL_CHORDLESS_PATHS = {
  1: findChordlessPaths(LEVEL_TOPOLOGY[1].nodes, LEVEL_TOPOLOGY[1].edges),
  2: findChordlessPaths(LEVEL_TOPOLOGY[2].nodes, LEVEL_TOPOLOGY[2].edges),
  3: findChordlessPaths(LEVEL_TOPOLOGY[3].nodes, LEVEL_TOPOLOGY[3].edges),
  4: findChordlessPaths(LEVEL_TOPOLOGY[4].nodes, LEVEL_TOPOLOGY[4].edges)
};

// --- 6. GAME MANAGER MIT DYNAMISCHER BRUCH-GENERIERUNG ---
class LevelExpedition {
  constructor() {
    this.currentLevelNum = 1;
    this.attempts = 1;
    this.score = 0;

    this.nodes = {};
    this.edges = [];
    this.adj = {};

    this.collectedGems = new Set();
    this.eliminatedNodes = new Set();
    this.jokerFiftyUsed = false;
    this.jokerHintUsed = false;

    this.currentNode = 'start';
    this.path = ['start'];
    this.steps = 0;
    this.gameOver = false;

    this.loadLevel(1);
  }

  loadLevel(num) {
    this.currentLevelNum = num;
    this.attempts = 1;
    let cfg = LEVEL_TOPOLOGY[num];
    if (!cfg) return;

    this.nodes = JSON.parse(JSON.stringify(cfg.nodes));
    this.edges = JSON.parse(JSON.stringify(cfg.edges));

    this.adj = {};
    Object.keys(this.nodes).forEach(id => this.adj[id] = []);
    this.edges.forEach(([u, v]) => {
      let nU = this.nodes[u];
      let nV = this.nodes[v];
      if (nU.col < nV.col) this.adj[u].push(v);
      else if (nV.col < nU.col) this.adj[v].push(u);
    });

    this.generateFreshBoard();
  }

  generateFreshBoard() {
    let pool = FRACTION_POOLS[this.currentLevelNum] || FRACTION_POOLS[1];
    let chordless = LEVEL_CHORDLESS_PATHS[this.currentLevelNum];
    let chosenPath = chordless[Math.floor(Math.random() * chordless.length)];
    let pathNodes = chosenPath.slice(0, -1); // ohne 'goal'

    let L = pathNodes.length;
    // Wähle L echt aufsteigende Indizes aus dem sortierten Pool
    let chosenIndices = new Set();
    while (chosenIndices.size < L) {
      chosenIndices.add(Math.floor(Math.random() * pool.length));
    }
    let sortedIndices = Array.from(chosenIndices).sort((a, b) => a - b);

    let nodeFracs = {};
    pathNodes.forEach((nodeId, i) => {
      let item = pool[sortedIndices[i]];
      nodeFracs[nodeId] = {
        val: item.val,
        str: formatFraction(item.num, item.den)
      };
    });

    // Distraktoren (Fallen) an jedem Entscheidungspunkt des Pfads
    pathNodes.forEach((u, i) => {
      let nextNode = chosenPath[i + 1];
      let currVal = nodeFracs[u].val;
      let forwardNeighbors = this.adj[u] || [];

      for (let v of forwardNeighbors) {
        if (v === 'goal' || v === nextNode || nodeFracs[v]) continue;

        // Falsche Abzweigung: Muss echt KLEINER oder gleich sein als u!
        let smallerItems = pool.filter(item => item.val <= currVal);
        let chosenItem = smallerItems.length > 0 
          ? smallerItems[Math.floor(Math.random() * smallerItems.length)]
          : pool[0];

        nodeFracs[v] = {
          val: chosenItem.val,
          str: formatFraction(chosenItem.num, chosenItem.den)
        };
      }
    });

    // Restliche Knoten (Hintergrund) mit passenden Brüchen auffüllen
    Object.keys(this.nodes).forEach(nodeId => {
      if (nodeId === 'goal') {
        this.nodes[nodeId].frac = 'Ziel';
        this.nodes[nodeId].label = 'Ziel';
        return;
      }
      if (!nodeFracs[nodeId]) {
        let randItem = pool[Math.floor(Math.random() * pool.length)];
        nodeFracs[nodeId] = {
          val: randItem.val,
          str: formatFraction(randItem.num, randItem.den)
        };
      }
      this.nodes[nodeId].frac = nodeFracs[nodeId].str;
      this.nodes[nodeId].label = nodeFracs[nodeId].str;
    });

    this.resetToStart();
  }

  resetToStart() {
    this.currentNode = 'start';
    this.path = ['start'];
    this.steps = 0;
    this.eliminatedNodes.clear();
    this.jokerFiftyUsed = false;
    this.jokerHintUsed = false;
    this.gameOver = false;

    let fiftyBtn = document.getElementById('jokerFiftyBtn');
    let hintBtn = document.getElementById('jokerHintBtn');
    if (fiftyBtn) fiftyBtn.disabled = false;
    if (hintBtn) hintBtn.disabled = false;

    let toast = document.getElementById('hintToast');
    if (toast) toast.style.display = 'none';

    document.querySelectorAll('.lvl-btn').forEach(btn => {
      btn.classList.toggle('active', parseInt(btn.getAttribute('data-lvl'), 10) === this.currentLevelNum);
    });

    this.render();
    this.updateUI();
  }

  restartWithNewFractions() {
    this.attempts++;
    this.generateFreshBoard();
    this.showToast(`🔄 Runde: Neuer Versuch ${this.attempts} gestartet!`);
  }

  useJokerFifty() {
    if (this.jokerFiftyUsed || this.gameOver) return;
    let candidateIds = this.adj[this.currentNode] || [];
    let currNode = this.nodes[this.currentNode];

    let wrongCandidates = candidateIds.filter(id => {
      if (this.nodes[id].isGoal || this.eliminatedNodes.has(id)) return false;
      let comp = compareFractions(currNode.frac, this.nodes[id].frac);
      return !comp.isLarger; // Ist falsch (kleiner oder gleich)
    });

    if (wrongCandidates.length === 0) {
      this.showToast('💡 Alle verbleibenden Wege sind bereits größer!');
      return;
    }

    let toEliminate = wrongCandidates[Math.floor(Math.random() * wrongCandidates.length)];
    this.eliminatedNodes.add(toEliminate);
    this.jokerFiftyUsed = true;
    document.getElementById('jokerFiftyBtn').disabled = true;

    sfx.playJoker();
    this.showToast(`✂️ 50:50: Knoten ${this.nodes[toEliminate].label} ist eine Falle und wurde gestrichen!`);
    this.render();
  }

  useJokerHint() {
    if (this.jokerHintUsed || this.gameOver) return;
    let candidateIds = this.adj[this.currentNode] || [];
    if (candidateIds.length === 0) return;

    let currNode = this.nodes[this.currentNode];
    let dens = [parseFraction(currNode.frac).den];
    candidateIds.forEach(id => {
      let f = parseFraction(this.nodes[id].frac);
      if (f && !f.isGoal && !this.eliminatedNodes.has(id)) dens.push(f.den);
    });

    let overallLCM = dens.reduce((acc, d) => lcm(acc, d), 1);
    this.jokerHintUsed = true;
    document.getElementById('jokerHintBtn').disabled = true;

    sfx.playJoker();
    this.showToast(`🔍 Lupe: Erweitert alle Brüche auf den Hauptnenner ${overallLCM}!`);
  }

  showToast(text) {
    let toast = document.getElementById('hintToast');
    if (!toast) return;
    toast.innerText = text;
    toast.style.display = 'inline-block';
    setTimeout(() => {
      toast.style.display = 'none';
    }, 4500);
  }

  handleNodeTap(targetId) {
    if (this.gameOver) return;
    if (targetId === this.currentNode) return;

    let candidateIds = this.adj[this.currentNode] || [];
    if (!candidateIds.includes(targetId)) return;
    if (this.eliminatedNodes.has(targetId)) return;

    let currNode = this.nodes[this.currentNode];
    let targetNode = this.nodes[targetId];
    let comp = compareFractions(currNode.frac, targetNode.frac);

    if (comp.isLarger) {
      // GÜLTIGER ZUG
      this.path.push(targetId);
      this.currentNode = targetId;
      this.steps++;

      if (targetNode.hasGem && !this.collectedGems.has(targetId)) {
        this.collectedGems.add(targetId);
        this.score += 20;
        sfx.playGem();
      } else {
        sfx.playStep();
      }

      if (targetNode.isGoal) {
        this.handleWin();
        return;
      }

      this.render();
      this.updateUI();
    } else {
      // FEHLTRITT: Der Bruch war nicht größer!
      // Regel: Bei Fehler muss man von vorne anfangen mit neuen Zufallsbrüchen!
      sfx.playHeartLoss();
      this.showComparison(currNode, targetNode, comp);
    }
  }

  showComparison(fromNode, toNode, comp) {
    let modal = document.getElementById('comparisonModal');
    let content = document.getElementById('comparisonContent');
    let title = document.getElementById('comparisonTitle');
    if (!modal || !content) return;

    if (title) {
      title.innerText = '⚠️ Fehltritt: Der gewählte Bruch ist nicht größer!';
    }

    let A = comp.A;
    let B = comp.B;
    let sign = comp.result === 0 ? '=' : '›';

    content.innerHTML = `
      <div class="comp-row">
        <div class="comp-card larger">
          <small>Euer bisheriger Bruch:</small>
          <div class="comp-frac-big">
            <span>${A.num}</span>
            <div class="bar"></div>
            <span>${A.den}</span>
          </div>
          <div class="expansion-box">
            Erweitert mit <strong>${comp.factorA}</strong>:<br>
            <strong>${comp.expNumA}/${comp.H}</strong>
          </div>
        </div>

        <div class="comp-sign">${sign}</div>

        <div class="comp-card smaller">
          <small>Gewählte Abzweigung:</small>
          <div class="comp-frac-big">
            <span>${B.num}</span>
            <div class="bar"></div>
            <span>${B.den}</span>
          </div>
          <div class="expansion-box">
            Erweitert mit <strong>${comp.factorB}</strong>:<br>
            <strong>${comp.expNumB}/${comp.H}</strong>
          </div>
        </div>
      </div>

      <!-- Bruchstreifen-Vergleich -->
      <div class="comp-strips">
        <div class="strip-line">
          <span>${A.text}:</span>
          <div class="strip-track">
            <div class="strip-fill blue" style="width: ${Math.min(100, (A.val / 2) * 100)}%;"></div>
          </div>
        </div>
        <div class="strip-line">
          <span>${B.text}:</span>
          <div class="strip-track">
            <div class="strip-fill red" style="width: ${Math.min(100, (B.val / 2) * 100)}%;"></div>
          </div>
        </div>
      </div>

      <div class="didactic-conclusion">
        <strong>⚠️ Halt! Keine Vorwärtsbewegung möglich!</strong><br>
        Die gewählte Abzweigung <strong>${toNode.label}</strong> ist <strong>${comp.result === 0 ? 'genauso groß wie' : 'kleiner als'}</strong> <strong>${fromNode.label}</strong>.<br>
        Auf Hauptnenner ${comp.H} erweitert: <strong>${comp.expNumA}/${comp.H} ${comp.result === 0 ? 'ist gleich groß wie' : 'ist größer als'} ${comp.expNumB}/${comp.H}</strong>.<br><br>
        🔄 <strong>Neuer Versuch:</strong> Ihr müsst von vorne starten. Das Gitter wird mit <strong>neuen Zufallsbrüchen</strong> gemischt!
      </div>
    `;

    modal.style.display = 'flex';
  }

  handleWin() {
    this.gameOver = true;
    sfx.playVictory();

    let winModal = document.getElementById('winModal');
    let winTitle = document.getElementById('winTitle');
    let winSub = document.getElementById('winSub');
    let starRating = document.getElementById('starRating');
    let winStats = document.getElementById('winStats');
    let nextBtn = document.getElementById('nextLevelBtn');

    let stars = '⭐⭐⭐';
    let comment = 'Perfekt! Im allerersten Versuch ohne Fehler durchmarschiert! 🥇';
    if (this.attempts === 2) {
      stars = '⭐⭐';
      comment = 'Starke Leistung! Im 2. Versuch den richtigen Weg berechnet!';
    } else if (this.attempts >= 3) {
      stars = '⭐';
      comment = `Klasse Durchhaltevermögen! Nach ${this.attempts} Runden das Ziel erreicht!`;
    }

    if (winTitle) winTitle.innerText = `🎉 Level ${this.currentLevelNum} gemeistert!`;
    if (starRating) starRating.innerText = stars;
    if (winSub) winSub.innerText = comment;

    let pathFracs = this.path.map(id => this.nodes[id].label).join(' ➔ ');
    if (winStats) {
      winStats.innerHTML = `
        <div><strong>Euer Siegerpfad (${this.steps} Schritte):</strong></div>
        <div style="font-weight: 800; color: var(--emerald); margin: 0.5rem 0; word-break: break-word; font-size: 1.1rem;">
          ${pathFracs}
        </div>
        <div style="font-size: 0.95rem; color: var(--text-muted);">
          Benötigte Versuche: <strong>${this.attempts}</strong> | Gesammelte Edelsteine: <strong>💎 ${this.score}</strong>
        </div>
      `;
    }

    if (nextBtn) {
      if (this.currentLevelNum >= 4) {
        nextBtn.innerText = 'Alle 4 Level geschafft! 🏆';
        nextBtn.onclick = () => {
          winModal.style.display = 'none';
          this.loadLevel(1);
        };
      } else {
        nextBtn.innerText = `Nächstes Level: Stufe ${this.currentLevelNum + 1} ➡️`;
        nextBtn.onclick = () => {
          winModal.style.display = 'none';
          this.loadLevel(this.currentLevelNum + 1);
        };
      }
    }

    this.render();
    winModal.style.display = 'flex';
  }

  // --- SVG RENDERING (RUHIG, KEINE LÖSUNGSHINWEISE) ---
  render() {
    const edgesLayer = document.getElementById('edgesLayer');
    const teamPathLayer = document.getElementById('teamPathLayer');
    const nodesLayer = document.getElementById('nodesLayer');
    const tokensLayer = document.getElementById('tokensLayer');

    edgesLayer.innerHTML = '';
    teamPathLayer.innerHTML = '';
    nodesLayer.innerHTML = '';
    tokensLayer.innerHTML = '';

    let candidateIds = this.adj[this.currentNode] || [];

    // 1. Kanten zeichnen
    this.edges.forEach(([u, v]) => {
      let nU = this.nodes[u];
      let nV = this.nodes[v];
      if (!nU || !nV) return;

      let line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', nU.x);
      line.setAttribute('y1', nU.y);
      line.setAttribute('x2', nV.x);
      line.setAttribute('y2', nV.y);

      // Alle vorwärts erreichbaren Nachbarkanten sehen identisch neutral aus!
      let isCandidateEdge = (u === this.currentNode && candidateIds.includes(v)) ||
                            (v === this.currentNode && candidateIds.includes(u));

      if (isCandidateEdge && !this.gameOver) {
        line.setAttribute('class', 'edge-line edge-candidate');
      } else {
        line.setAttribute('class', 'edge-line');
      }
      edgesLayer.appendChild(line);
    });

    // 2. Pfad zeichnen (bereits gegangene Schritte)
    if (this.path.length >= 2) {
      for (let i = 0; i < this.path.length - 1; i++) {
        let u = this.nodes[this.path[i]];
        let v = this.nodes[this.path[i + 1]];
        if (!u || !v) continue;

        let line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', u.x);
        line.setAttribute('y1', u.y);
        line.setAttribute('x2', v.x);
        line.setAttribute('y2', v.y);
        line.setAttribute('class', 'edge-line edge-team-path');
        teamPathLayer.appendChild(line);
      }
    }

    // 3. Knoten zeichnen
    Object.values(this.nodes).forEach(node => {
      let g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.setAttribute('transform', `translate(${node.x}, ${node.y})`);
      g.setAttribute('id', `node_${node.id}`);

      let cls = ['node-g'];
      if (node.isStart) cls.push('is-start');
      if (node.isGoal) cls.push('is-goal');
      if (this.eliminatedNodes.has(node.id)) cls.push('eliminated');

      // WICHTIG: Alle erreichbaren Nachbarn werden NEUTRAL als Kandidaten markiert!
      // Keine Vorwegnahme des richtigen Bruchs!
      if (candidateIds.includes(node.id) && !this.gameOver) {
        cls.push('is-candidate');
      }
      if (this.currentNode === node.id) cls.push('pos-team');

      g.setAttribute('class', cls.join(' '));

      // iPad Touch: pointerdown mit preventDefault & stopPropagation
      g.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.handleNodeTap(node.id);
      });

      // Basis-Kreis
      let radius = (this.currentLevelNum <= 3) ? '32' : (node.isGoal || node.isStart ? '28' : '25');
      let c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      c.setAttribute('r', radius);
      c.setAttribute('class', 'node-base-circle');
      g.appendChild(c);

      // Edelstein
      if (node.hasGem && !this.collectedGems.has(node.id)) {
        let gem = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        gem.setAttribute('x', '16');
        gem.setAttribute('y', '-16');
        gem.setAttribute('class', 'svg-gem');
        gem.textContent = '💎';
        g.appendChild(gem);
      }

      // Bruch-Beschriftung
      this.drawFraction(g, node);

      nodesLayer.appendChild(g);
    });

    // 4. Spielfigur
    let activeNode = this.nodes[this.currentNode];
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

  drawFraction(g, node) {
    if (node.isStart) {
      let tStart = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      tStart.setAttribute('class', 'node-txt');
      tStart.setAttribute('y', '-12');
      tStart.setAttribute('style', 'font-size: 11px; fill: #059669; font-weight: 800;');
      tStart.textContent = 'START';
      g.appendChild(tStart);

      let parsed = parseFraction(node.frac);
      let tNum = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      tNum.setAttribute('class', 'node-txt num');
      tNum.setAttribute('y', '3');
      tNum.textContent = parsed.num;
      g.appendChild(tNum);

      let bar = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      bar.setAttribute('x1', '-10');
      bar.setAttribute('x2', '10');
      bar.setAttribute('y1', '9');
      bar.setAttribute('y2', '9');
      bar.setAttribute('class', 'node-frac-bar');
      g.appendChild(bar);

      let tDen = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      tDen.setAttribute('class', 'node-txt den');
      tDen.setAttribute('y', '19');
      tDen.textContent = parsed.den;
      g.appendChild(tDen);
      return;
    }

    if (node.isGoal) {
      let tGoal = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      tGoal.setAttribute('class', 'node-txt single');
      tGoal.setAttribute('y', '2');
      tGoal.setAttribute('style', 'fill: #b45309; font-size: 15px; font-weight: 900;');
      tGoal.textContent = 'ZIEL 🏁';
      g.appendChild(tGoal);
      return;
    }

    let parsed = parseFraction(node.frac);
    if (!parsed.den || parsed.den === 1) {
      let tInt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      tInt.setAttribute('class', 'node-txt single');
      tInt.setAttribute('y', '2');
      tInt.textContent = parsed.text;
      g.appendChild(tInt);
    } else if (parsed.whole) {
      let tWhole = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      tWhole.setAttribute('class', 'node-txt');
      tWhole.setAttribute('x', '-11');
      tWhole.setAttribute('y', '2');
      tWhole.setAttribute('style', 'font-size: 14px; font-weight: 800;');
      tWhole.textContent = parsed.whole;
      g.appendChild(tWhole);

      let tNum = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      tNum.setAttribute('class', 'node-txt num');
      tNum.setAttribute('x', '7');
      tNum.setAttribute('y', '-6');
      tNum.textContent = parsed.origNum;
      g.appendChild(tNum);

      let bar = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      bar.setAttribute('x1', '0');
      bar.setAttribute('x2', '14');
      bar.setAttribute('y1', '0');
      bar.setAttribute('y2', '0');
      bar.setAttribute('class', 'node-frac-bar');
      g.appendChild(bar);

      let tDen = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      tDen.setAttribute('class', 'node-txt den');
      tDen.setAttribute('x', '7');
      tDen.setAttribute('y', '9');
      tDen.textContent = parsed.den;
      g.appendChild(tDen);
    } else {
      let tNum = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      tNum.setAttribute('class', 'node-txt num');
      tNum.setAttribute('y', '-7');
      tNum.textContent = parsed.num;
      g.appendChild(tNum);

      let bar = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      bar.setAttribute('x1', '-10');
      bar.setAttribute('x2', '10');
      bar.setAttribute('y1', '0');
      bar.setAttribute('y2', '0');
      bar.setAttribute('class', 'node-frac-bar');
      g.appendChild(bar);

      let tDen = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      tDen.setAttribute('class', 'node-txt den');
      tDen.setAttribute('y', '9');
      tDen.textContent = parsed.den;
      g.appendChild(tDen);
    }
  }

  updateUI() {
    let attemptsBadge = document.getElementById('attemptsBadge');
    if (attemptsBadge) {
      attemptsBadge.innerText = `Versuch ${this.attempts}`;
    }

    let scoreVal = document.getElementById('scoreVal');
    if (scoreVal) {
      scoreVal.innerText = this.score;
    }

    let bannerText = document.getElementById('bannerText');
    if (bannerText) {
      let curr = this.nodes[this.currentNode];
      let fracStr = curr ? curr.label : '';
      bannerText.innerHTML = `🤝 <strong>Stufe ${this.currentLevelNum}:</strong> Aktueller Bruch: <span class="badge-frac">${fracStr}</span>. Welcher Nachbar nach rechts ist <strong>größer</strong>?`;
    }
  }
}

// --- 7. EVENT-LISTENER & INITIALISIERUNG ---
document.addEventListener('DOMContentLoaded', () => {
  const game = new LevelExpedition();

  // Level Buttons
  document.querySelectorAll('.lvl-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      let lvl = parseInt(btn.getAttribute('data-lvl'), 10);
      game.loadLevel(lvl);
    });
  });

  // Joker Buttons
  let fiftyBtn = document.getElementById('jokerFiftyBtn');
  if (fiftyBtn) {
    fiftyBtn.addEventListener('click', () => {
      game.useJokerFifty();
    });
  }

  let hintBtn = document.getElementById('jokerHintBtn');
  if (hintBtn) {
    hintBtn.addEventListener('click', () => {
      game.useJokerHint();
    });
  }

  // Neu mischen Button
  let shuffleBtn = document.getElementById('shuffleBtn');
  if (shuffleBtn) {
    shuffleBtn.addEventListener('click', () => {
      game.restartWithNewFractions();
    });
  }

  // Sound Button
  let soundBtn = document.getElementById('soundBtn');
  if (soundBtn) {
    soundBtn.addEventListener('click', () => {
      sfx.enabled = !sfx.enabled;
      soundBtn.innerText = sfx.enabled ? '🔊' : '🔇';
    });
  }

  // Regeln Modal
  const rulesModal = document.getElementById('rulesModal');
  let rulesBtn = document.getElementById('rulesBtn');
  if (rulesBtn) {
    rulesBtn.addEventListener('click', () => {
      rulesModal.style.display = 'flex';
    });
  }
  let closeRulesBtn = document.getElementById('closeRulesBtn');
  if (closeRulesBtn) {
    closeRulesBtn.addEventListener('click', () => {
      rulesModal.style.display = 'none';
    });
  }
  let closeRulesX = document.getElementById('closeRulesX');
  if (closeRulesX) {
    closeRulesX.addEventListener('click', () => {
      rulesModal.style.display = 'none';
    });
  }

  // Didaktisches Modal (Fehler -> Neustart mit neuen Brüchen)
  const compModal = document.getElementById('comparisonModal');
  let closeCompBtn = document.getElementById('closeComparisonBtn');
  if (closeCompBtn) {
    closeCompBtn.addEventListener('click', () => {
      compModal.style.display = 'none';
      game.restartWithNewFractions();
    });
  }
  let closeCompX = document.getElementById('closeComparisonX');
  if (closeCompX) {
    closeCompX.addEventListener('click', () => {
      compModal.style.display = 'none';
      game.restartWithNewFractions();
    });
  }

  // Retry Button (Game Over Modal)
  let retryBtn = document.getElementById('retryBtn');
  if (retryBtn) {
    retryBtn.addEventListener('click', () => {
      document.getElementById('gameOverModal').style.display = 'none';
      game.restartWithNewFractions();
    });
  }

  // Level Replay Button (Win Modal)
  let replayLevelBtn = document.getElementById('replayLevelBtn');
  if (replayLevelBtn) {
    replayLevelBtn.addEventListener('click', () => {
      document.getElementById('winModal').style.display = 'none';
      game.restartWithNewFractions();
    });
  }
});
