'use strict';

/* =========================================================
   DONNÉES DE JEU
   ========================================================= */

const TYPES = {
  carnivore: { label: 'Carnivore' },
  herbivore: { label: 'Herbivore' },
  pterosaur: { label: 'Ptérosaure' },
};

// Triangle d'efficacité façon Pokémon
const EFFECTIVENESS = {
  carnivore: { herbivore: 1.5, pterosaur: 0.7 },
  herbivore: { pterosaur: 1.5, carnivore: 0.7 },
  pterosaur: { carnivore: 1.5, herbivore: 0.7 },
};

function getMultiplier(moveType, defenderType) {
  if (moveType === 'neutral') return 1;
  return EFFECTIVENESS[moveType]?.[defenderType] ?? 1;
}

const SPECIES = [
  {
    id: 'velociraptor', name: 'Vélociraptor', type: 'carnivore', emoji: '🦖',
    isEgg: true, rarity: 1,
    base: { hp: 32, atk: 12, def: 8 },
    moves: [
      { name: 'Griffure', power: 14, type: 'carnivore' },
      { name: 'Morsure', power: 10, type: 'neutral' },
    ],
  },
  {
    id: 'tyrannosaurus', name: 'Tyrannosaure', type: 'carnivore', emoji: '🐉',
    isEgg: false, rarity: 3,
    base: { hp: 55, atk: 16, def: 10 },
    moves: [
      { name: 'Mâchoires broyeuses', power: 18, type: 'carnivore' },
      { name: 'Charge', power: 12, type: 'neutral' },
    ],
  },
  {
    id: 'dilophosaurus', name: 'Dilophosaure', type: 'carnivore', emoji: '🐍',
    isEgg: false, rarity: 2,
    base: { hp: 30, atk: 11, def: 7 },
    moves: [
      { name: 'Crachat venimeux', power: 15, type: 'carnivore' },
      { name: 'Coup de collerette', power: 9, type: 'neutral' },
    ],
  },
  {
    id: 'compsognathus', name: 'Compsognathus', type: 'carnivore', emoji: '🦎',
    isEgg: false, rarity: 1,
    base: { hp: 16, atk: 7, def: 4 },
    moves: [
      { name: 'Nuée véloce', power: 10, type: 'carnivore' },
      { name: 'Griffade', power: 7, type: 'neutral' },
    ],
  },
  {
    id: 'triceratops', name: 'Tricératops', type: 'herbivore', emoji: '🦏',
    isEgg: true, rarity: 1,
    base: { hp: 40, atk: 9, def: 14 },
    moves: [
      { name: 'Charge de cornes', power: 14, type: 'herbivore' },
      { name: 'Coup de tête', power: 10, type: 'neutral' },
    ],
  },
  {
    id: 'stegosaurus', name: 'Stégosaure', type: 'herbivore', emoji: '🐢',
    isEgg: false, rarity: 2,
    base: { hp: 42, atk: 10, def: 13 },
    moves: [
      { name: 'Coup de queue à pointes', power: 15, type: 'herbivore' },
      { name: 'Piétinement', power: 9, type: 'neutral' },
    ],
  },
  {
    id: 'brachiosaurus', name: 'Brachiosaure', type: 'herbivore', emoji: '🦕',
    isEgg: false, rarity: 3,
    base: { hp: 60, atk: 8, def: 12 },
    moves: [
      { name: 'Coup de queue massif', power: 16, type: 'herbivore' },
      { name: 'Écrasement', power: 11, type: 'neutral' },
    ],
  },
  {
    id: 'pteranodon', name: 'Ptéranodon', type: 'pterosaur', emoji: '🦅',
    isEgg: true, rarity: 1,
    base: { hp: 28, atk: 10, def: 6 },
    moves: [
      { name: 'Piqué vertical', power: 14, type: 'pterosaur' },
      { name: 'Coup de bec', power: 10, type: 'neutral' },
    ],
  },
  {
    id: 'dimorphodon', name: 'Dimorphodon', type: 'pterosaur', emoji: '🦇',
    isEgg: false, rarity: 2,
    base: { hp: 24, atk: 9, def: 5 },
    moves: [
      { name: 'Vol rasant', power: 13, type: 'pterosaur' },
      { name: 'Griffade', power: 9, type: 'neutral' },
    ],
  },
  {
    id: 'quetzalcoatlus', name: 'Quetzalcoatlus', type: 'pterosaur', emoji: '🦉',
    isEgg: false, rarity: 3,
    base: { hp: 34, atk: 13, def: 7 },
    moves: [
      { name: 'Serres tranchantes', power: 17, type: 'pterosaur' },
      { name: 'Bourrasque', power: 11, type: 'neutral' },
    ],
  },
];

function getSpecies(id) {
  return SPECIES.find((s) => s.id === id);
}

const EGG_STYLES = [
  { emoji: '🥚', label: 'Œuf tacheté de brun' },
  { emoji: '🥚', label: 'Œuf strié de vert' },
  { emoji: '🥚', label: 'Œuf moucheté de gris' },
];

/* =========================================================
   TUILES ET CARTES
   ========================================================= */

const TILE = 48;
const PXR = TILE / 16; // taille d'un "pixel" du pixel art (grille 16x16)
const VIEW_COLS = 11;
const VIEW_ROWS = 8;

const TILE_INFO = {
  '.': { walkable: true },
  '#': { walkable: true, encounter: true },
  T: { walkable: false },
  '~': { walkable: false },
  R: { walkable: false },
  C: { walkable: true, camp: true },
  B: { walkable: true },
  J: { walkable: false },
  D: { walkable: false },
  K: { walkable: true, cabin: true },
  X: { walkable: true, exit: true },
};

function fillRect(grid, x0, y0, x1, y1, tile) {
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      if (grid[y] && grid[y][x] !== undefined) grid[y][x] = tile;
    }
  }
}

function buildIslandMap() {
  const w = 26, h = 16;
  const grid = [];
  for (let y = 0; y < h; y++) {
    const row = [];
    for (let x = 0; x < w; x++) {
      const border = x === 0 || y === 0 || x === w - 1 || y === h - 1;
      row.push(border ? 'T' : '.');
    }
    grid.push(row);
  }

  fillRect(grid, 2, 6, 4, 7, 'C'); // camp
  fillRect(grid, 7, 2, 12, 4, '#'); // clairière nord
  fillRect(grid, 4, 9, 9, 12, '#'); // sous-bois ouest
  fillRect(grid, 16, 3, 21, 6, '#'); // hautes herbes est
  fillRect(grid, 14, 10, 20, 13, '#'); // marécage
  fillRect(grid, 17, 12, 22, 14, '~'); // rivière

  const rocks = [[6, 6], [10, 7], [13, 8], [19, 8], [9, 3], [23, 9], [6, 11], [15, 5]];
  rocks.forEach(([x, y]) => { grid[y][x] = 'R'; });

  const trees = [[13, 2], [14, 11], [8, 13], [21, 10], [12, 9]];
  trees.forEach(([x, y]) => { grid[y][x] = 'T'; });

  return { w, h, rows: grid.map((row) => row.join('')) };
}

function buildPierMap() {
  const w = 16, h = 12;
  const grid = [];
  for (let y = 0; y < h; y++) {
    const row = [];
    for (let x = 0; x < w; x++) {
      let tile = '.';
      if (y <= 2) tile = 'J';
      else if (y >= h - 1) tile = '~';
      else if (x <= 1 || x >= w - 2) tile = 'J';
      row.push(tile);
    }
    grid.push(row);
  }

  grid[2][7] = 'X';
  grid[2][8] = 'X';

  fillRect(grid, 7, 9, 8, 10, 'B'); // ponton
  fillRect(grid, 11, 4, 13, 6, '#'); // hautes herbes
  grid[6][4] = 'D'; // dinosaure mort
  fillRect(grid, 2, 3, 3, 3, 'K'); // cabane du garde
  grid[5][6] = 'R';
  grid[7][9] = 'R';

  return { w, h, rows: grid.map((row) => row.join('')) };
}

const ZONES = {
  island: {
    ...buildIslandMap(),
    spawn: { x: 5, y: 6 },
    weather: 'clear',
    encounterSpecies: null,
    encounterRate: 0.13,
    theme: 'island',
  },
  pier: {
    ...buildPierMap(),
    spawn: { x: 7, y: 8 },
    weather: 'rain',
    encounterSpecies: ['compsognathus'],
    encounterRate: 0.16,
    theme: 'pier',
  },
};

function currentZone() {
  return ZONES[state.zoneId];
}

function tileAt(x, y) {
  return currentZone().rows[y][x];
}

function isWalkable(x, y) {
  const zone = currentZone();
  if (x < 0 || y < 0 || x >= zone.w || y >= zone.h) return false;
  const info = TILE_INFO[tileAt(x, y)];
  return info ? info.walkable : false;
}

/* =========================================================
   ÉTAT DU JEU
   ========================================================= */

const SAVE_KEY = 'jurassicTamersSave';

let state = null; // état persistant (équipe, ressources, position, zone...)
let battle = null; // état transitoire de combat
let teamReturnTarget = 'screen-overworld'; // écran vers lequel revenir depuis l'équipe

function xpToNextLevel(level) {
  return level * 20;
}

function createDino(speciesId, level) {
  const species = getSpecies(speciesId);
  const maxHp = species.base.hp + level * 4;
  return {
    uid: `${speciesId}-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    speciesId,
    level,
    xp: 0,
    maxHp,
    hp: maxHp,
    atk: species.base.atk + level,
    def: species.base.def + Math.round(level * 0.6),
  };
}

function defaultState() {
  return {
    tranqDarts: 5,
    team: [],
    activeIndex: 0,
    explorationLevel: 1,
    wins: 0,
    zoneId: 'pier',
    pos: { x: ZONES.pier.spawn.x, y: ZONES.pier.spawn.y },
    cabinVisited: false,
  };
}

function saveGame() {
  localStorage.setItem(SAVE_KEY, JSON.stringify(state));
}

function loadGame() {
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (!parsed.zoneId) parsed.zoneId = 'island';
    if (!parsed.pos) parsed.pos = { x: ZONES[parsed.zoneId].spawn.x, y: ZONES[parsed.zoneId].spawn.y };
    if (typeof parsed.cabinVisited !== 'boolean') parsed.cabinVisited = true;
    return parsed;
  } catch {
    return null;
  }
}

/* =========================================================
   UTILITAIRES
   ========================================================= */

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function hpBarClass(hp, maxHp) {
  const ratio = hp / maxHp;
  if (ratio <= 0.25) return 'low';
  if (ratio <= 0.5) return 'mid';
  return '';
}

function showScreen(id) {
  document.querySelectorAll('.screen').forEach((el) => el.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

function isOverworldActive() {
  return document.getElementById('screen-overworld').classList.contains('active');
}

let toastTimer = null;
function toast(message) {
  const el = document.getElementById('toast');
  el.textContent = message;
  el.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.hidden = true; }, 2800);
}

/* =========================================================
   RENDU : CARTES DE DINOSAURES
   ========================================================= */

function buildDinoCard(dino, { interactive = false, showStats = true } = {}) {
  const species = getSpecies(dino.speciesId);
  const card = document.createElement('div');
  card.className = 'dino-card' + (interactive ? '' : ' non-interactive');
  if (dino.hp <= 0) card.classList.add('fainted');

  const barClass = hpBarClass(dino.hp, dino.maxHp);
  const hpRatio = clamp((dino.hp / dino.maxHp) * 100, 0, 100);

  card.innerHTML = `
    <div class="dino-emoji">${species.emoji}</div>
    <div class="dino-name">${species.name}</div>
    <span class="type-badge ${species.type}">${TYPES[species.type].label}</span>
    <div class="dino-level">Niveau ${dino.level}${dino.hp <= 0 ? ' · K.O.' : ''}</div>
    <div class="hp-bar-track"><div class="hp-bar-fill ${barClass}" style="width:${hpRatio}%"></div></div>
    <div class="hp-text">${Math.max(0, dino.hp)} / ${dino.maxHp} PV</div>
    ${showStats ? `<div class="dino-stats">ATQ ${dino.atk} · DEF ${dino.def}</div>` : ''}
  `;
  return card;
}

/* =========================================================
   ÉCRAN TITRE / INTRODUCTION
   ========================================================= */

function initTitleScreen() {
  const saved = loadGame();
  document.getElementById('btn-continue').hidden = !saved;

  document.getElementById('btn-new-game').addEventListener('click', () => {
    if (saved && !confirm("Une expédition est déjà en cours. La remplacer par une nouvelle ?")) return;
    state = defaultState();
    showScreen('screen-intro');
  });

  document.getElementById('btn-continue').addEventListener('click', () => {
    state = loadGame() ?? defaultState();
    enterOverworld();
  });

  document.getElementById('btn-start-intro').addEventListener('click', () => {
    saveGame();
    enterOverworld();
    toast('Vous débarquez sur la plage. La pluie ne faiblit pas.');
  });
}

/* =========================================================
   ÉCRAN ŒUFS (CABANE)
   ========================================================= */

function renderEggScreen() {
  const list = document.getElementById('egg-list');
  list.innerHTML = '';
  const eggSpecies = SPECIES.filter((s) => s.isEgg);

  eggSpecies.forEach((species, index) => {
    const style = EGG_STYLES[index % EGG_STYLES.length];
    const card = document.createElement('div');
    card.className = 'dino-card egg-card';
    card.innerHTML = `
      <div class="dino-emoji egg-emoji">${style.emoji}</div>
      <div class="dino-name">${style.label}</div>
      <div class="dino-level">Il est encore chaud...</div>
    `;
    card.addEventListener('click', () => hatchEgg(species));
    list.appendChild(card);
  });
}

function hatchEgg(species) {
  const dino = createDino(species.id, 5);
  state.team.push(dino);
  state.activeIndex = 0;
  state.cabinVisited = true;
  saveGame();
  toast(`L'œuf éclot... c'est un ${species.name} !`);
  enterOverworldView();
}

/* =========================================================
   MONDE OUVERT
   ========================================================= */

let canvas = null;
let ctx = null;
let moving = false;
let anim = null;
let rafRunning = false;
let rainDrops = [];
let facingFlip = false; // true = regarde vers la gauche
let facingUp = false;
let walkFrame = 0;

function initOverworld() {
  canvas = document.getElementById('game-canvas');
  canvas.width = VIEW_COLS * TILE;
  canvas.height = VIEW_ROWS * TILE;
  ctx = canvas.getContext('2d');
  initRain();
}

function initRain() {
  rainDrops = [];
  for (let i = 0; i < 46; i++) {
    rainDrops.push({
      x: Math.random() * (VIEW_COLS * TILE),
      y: Math.random() * (VIEW_ROWS * TILE),
      len: 9 + Math.random() * 9,
      speed: 7 + Math.random() * 5,
    });
  }
}

function getActiveDino() {
  return state.team[state.activeIndex];
}

function getFirstHealthyIndex() {
  return state.team.findIndex((d) => d.hp > 0);
}

function updateHud() {
  document.getElementById('hud-tranq').textContent = state.tranqDarts;
  const hudDino = document.getElementById('hud-dino');
  hudDino.innerHTML = '';
  if (state.team.length === 0) {
    hudDino.innerHTML = '<div class="hud-dino-info"><div class="hud-dino-name">Aucun dinosaure — trouvez la cabane</div></div>';
    return;
  }

  const dino = getActiveDino();
  const species = getSpecies(dino.speciesId);
  const hpRatio = clamp((dino.hp / dino.maxHp) * 100, 0, 100);
  const barClass = hpBarClass(dino.hp, dino.maxHp);

  hudDino.innerHTML = `
    <div class="hud-dino-emoji">${species.emoji}</div>
    <div class="hud-dino-info">
      <div class="hud-dino-name">${species.name} <small>Niv. ${dino.level}</small></div>
      <div class="hp-bar-track hud-hp-track"><div class="hp-bar-fill ${barClass}" style="width:${hpRatio}%"></div></div>
    </div>
  `;
}

function updateInteractHint() {
  const tile = tileAt(state.pos.x, state.pos.y);
  const hint = document.getElementById('interact-hint');
  const btn = document.getElementById('btn-interact');
  if (tile === 'C') {
    hint.hidden = false;
    btn.textContent = '⛺ Installer le camp (E)';
  } else if (tile === 'K') {
    hint.hidden = false;
    btn.textContent = state.cabinVisited ? '🛖 Cabane vide (E)' : '🛖 Entrer dans la cabane (E)';
  } else {
    hint.hidden = true;
  }
}

function enterOverworldView() {
  updateHud();
  showScreen('screen-overworld');
  updateInteractHint();
  startGameLoop();
}

function enterOverworld() {
  enterOverworldView();
}

/* ---------- Pixel art : palette et outils ---------- */

const PAL = {
  grassA: '#3a7a42', grassB: '#4a8a4f', grassC: '#245229', grassD: '#5f9a56',
  dirtA: '#4a3c2a', dirtB: '#5a4a34', dirtC: '#332818',
  sandA: '#8a774f', sandB: '#9c8862', sandC: '#6b5a3e',
  waterA: '#1f5068', waterB: '#3a7fa0', waterC: '#8fc8dd',
  wallGreenA: '#16321c', wallGreenB: '#1e4224', wallGreenC: '#0e2013',
  trunkA: '#5a3d22', trunkB: '#402c18',
  canopyA: '#2c6b34', canopyB: '#3d8a45', canopyC: '#1c4620',
  rockA: '#9aa1a9', rockB: '#767e86', rockC: '#565c63',
  tentA: '#d1652c', tentB: '#a84a1e', tentC: '#5c2c10',
  hutRoof: '#6b5338', hutRoofDark: '#40311f', hutWall: '#8a6b45', hutDoor: '#241a10', hutWindow: '#a9c9c4',
  plankA: '#7a5c38', plankB: '#684d2e', plankLine: '#3f2c18',
  bodyGray: '#697870', bodyGrayDark: '#495650', boneWhite: '#c9c2ac',
  skin: '#f2c9a0', skinShade: '#dba97e', hair: '#e8c765', hairDark: '#c9a34f',
  vest: '#e8853a', vestDark: '#b85f1f', pants: '#33405a', pantsDark: '#242e42', ink: '#241c14',
};

function tileHash(tx, ty, salt) {
  let h = (tx * 374761393 + ty * 668265263 + salt * 2246822519) >>> 0;
  h = (h ^ (h >>> 13)) * 1274126177 >>> 0;
  return (h ^ (h >>> 16)) >>> 0;
}

function blk(ox, oy, gx, gy, gw, gh, color) {
  ctx.fillStyle = color;
  ctx.fillRect(ox + gx * PXR, oy + gy * PXR, gw * PXR, gh * PXR);
}

/* ---------- Sol ---------- */

function drawGroundTile(ox, oy, tx, ty, base, dark, light) {
  blk(ox, oy, 0, 0, 16, 16, base);
  for (let i = 0; i < 4; i++) {
    const hh = tileHash(tx, ty, 10 + i);
    const gx = 1 + (hh % 13);
    const gy = 1 + ((hh >> 4) % 13);
    blk(ox, oy, gx, gy, 2, 1, i % 2 === 0 ? dark : light);
  }
}

function groundPalette(theme) {
  return theme === 'pier' ? [PAL.sandA, PAL.sandC, PAL.sandB] : [PAL.dirtA, PAL.dirtC, PAL.dirtB];
}

function drawTallGrassTile(ox, oy, tx, ty) {
  blk(ox, oy, 0, 0, 16, 16, PAL.grassA);
  for (let i = 0; i < 5; i++) {
    const hh = tileHash(tx, ty, 20 + i);
    const gx = 1 + (hh % 13);
    const c = hh & 1 ? PAL.grassC : PAL.grassD;
    blk(ox, oy, gx, 8, 1, 6, c);
    blk(ox, oy, gx + 1, 11, 1, 3, c);
  }
  blk(ox, oy, 2, 2, 3, 1, PAL.grassB);
  blk(ox, oy, 10, 4, 3, 1, PAL.grassB);
}

let waveOffset = 0;

function drawWaterTile(ox, oy, tx, ty) {
  blk(ox, oy, 0, 0, 16, 16, PAL.waterA);
  const rowY = 6 + ((tx + ty) % 3) * 3;
  const shift = Math.floor(waveOffset) % 16;
  for (let gx = -4; gx < 16; gx += 6) {
    const wx = ((gx + shift) % 20 + 20) % 20 - 4;
    blk(ox, oy, wx, rowY, 3, 1, PAL.waterB);
  }
  const hh = tileHash(tx, ty, 30);
  blk(ox, oy, hh % 13, 2 + ((hh >> 3) % 3), 1, 1, PAL.waterC);
}

function drawDockTile(ox, oy, tx, ty) {
  blk(ox, oy, 0, 0, 16, 16, (tx + ty) % 2 === 0 ? PAL.plankA : PAL.plankB);
  blk(ox, oy, 0, 5, 16, 1, PAL.plankLine);
  blk(ox, oy, 0, 11, 16, 1, PAL.plankLine);
  blk(ox, oy, 7, 0, 1, 16, PAL.plankLine);
}

/* ---------- Objets posés sur une tuile ---------- */

function drawTreeObject(ox, oy) {
  blk(ox, oy, 7, 11, 2, 5, PAL.trunkA);
  blk(ox, oy, 7, 11, 1, 5, PAL.trunkB);
  const rows = [[-5, 6, 4], [-4, 4, 8], [-3, 2, 12], [-2, 1, 14], [-1, 1, 14], [0, 2, 12], [1, 4, 8]];
  rows.forEach(([dy, gx, w]) => blk(ox, oy, gx, dy, w, 1, PAL.canopyA));
  blk(ox, oy, 9, -3, 4, 3, PAL.canopyC);
  blk(ox, oy, 3, -4, 3, 3, PAL.canopyB);
}

function drawRockObject(ox, oy, tx, ty) {
  blk(ox, oy, 4, 10, 8, 4, PAL.rockB);
  blk(ox, oy, 5, 9, 6, 2, PAL.rockA);
  blk(ox, oy, 5, 13, 7, 1, PAL.rockC);
  blk(ox, oy, 6, 10, 2, 2, PAL.rockA);
}

function drawTentObject(ox, oy) {
  const rows = [[3, 7, 2], [4, 6, 4], [5, 5, 6], [6, 4, 8], [7, 3, 10], [8, 3, 10]];
  rows.forEach(([gy, gx, w]) => blk(ox, oy, gx, gy, w, 1, PAL.tentA));
  blk(ox, oy, 7, 6, 2, 3, PAL.tentC);
  blk(ox, oy, 3, 9, 10, 2, PAL.tentB);
}

function drawCabinObject(ox, oy) {
  blk(ox, oy, 2, 1, 12, 2, PAL.hutRoofDark);
  blk(ox, oy, 3, 3, 10, 2, PAL.hutRoof);
  blk(ox, oy, 3, 5, 10, 8, PAL.hutWall);
  blk(ox, oy, 7, 8, 3, 5, PAL.hutDoor);
  blk(ox, oy, 4, 6, 2, 2, PAL.hutWindow);
  blk(ox, oy, 11, 6, 1, 7, PAL.hutRoofDark);
}

function drawCarcassObject(ox, oy) {
  blk(ox, oy, 1, 9, 13, 4, PAL.bodyGray);
  blk(ox, oy, 0, 10, 3, 2, PAL.bodyGray);
  blk(ox, oy, 13, 11, 3, 2, PAL.bodyGrayDark);
  for (let i = 0; i < 3; i++) blk(ox, oy, 4 + i * 3, 9, 1, 4, PAL.bodyGrayDark);
  blk(ox, oy, 1, 10, 1, 1, PAL.ink);
  blk(ox, oy, 2, 11, 1, 1, PAL.ink);
  blk(ox, oy, 9, 10, 2, 1, PAL.boneWhite);
}

function drawTile(tile, sx, sy, tx, ty, theme) {
  const [base, dark, light] = groundPalette(theme);
  switch (tile) {
    case '#':
      drawTallGrassTile(sx, sy, tx, ty);
      break;
    case '~':
      drawWaterTile(sx, sy, tx, ty);
      break;
    case 'B':
      drawDockTile(sx, sy, tx, ty);
      break;
    case 'C':
      drawGroundTile(sx, sy, tx, ty, base, dark, light);
      drawTentObject(sx, sy);
      break;
    case 'K':
      drawGroundTile(sx, sy, tx, ty, base, dark, light);
      drawCabinObject(sx, sy);
      break;
    case 'D':
      drawGroundTile(sx, sy, tx, ty, base, dark, light);
      drawCarcassObject(sx, sy);
      break;
    case 'T':
      drawGroundTile(sx, sy, tx, ty, base, dark, light);
      drawTreeObject(sx, sy);
      break;
    case 'J':
      drawGroundTile(sx, sy, tx, ty, PAL.wallGreenA, PAL.wallGreenC, PAL.wallGreenB);
      drawTreeObject(sx - 5, sy + 3);
      drawTreeObject(sx + 5, sy);
      break;
    case 'R':
      drawGroundTile(sx, sy, tx, ty, base, dark, light);
      drawRockObject(sx, sy, tx, ty);
      break;
    default:
      drawGroundTile(sx, sy, tx, ty, base, dark, light);
  }
}

/* ---------- Personnage ---------- */

function drawExplorer(px, py) {
  const spriteW = 16 * PXR;
  const spriteH = 20 * PXR;
  const ox = px + (TILE - spriteW) / 2;
  const oy = py + TILE - spriteH;
  const lift = walkFrame === 1 ? 1 : 0;

  ctx.save();
  if (facingFlip) {
    ctx.translate(px * 2 + TILE, 0);
    ctx.scale(-1, 1);
  }

  // ombre
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath();
  ctx.ellipse(px + TILE / 2, py + TILE - PXR, PXR * 3.5, PXR * 1.4, 0, 0, Math.PI * 2);
  ctx.fill();

  // jambes (alternance de marche)
  blk(ox, oy, 5, 15 - (1 - lift), 3, 4 + (1 - lift), PAL.pants);
  blk(ox, oy, 9, 15 - lift, 3, 4 + lift, PAL.pants);
  blk(ox, oy, 5, 18, 3, 1, PAL.ink);
  blk(ox, oy, 9, 18, 3, 1, PAL.ink);

  // gilet de sauvetage
  blk(ox, oy, 3, 8, 10, 7, PAL.vest);
  blk(ox, oy, 3, 8, 10, 1, PAL.vestDark);
  blk(ox, oy, 7, 8, 2, 7, PAL.vestDark);

  // bras
  blk(ox, oy, 1, 9, 2, 6, PAL.skin);
  blk(ox, oy, 13, 9, 2, 6, PAL.skin);

  if (facingUp) {
    // vu de dos : cheveux couvrent toute la tête
    blk(ox, oy, 4, 1, 8, 6, PAL.hair);
    blk(ox, oy, 4, 6, 8, 2, PAL.hairDark);
    blk(ox, oy, 7, 1, 1, 7, PAL.hairDark);
  } else {
    // visage
    blk(ox, oy, 4, 3, 8, 5, PAL.skin);
    blk(ox, oy, 4, 7, 8, 1, PAL.skinShade);
    // yeux
    blk(ox, oy, 5, 5, 1, 1, PAL.ink);
    blk(ox, oy, 10, 5, 1, 1, PAL.ink);
    // cheveux (carré blond avec frange)
    blk(ox, oy, 4, 0, 8, 3, PAL.hair);
    blk(ox, oy, 3, 1, 1, 4, PAL.hair);
    blk(ox, oy, 12, 1, 1, 4, PAL.hair);
    blk(ox, oy, 4, 3, 2, 1, PAL.hairDark);
    blk(ox, oy, 10, 3, 2, 1, PAL.hairDark);
  }

  ctx.restore();
}

function drawMap(renderPos) {
  if (!ctx || !state) return;
  const zone = currentZone();

  const camX = clamp(Math.round(renderPos.x - (VIEW_COLS - 1) / 2), 0, Math.max(0, zone.w - VIEW_COLS));
  const camY = clamp(Math.round(renderPos.y - (VIEW_ROWS - 1) / 2), 0, Math.max(0, zone.h - VIEW_ROWS));

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let ty = camY; ty < camY + VIEW_ROWS; ty++) {
    for (let tx = camX; tx < camX + VIEW_COLS; tx++) {
      drawTile(zone.rows[ty][tx], (tx - camX) * TILE, (ty - camY) * TILE, tx, ty, zone.theme);
    }
  }

  drawExplorer((renderPos.x - camX) * TILE, (renderPos.y - camY) * TILE);

  if (zone.weather === 'rain') drawRain();
}

function drawRain() {
  ctx.strokeStyle = 'rgba(190,205,225,0.4)';
  ctx.lineWidth = 1.5;
  rainDrops.forEach((d) => {
    ctx.beginPath();
    ctx.moveTo(d.x, d.y);
    ctx.lineTo(d.x - 3, d.y + d.len);
    ctx.stroke();
    d.y += d.speed;
    d.x -= 0.8;
    if (d.y > canvas.height) {
      d.y = -10;
      d.x = Math.random() * canvas.width;
    }
  });
  ctx.fillStyle = 'rgba(50,70,100,0.10)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function startGameLoop() {
  if (rafRunning) return;
  rafRunning = true;
  requestAnimationFrame(gameLoopTick);
}

function gameLoopTick(now) {
  if (!rafRunning) return;
  if (!isOverworldActive()) { rafRunning = false; return; }

  let renderPos = state.pos;
  if (anim) {
    const t = Math.min(1, (now - anim.start) / anim.duration);
    renderPos = {
      x: anim.fromX + (anim.toX - anim.fromX) * t,
      y: anim.fromY + (anim.toY - anim.fromY) * t,
    };
    if (t >= 1) {
      state.pos.x = anim.toX;
      state.pos.y = anim.toY;
      anim = null;
      moving = false;
      saveGame();
      onArriveTile();
      renderPos = state.pos;
    }
  }

  waveOffset += 0.06;
  drawMap(renderPos);
  requestAnimationFrame(gameLoopTick);
}

function onArriveTile() {
  const tile = tileAt(state.pos.x, state.pos.y);

  if (tile === 'X') {
    changeZone('island', ZONES.island.spawn);
    toast("Vous quittez la plage et pénétrez sur l'île.");
    return;
  }

  updateInteractHint();

  const zone = currentZone();
  if (tile === '#' && getFirstHealthyIndex() !== -1 && Math.random() < zone.encounterRate) {
    startEncounter();
  }
}

function changeZone(zoneId, spawn) {
  state.zoneId = zoneId;
  state.pos = { x: spawn.x, y: spawn.y };
  saveGame();
  updateInteractHint();
}

function animStep() {
  // conservé pour compatibilité, le rendu est géré par gameLoopTick
}

function attemptMove(dx, dy) {
  if (moving || !state || !isOverworldActive()) return;
  const nx = state.pos.x + dx;
  const ny = state.pos.y + dy;

  if (dx < 0) facingFlip = true;
  else if (dx > 0) facingFlip = false;
  if (dy < 0) facingUp = true;
  else if (dy > 0) facingUp = false;

  if (!isWalkable(nx, ny)) return;
  moving = true;
  walkFrame = 1 - walkFrame;
  anim = { fromX: state.pos.x, fromY: state.pos.y, toX: nx, toY: ny, start: performance.now(), duration: 130 };
  startGameLoop();
}

function tryInteract() {
  if (!isOverworldActive()) return;
  const tile = tileAt(state.pos.x, state.pos.y);
  if (tile === 'C') {
    renderCampScreen();
    showScreen('screen-camp');
  } else if (tile === 'K') {
    if (state.cabinVisited) {
      toast('Il ne reste plus rien dans la cabane.');
    } else {
      renderEggScreen();
      showScreen('screen-eggs');
    }
  }
}

/* =========================================================
   RENCONTRE ALÉATOIRE
   ========================================================= */

function weightedRandomSpecies(pool) {
  const list = pool ? pool.map((id) => getSpecies(id)) : SPECIES;
  const weights = list.map((s) => 1 / s.rarity);
  const total = weights.reduce((a, b) => a + b, 0);
  let roll = Math.random() * total;
  for (let i = 0; i < list.length; i++) {
    roll -= weights[i];
    if (roll <= 0) return list[i];
  }
  return list[0];
}

function startEncounter() {
  const activeIdx = getFirstHealthyIndex();
  if (activeIdx === -1) return;
  state.activeIndex = activeIdx;

  const zone = currentZone();
  const species = weightedRandomSpecies(zone.encounterSpecies);
  const level = clamp(state.explorationLevel + randInt(-1, 1), 1, 30);
  const wildDino = createDino(species.id, level);

  battle = {
    wildDino,
    playerIndex: activeIdx,
    log: [],
    ended: false,
  };

  showScreen('screen-battle');
  logBattle(`Un ${species.name} sauvage de niveau ${level} apparaît !`);
  renderBattle();
}

/* =========================================================
   ÉCRAN COMBAT
   ========================================================= */

function logBattle(message) {
  battle.log.push(message);
  const box = document.getElementById('battle-log');
  box.innerHTML = '';
  battle.log.slice(-3).forEach((line) => {
    const p = document.createElement('p');
    p.textContent = line;
    box.appendChild(p);
  });
}

function renderPlate(elId, dino, { showNumeric }) {
  const species = getSpecies(dino.speciesId);
  const barClass = hpBarClass(dino.hp, dino.maxHp);
  const hpRatio = clamp((dino.hp / dino.maxHp) * 100, 0, 100);
  document.getElementById(elId).innerHTML = `
    <div class="plate-name-row">
      <span class="plate-name">${species.name}</span>
      <span class="plate-level">N.${dino.level}</span>
    </div>
    <div class="hp-bar-track"><div class="hp-bar-fill ${barClass}" style="width:${hpRatio}%"></div></div>
    ${showNumeric ? `<div class="plate-hp-text">${Math.max(0, dino.hp)}/${dino.maxHp} PV</div>` : ''}
  `;
}

function renderBattle() {
  const wild = battle.wildDino;
  const player = state.team[battle.playerIndex];

  document.getElementById('wild-sprite').textContent = getSpecies(wild.speciesId).emoji;
  document.getElementById('player-sprite').textContent = getSpecies(player.speciesId).emoji;

  renderPlate('wild-plate', wild, { showNumeric: false });
  renderPlate('player-plate', player, { showNumeric: true });

  showBattleMainMenu();
  updateBattleButtonsAvailability();
}

function flashSprite(elId) {
  const el = document.getElementById(elId);
  el.classList.remove('hit');
  // force reflow pour rejouer l'animation
  void el.offsetWidth;
  el.classList.add('hit');
}

function updateBattleButtonsAvailability() {
  document.getElementById('btn-tranq').disabled = state.tranqDarts <= 0;
  const hasReserve = state.team.some((d, i) => i !== battle.playerIndex && d.hp > 0);
  document.getElementById('btn-switch').disabled = !hasReserve;
}

function showBattleMainMenu() {
  document.getElementById('battle-main-actions').hidden = false;
  document.getElementById('battle-move-actions').hidden = true;
  document.getElementById('battle-switch-actions').hidden = true;
}

function showMoveMenu() {
  const player = state.team[battle.playerIndex];
  const species = getSpecies(player.speciesId);
  const container = document.getElementById('battle-move-actions');
  container.innerHTML = '';

  species.moves.forEach((move) => {
    const btn = document.createElement('button');
    btn.className = 'btn btn-action move-btn';
    btn.innerHTML = `${move.name}<small>Puissance ${move.power} · ${move.type === 'neutral' ? 'Neutre' : TYPES[move.type].label}</small>`;
    btn.addEventListener('click', () => playerAttack(move));
    container.appendChild(btn);
  });

  const back = document.createElement('button');
  back.className = 'btn btn-action';
  back.textContent = '← Retour';
  back.addEventListener('click', showBattleMainMenu);
  container.appendChild(back);

  document.getElementById('battle-main-actions').hidden = true;
  container.hidden = false;
}

function showSwitchMenu() {
  const container = document.getElementById('battle-switch-actions');
  container.innerHTML = '';

  state.team.forEach((dino, index) => {
    if (index === battle.playerIndex || dino.hp <= 0) return;
    const species = getSpecies(dino.speciesId);
    const btn = document.createElement('button');
    btn.className = 'btn btn-action switch-btn';
    btn.innerHTML = `${species.emoji} ${species.name}<small>Niv. ${dino.level} · ${dino.hp}/${dino.maxHp} PV</small>`;
    btn.addEventListener('click', () => switchActiveDino(index, true));
    container.appendChild(btn);
  });

  const back = document.createElement('button');
  back.className = 'btn btn-action';
  back.textContent = '← Retour';
  back.addEventListener('click', showBattleMainMenu);
  container.appendChild(back);

  document.getElementById('battle-main-actions').hidden = true;
  container.hidden = false;
}

function switchActiveDino(index, isBattleAction) {
  battle.playerIndex = index;
  state.activeIndex = index;
  logBattle(`${getSpecies(state.team[index].speciesId).name} entre en scène !`);
  renderBattle();
  if (isBattleAction) wildTurn();
}

function computeDamage(attacker, defender, move, multiplier) {
  const base = attacker.atk * (move.power / 10) - defender.def * 0.5;
  const variance = 0.85 + Math.random() * 0.3;
  return Math.max(1, Math.round(base * multiplier * variance));
}

function playerAttack(move) {
  const player = state.team[battle.playerIndex];
  const wild = battle.wildDino;
  const wildType = getSpecies(wild.speciesId).type;
  const multiplier = getMultiplier(move.type, wildType);
  const damage = computeDamage(player, wild, move, multiplier);

  wild.hp = Math.max(0, wild.hp - damage);
  logBattle(`${getSpecies(player.speciesId).name} utilise ${move.name} ! (${damage} dégâts${multiplier > 1 ? ', super efficace !' : multiplier < 1 ? ', peu efficace...' : ''})`);
  renderBattle();
  flashSprite('wild-sprite');

  if (wild.hp <= 0) {
    winBattle();
    return;
  }
  setTimeout(wildTurn, 500);
}

function wildTurn() {
  const player = state.team[battle.playerIndex];
  if (player.hp <= 0 || battle.ended) return;

  const wild = battle.wildDino;
  const species = getSpecies(wild.speciesId);
  const move = species.moves[randInt(0, species.moves.length - 1)];
  const playerType = getSpecies(player.speciesId).type;
  const multiplier = getMultiplier(move.type, playerType);
  const damage = computeDamage(wild, player, move, multiplier);

  player.hp = Math.max(0, player.hp - damage);
  logBattle(`${species.name} utilise ${move.name} ! (${damage} dégâts${multiplier > 1 ? ', super efficace !' : multiplier < 1 ? ', peu efficace...' : ''})`);
  renderBattle();
  flashSprite('player-sprite');

  if (player.hp <= 0) {
    logBattle(`${getSpecies(player.speciesId).name} est K.O. !`);
    const nextIndex = getFirstHealthyIndex();
    if (nextIndex === -1) {
      loseBattle();
    } else {
      updateBattleButtonsAvailability();
      showSwitchMenu();
      logBattle('Choisissez un autre dinosaure pour continuer le combat.');
    }
  }
}

function winBattle() {
  battle.ended = true;
  const wild = battle.wildDino;
  const wildSpecies = getSpecies(wild.speciesId);
  logBattle(`${wildSpecies.name} sauvage est vaincu !`);

  const player = state.team[battle.playerIndex];
  const xpGain = wild.level * 8 + 10;
  player.xp += xpGain;
  logBattle(`${getSpecies(player.speciesId).name} gagne ${xpGain} points d'expérience.`);

  while (player.xp >= xpToNextLevel(player.level)) {
    player.xp -= xpToNextLevel(player.level);
    player.level += 1;
    player.maxHp += 4;
    player.atk += 1;
    player.def += 1;
    player.hp = Math.min(player.maxHp, player.hp + 4);
    logBattle(`${getSpecies(player.speciesId).name} monte au niveau ${player.level} !`);
  }

  state.wins += 1;
  if (state.wins % 3 === 0) state.explorationLevel += 1;
  saveGame();
  renderBattle();
  showBattleEndMenu();
}

function loseBattle() {
  battle.ended = true;
  logBattle("Toute votre équipe est épuisée. Vous battez en retraite vers le camp.");
  saveGame();
  showBattleEndMenu();
}

function showBattleEndMenu() {
  const container = document.getElementById('battle-move-actions');
  container.innerHTML = '';
  container.hidden = false;
  document.getElementById('battle-main-actions').hidden = true;
  document.getElementById('battle-switch-actions').hidden = true;

  const back = document.createElement('button');
  back.className = 'btn btn-action';
  back.textContent = "Continuer l'exploration";
  back.addEventListener('click', () => {
    battle = null;
    if (getFirstHealthyIndex() === -1) {
      const zone = currentZone();
      state.pos = { x: zone.spawn.x, y: zone.spawn.y };
      saveGame();
      toast('Toute votre équipe est épuisée. Retour au point de départ...');
      enterOverworldView();
    } else {
      enterOverworldView();
    }
  });
  container.appendChild(back);
}

function attemptRun() {
  const chance = 0.7;
  if (Math.random() < chance) {
    logBattle('Vous prenez la fuite avec succès.');
    battle.ended = true;
    saveGame();
    showBattleEndMenu();
  } else {
    logBattle('Impossible de fuir !');
    setTimeout(wildTurn, 400);
  }
}

function attemptCapture() {
  if (state.tranqDarts <= 0) return;
  state.tranqDarts -= 1;

  const wild = battle.wildDino;
  const hpFraction = wild.hp / wild.maxHp;
  const chance = clamp(0.9 * (1 - hpFraction) + 0.1, 0.1, 0.9);
  const success = Math.random() < chance;

  const wildSpecies = getSpecies(wild.speciesId);
  logBattle(`Vous tirez une fléchette tranquillisante sur ${wildSpecies.name}...`);

  if (success) {
    if (state.team.length >= 6) {
      logBattle("Votre équipe est complète (6 dinosaures) ! Impossible de le capturer pour le moment.");
      saveGame();
      renderBattle();
      return;
    }
    state.team.push(wild);
    logBattle(`${wildSpecies.name} a été capturé et rejoint votre équipe !`);
    battle.ended = true;
    saveGame();
    renderBattle();
    showBattleEndMenu();
  } else {
    logBattle('Le dinosaure résiste à la fléchette !');
    saveGame();
    renderBattle();
    setTimeout(wildTurn, 400);
  }
}

/* =========================================================
   ÉCRAN CAMP
   ========================================================= */

function campLog(message) {
  const box = document.getElementById('camp-log');
  const p = document.createElement('p');
  p.textContent = message;
  box.appendChild(p);
  box.scrollTop = box.scrollHeight;
}

function renderCampScreen() {
  document.getElementById('camp-tranq-count').textContent = state.tranqDarts;
  const panel = document.getElementById('camp-active-dino-panel');
  panel.innerHTML = '';
  if (state.team.length === 0) {
    panel.textContent = "Vous n'avez aucun dinosaure.";
    return;
  }
  const label = document.createElement('p');
  label.textContent = 'Dinosaure actif';
  panel.appendChild(label);
  panel.appendChild(buildDinoCard(getActiveDino()));
}

function healTeam() {
  state.team.forEach((d) => (d.hp = d.maxHp));
  saveGame();
  campLog("Votre équipe est soignée et prête à repartir explorer l'île.");
  renderCampScreen();
}

/* =========================================================
   ÉCRAN ÉQUIPE
   ========================================================= */

function renderTeamScreen() {
  const list = document.getElementById('team-list');
  list.innerHTML = '';
  state.team.forEach((dino, index) => {
    const card = buildDinoCard(dino, { interactive: true });
    if (index === state.activeIndex) card.classList.add('selected');
    card.addEventListener('click', () => {
      if (dino.hp <= 0) return;
      state.activeIndex = index;
      saveGame();
      renderTeamScreen();
    });
    list.appendChild(card);
  });
}

function leaveTeamScreen() {
  showScreen(teamReturnTarget);
  if (teamReturnTarget === 'screen-overworld') {
    enterOverworldView();
  } else {
    renderCampScreen();
  }
}

/* =========================================================
   INITIALISATION / ÉCOUTEURS D'ÉVÉNEMENTS
   ========================================================= */

const MOVE_KEYS = {
  ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0],
  z: [0, -1], Z: [0, -1], w: [0, -1], W: [0, -1],
  s: [0, 1], S: [0, 1],
  q: [-1, 0], Q: [-1, 0], a: [-1, 0], A: [-1, 0],
  d: [1, 0], D: [1, 0],
};

function initEventListeners() {
  document.getElementById('btn-hud-team').addEventListener('click', () => {
    teamReturnTarget = 'screen-overworld';
    renderTeamScreen();
    showScreen('screen-team');
  });
  document.getElementById('btn-team-from-camp').addEventListener('click', () => {
    teamReturnTarget = 'screen-camp';
    renderTeamScreen();
    showScreen('screen-team');
  });
  document.getElementById('btn-team-back').addEventListener('click', leaveTeamScreen);

  document.getElementById('btn-interact').addEventListener('click', tryInteract);
  document.getElementById('btn-heal').addEventListener('click', healTeam);
  document.getElementById('btn-leave-camp').addEventListener('click', enterOverworldView);

  document.getElementById('btn-reset-game').addEventListener('click', () => {
    if (!confirm('Réinitialiser toute la progression ? Cette action est irréversible.')) return;
    localStorage.removeItem(SAVE_KEY);
    state = null;
    battle = null;
    showScreen('screen-title');
    initTitleScreen();
  });

  document.getElementById('btn-fight').addEventListener('click', showMoveMenu);
  document.getElementById('btn-tranq').addEventListener('click', attemptCapture);
  document.getElementById('btn-switch').addEventListener('click', showSwitchMenu);
  document.getElementById('btn-run').addEventListener('click', attemptRun);

  document.getElementById('dpad-up').addEventListener('click', () => attemptMove(0, -1));
  document.getElementById('dpad-down').addEventListener('click', () => attemptMove(0, 1));
  document.getElementById('dpad-left').addEventListener('click', () => attemptMove(-1, 0));
  document.getElementById('dpad-right').addEventListener('click', () => attemptMove(1, 0));

  document.addEventListener('keydown', (e) => {
    if (!isOverworldActive()) return;
    if (e.key === 'e' || e.key === 'E') {
      e.preventDefault();
      tryInteract();
      return;
    }
    const dir = MOVE_KEYS[e.key];
    if (dir) {
      e.preventDefault();
      attemptMove(dir[0], dir[1]);
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initOverworld();
  initTitleScreen();
  initEventListeners();
});
