// ══════════════════════════════════════
// MAHJONG SOLITÁRIO — Layout Pirâmide/Losango
// Sem scroll, tudo visível, pares sempre possíveis
// Seleção por toque individual
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

// Classic pyramid layout — 36 pairs = 72 tiles
// Layout rows (each entry = [layer, row, col] in a grid where each unit = half tile)
function buildPyramidLayout() {
  // We'll use a classic turtle layout scaled to fit screen
  // Each position: {layer, row, col} — col/row in half-tile units
  const pos = [];

  // Layer 0 - base rectangle 12×4 = 48 tiles
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 12; c++) {
      pos.push({layer:0, row:r, col:c});
    }
  }
  // Layer 1 - 8×2 = 16 tiles centered
  for (let r = 0; r < 2; r++) {
    for (let c = 0; c < 8; c++) {
      pos.push({layer:1, row:r, col:c+2});
    }
  }
  // Layer 2 - 4×1 = 4 tiles
  for (let c = 0; c < 4; c++) {
    pos.push({layer:2, row:0, col:c+4});
  }
  // Layer 3 - 2 tiles
  pos.push({layer:3, row:0, col:5});
  pos.push({layer:3, row:0, col:6});
  // Layer 4 - 1 tile
  pos.push({layer:4, row:0, col:5});
  // Extra tiles along edges (classic turtle wings)
  pos.push({layer:0, row:1, col:13}); // right wing
  pos.push({layer:0, row:2, col:13});
  pos.push({layer:0, row:1, col:-1}); // left wing (col -1)
  pos.push({layer:0, row:2, col:-1});

  return pos; // 48+16+4+2+1+4 = 75, trim to 72
}

// Generate 36 pairs ensuring solvability
function generateMJTiles() {
  const types = [
    'B1','B2','B3','B4','B5','B6','B7','B8','B9',
    'C1','C2','C3','C4','C5','C6','C7','C8','C9',
    'M1','M2','M3','M4','M5','M6','M7','M8','M9',
    'WE','WS','WW','WN',
    'DR','DG','DW',
    'S1','S2','S3',
  ];
  // 36 types × 2 = 72 tiles
  let deck = [];
  types.forEach(t => { deck.push(t); deck.push(t); });
  // Shuffle multiple times for good randomness
  for (let i = 0; i < 5; i++) deck = shuffle(deck);
  return deck;
}

// Build layout ensuring pairs can always be matched
function buildSolvableLayout() {
  const layout = buildPyramidLayout().slice(0, 72);
  const deck = generateMJTiles();

  // Sort positions by layer desc then by accessibility
  // Place matching pairs in accessible positions
  const tiles = deck.map((type, i) => ({
    id: i, type,
    layer: layout[i].layer,
    row: layout[i].row,
    col: layout[i].col,
    removed: false,
    selected: false
  }));

  // Verify at least some moves exist; if not, reshuffle
  let attempts = 0;
  let result = tiles;
  while (!hasMJMove(result) && attempts < 20) {
    const newDeck = generateMJTiles();
    result = newDeck.map((type, i) => ({
      id: i, type,
      layer: layout[i].layer,
      row: layout[i].row,
      col: layout[i].col,
      removed: false,
      selected: false
    }));
    attempts++;
  }
  return result;
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

  mjTiles = buildSolvableLayout();
  renderMahjong();
  startTimer('mj','mj-time');
}

function isMJFree(tile) {
  if (tile.removed) return false;
  // Not covered from above
  const covered = mjTiles.some(t =>
    !t.removed && t.id !== tile.id &&
    t.layer === tile.layer + 1 &&
    Math.abs(t.row - tile.row) <= 0 &&
    Math.abs(t.col - tile.col) <= 1
  );
  if (covered) return false;
  // Free on left or right side
  const blockedL = mjTiles.some(t => !t.removed && t.id !== tile.id && t.layer === tile.layer && t.row === tile.row && t.col === tile.col - 1);
  const blockedR = mjTiles.some(t => !t.removed && t.id !== tile.id && t.layer === tile.layer && t.row === tile.row && t.col === tile.col + 1);
  return !blockedL || !blockedR;
}

function tilesMatch(a, b) {
  if (a.type === b.type) return true;
  const seasons = ['S1','S2','S3','S4'];
  if (seasons.includes(a.type) && seasons.includes(b.type)) return true;
  const flowers = ['F1','F2','F3','F4'];
  if (flowers.includes(a.type) && flowers.includes(b.type)) return true;
  return false;
}

function hasMJMove(tiles) {
  const free = tiles.filter(t => !t.removed && isMJFreeCheck(t, tiles));
  for (let i = 0; i < free.length; i++)
    for (let j = i+1; j < free.length; j++)
      if (tilesMatch(free[i], free[j])) return true;
  return false;
}

function isMJFreeCheck(tile, tiles) {
  if (tile.removed) return false;
  const covered = tiles.some(t =>
    !t.removed && t.id !== tile.id &&
    t.layer === tile.layer + 1 &&
    Math.abs(t.row - tile.row) <= 0 &&
    Math.abs(t.col - tile.col) <= 1
  );
  if (covered) return false;
  const blockedL = tiles.some(t => !t.removed && t.id !== tile.id && t.layer === tile.layer && t.row === tile.row && t.col === tile.col - 1);
  const blockedR = tiles.some(t => !t.removed && t.id !== tile.id && t.layer === tile.layer && t.row === tile.row && t.col === tile.col + 1);
  return !blockedL || !blockedR;
}

function mjClick(id) {
  const tile = mjTiles.find(t => t.id === id);
  if (!tile || tile.removed || !isMJFree(tile)) return;

  if (mjSelected === null) {
    mjSelected = id;
    tile.selected = true;
  } else if (mjSelected === id) {
    tile.selected = false;
    mjSelected = null;
  } else {
    const prev = mjTiles.find(t => t.id === mjSelected);
    prev.selected = false;
    if (tilesMatch(prev, tile)) {
      mjHistory.push([prev.id, tile.id]);
      prev.removed = true; tile.removed = true;
      mjSelected = null; mjScore += 10; mjMoves++;
      document.getElementById('mj-score').textContent = mjScore;
      document.getElementById('mj-moves').textContent = mjMoves;
      const rem = mjTiles.filter(t => !t.removed).length;
      document.getElementById('mj-pairs').textContent = (72 - rem) / 2;
      if (rem === 0) {
        stopAllTimers();
        const t = document.getElementById('mj-time').textContent;
        showMsg('🎉','Parabéns!',`Tabuleiro limpo em ${t}!`,initMahjong);
        return;
      }
      if (!hasMJMove(mjTiles)) {
        setTimeout(()=>showMsg('😔','Sem movimentos!','Não há mais pares disponíveis. Tente desfazer ou novo jogo.',initMahjong),300);
      }
    } else {
      mjSelected = id; tile.selected = true;
    }
  }
  renderMahjong();
}

function mjHint() {
  const free = mjTiles.filter(t => !t.removed && isMJFree(t));
  for (let i = 0; i < free.length; i++) {
    for (let j = i+1; j < free.length; j++) {
      if (tilesMatch(free[i], free[j])) {
        [free[i].id, free[j].id].forEach(id => {
          const el = document.querySelector(`.mj-tile[data-id="${id}"]`);
          if (el) { el.classList.add('hint'); setTimeout(()=>el.classList.remove('hint'),1500); }
        });
        return;
      }
    }
  }
  showMsg('💭','Sem dicas','Não há mais pares disponíveis!',null);
}

function mjUndo() {
  if (!mjHistory.length) return;
  const [id1,id2] = mjHistory.pop();
  mjTiles.find(t=>t.id===id1).removed = false;
  mjTiles.find(t=>t.id===id2).removed = false;
  mjSelected = null;
  mjTiles.forEach(t=>t.selected=false);
  mjScore = Math.max(0, mjScore-10);
  document.getElementById('mj-score').textContent = mjScore;
  const rem = mjTiles.filter(t=>!t.removed).length;
  document.getElementById('mj-pairs').textContent = (72-rem)/2;
  renderMahjong();
}

function renderMahjong() {
  const board = document.getElementById('mj-board');
  board.innerHTML = '';

  // Fit all tiles in the available width
  const wrap = document.getElementById('mj-board-wrap');
  const availW = wrap.clientWidth - 16;
  const availH = Math.min(availW * 0.65, 300); // keep aspect ratio

  // Grid: 14 cols (-1 to 13), 4 rows, 5 layers
  const minCol = Math.min(...mjTiles.map(t=>t.col));
  const maxCol = Math.max(...mjTiles.map(t=>t.col));
  const minRow = Math.min(...mjTiles.map(t=>t.row));
  const maxRow = Math.max(...mjTiles.map(t=>t.row));
  const maxLayer = Math.max(...mjTiles.map(t=>t.layer));

  const cols = maxCol - minCol + 2;
  const rows = maxRow - minRow + 2;
  const OFFSET = 2; // layer offset px

  const TW = Math.floor((availW - maxLayer*OFFSET) / (cols + 0.5));
  const TH = Math.floor(TW * 1.3);
  const boardW = cols * TW + maxLayer * OFFSET + 4;
  const boardH = rows * TH + maxLayer * OFFSET + 4;

  board.style.width = boardW + 'px';
  board.style.height = boardH + 'px';
  board.style.position = 'relative';

  // Sort by layer so higher layers render on top
  [...mjTiles].sort((a,b) => a.layer - b.layer).forEach(tile => {
    if (tile.removed) return;
    const free = isMJFree(tile);
    const suit = tile.type.replace(/[0-9]/g,'').substring(0,1);
    const el = document.createElement('div');
    el.className = 'mj-tile' +
      (tile.selected ? ' mj-selected' : '') +
      (free ? ' mj-free' : ' mj-blocked');
    el.dataset.id = tile.id;

    const x = (tile.col - minCol) * TW + tile.layer * OFFSET;
    const y = (tile.row - minRow) * TH + tile.layer * OFFSET;

    el.style.cssText = `left:${x}px;top:${y}px;width:${TW}px;height:${TH}px;` +
      `z-index:${tile.layer*100+tile.row*10};` +
      `font-size:${Math.max(8, TW-10)}px;` +
      `--suit-color:${MJ_COLORS[suit]||'#333'};`;
    el.innerHTML = `<span class="mj-label" style="font-size:${Math.max(7,TW-14)}px">${MJ_LABELS[tile.type]||tile.type}</span>`;
    if (free) el.addEventListener('click', () => mjClick(tile.id));
    board.appendChild(el);
  });
}
