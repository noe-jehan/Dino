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
   ÉTAT DU JEU
   ========================================================= */

const SAVE_KEY = 'jurassicTamersSave';

let state = null; // état persistant (équipe, ressources...)
let battle = null; // état transitoire de combat

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
  };
}

function saveGame() {
  localStorage.setItem(SAVE_KEY, JSON.stringify(state));
}

function loadGame() {
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
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
    renderHome();
    showScreen('screen-home');
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
      saveGame();
      logHome(`Vous partez à l'aventure avec ${species.name} à vos côtés !`);
      renderHome();
      showScreen('screen-home');
    });
    list.appendChild(card);
  });
}

/* =========================================================
   ÉCRAN CAMP DE BASE
   ========================================================= */

function logHome(message) {
  const box = document.getElementById('home-log');
  const p = document.createElement('p');
  p.textContent = message;
  box.appendChild(p);
  box.scrollTop = box.scrollHeight;
}

function getActiveDino() {
  return state.team[state.activeIndex];
}

function getFirstHealthyIndex() {
  return state.team.findIndex((d) => d.hp > 0);
}

function renderHome() {
  document.getElementById('tranq-count').textContent = state.tranqDarts;

  const panel = document.getElementById('active-dino-panel');
  panel.innerHTML = '';
  if (state.team.length === 0) {
    panel.textContent = "Vous n'avez aucun dinosaure. Commencez une nouvelle expédition.";
  } else {
    const label = document.createElement('p');
    label.textContent = 'Dinosaure actif :';
    label.style.marginBottom = '8px';
    panel.appendChild(label);
    panel.appendChild(buildDinoCard(getActiveDino()));
  }

  const canExplore = state.team.some((d) => d.hp > 0);
  document.getElementById('btn-explore').disabled = !canExplore;
}

function healTeam() {
  state.team.forEach((d) => (d.hp = d.maxHp));
  saveGame();
  logHome('Votre équipe est soignée et prête à repartir explorer l\'île.');
  renderHome();
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
  if (activeIdx === -1) {
    logHome('Toute votre équipe est épuisée. Soignez-la avant de repartir explorer.');
    return;
  }
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

function clearBattleLog() {
  document.getElementById('battle-log').innerHTML = '';
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
  back.textContent = 'Retour au camp';
  back.addEventListener('click', () => {
    battle = null;
    renderHome();
    showScreen('screen-home');
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

/* =========================================================
   INITIALISATION / ÉCOUTEURS D'ÉVÉNEMENTS
   ========================================================= */

function initEventListeners() {
  document.getElementById('btn-explore').addEventListener('click', startEncounter);
  document.getElementById('btn-heal').addEventListener('click', healTeam);
  document.getElementById('btn-team').addEventListener('click', () => {
    renderTeamScreen();
    showScreen('screen-team');
  });
  document.getElementById('btn-team-back').addEventListener('click', () => {
    renderHome();
    showScreen('screen-home');
  });
  document.getElementById('btn-reset-game').addEventListener('click', () => {
    if (!confirm('Réinitialiser toute la progression ? Cette action est irréversible.')) return;
    localStorage.removeItem(SAVE_KEY);
    state = null;
    battle = null;
    document.getElementById('home-log').innerHTML = '';
    showScreen('screen-title');
    initTitleScreen();
  });

  document.getElementById('btn-fight').addEventListener('click', showMoveMenu);
  document.getElementById('btn-tranq').addEventListener('click', attemptCapture);
  document.getElementById('btn-switch').addEventListener('click', showSwitchMenu);
  document.getElementById('btn-run').addEventListener('click', attemptRun);
}

document.addEventListener('DOMContentLoaded', () => {
  initTitleScreen();
  initEventListeners();
});
