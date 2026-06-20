// ══════════════════════════════════════
// MAHJONG SOLITÁRIO — Layout Pirâmide fixo
// Sem scroll, peças sempre visíveis
// ══════════════════════════════════════

const MJ_LABELS = {
  B1:'1🎍',B2:'2🎍',B3:'3🎍',B4:'4🎍',B5:'5🎍',B6:'6🎍',B7:'7🎍',B8:'8🎍',B9:'9🎍',
  C1:'1●',C2:'2●',C3:'3●',C4:'4●',C5:'5●',C6:'6●',C7:'7●',C8:'8●',C9:'9●',
  M1:'一',M2:'二',M3:'三',M4:'四',M5:'五',M6:'六',M7:'七',M8:'八',M9:'九',
  WE:'東',WS:'南',WW:'西',WN:'北',
  DR:'中',DG:'發',DW:'白',
  S1:'🌸',S2:'🌿',S3:'🍂',S4:'❄️',
  F1:'🌺',F2:'🍀',F3:'🌻',F4:'🌹',
};
const MJ_COLORS = {
  B:'#1a6b3c',C:'#1a3f6b',M:'#6b1a1a',
  W:'#5a4a0a',D:'#6b1a5a',S:'#0a5a4a',F:'#4a0a5a'
};

// 36 types × 2 = 72 tiles
const MJ_TYPES = [
  'B1','B2','B3','B4','B5','B6','B7','B8','B9',
  'C1','C2','C3','C4','C5','C6','C7','C8','C9',
  'M1','M2','M3','M4','M5','M6','M7','M8','M9',
  'WE','WS','WW','WN',
  'DR','DG','DW',
  'S1','S2','S3',
];

// Classic pyramid layout: layer, row, col (grid units)
// 72 positions total
function getMJLayout() {
  const p = [];
  // Layer 0 — 12×4 = 48
  for (let r=0;r<4;r++) for (let c=0;c<12;c++) p.push([0,r,c]);
  // Layer 1 — 10×2 = 20
  for (let r=0;r<2;r++) for (let c=1;c<11;c++) p.push([1,r,c]);
  // Layer 2 — 4×1 = 4 (trimming to fit 72 total)
  for (let c=4;c<8;c++) p.push([2,1,c]);
  // Layer 3 — top single row
  p.push([3,1,5]);
  p.push([3,1,6]);
  return p; // 48+20+4+2 = 74 — will take first 72
}

let mjTiles = [];
let mjSelected = null;
let mjScore = 0, mjMoves = 0;
let mjHistory = [];

function initMahjong() {
  stopAllTimers();
  mjSelected = null; mjScore = 0; mjMoves = 0; mjHistory = [];
  document.getElementById('mj-score').textContent = '0';
  document.getElementById('mj-moves').textContent = '0';
  document.getElementById('mj-time').textContent = '00:00';
  document.getElementById('mj-pairs').textContent = '0';

  // Build deck: 2 of each type
  let deck = [];
  MJ_TYPES.forEach(t => { deck.push(t); deck.push(t); });
  deck = shuffle(deck);

  const layout = getMJLayout().slice(0, 72);
  mjTiles = deck.map((type, i) => ({
    id: i, type,
    layer: layout[i][0],
    row:   layout[i][1],
    col:   layout[i][2],
    removed: false,
    selected: false
  }));

  // Retry until there's at least one valid move
  let tries = 0;
  while (!mjHasMove() && tries < 30) {
    deck = shuffle(deck);
    mjTiles = deck.map((type, i) => ({
      id: i, type,
      layer: layout[i][0],
      row:   layout[i][1],
      col:   layout[i][2],
      removed: false,
      selected: false
    }));
    tries++;
  }

  // Use setTimeout to ensure DOM is ready before measuring
  setTimeout(() => {
    renderMahjong();
    startTimer('mj','mj-time');
  }, 50);
}

function mjIsFree(tile) {
  if (tile.removed) return false;
  // Not covered from above
  const covered = mjTiles.some(t =>
    !t.removed && t.id !== tile.id &&
    t.layer === tile.layer + 1 &&
    Math.abs(t.row - tile.row) <= 1 &&
    Math.abs(t.col - tile.col) <= 1
  );
  if (covered) return false;
  // Free on at least one horizontal side
  const blockedL = mjTiles.some(t => !t.removed && t.id !== tile.id && t.layer === tile.layer && t.row === tile.row && t.col === tile.col - 1);
  const blockedR = mjTiles.some(t => !t.removed && t.id !== tile.id && t.layer === tile.layer && t.row === tile.row && t.col === tile.col + 1);
  return !blockedL || !blockedR;
}

function mjMatch(a, b) {
  if (a.type === b.type) return true;
  if (['S1','S2','S3','S4'].includes(a.type) && ['S1','S2','S3','S4'].includes(b.type)) return true;
  if (['F1','F2','F3','F4'].includes(a.type) && ['F1','F2','F3','F4'].includes(b.type)) return true;
  return false;
}

function mjHasMove() {
  const free = mjTiles.filter(t => !t.removed && mjIsFree(t));
  for (let i=0;i<free.length;i++)
    for (let j=i+1;j<free.length;j++)
      if (mjMatch(free[i], free[j])) return true;
  return false;
}

function mjClick(id) {
  const tile = mjTiles.find(t => t.id === id);
  if (!tile || tile.removed || !mjIsFree(tile)) return;

  if (mjSelected === null) {
    mjSelected = id; tile.selected = true;
  } else if (mjSelected === id) {
    tile.selected = false; mjSelected = null;
  } else {
    const prev = mjTiles.find(t => t.id === mjSelected);
    prev.selected = false;
    if (mjMatch(prev, tile)) {
      mjHistory.push([prev.id, tile.id]);
      prev.removed = true; tile.removed = true;
      mjSelected = null; mjScore += 10; mjMoves++;
      document.getElementById('mj-score').textContent = mjScore;
      document.getElementById('mj-moves').textContent = mjMoves;
      const rem = mjTiles.filter(t => !t.removed).length;
      document.getElementById('mj-pairs').textContent = (72 - rem) / 2;
      if (rem === 0) {
        stopAllTimers();
        showMsg('🎉','Parabéns!',`Tabuleiro limpo em ${document.getElementById('mj-time').textContent}!`, initMahjong);
        return;
      }
      if (!mjHasMove()) {
        setTimeout(() => showMsg('😔','Sem movimentos!','Não há mais pares disponíveis. Desfaça ou inicie novo jogo.', initMahjong), 300);
      }
    } else {
      mjSelected = id; tile.selected = true;
    }
  }
  renderMahjong();
}

function mjHint() {
  const free = mjTiles.filter(t => !t.removed && mjIsFree(t));
  for (let i=0;i<free.length;i++) {
    for (let j=i+1;j<free.length;j++) {
      if (mjMatch(free[i], free[j])) {
        [free[i].id, free[j].id].forEach(id => {
          const el = document.querySelector(`.mj-tile[data-id="${id}"]`);
          if (el) { el.classList.add('hint'); setTimeout(() => el.classList.remove('hint'), 1500); }
        });
        return;
      }
    }
  }
  showMsg('💭','Sem dicas','Não há mais pares livres!', null);
}

function mjUndo() {
  if (!mjHistory.length) return;
  const [id1, id2] = mjHistory.pop();
  mjTiles.find(t=>t.id===id1).removed = false;
  mjTiles.find(t=>t.id===id2).removed = false;
  mjSelected = null;
  mjTiles.forEach(t => t.selected = false);
  mjScore = Math.max(0, mjScore - 10);
  document.getElementById('mj-score').textContent = mjScore;
  const rem = mjTiles.filter(t => !t.removed).length;
  document.getElementById('mj-pairs').textContent = (72 - rem) / 2;
  renderMahjong();
}

function renderMahjong() {
  const board = document.getElementById('mj-board');
  const wrap  = document.getElementById('mj-board-wrap');
  board.innerHTML = '';

  // Fixed tile size based on screen width — no clientWidth dependency
  const screenW = window.innerWidth || 360;
  const availW  = screenW - 32; // padding

  // Grid spans: cols 0-11 = 12 units, rows 0-3 = 4 units
  // Layer offset: 3px per layer
  const LAYERS = 4, COLS = 12, ROWS = 4;
  const LAYER_OFFSET = 3;

  const TW = Math.floor((availW - LAYERS * LAYER_OFFSET) / COLS);
  const TH = Math.floor(TW * 1.35);

  const boardW = COLS * TW + LAYERS * LAYER_OFFSET;
  const boardH = ROWS * TH + LAYERS * LAYER_OFFSET + 10;

  board.style.width  = boardW + 'px';
  board.style.height = boardH + 'px';
  board.style.position = 'relative';
  wrap.style.height = (boardH + 16) + 'px';

  // Sort by layer so higher tiles appear on top
  [...mjTiles]
    .filter(t => !t.removed)
    .sort((a, b) => a.layer - b.layer)
    .forEach(tile => {
      const free = mjIsFree(tile);
      const suit = tile.type[0];
      const el = document.createElement('div');
      el.className = 'mj-tile' +
        (tile.selected ? ' mj-selected' : '') +
        (free ? ' mj-free' : ' mj-blocked');
      el.dataset.id = tile.id;

      const x = tile.col * TW + tile.layer * LAYER_OFFSET;
      const y = tile.row * TH + tile.layer * LAYER_OFFSET;

      el.style.cssText =
        `left:${x}px;top:${y}px;` +
        `width:${TW}px;height:${TH}px;` +
        `z-index:${tile.layer * 100 + tile.row};` +
        `--suit-color:${MJ_COLORS[suit] || '#333'};`;

      const fontSize = Math.max(7, TW - 16);
      el.innerHTML = `<span class="mj-label" style="font-size:${fontSize}px">${MJ_LABELS[tile.type] || tile.type}</span>`;
      if (free) el.addEventListener('click', () => mjClick(tile.id));
      board.appendChild(el);
    });
}
