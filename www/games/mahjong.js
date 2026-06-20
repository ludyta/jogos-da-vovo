// ══════════════════════════════════════
// MAHJONG SOLITÁRIO
// Layout clássico Turtle/Pirâmide
// Combinar 2 peças livres iguais para remover
// ══════════════════════════════════════

// Tipos de peças (36 pares = 72 peças)
const MJ_TILES = [
  // Bambus (9 tipos × 4)
  '🎋1','🎋2','🎋3','🎋4','🎋5','🎋6','🎋7','🎋8','🎋9',
  // Círculos (9 tipos × 4)
  '🔵1','🔵2','🔵3','🔵4','🔵5','🔵6','🔵7','🔵8','🔵9',
  // Caracteres (9 tipos × 4)
  '🀇','🀈','🀉','🀊','🀋','🀌','🀍','🀎','🀏',
  // Ventos (4 tipos × 4)
  '🀀','🀁','🀂','🀃',
  // Dragões (3 tipos × 4)
  '🀄','🀅','🀆',
  // Estações (4 únicos — par com qualquer da série)
  '🌸','🌿','🍂','❄️',
  // Flores (4 únicos)
  '🌺','🍀','🌻','🌹',
];

// Usaremos emojis visuais mais simples para melhor renderização
const MJ_SYMBOLS = [
  // Bambus 1-9
  ['B1','B2','B3','B4','B5','B6','B7','B8','B9'],
  // Círculos 1-9
  ['C1','C2','C3','C4','C5','C6','C7','C8','C9'],
  // Milhares 1-9
  ['M1','M2','M3','M4','M5','M6','M7','M8','M9'],
  // Ventos
  ['WE','WS','WW','WN'],
  // Dragões
  ['DR','DG','DW'],
  // Estações (pares entre si)
  ['S1','S2','S3','S4'],
  // Flores (pares entre si)
  ['F1','F2','F3','F4'],
];

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
  B:'#1a6b3c', C:'#1a3f6b', M:'#6b1a1a',
  W:'#5a4a0a', D:'#6b1a5a', S:'#0a5a4a', F:'#4a0a5a'
};

// Layout clássico "Turtle" — 144 peças em camadas
// Formato: [layer, row, col] — layer 0 = baixo
// Usaremos um layout simplificado de 72 peças (36 pares)
function buildLayout() {
  const positions = [];
  // Layer 0 — base (8×6 grid nos espaços escuros)
  const base = [
    [0,0],[0,2],[0,4],[0,6],[0,8],[0,10],[0,12],
    [2,0],[2,2],[2,4],[2,6],[2,8],[2,10],[2,12],
    [4,0],[4,2],[4,4],[4,6],[4,8],[4,10],[4,12],
    [6,0],[6,2],[6,4],[6,6],[6,8],[6,10],[6,12],
    [8,0],[8,2],[8,4],[8,6],[8,8],[8,10],[8,12],
    [10,0],[10,2],[10,4],[10,6],[10,8],[10,10],[10,12],
  ];
  base.forEach(([r,c]) => positions.push({layer:0, row:r, col:c}));
  // Layer 1 — menor
  const l1 = [
    [1,2],[1,4],[1,6],[1,8],[1,10],
    [3,2],[3,4],[3,6],[3,8],[3,10],
    [5,2],[5,4],[5,6],[5,8],[5,10],
    [7,2],[7,4],[7,6],[7,8],[7,10],
    [9,2],[9,4],[9,6],[9,8],[9,10],
  ];
  l1.forEach(([r,c]) => positions.push({layer:1, row:r, col:c}));
  // Layer 2
  const l2 = [
    [2,4],[2,6],[2,8],
    [4,4],[4,6],[4,8],
    [6,4],[6,6],[6,8],
    [8,4],[8,6],[8,8],
  ];
  l2.forEach(([r,c]) => positions.push({layer:2, row:r, col:c}));
  // Layer 3
  const l3 = [[3,5],[3,7],[5,5],[5,7],[7,5],[7,7]];
  l3.forEach(([r,c]) => positions.push({layer:3, row:r, col:c}));
  // Top
  positions.push({layer:4, row:5, col:6});

  return positions; // 42 + 25 + 12 + 6 + 1 = muitas, vamos usar só 72
}

let mjTiles = []; // {id, type, layer, row, col, removed, selected}
let mjSelected = null;
let mjScore = 0;
let mjMoves = 0;
let mjHistory = []; // for undo

function initMahjong() {
  stopAllTimers();
  mjSelected = null; mjScore = 0; mjMoves = 0; mjHistory = [];
  document.getElementById('mj-score').textContent = '0';
  document.getElementById('mj-moves').textContent = '0';
  document.getElementById('mj-time').textContent = '00:00';
  document.getElementById('mj-pairs').textContent = '0';

  // Build 36 pairs
  const pairs = [];
  // 9 bambus × 4 each = 36 → use 9 pairs of 4? No: pair = 2 tiles same type
  // We build groups of 4 identical tiles (each group = 2 pairs)
  const types = [];
  ['B','C','M'].forEach(suit => {
    for (let n=1;n<=9;n++) types.push(suit+n);
  });
  ['WE','WS','WW','WN','DR','DG','DW'].forEach(t => types.push(t));
  // Seasons & flowers: any 2 of same group match
  ['S1','S2','S3','S4','F1','F2','F3','F4'].forEach(t => types.push(t));

  // Take first 36 types, make 2 of each = 72 tiles
  const chosen = types.slice(0, 36);
  const deck = [];
  chosen.forEach(t => { deck.push(t); deck.push(t); });
  const shuffled = shuffle([...deck]);

  // Use simplified rectangular layout: 6 layers pyramid
  // Layer sizes: 36, 20, 10, 4, 1, 1 = 72
  const layout = buildMJLayout();
  mjTiles = shuffled.map((type, i) => ({
    id: i, type,
    layer: layout[i].layer,
    row:   layout[i].row,
    col:   layout[i].col,
    removed: false,
    selected: false
  }));

  renderMahjong();
  startTimer('mj', 'mj-time');
}

function buildMJLayout() {
  // Build a visually nice pyramid layout for exactly 72 tiles
  const pos = [];
  // Layer 0: 8×5 = 40 slots but use 36
  const cols0 = [0,1,2,3,4,5,6,7,8,9,10,11];
  const rows0 = [0,1,2];
  for (let r of rows0) for (let c of cols0) {
    if (pos.length < 36) pos.push({layer:0, row:r*2, col:c*2});
  }
  // Layer 1: 5×4 = 20
  for (let r=0;r<4;r++) for (let c=0;c<5;c++) {
    if (pos.length < 56) pos.push({layer:1, row:r*2+1, col:c*2+2});
  }
  // Layer 2: 3×2 = 6 + 4 = 10
  for (let r=0;r<2;r++) for (let c=0;c<4;c++) {
    if (pos.length < 66) pos.push({layer:2, row:r*2+2, col:c*2+3});
  }
  // Layer 3: 2×2 = 4
  for (let r=0;r<2;r++) for (let c=0;c<2;c++) {
    if (pos.length < 70) pos.push({layer:3, row:r*2+3, col:c*2+4});
  }
  // Layer 4: 2
  pos.push({layer:4, row:4, col:5});
  pos.push({layer:4, row:4, col:7});
  // Layer 5: top
  while (pos.length < 72) pos.push({layer:5, row:4, col:6});

  return pos;
}

function isMJFree(tile) {
  if (tile.removed) return false;
  // Free = not covered from above AND free on at least one side (left or right)
  const covered = mjTiles.some(t =>
    !t.removed && t.id !== tile.id && t.layer === tile.layer + 1 &&
    Math.abs(t.row - tile.row) <= 1 && Math.abs(t.col - tile.col) <= 1
  );
  if (covered) return false;

  const blockedLeft  = mjTiles.some(t => !t.removed && t.id !== tile.id && t.layer === tile.layer && t.row === tile.row && t.col === tile.col - 2);
  const blockedRight = mjTiles.some(t => !t.removed && t.id !== tile.id && t.layer === tile.layer && t.row === tile.row && t.col === tile.col + 2);
  return !blockedLeft || !blockedRight;
}

function tilesMatch(a, b) {
  if (a.type === b.type) return true;
  // Seasons match each other
  const seasons = ['S1','S2','S3','S4'];
  if (seasons.includes(a.type) && seasons.includes(b.type)) return true;
  // Flowers match each other
  const flowers = ['F1','F2','F3','F4'];
  if (flowers.includes(a.type) && flowers.includes(b.type)) return true;
  return false;
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
      // Match!
      mjHistory.push([prev.id, tile.id]);
      prev.removed = true;
      tile.removed = true;
      mjSelected = null;
      mjScore += 10;
      mjMoves++;
      document.getElementById('mj-score').textContent = mjScore;
      document.getElementById('mj-moves').textContent = mjMoves;
      const remaining = mjTiles.filter(t => !t.removed).length;
      document.getElementById('mj-pairs').textContent = (72 - remaining) / 2;
      if (remaining === 0) {
        stopAllTimers();
        const t = document.getElementById('mj-time').textContent;
        showMsg('🎉', 'Parabéns!', `Você limpou o tabuleiro em ${t} com ${mjMoves} movimentos!`, initMahjong);
        return;
      }
      if (!hasAnyMove()) {
        setTimeout(() => showMsg('😔', 'Sem movimentos!', 'Não há mais pares disponíveis. Use "Desfazer" ou inicie um novo jogo.', initMahjong), 300);
      }
    } else {
      // No match — select new tile
      mjSelected = id;
      tile.selected = true;
    }
  }
  renderMahjong();
}

function hasAnyMove() {
  const free = mjTiles.filter(t => !t.removed && isMJFree(t));
  for (let i = 0; i < free.length; i++)
    for (let j = i+1; j < free.length; j++)
      if (tilesMatch(free[i], free[j])) return true;
  return false;
}

function mjHint() {
  const free = mjTiles.filter(t => !t.removed && isMJFree(t));
  for (let i = 0; i < free.length; i++) {
    for (let j = i+1; j < free.length; j++) {
      if (tilesMatch(free[i], free[j])) {
        // Flash both
        [free[i].id, free[j].id].forEach(id => {
          const el = document.querySelector(`.mj-tile[data-id="${id}"]`);
          if (el) { el.classList.add('hint'); setTimeout(()=>el.classList.remove('hint'),1500); }
        });
        return;
      }
    }
  }
  showMsg('💭','Sem dicas','Não há mais pares disponíveis!', null);
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
  const remaining = mjTiles.filter(t => !t.removed).length;
  document.getElementById('mj-pairs').textContent = (72 - remaining) / 2;
  renderMahjong();
}

function renderMahjong() {
  const board = document.getElementById('mj-board');
  board.innerHTML = '';

  // Determine grid bounds
  const active = mjTiles.filter(t => !t.removed);
  if (!active.length) return;

  const maxRow = Math.max(...active.map(t=>t.row));
  const maxCol = Math.max(...active.map(t=>t.col));
  const maxLayer = Math.max(...active.map(t=>t.layer));

  // Sort by layer (bottom first so top renders on top via z-index)
  const sorted = [...mjTiles].sort((a,b) => a.layer - b.layer);

  const TW = 46, TH = 58, OFFSET = 4; // tile width, height, layer offset

  const boardW = (maxCol + 2) * (TW/2) + maxLayer * OFFSET + 20;
  const boardH = (maxRow + 2) * (TH/2) + maxLayer * OFFSET + 20;
  board.style.width  = boardW + 'px';
  board.style.height = boardH + 'px';
  board.style.position = 'relative';

  sorted.forEach(tile => {
    if (tile.removed) return;
    const el = document.createElement('div');
    const free = isMJFree(tile);
    const suit = tile.type.replace(/[0-9]/g,'').substring(0,1);
    el.className = 'mj-tile' +
      (tile.selected ? ' mj-selected' : '') +
      (free ? ' mj-free' : ' mj-blocked');
    el.dataset.id = tile.id;

    const x = tile.col * (TW/2) + tile.layer * OFFSET + 10;
    const y = tile.row * (TH/2) + tile.layer * OFFSET + 10;

    el.style.cssText = `
      left:${x}px; top:${y}px;
      width:${TW}px; height:${TH}px;
      z-index:${tile.layer * 100 + tile.row};
      --suit-color:${MJ_COLORS[suit] || '#333'};
    `;
    el.innerHTML = `<span class="mj-label">${MJ_LABELS[tile.type] || tile.type}</span>`;
    if (free) el.addEventListener('click', () => mjClick(tile.id));
    board.appendChild(el);
  });
}
