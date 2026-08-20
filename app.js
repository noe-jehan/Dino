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

const TILE = 64;
const PXR = TILE / 32; // taille d'un "pixel" du pixel art (grille 32x32)
const VIEW_COLS = 9;
const VIEW_ROWS = 6;

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
  S: { walkable: false },
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

  // sentier sud : ramène vers la plage
  grid[h - 1][12] = 'X';
  grid[h - 1][13] = 'X';

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
  grid[3][2] = 'K'; // cabane du garde
  grid[5][6] = 'R';
  grid[7][9] = 'R';
  grid[11][7] = 'S'; // bateau amarré au ponton

  return { w, h, rows: grid.map((row) => row.join('')) };
}

const ISLAND_SPAWN = { x: 5, y: 6 };
const PIER_SPAWN = { x: 7, y: 8 }; // arrivée initiale, près du ponton
const PIER_JUNGLE_ENTRY = { x: 7, y: 3 }; // retour depuis l'île, juste sous la lisière

const ZONES = {
  island: {
    ...buildIslandMap(),
    spawn: ISLAND_SPAWN,
    weather: 'clear',
    encounterSpecies: null,
    encounterRate: 0.13,
    theme: 'island',
    exits: {
      '12,15': { zoneId: 'pier', spawn: PIER_JUNGLE_ENTRY, message: 'Vous redescendez vers la plage.' },
      '13,15': { zoneId: 'pier', spawn: PIER_JUNGLE_ENTRY, message: 'Vous redescendez vers la plage.' },
    },
  },
  pier: {
    ...buildPierMap(),
    spawn: PIER_SPAWN,
    weather: 'rain',
    encounterSpecies: ['compsognathus'],
    encounterRate: 0.16,
    theme: 'pier',
    exits: {
      '7,2': { zoneId: 'island', spawn: ISLAND_SPAWN, message: "Vous quittez la plage et pénétrez sur l'île." },
      '8,2': { zoneId: 'island', spawn: ISLAND_SPAWN, message: "Vous quittez la plage et pénétrez sur l'île." },
    },
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
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  } catch {
    // stockage indisponible (ex: iframe sandboxée) — la partie continue simplement sans sauvegarde persistante.
  }
}

function loadGame() {
  let raw = null;
  try {
    raw = localStorage.getItem(SAVE_KEY);
  } catch {
    return null;
  }
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

// Remplace window.confirm(), qui peut être bloqué (silencieusement ou par exception)
// dans un iframe sandboxé sans "allow-modals" — cas de l'aperçu d'artifact.
function showConfirm(message) {
  return new Promise((resolve) => {
    const modal = document.getElementById('confirm-modal');
    document.getElementById('confirm-message').textContent = message;
    modal.hidden = false;

    const okBtn = document.getElementById('confirm-ok');
    const cancelBtn = document.getElementById('confirm-cancel');
    const settle = (result) => {
      modal.hidden = true;
      okBtn.removeEventListener('click', onOk);
      cancelBtn.removeEventListener('click', onCancel);
      resolve(result);
    };
    const onOk = () => settle(true);
    const onCancel = () => settle(false);
    okBtn.addEventListener('click', onOk);
    cancelBtn.addEventListener('click', onCancel);
  });
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

function refreshContinueButton() {
  document.getElementById('btn-continue').hidden = !loadGame();
}

function resetMovementState() {
  moving = false;
  anim = null;
  facingDir = 'down';
  walkFrame = 0;
}

function initTitleScreen() {
  refreshContinueButton();

  document.getElementById('btn-new-game').addEventListener('click', async () => {
    if (loadGame() && !(await showConfirm("Une expédition est déjà en cours. La remplacer par une nouvelle ?"))) return;
    resetMovementState();
    state = defaultState();
    showScreen('screen-intro');
  });

  document.getElementById('btn-continue').addEventListener('click', () => {
    resetMovementState();
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
let facingDir = 'down'; // 'down' | 'up' | 'left' | 'right'
let walkFrame = 0;
let assetsLoaded = false;
let interactBubbleIcon = null;

const TILE_SRC = {
  grass: 'assets/tiles/ground_grass.png',
  sand: 'assets/tiles/ground_sand.png',
  tallGrass: 'assets/tiles/tall_grass.png',
  water: 'assets/tiles/water.png',
  treePalm: 'assets/tiles/tree_palm.png',
  treeBush: 'assets/tiles/tree_bush.png',
  rock: 'assets/tiles/rock.png',
  dock: 'assets/tiles/dock_plank.png',
};
const CHAR_SRC = {
  down: ['assets/character/down_0.png', 'assets/character/down_1.png', 'assets/character/down_2.png'],
  up: ['assets/character/up_0.png', 'assets/character/up_1.png', 'assets/character/up_2.png'],
  side: ['assets/character/side_0.png', 'assets/character/side_1.png', 'assets/character/side_2.png'],
};
// Sprites de combat réels, par espèce. Les espèces absentes de cette table
// gardent le rendu procédural (drawSpeciesSprite) comme repli.
const CREATURE_SRC = {
  velociraptor: 'assets/creatures/velociraptor.png',
  triceratops: 'assets/creatures/triceratops.png',
  pteranodon: 'assets/creatures/pteranodon.png',
  quetzalcoatlus: 'assets/creatures/quetzalcoatlus.png',
};
// Objets illustrés posés sur la carte (cabane, carcasse, bateau). Même principe
// que CREATURE_SRC : repli sur le dessin procédural tant que l'image n'existe pas.
const OBJECT_SRC = {
  cabin: 'assets/objects/cabin.png',
  carcass: 'assets/objects/carcass.png',
  boat: 'assets/objects/boat.png',
};
const TILE_IMAGES = {};
const CHAR_IMAGES = { down: [], up: [], side: [] };
const CREATURE_IMAGES = {};
const OBJECT_IMAGES = {};

function loadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

async function loadAssets() {
  const tileEntries = Object.entries(TILE_SRC);
  await Promise.all(tileEntries.map(async ([key, src]) => {
    TILE_IMAGES[key] = await loadImage(src);
  }));
  await Promise.all(Object.entries(CHAR_SRC).map(async ([dir, list]) => {
    CHAR_IMAGES[dir] = await Promise.all(list.map(loadImage));
  }));
  await Promise.all(Object.entries(CREATURE_SRC).map(async ([key, src]) => {
    CREATURE_IMAGES[key] = await loadImage(src);
  }));
  await Promise.all(Object.entries(OBJECT_SRC).map(async ([key, src]) => {
    OBJECT_IMAGES[key] = await loadImage(src);
  }));
  assetsLoaded = true;
  if (state) drawMap(state.pos);
  if (battle && wildCtx && playerCtx) {
    drawSpeciesSprite(wildCtx, battle.wildDino.speciesId);
    drawSpeciesSprite(playerCtx, state.team[battle.playerIndex].speciesId);
  }
}

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
    interactBubbleIcon = '⛺';
  } else if (tile === 'K') {
    hint.hidden = false;
    btn.textContent = state.cabinVisited ? '🛖 Cabane vide (E)' : '🛖 Entrer dans la cabane (E)';
    interactBubbleIcon = state.cabinVisited ? null : '🥚';
  } else {
    hint.hidden = true;
    interactBubbleIcon = null;
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
  grassA: '#2f7a35', grassB: '#3d8f3e', grassC: '#1f5522', grassD: '#4fa14a',
  dirtA: '#c9975a', dirtB: '#d9ab72', dirtC: '#a97a42',
  sandA: '#e8cf9c', sandB: '#f0dcb2', sandC: '#d4b880',
  waterA: '#1b7fa3', waterB: '#2ea8c9', waterC: '#cdeef5',
  wallGreenA: '#2a5c2e', wallGreenB: '#347538', wallGreenC: '#1c4020',
  trunkA: '#6b4a28', trunkB: '#4a3218',
  canopyA: '#3d8b3f', canopyB: '#52a84f', canopyC: '#276b2c',
  rockA: '#a8a29a', rockB: '#847c72', rockC: '#5c564e', rockMoss: '#4a7a3e',
  tentA: '#d1652c', tentB: '#a84a1e', tentC: '#5c2c10',
  hutRoof: '#6b5338', hutRoofDark: '#40311f', hutWall: '#8a6b45', hutDoor: '#241a10', hutWindow: '#a9c9c4',
  plankA: '#8a6a3f', plankB: '#7a5a32', plankLine: '#4a3320', plankBolt: '#2a2016',
  bodyGray: '#697870', bodyGrayDark: '#495650', boneWhite: '#c9c2ac',
  skin: '#f0c39a', skinShade: '#d9a878',
  hair: '#8a1f24', hairMid: '#a52a2f', hairDark: '#5c1418', hairShine: '#c23a3a',
  tank: '#232323', tankDark: '#121212',
  cargo: '#4f5a35', cargoDark: '#3a4326', cargoLight: '#5f6c40',
  boot: '#2a2018', ink: '#201810',
};

function tileHash(tx, ty, salt) {
  let h = (tx * 374761393 + ty * 668265263 + salt * 2246822519) >>> 0;
  h = (h ^ (h >>> 13)) * 1274126177 >>> 0;
  return (h ^ (h >>> 16)) >>> 0;
}

function blk(ox, oy, gx, gy, gw, gh, color) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(ox + gx * PXR), Math.round(oy + gy * PXR), Math.round(gw * PXR), Math.round(gh * PXR));
}

// Ellipse pleine dans le repère d'une tuile (mêmes maths que creatureBlob, échelle PXR).
function tileBlob(ox, oy, cx, cy, rx, ry, color) {
  ctx.fillStyle = color;
  const top = Math.ceil(cy - ry);
  const bottom = Math.floor(cy + ry);
  for (let y = top; y <= bottom; y++) {
    const dy = y - cy;
    const frac = 1 - (dy * dy) / (ry * ry);
    if (frac <= 0) continue;
    const halfW = rx * Math.sqrt(frac);
    ctx.fillRect(Math.round(ox + (cx - halfW) * PXR), Math.round(oy + y * PXR), Math.round(halfW * 2 * PXR), PXR);
  }
}

/* ---------- Sol ---------- */

function drawGroundTile(ox, oy, tx, ty, base, dark, light) {
  blk(ox, oy, 0, 0, 32, 32, base);
  const hhWash = tileHash(tx, ty, 88);
  tileBlob(ox, oy, 5 + (hhWash % 22), 5 + ((hhWash >> 4) % 22), 7, 4, dark + '1c');
  for (let i = 0; i < 7; i++) {
    const hh = tileHash(tx, ty, 10 + i);
    const gx = 1 + (hh % 28);
    const gy = 1 + ((hh >> 5) % 28);
    const s = 1 + (hh % 2.4);
    tileBlob(ox, oy, gx, gy, s + 0.6, s, i % 2 === 0 ? dark : light);
  }
}

function groundPalette(theme) {
  return theme === 'pier' ? [PAL.sandA, PAL.sandC, PAL.sandB] : [PAL.dirtA, PAL.dirtC, PAL.dirtB];
}

function drawTallGrassTile(ox, oy, tx, ty) {
  blk(ox, oy, 0, 0, 32, 32, PAL.grassA);
  tileBlob(ox, oy, 12, 12, 16, 13, PAL.grassB + '2a');
  for (let i = 0; i < 10; i++) {
    const hh = tileHash(tx, ty, 20 + i);
    const gx = 2 + (hh % 27);
    const baseY = 15 + ((hh >> 5) % 8);
    const h = 7 + (hh % 7);
    const c = hh & 1 ? PAL.grassC : PAL.grassD;
    blk(ox, oy, gx, baseY, 1.6, h, c);
    blk(ox, oy, gx + 1.8, baseY + 2, 1.2, h - 3, c);
  }
  const hf = tileHash(tx, ty, 60);
  if (hf % 3 === 0) {
    const fx = 4 + (hf % 22), fy = 6 + ((hf >> 4) % 14);
    const petal = (hf >> 8) % 2 === 0 ? '#f2ecd8' : '#c9453d';
    tileBlob(ox, oy, fx, fy, 1.3, 1.3, petal);
    tileBlob(ox, oy, fx + 0.2, fy + 0.2, 0.5, 0.5, PAL.dirtA);
  }
}

let waveOffset = 0;

function drawWaterTile(ox, oy, tx, ty) {
  blk(ox, oy, 0, 0, 32, 32, PAL.waterA);
  tileBlob(ox, oy, 16, 16, 17, 15, PAL.waterB + '20');
  const shift = waveOffset % 32;
  for (let row = 0; row < 3; row++) {
    const rowY = 6 + row * 9;
    for (let gx = -8; gx < 32; gx += 11) {
      const wx = (((gx + shift + row * 5) % 42) + 42) % 42 - 8;
      blk(ox, oy, wx, rowY, 6, 1.4, PAL.waterB);
    }
  }
  const hh = tileHash(tx, ty, 30);
  tileBlob(ox, oy, 3 + (hh % 25), 3 + ((hh >> 4) % 8), 1.5, 1, PAL.waterC);
}

function drawDockTile(ox, oy, tx, ty) {
  const alt = (tx + ty) % 2 === 0;
  blk(ox, oy, 0, 0, 32, 32, alt ? PAL.plankA : PAL.plankB);
  blk(ox, oy, 0, 10, 32, 1.6, PAL.plankLine);
  blk(ox, oy, 0, 21, 32, 1.6, PAL.plankLine);
  blk(ox, oy, 15, 0, 1.6, 32, PAL.plankLine);
  const hh = tileHash(tx, ty, 40);
  blk(ox, oy, 2 + (hh % 6), 3, 9, 0.8, PAL.plankLine + '66');
  blk(ox, oy, 18 + (hh % 6), 14, 9, 0.8, PAL.plankLine + '66');
  tileBlob(ox, oy, 4, 5, 1, 1, PAL.plankBolt);
  tileBlob(ox, oy, 4, 16, 1, 1, PAL.plankBolt);
  tileBlob(ox, oy, 4, 27, 1, 1, PAL.plankBolt);
}

/* ---------- Objets posés sur une tuile ---------- */

function drawTreeObject(ox, oy) {
  blk(ox, oy, 14, 22, 4.5, 11, PAL.trunkA);
  blk(ox, oy, 14, 22, 1.6, 11, PAL.trunkB);
  blk(ox, oy, 17.5, 24, 1.2, 9, PAL.trunkB);
  tileBlob(ox, oy, 16, 4, 15.5, 12, PAL.canopyC);
  tileBlob(ox, oy, 16, 3, 13.5, 11, PAL.canopyA);
  tileBlob(ox, oy, 10.5, -1, 6.5, 5.5, PAL.canopyB);
  tileBlob(ox, oy, 22, 1, 5.5, 4.5, PAL.canopyB);
}

function drawRockObject(ox, oy, tx, ty) {
  tileBlob(ox, oy, 16, 23, 12, 7.5, PAL.rockC);
  tileBlob(ox, oy, 16, 21, 11, 7, PAL.rockB);
  tileBlob(ox, oy, 12.5, 18, 5.5, 4.5, PAL.rockA);
  blk(ox, oy, 17, 25.5, 7, 1.6, PAL.rockC + '90');
}

function drawTentObject(ox, oy) {
  for (let i = 0; i < 15; i++) {
    const y = 5 + i;
    const w = 2 + i * 1.5;
    blk(ox, oy, 16 - w / 2, y, w, 1.2, i % 3 === 0 ? PAL.tentB : PAL.tentA);
  }
  blk(ox, oy, 13, 14, 6, 7, PAL.tentC);
  blk(ox, oy, 5, 20, 22, 3, PAL.tentB);
}

function drawCabinObject(ox, oy) {
  blk(ox, oy, 4, 2, 24, 3, PAL.hutRoofDark);
  blk(ox, oy, 6, 6, 20, 4, PAL.hutRoof);
  blk(ox, oy, 6, 10, 20, 17, PAL.hutWall);
  blk(ox, oy, 14, 16, 6, 11, PAL.hutDoor);
  blk(ox, oy, 8, 12, 4, 4, PAL.hutWindow);
  blk(ox, oy, 20, 12, 4, 4, PAL.hutWindow);
  blk(ox, oy, 22, 12, 1.6, 15, PAL.hutRoofDark);
  blk(ox, oy, 6, 26, 20, 1.6, PAL.hutRoofDark);
}

function drawCarcassObject(ox, oy) {
  tileBlob(ox, oy, 17, 21, 15, 6.5, PAL.bodyGray);
  tileBlob(ox, oy, 3, 22, 4.5, 3.5, PAL.bodyGray);
  tileBlob(ox, oy, 29, 23, 4, 3, PAL.bodyGrayDark);
  for (let i = 0; i < 4; i++) blk(ox, oy, 10 + i * 4, 16.5, 1.5, 9, PAL.bodyGrayDark);
  blk(ox, oy, 2.5, 20.5, 1.6, 1.6, PAL.ink);
  blk(ox, oy, 5, 22.5, 1.6, 1.6, PAL.ink);
  blk(ox, oy, 19, 19.5, 4.5, 1.6, PAL.boneWhite);
  blk(ox, oy, 12, 27, 3.5, 1.5, PAL.boneWhite + 'aa');
}

function drawImageTile(img, sx, sy, w = TILE, h = TILE, dx = 0, dy = 0) {
  if (!img) return false;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, sx + dx, sy + dy, w, h);
  return true;
}

function groundImageKey(theme) {
  return theme === 'pier' ? 'sand' : 'grass';
}

function drawTile(tile, sx, sy, tx, ty, theme) {
  const [base, dark, light] = groundPalette(theme);
  const groundImg = assetsLoaded ? TILE_IMAGES[groundImageKey(theme)] : null;
  const drawGroundBase = () => {
    if (!drawImageTile(groundImg, sx, sy)) drawGroundTile(sx, sy, tx, ty, base, dark, light);
  };

  switch (tile) {
    case '#': {
      drawGroundBase();
      const img = assetsLoaded ? TILE_IMAGES.tallGrass : null;
      if (!drawImageTile(img, sx, sy)) drawTallGrassTile(sx, sy, tx, ty);
      break;
    }
    case '~': {
      const img = assetsLoaded ? TILE_IMAGES.water : null;
      if (!drawImageTile(img, sx, sy)) drawWaterTile(sx, sy, tx, ty);
      break;
    }
    case 'B': {
      const img = assetsLoaded ? TILE_IMAGES.dock : null;
      if (!drawImageTile(img, sx, sy)) drawDockTile(sx, sy, tx, ty);
      break;
    }
    case 'C':
      drawGroundBase();
      drawTentObject(sx, sy);
      break;
    case 'K': {
      drawGroundBase();
      const img = assetsLoaded ? OBJECT_IMAGES.cabin : null;
      const w = TILE * 1.7, h = TILE * 1.7;
      if (!drawImageTile(img, sx, sy, w, h, (TILE - w) / 2, TILE - h)) drawCabinObject(sx, sy);
      break;
    }
    case 'D': {
      drawGroundBase();
      const img = assetsLoaded ? OBJECT_IMAGES.carcass : null;
      const w = TILE * 1.6, h = TILE * 1.1;
      if (!drawImageTile(img, sx, sy, w, h, (TILE - w) / 2, TILE - h)) drawCarcassObject(sx, sy);
      break;
    }
    case 'S': {
      const waterImg = assetsLoaded ? TILE_IMAGES.water : null;
      if (!drawImageTile(waterImg, sx, sy)) drawWaterTile(sx, sy, tx, ty);
      const img = assetsLoaded ? OBJECT_IMAGES.boat : null;
      if (img) {
        const w = TILE * 2.4, h = w / (img.naturalWidth / img.naturalHeight);
        drawImageTile(img, sx, sy, w, h, (TILE - w) / 2, TILE - h);
      }
      break;
    }
    case 'T': {
      drawGroundBase();
      const hh = tileHash(tx, ty, 70);
      const img = assetsLoaded ? (hh % 2 === 0 ? TILE_IMAGES.treePalm : TILE_IMAGES.treeBush) : null;
      const w = TILE * 1.3, h = TILE * 1.5;
      if (!drawImageTile(img, sx, sy, w, h, (TILE - w) / 2, TILE - h)) drawTreeObject(sx, sy);
      break;
    }
    case 'J': {
      drawGroundBase();
      const hh1 = tileHash(tx, ty, 71);
      const hh2 = tileHash(tx, ty, 72);
      const img1 = assetsLoaded ? (hh1 % 2 === 0 ? TILE_IMAGES.treePalm : TILE_IMAGES.treeBush) : null;
      const img2 = assetsLoaded ? (hh2 % 2 === 0 ? TILE_IMAGES.treePalm : TILE_IMAGES.treeBush) : null;
      if (img1 && img2) {
        const w = TILE * 1.15, h = TILE * 1.35;
        drawImageTile(img2, sx, sy, w, h, TILE * 0.35, TILE - h * 0.9);
        drawImageTile(img1, sx, sy, w, h, -TILE * 0.05, TILE - h);
        ctx.fillStyle = 'rgba(10,30,10,0.28)';
        ctx.fillRect(sx, sy, TILE, TILE);
      } else {
        drawGroundTile(sx, sy, tx, ty, PAL.wallGreenA, PAL.wallGreenC, PAL.wallGreenB);
        drawTreeObject(sx - 9, sy + 5);
        drawTreeObject(sx + 9, sy);
      }
      break;
    }
    case 'R': {
      drawGroundBase();
      const img = assetsLoaded ? TILE_IMAGES.rock : null;
      if (!drawImageTile(img, sx, sy)) drawRockObject(sx, sy, tx, ty);
      break;
    }
    default:
      drawGroundBase();
  }
}

/* ---------- Personnage ---------- */

function drawExplorerProcedural(px, py) {
  const spriteW = 32 * PXR;
  const spriteH = 40 * PXR;
  const ox = px + (TILE - spriteW) / 2;
  const oy = py + TILE - spriteH;
  const lift = walkFrame === 1 ? 2 : 0;
  const flip = facingDir === 'left';
  const up = facingDir === 'up';

  ctx.save();
  if (flip) {
    ctx.translate(px * 2 + TILE, 0);
    ctx.scale(-1, 1);
  }

  // ombre
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath();
  ctx.ellipse(px + TILE / 2, py + TILE - PXR * 1.5, PXR * 7, PXR * 2.6, 0, 0, Math.PI * 2);
  ctx.fill();

  // jambes (alternance de marche)
  blk(ox, oy, 10, 30 - (2 - lift), 6, 8 + (2 - lift), PAL.cargo);
  blk(ox, oy, 18, 30 - lift, 6, 8 + lift, PAL.cargo);
  blk(ox, oy, 10, 36, 6, 2, PAL.boot);
  blk(ox, oy, 18, 36, 6, 2, PAL.boot);

  // débardeur
  blk(ox, oy, 6, 16, 20, 14, PAL.tank);
  blk(ox, oy, 6, 16, 20, 2, PAL.tankDark);
  blk(ox, oy, 14, 16, 4, 14, PAL.tankDark);
  blk(ox, oy, 8, 21, 3, 3, PAL.cargoLight);
  blk(ox, oy, 21, 21, 3, 3, PAL.cargoLight);

  // bras
  blk(ox, oy, 2, 18, 4, 12, PAL.skin);
  blk(ox, oy, 26, 18, 4, 12, PAL.skin);
  blk(ox, oy, 2, 28, 4, 2, PAL.skinShade);
  blk(ox, oy, 26, 28, 4, 2, PAL.skinShade);

  if (up) {
    // vu de dos : cheveux couvrent toute la tête
    tileBlob(ox, oy, 16, 5, 9.5, 8.5, PAL.hair);
    blk(ox, oy, 8, 11, 16, 3, PAL.hairDark);
    blk(ox, oy, 15, 5, 2, 9, PAL.hairDark);
  } else {
    // visage
    tileBlob(ox, oy, 16, 6, 9, 8, PAL.skin);
    blk(ox, oy, 8, 12, 16, 2, PAL.skinShade);
    // yeux
    blk(ox, oy, 10, 8, 2.5, 2.5, PAL.ink);
    blk(ox, oy, 19.5, 8, 2.5, 2.5, PAL.ink);
    // cheveux
    tileBlob(ox, oy, 16, 1, 10, 6.5, PAL.hair);
    blk(ox, oy, 5.5, 2, 3.5, 9, PAL.hair);
    blk(ox, oy, 23, 2, 3.5, 9, PAL.hair);
    blk(ox, oy, 8, 6, 4, 2, PAL.hairDark);
    blk(ox, oy, 20, 6, 4, 2, PAL.hairDark);
  }

  ctx.restore();
}

function drawExplorer(px, py) {
  // ombre
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath();
  ctx.ellipse(px + TILE / 2, py + TILE - PXR * 1.5, PXR * 7, PXR * 2.6, 0, 0, Math.PI * 2);
  ctx.fill();

  const dirKey = facingDir === 'left' || facingDir === 'right' ? 'side' : facingDir;
  const frame = walkFrame % 3;
  const img = assetsLoaded ? CHAR_IMAGES[dirKey][frame] : null;
  if (!img) {
    drawExplorerProcedural(px, py);
    return;
  }

  const targetH = TILE * 1.55;
  const targetW = targetH * (img.naturalWidth / img.naturalHeight);
  const dx = px + (TILE - targetW) / 2;
  const dy = py + TILE - targetH;

  ctx.save();
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  if (facingDir === 'left') {
    ctx.translate(dx + targetW, dy);
    ctx.scale(-1, 1);
    ctx.drawImage(img, 0, 0, targetW, targetH);
  } else {
    ctx.drawImage(img, dx, dy, targetW, targetH);
  }
  ctx.restore();
}

function drawMap(renderPos) {
  if (!ctx || !state) return;
  const zone = currentZone();

  // Caméra en pixels continus (pas arrondie au tile) pour un scroll fluide pendant l'animation de pas.
  const camX = clamp(renderPos.x - (VIEW_COLS - 1) / 2, 0, Math.max(0, zone.w - VIEW_COLS));
  const camY = clamp(renderPos.y - (VIEW_ROWS - 1) / 2, 0, Math.max(0, zone.h - VIEW_ROWS));
  const camPxX = camX * TILE;
  const camPxY = camY * TILE;

  // On dessine une bordure de tiles en plus (partiellement visibles) pour couvrir le décalage sous-pixel.
  const startTx = clamp(Math.floor(camX), 0, zone.w - 1);
  const endTx = clamp(Math.ceil(camX + VIEW_COLS), 0, zone.w);
  const startTy = clamp(Math.floor(camY), 0, zone.h - 1);
  const endTy = clamp(Math.ceil(camY + VIEW_ROWS), 0, zone.h);

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let ty = startTy; ty < endTy; ty++) {
    for (let tx = startTx; tx < endTx; tx++) {
      drawTile(zone.rows[ty][tx], tx * TILE - camPxX, ty * TILE - camPxY, tx, ty, zone.theme);
    }
  }

  const px = renderPos.x * TILE - camPxX;
  const py = renderPos.y * TILE - camPxY;
  drawExplorer(px, py);
  if (interactBubbleIcon) drawInteractBubble(px, py, interactBubbleIcon);

  if (zone.weather === 'rain') drawRain();
}

// Bulle de dialogue flottante au-dessus du personnage, signalant une interaction possible.
function drawInteractBubble(px, py, icon) {
  const bw = 34, bh = 28;
  const cx = px + TILE / 2;
  const bob = Math.sin(performance.now() / 260) * 2;
  const by = py - TILE * 0.95 + bob;
  const bx = cx - bw / 2;

  ctx.save();
  ctx.fillStyle = 'rgba(16, 20, 12, 0.88)';
  ctx.strokeStyle = '#f0a500';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(bx, by, bw, bh, 8);
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(cx - 6, by + bh - 1);
  ctx.lineTo(cx, by + bh + 8);
  ctx.lineTo(cx + 6, by + bh - 1);
  ctx.closePath();
  ctx.fillStyle = 'rgba(16, 20, 12, 0.88)';
  ctx.fill();

  ctx.font = `${Math.round(bh * 0.62)}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(icon, cx, by + bh / 2 + 1);
  ctx.restore();
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
    const exit = currentZone().exits?.[`${state.pos.x},${state.pos.y}`];
    if (exit) {
      changeZone(exit.zoneId, exit.spawn);
      toast(exit.message);
    }
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

function finishPendingMove() {
  if (!anim || !state) return;
  state.pos.x = anim.toX;
  state.pos.y = anim.toY;
  anim = null;
  moving = false;
}

function attemptMove(dx, dy) {
  if (moving || !state || !isOverworldActive()) return;
  const nx = state.pos.x + dx;
  const ny = state.pos.y + dy;

  if (dx < 0) facingDir = 'left';
  else if (dx > 0) facingDir = 'right';
  else if (dy < 0) facingDir = 'up';
  else if (dy > 0) facingDir = 'down';

  if (!isWalkable(nx, ny)) return;
  moving = true;
  walkFrame = (walkFrame + 1) % 3;
  anim = { fromX: state.pos.x, fromY: state.pos.y, toX: nx, toY: ny, start: performance.now(), duration: 130 };
  startGameLoop();
}

function tryInteract() {
  if (!isOverworldActive()) return;
  finishPendingMove();
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

/* =========================================================
   SPRITES DE COMBAT (pixel art dessiné, pas d'emoji)
   ========================================================= */

const CW = 56, CH = 40, PXR_C = 3;

const CPAL = {
  outline: '#141a10',
  eye: '#161210',
  eyeShine: '#f4ead8',
  tooth: '#f0ead6',
  claw: '#e3d9be',

  raptorBase: '#5c7a3f', raptorShade: '#3d5628', raptorBelly: '#d8dba8', raptorStripe: '#2c3d1c',
  triBase: '#7d7256', triShade: '#54492f', triBelly: '#cfc49f', triHorn: '#e8ddb8',
  pteroBase: '#a8622f', pteroShade: '#6e3d1c', pteroBelly: '#e6c79a', pteroWing: '#8a4a24',
  compyBase: '#4d8a4a', compyShade: '#2f5c30', compyBelly: '#cfe0a0', compyStripe: '#264420',

  genCarnBase: '#6b6153', genCarnShade: '#453e33', genCarnBelly: '#c9bfa6',
  genHerbBase: '#6f8058', genHerbShade: '#48543a', genHerbBelly: '#cdd8b8',
  genPteroBase: '#8a7550', genPteroShade: '#5c4c32', genPteroBelly: '#ddcfa9',
};

function creatureRect(cctx, gx, gy, gw, gh, color) {
  cctx.fillStyle = color;
  cctx.fillRect(Math.round(gx * PXR_C), Math.round(gy * PXR_C), Math.round(gw * PXR_C), Math.round(gh * PXR_C));
}

function creatureBlob(cctx, cx, cy, rx, ry, color) {
  cctx.fillStyle = color;
  const top = Math.ceil(cy - ry);
  const bottom = Math.floor(cy + ry);
  for (let y = top; y <= bottom; y++) {
    const dy = y - cy;
    const frac = 1 - (dy * dy) / (ry * ry);
    if (frac <= 0) continue;
    const halfW = rx * Math.sqrt(frac);
    cctx.fillRect(Math.round((cx - halfW) * PXR_C), Math.round(y * PXR_C), Math.round(halfW * 2 * PXR_C), PXR_C);
  }
}

// Chaîne de cercles reliant deux points : sert à dessiner cou/queue/museau/pattes
// de façon continue, sans jamais laisser une pièce du corps "flotter".
function creatureChain(cctx, x0, y0, x1, y1, w0, w1, color) {
  const dist = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1);
  const steps = Math.ceil(dist * 1.6);
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = x0 + (x1 - x0) * t;
    const y = y0 + (y1 - y0) * t;
    const w = w0 + (w1 - w0) * t;
    creatureBlob(cctx, x, y, w / 2, w / 2, color);
  }
}

function creatureWedge(cctx, x0, yCenter, len, w0, w1, color, dir = 1) {
  cctx.fillStyle = color;
  for (let i = 0; i < len; i++) {
    const t = len <= 1 ? 0 : i / (len - 1);
    const w = w0 + (w1 - w0) * t;
    const x = x0 + i * dir;
    cctx.fillRect(Math.round((dir > 0 ? x : x - 1) * PXR_C), Math.round((yCenter - w / 2) * PXR_C), PXR_C, Math.round(w * PXR_C));
  }
}

function drawBiped(cctx, pal, opts = {}) {
  const {
    tailX = 4, tailY = 28,
    torsoX = 26, torsoY = 24,
    headX = 46, headY = 11,
    snoutX = 53, snoutY = 10,
  } = opts;
  const neckX = torsoX + 7, neckY = torsoY - 6;

  // --- silhouette (passe assombrie, légèrement plus large) ---
  creatureChain(cctx, torsoX - 4, torsoY + 3, tailX, tailY, 11, 2, pal.shade);
  creatureBlob(cctx, torsoX, torsoY, 12, 8.5, pal.shade);
  creatureChain(cctx, neckX, neckY, headX - 3, headY + 2, 7.5, 6, pal.shade);
  creatureBlob(cctx, headX, headY, 6.5, 5.5, pal.shade);
  creatureChain(cctx, headX + 2, headY - 1, snoutX, snoutY, 4, 1, pal.shade);

  // --- corps (couleur de base, inséré dans la silhouette) ---
  creatureChain(cctx, torsoX - 4, torsoY + 3, tailX + 1, tailY, 9, 1.5, pal.base);
  creatureBlob(cctx, torsoX, torsoY, 10.5, 7, pal.base);
  creatureChain(cctx, neckX, neckY, headX - 3, headY + 2, 6, 4.5, pal.base);
  creatureBlob(cctx, headX, headY, 5.3, 4.5, pal.base);
  creatureChain(cctx, headX + 2, headY - 1, snoutX, snoutY, 3, 0.8, pal.base);

  // ventre clair
  creatureBlob(cctx, torsoX, torsoY + 4.5, 7.5, 3, pal.belly);

  // pattes arrière (cuisse + tibia + pied), légèrement fléchies
  creatureChain(cctx, torsoX - 3, torsoY + 5, torsoX - 5, torsoY + 12, 6, 3.5, pal.shade);
  creatureChain(cctx, torsoX - 3, torsoY + 5, torsoX - 5, torsoY + 12, 4.5, 2.5, pal.base);
  creatureChain(cctx, torsoX - 5, torsoY + 12, torsoX - 1, torsoY + 16, 3.5, 2.5, pal.shade);
  creatureChain(cctx, torsoX - 5, torsoY + 12, torsoX - 1, torsoY + 16, 2.5, 1.8, pal.base);
  creatureRect(cctx, torsoX - 6, torsoY + 15.5, 8, 1.6, pal.shade);

  // patte avant
  creatureChain(cctx, torsoX + 4, torsoY + 6, torsoX + 4, torsoY + 15, 5.5, 3, pal.shade);
  creatureChain(cctx, torsoX + 4, torsoY + 6, torsoX + 4, torsoY + 15, 4, 2, pal.base);
  creatureRect(cctx, torsoX + 1.5, torsoY + 14.5, 7, 1.6, pal.shade);

  // petit bras
  creatureChain(cctx, torsoX + 8, torsoY - 1, torsoX + 12, torsoY + 3, 2.5, 1.2, pal.base);

  // œil + dent
  creatureRect(cctx, headX + 2, headY - 2, 1.4, 1.4, CPAL.eye);
  creatureRect(cctx, headX + 4, headY + 2.5, 1, 1.4, CPAL.tooth);
}

function drawQuadruped(cctx, pal, opts = {}) {
  const {
    tailX = 3, tailY = 26,
    torsoX = 25, torsoY = 23,
    frillX = 39, frillY = 16,
    headX = 45, headY = 16,
    horns = true,
  } = opts;

  // silhouette
  creatureChain(cctx, torsoX - 5, torsoY + 2, tailX, tailY, 13, 3, pal.shade);
  creatureBlob(cctx, torsoX, torsoY, 14.5, 9.5, pal.shade);
  creatureChain(cctx, torsoX + 10, torsoY - 3, frillX, frillY, 9, 8, pal.shade);
  creatureBlob(cctx, frillX, frillY, 8.5, 8.5, pal.shade);
  creatureBlob(cctx, headX, headY, 6.5, 5.5, pal.shade);

  // base
  creatureChain(cctx, torsoX - 5, torsoY + 2, tailX + 1, tailY, 11, 2, pal.base);
  creatureBlob(cctx, torsoX, torsoY, 13, 8, pal.base);
  creatureChain(cctx, torsoX + 10, torsoY - 3, frillX, frillY, 7.5, 6.5, pal.base);
  creatureBlob(cctx, frillX, frillY, 7, 7, pal.base);
  creatureBlob(cctx, headX, headY, 5.3, 4.5, pal.base);
  creatureBlob(cctx, torsoX + 1, torsoY + 5, 9, 3.5, pal.belly);

  // 4 pattes trapues
  [[torsoX - 8, torsoY + 6], [torsoX + 6, torsoY + 6]].forEach(([lx, ly]) => {
    creatureChain(cctx, lx, ly, lx, ly + 10, 6, 4, pal.shade);
    creatureChain(cctx, lx, ly, lx, ly + 10, 4.5, 3, pal.base);
    creatureRect(cctx, lx - 3.5, ly + 9, 7, 1.8, pal.shade);
  });

  // cornes
  if (horns) {
    creatureChain(cctx, headX + 3, headY - 2, headX + 10, headY - 7, 2.3, 0.6, CPAL.triHorn);
    creatureChain(cctx, headX + 3, headY - 1, headX + 9, headY + 4, 2.1, 0.6, CPAL.triHorn);
    creatureChain(cctx, frillX - 1, frillY - 6, frillX - 5, frillY - 11, 1.8, 0.5, CPAL.triHorn);
  }

  creatureRect(cctx, headX + 2, headY - 1, 1.4, 1.4, CPAL.eye);
}

// Triangle effilé dessiné dans un repère tourné : sert aux ailes de ptérosaure.
function creatureFin(cctx, x0, y0, len, w0, w1, color, angleDeg) {
  cctx.save();
  cctx.translate(x0 * PXR_C, y0 * PXR_C);
  cctx.rotate((angleDeg * Math.PI) / 180);
  cctx.fillStyle = color;
  for (let i = 0; i < len; i++) {
    const t = len <= 1 ? 0 : i / (len - 1);
    const w = w0 + (w1 - w0) * t;
    cctx.fillRect(i * PXR_C, -(w / 2) * PXR_C, PXR_C, Math.max(1, Math.round(w * PXR_C)));
  }
  cctx.restore();
}

function drawPterosaur(cctx, pal) {
  const bodyX = 29, bodyY = 23;
  const headX = 41, headY = 14;

  // ailes (dessinées en premier, sous le corps)
  creatureFin(cctx, bodyX, bodyY - 3, 25, 5, 17, pal.shade, -22);
  creatureFin(cctx, bodyX, bodyY - 3, 23, 3.5, 13.5, pal.wing, -22);
  creatureFin(cctx, bodyX + 2, bodyY - 1, 25, 5, 16, pal.shade, 26);
  creatureFin(cctx, bodyX + 2, bodyY - 1, 23, 3.5, 12.5, pal.wing, 26);

  // silhouette corps/cou/tête/bec/crête
  creatureBlob(cctx, bodyX, bodyY, 7.5, 6, pal.shade);
  creatureChain(cctx, bodyX + 5, bodyY - 5, headX - 2, headY + 1, 6.5, 5, pal.shade);
  creatureBlob(cctx, headX, headY, 5.5, 4.5, pal.shade);
  creatureChain(cctx, headX + 2, headY - 1, headX + 11, headY - 3, 3.2, 0.5, pal.shade);
  creatureChain(cctx, headX - 2, headY - 4, headX + 4, headY - 10, 3.5, 0.6, pal.shade);

  // base
  creatureBlob(cctx, bodyX, bodyY, 6, 4.5, pal.base);
  creatureChain(cctx, bodyX + 5, bodyY - 5, headX - 2, headY + 1, 5, 3.8, pal.base);
  creatureBlob(cctx, headX, headY, 4.5, 3.8, pal.base);
  creatureChain(cctx, headX + 2, headY - 1, headX + 10, headY - 3, 2.3, 0.4, pal.base);
  creatureChain(cctx, headX - 2, headY - 4, headX + 3.5, headY - 9, 2.6, 0.4, CPAL.pteroShade);

  // corps bas + pattes, par-dessus les ailes pour rester lisible
  creatureBlob(cctx, bodyX - 1, bodyY + 6, 4, 3, pal.base);
  creatureRect(cctx, bodyX - 3, bodyY + 8, 1.8, 4, pal.shade);
  creatureRect(cctx, bodyX + 0.5, bodyY + 8, 1.8, 4, pal.shade);

  creatureRect(cctx, headX + 1, headY - 1, 1.3, 1.3, CPAL.eye);
}

function drawSpeciesSprite(cctx, speciesId) {
  const canvasW = CW * PXR_C;
  const canvasH = CH * PXR_C;
  cctx.clearRect(0, 0, canvasW, canvasH);

  const img = assetsLoaded ? CREATURE_IMAGES[speciesId] : null;
  if (img) {
    const scale = Math.min(canvasW / img.naturalWidth, canvasH / img.naturalHeight);
    const w = img.naturalWidth * scale;
    const h = img.naturalHeight * scale;
    cctx.imageSmoothingEnabled = true;
    cctx.imageSmoothingQuality = 'high';
    cctx.drawImage(img, (canvasW - w) / 2, canvasH - h, w, h);
    return;
  }

  switch (speciesId) {
    case 'velociraptor':
      drawBiped(cctx, { base: CPAL.raptorBase, shade: CPAL.raptorShade, belly: CPAL.raptorBelly });
      creatureRect(cctx, 34, 19, 12, 1.3, CPAL.raptorStripe);
      creatureRect(cctx, 15, 24, 8, 1.3, CPAL.raptorStripe);
      break;
    case 'compsognathus':
      drawBiped(cctx, {
        base: CPAL.compyBase, shade: CPAL.compyShade, belly: CPAL.compyBelly,
        tailX: 3, tailY: 27, torsoX: 23, torsoY: 23, headX: 43, headY: 10, snoutX: 50, snoutY: 9,
      });
      creatureRect(cctx, 27, 19, 10, 1.1, CPAL.compyStripe);
      creatureRect(cctx, 12, 24, 6, 1.1, CPAL.compyStripe);
      break;
    case 'triceratops':
      drawQuadruped(cctx, { base: CPAL.triBase, shade: CPAL.triShade, belly: CPAL.triBelly });
      break;
    case 'pteranodon':
      drawPterosaur(cctx, { base: CPAL.pteroBase, shade: CPAL.pteroShade, wing: CPAL.pteroWing });
      break;
    default: {
      const species = getSpecies(speciesId);
      if (species.type === 'herbivore') {
        drawQuadruped(cctx, { base: CPAL.genHerbBase, shade: CPAL.genHerbShade, belly: CPAL.genHerbBelly, horns: false });
      } else if (species.type === 'pterosaur') {
        drawPterosaur(cctx, { base: CPAL.genPteroBase, shade: CPAL.genPteroShade, wing: CPAL.genPteroShade });
      } else {
        drawBiped(cctx, { base: CPAL.genCarnBase, shade: CPAL.genCarnShade, belly: CPAL.genCarnBelly });
      }
    }
  }
}

let wildCtx = null;
let playerCtx = null;

function initBattleSprites() {
  const wildCanvas = document.getElementById('wild-sprite');
  const playerCanvas = document.getElementById('player-sprite');
  wildCanvas.width = CW * PXR_C;
  wildCanvas.height = CH * PXR_C;
  playerCanvas.width = CW * PXR_C;
  playerCanvas.height = CH * PXR_C;
  wildCtx = wildCanvas.getContext('2d');
  playerCtx = playerCanvas.getContext('2d');
}

function renderBattle() {
  const wild = battle.wildDino;
  const player = state.team[battle.playerIndex];

  drawSpeciesSprite(wildCtx, wild.speciesId);
  drawSpeciesSprite(playerCtx, player.speciesId);

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
    finishPendingMove();
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

  document.getElementById('btn-reset-game').addEventListener('click', async () => {
    if (!(await showConfirm('Réinitialiser toute la progression ? Cette action est irréversible.'))) return;
    localStorage.removeItem(SAVE_KEY);
    state = null;
    battle = null;
    rafRunning = false;
    resetMovementState();
    showScreen('screen-title');
    refreshContinueButton();
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
  initBattleSprites();
  initTitleScreen();
  initEventListeners();
  loadAssets();
});
