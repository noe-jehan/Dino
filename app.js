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
    isStarter: true, rarity: 1,
    base: { hp: 32, atk: 12, def: 8 },
    moves: [
      { name: 'Griffure', power: 14, type: 'carnivore' },
      { name: 'Morsure', power: 10, type: 'neutral' },
    ],
  },
  {
    id: 'tyrannosaurus', name: 'Tyrannosaure', type: 'carnivore', emoji: '🐉',
    isStarter: false, rarity: 3,
    base: { hp: 55, atk: 16, def: 10 },
    moves: [
      { name: 'Mâchoires broyeuses', power: 18, type: 'carnivore' },
      { name: 'Charge', power: 12, type: 'neutral' },
    ],
  },
  {
    id: 'dilophosaurus', name: 'Dilophosaure', type: 'carnivore', emoji: '🦎',
    isStarter: false, rarity: 2,
    base: { hp: 30, atk: 11, def: 7 },
    moves: [
      { name: 'Crachat venimeux', power: 15, type: 'carnivore' },
      { name: 'Coup de collerette', power: 9, type: 'neutral' },
    ],
  },
  {
    id: 'triceratops', name: 'Tricératops', type: 'herbivore', emoji: '🦏',
    isStarter: true, rarity: 1,
    base: { hp: 40, atk: 9, def: 14 },
    moves: [
      { name: 'Charge de cornes', power: 14, type: 'herbivore' },
      { name: 'Coup de tête', power: 10, type: 'neutral' },
    ],
  },
  {
    id: 'stegosaurus', name: 'Stégosaure', type: 'herbivore', emoji: '🐢',
    isStarter: false, rarity: 2,
    base: { hp: 42, atk: 10, def: 13 },
    moves: [
      { name: 'Coup de queue à pointes', power: 15, type: 'herbivore' },
      { name: 'Piétinement', power: 9, type: 'neutral' },
    ],
  },
  {
    id: 'brachiosaurus', name: 'Brachiosaure', type: 'herbivore', emoji: '🦕',
    isStarter: false, rarity: 3,
    base: { hp: 60, atk: 8, def: 12 },
    moves: [
      { name: 'Coup de queue massif', power: 16, type: 'herbivore' },
      { name: 'Écrasement', power: 11, type: 'neutral' },
    ],
  },
  {
    id: 'pteranodon', name: 'Ptéranodon', type: 'pterosaur', emoji: '🦅',
    isStarter: true, rarity: 1,
    base: { hp: 28, atk: 10, def: 6 },
    moves: [
      { name: 'Piqué vertical', power: 14, type: 'pterosaur' },
      { name: 'Coup de bec', power: 10, type: 'neutral' },
    ],
  },
  {
    id: 'dimorphodon', name: 'Dimorphodon', type: 'pterosaur', emoji: '🦇',
    isStarter: false, rarity: 2,
    base: { hp: 24, atk: 9, def: 5 },
    moves: [
      { name: 'Vol rasant', power: 13, type: 'pterosaur' },
      { name: 'Griffade', power: 9, type: 'neutral' },
    ],
  },
  {
    id: 'quetzalcoatlus', name: 'Quetzalcoatlus', type: 'pterosaur', emoji: '🦉',
    isStarter: false, rarity: 3,
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

/* =========================================================
   CARTE DU MONDE
   ========================================================= */

const TILE = 40;
const VIEW_COLS = 13;
const VIEW_ROWS = 9;
const MAP_W = 26;
const MAP_H = 16;
const SPAWN = { x: 5, y: 6 };

const TILE_INFO = {
  '.': { walkable: true, encounter: false },
  '#': { walkable: true, encounter: true },
  T: { walkable: false },
  '~': { walkable: false },
  R: { walkable: false },
  C: { walkable: true, camp: true },
};

function buildMap() {
  const grid = [];
  for (let y = 0; y < MAP_H; y++) {
    const row = [];
    for (let x = 0; x < MAP_W; x++) {
      const border = x === 0 || y === 0 || x === MAP_W - 1 || y === MAP_H - 1;
      row.push(border ? 'T' : '.');
    }
    grid.push(row);
  }

  const fillRect = (x0, y0, x1, y1, tile) => {
    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        if (grid[y] && grid[y][x] !== undefined) grid[y][x] = tile;
      }
    }
  };

  fillRect(2, 6, 4, 7, 'C'); // camp
  fillRect(7, 2, 12, 4, '#'); // clairière nord
  fillRect(4, 9, 9, 12, '#'); // sous-bois ouest
  fillRect(16, 3, 21, 6, '#'); // hautes herbes est
  fillRect(14, 10, 20, 13, '#'); // marécage
  fillRect(17, 12, 22, 14, '~'); // rivière

  const rocks = [[6, 6], [10, 7], [13, 8], [19, 8], [9, 3], [23, 9], [6, 11], [15, 5]];
  rocks.forEach(([x, y]) => { grid[y][x] = 'R'; });

  const trees = [[13, 2], [14, 11], [8, 13], [21, 10], [5, 4], [12, 9]];
  trees.forEach(([x, y]) => { grid[y][x] = 'T'; });

  return grid.map((row) => row.join(''));
}

const MAP = buildMap();

function tileAt(x, y) {
  return MAP[y][x];
}

function isWalkable(x, y) {
  if (x < 0 || y < 0 || x >= MAP_W || y >= MAP_H) return false;
  const info = TILE_INFO[tileAt(x, y)];
  return info ? info.walkable : false;
}

/* =========================================================
   ÉTAT DU JEU
   ========================================================= */

const SAVE_KEY = 'jurassicTamersSave';

let state = null; // état persistant (équipe, ressources, position...)
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
    pos: { x: SPAWN.x, y: SPAWN.y },
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
    if (!parsed.pos) parsed.pos = { x: SPAWN.x, y: SPAWN.y };
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
  toastTimer = setTimeout(() => { el.hidden = true; }, 2600);
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
   ÉCRAN TITRE
   ========================================================= */

function initTitleScreen() {
  const saved = loadGame();
  document.getElementById('btn-continue').hidden = !saved;

  document.getElementById('btn-new-game').addEventListener('click', () => {
    if (saved && !confirm("Une expédition est déjà en cours. La remplacer par une nouvelle ?")) return;
    state = defaultState();
    renderStarterScreen();
    showScreen('screen-starter');
  });

  document.getElementById('btn-continue').addEventListener('click', () => {
    state = loadGame() ?? defaultState();
    enterOverworld();
  });
}

/* =========================================================
   ÉCRAN CHOIX DU STARTER
   ========================================================= */

function renderStarterScreen() {
  const list = document.getElementById('starter-list');
  list.innerHTML = '';
  SPECIES.filter((s) => s.isStarter).forEach((species) => {
    const preview = createDino(species.id, 5);
    const card = buildDinoCard(preview, { interactive: true, showStats: true });
    card.addEventListener('click', () => {
      state.team.push(createDino(species.id, 5));
      state.activeIndex = 0;
      state.pos = { x: SPAWN.x, y: SPAWN.y };
      saveGame();
      toast(`Vous partez à l'aventure avec ${species.name} à vos côtés !`);
      enterOverworld();
    });
    list.appendChild(card);
  });
}

/* =========================================================
   MONDE OUVERT
   ========================================================= */

let canvas = null;
let ctx = null;
let moving = false;
let anim = null;

function initOverworld() {
  canvas = document.getElementById('game-canvas');
  canvas.width = VIEW_COLS * TILE;
  canvas.height = VIEW_ROWS * TILE;
  ctx = canvas.getContext('2d');
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
  if (state.team.length === 0) return;

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

function updateCampHint() {
  const tile = tileAt(state.pos.x, state.pos.y);
  document.getElementById('camp-hint').hidden = tile !== 'C';
}

function enterOverworld() {
  updateHud();
  showScreen('screen-overworld');
  updateCampHint();
  drawMap(state.pos);
}

function drawEmoji(context, emoji, x, y, size) {
  context.font = `${size}px "Segoe UI Emoji", "Apple Color Emoji", sans-serif`;
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(emoji, x, y);
}

function drawTile(tile, sx, sy, tx, ty) {
  const checker = (tx + ty) % 2 === 0;
  switch (tile) {
    case '#':
      ctx.fillStyle = checker ? '#2f5c34' : '#356a3a';
      ctx.fillRect(sx, sy, TILE, TILE);
      ctx.strokeStyle = 'rgba(15,30,15,0.4)';
      ctx.lineWidth = 2;
      for (let i = 0; i < 3; i++) {
        const bx = sx + 8 + i * 11;
        ctx.beginPath();
        ctx.moveTo(bx, sy + TILE - 6);
        ctx.lineTo(bx - 3, sy + TILE - 20);
        ctx.stroke();
      }
      break;
    case '~':
      ctx.fillStyle = checker ? '#265974' : '#2c6584';
      ctx.fillRect(sx, sy, TILE, TILE);
      ctx.strokeStyle = 'rgba(255,255,255,0.18)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(sx + 4, sy + TILE / 2);
      ctx.quadraticCurveTo(sx + TILE / 2, sy + TILE / 2 - 6, sx + TILE - 4, sy + TILE / 2);
      ctx.stroke();
      break;
    case 'C':
      ctx.fillStyle = checker ? '#5a4326' : '#63502f';
      ctx.fillRect(sx, sy, TILE, TILE);
      break;
    default:
      ctx.fillStyle = checker ? '#3a2f22' : '#40352a';
      ctx.fillRect(sx, sy, TILE, TILE);
  }
  if (tile === 'T') drawEmoji(ctx, '🌴', sx + TILE / 2, sy + TILE / 2 + 3, 32);
  if (tile === 'R') drawEmoji(ctx, '🪨', sx + TILE / 2, sy + TILE / 2 + 3, 24);
  if (tile === 'C') drawEmoji(ctx, '⛺', sx + TILE / 2, sy + TILE / 2 + 2, 24);
}

function drawPlayer(px, py) {
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath();
  ctx.ellipse(px + TILE / 2, py + TILE - 8, 12, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  const species = getSpecies(getActiveDino().speciesId);
  drawEmoji(ctx, species.emoji, px + TILE / 2, py + TILE / 2, 28);
}

function drawMap(renderPos) {
  if (!ctx || !state || state.team.length === 0) return;

  const camX = clamp(Math.round(renderPos.x - (VIEW_COLS - 1) / 2), 0, MAP_W - VIEW_COLS);
  const camY = clamp(Math.round(renderPos.y - (VIEW_ROWS - 1) / 2), 0, MAP_H - VIEW_ROWS);

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let ty = camY; ty < camY + VIEW_ROWS; ty++) {
    for (let tx = camX; tx < camX + VIEW_COLS; tx++) {
      drawTile(tileAt(tx, ty), (tx - camX) * TILE, (ty - camY) * TILE, tx, ty);
    }
  }

  drawPlayer((renderPos.x - camX) * TILE, (renderPos.y - camY) * TILE);
}

function onArriveTile() {
  updateCampHint();
  const tile = tileAt(state.pos.x, state.pos.y);
  if (tile === '#' && getFirstHealthyIndex() !== -1 && Math.random() < 0.13) {
    startEncounter();
  }
}

function animStep(now) {
  if (!anim) return;
  const t = Math.min(1, (now - anim.start) / anim.duration);
  const renderPos = {
    x: anim.fromX + (anim.toX - anim.fromX) * t,
    y: anim.fromY + (anim.toY - anim.fromY) * t,
  };
  drawMap(renderPos);
  if (t < 1) {
    requestAnimationFrame(animStep);
  } else {
    state.pos.x = anim.toX;
    state.pos.y = anim.toY;
    anim = null;
    moving = false;
    saveGame();
    onArriveTile();
    if (isOverworldActive()) drawMap(state.pos);
  }
}

function attemptMove(dx, dy) {
  if (moving || !state || !isOverworldActive()) return;
  const nx = state.pos.x + dx;
  const ny = state.pos.y + dy;
  if (!isWalkable(nx, ny)) return;
  moving = true;
  anim = { fromX: state.pos.x, fromY: state.pos.y, toX: nx, toY: ny, start: performance.now(), duration: 130 };
  requestAnimationFrame(animStep);
}

function tryEnterCamp() {
  if (!isOverworldActive()) return;
  if (tileAt(state.pos.x, state.pos.y) !== 'C') return;
  renderCampScreen();
  showScreen('screen-camp');
}

/* =========================================================
   RENCONTRE ALÉATOIRE
   ========================================================= */

function weightedRandomSpecies() {
  const weights = SPECIES.map((s) => 1 / s.rarity);
  const total = weights.reduce((a, b) => a + b, 0);
  let roll = Math.random() * total;
  for (let i = 0; i < SPECIES.length; i++) {
    roll -= weights[i];
    if (roll <= 0) return SPECIES[i];
  }
  return SPECIES[0];
}

function startEncounter() {
  const activeIdx = getFirstHealthyIndex();
  if (activeIdx === -1) return;
  state.activeIndex = activeIdx;

  const species = weightedRandomSpecies();
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
  const p = document.createElement('p');
  p.textContent = message;
  box.appendChild(p);
  box.scrollTop = box.scrollHeight;
}

function renderBattle() {
  const wildPanel = document.getElementById('wild-dino-panel');
  wildPanel.innerHTML = '';
  wildPanel.appendChild(buildDinoCard(battle.wildDino, { showStats: false }));

  const playerPanel = document.getElementById('player-dino-panel');
  playerPanel.innerHTML = '';
  playerPanel.appendChild(buildDinoCard(state.team[battle.playerIndex], { showStats: false }));

  showBattleMainMenu();
  updateBattleButtonsAvailability();
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

  if (wild.hp <= 0) {
    winBattle();
    return;
  }
  wildTurn();
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
  back.textContent = 'Continuer l\'exploration';
  back.addEventListener('click', () => {
    battle = null;
    if (getFirstHealthyIndex() === -1) {
      state.pos = { x: SPAWN.x, y: SPAWN.y };
      saveGame();
      toast('Toute votre équipe est épuisée. Retour au camp...');
      renderCampScreen();
      showScreen('screen-camp');
    } else {
      updateHud();
      showScreen('screen-overworld');
      updateCampHint();
      drawMap(state.pos);
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
    logBattle("Impossible de fuir !");
    wildTurn();
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
    logBattle("Le dinosaure résiste à la fléchette !");
    saveGame();
    renderBattle();
    wildTurn();
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
    updateHud();
    updateCampHint();
    drawMap(state.pos);
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

  document.getElementById('btn-enter-camp').addEventListener('click', tryEnterCamp);
  document.getElementById('btn-heal').addEventListener('click', healTeam);
  document.getElementById('btn-leave-camp').addEventListener('click', () => {
    showScreen('screen-overworld');
    updateHud();
    updateCampHint();
    drawMap(state.pos);
  });

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
      tryEnterCamp();
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
