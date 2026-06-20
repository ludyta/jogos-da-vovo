// ══════════════════════════════════════
// CAÇA-PALAVRAS — temas + dificuldade
// ══════════════════════════════════════

const WP_THEMES = {
  animais: {
    label: '🐾 Animais',
    easy:   ['GATO','CÃO','PEIXE','COELHO','PATO','LEÃO','URSO','LOBO'],
    medium: ['PÁSSARO','ELEFANTE','GIRAFA','MACACO','TIGRE','CAVALO','COBRA','RAPOSA'],
    hard:   ['CROCODILO','RINOCERONTE','CHIMPANZÉ','ORNITORRINCO','HIPOPÓTAMO','CAMALEÃO']
  },
  flores: {
    label: '🌸 Flores',
    easy:   ['ROSA','CRAVO','LÍRIO','TULIPA','VIOLETA','JASMIM','DÁLIA'],
    medium: ['MARGARIDA','ORQUÍDEA','GIRASSOL','LAVANDA','AZALEIA','BEGÔNIA'],
    hard:   ['BOUGAINVILLEA','ONAGRÁCEA','HELICÔNIA','BROMÉLIA','ANTÚRIO']
  },
  culinaria: {
    label: '🍽️ Culinária',
    easy:   ['ARROZ','PÃO','BOLO','SOPA','CARNE','SALADA','OVO'],
    medium: ['FEIJÃO','FRANGO','PUDIM','MACARRÃO','TORTA','FAROFA','VATAPÁ'],
    hard:   ['ESCONDIDINHO','MOQUECA','COXINHA','BRIGADEIRO','QUINDIM','PAÇOCA']
  },
  familia: {
    label: '👨‍👩‍👧 Família',
    easy:   ['MÃE','PAI','AVÓ','AVÔ','TIA','TIO','FILHA','FILHO'],
    medium: ['PRIMA','PRIMO','NETA','NETO','SOGRA','SOGRO','CUNHADA'],
    hard:   ['BISNETA','BISNETO','MADRINHA','PADRINHO','ENTEADA','GENRO']
  },
  geografia: {
    label: '🌍 Geografia',
    easy:   ['BRASIL','PARIS','ROMA','CHINA','CUBA','PERU','CHILE'],
    medium: ['BRASÍLIA','ARGENTINA','PORTUGAL','ESPANHA','AFRICA','EUROPA'],
    hard:   ['MONTEVIDÉU','GUADALUPE','MOZAMBIQUE','AZERBAIJÃO','CAZAQUISTÃO']
  },
  ciencias: {
    label: '🔬 Ciências',
    easy:   ['SOL','LUA','MAR','RIO','TERRA','ÁGUA','FOGO','AR'],
    medium: ['OXIGÊNIO','PLANETAS','ÁTOMO','CÉLULA','ENERGIA','GRAVIDADE'],
    hard:   ['FOTOSSÍNTESE','EVAPORAÇÃO','TERMODINÂMICA','ELETRICIDADE','MAGNETISMO']
  },
  musica: {
    label: '🎵 Música',
    easy:   ['NOTA','SOM','VOZ','RITMO','CANTO','FLAUTA','VIOLA'],
    medium: ['VIOLINO','BATERIA','GUITARRA','TECLADO','SAXOFONE','CLARINETE'],
    hard:   ['CONTRABAIXO','TROMPETE','HARMÔNICA','BANDONEON','PERCUSSÃO']
  }
};

// Difficulty settings
const WP_DIFF = {
  facil:   { gridSize: 10, wordCount: 6,  dirs: [[0,1],[1,0]],                              label:'Fácil' },
  medio:   { gridSize: 13, wordCount: 8,  dirs: [[0,1],[1,0],[1,1],[-1,1]],                 label:'Médio' },
  dificil: { gridSize: 16, wordCount: 10, dirs: [[0,1],[1,0],[1,1],[-1,1],[0,-1],[-1,0],[-1,-1],[1,-1]], label:'Difícil' }
};

let wpTheme = 'animais';
let wpDiff  = 'facil';
let wpGrid  = [], wpRows = 10, wpCols = 10;
let wpWordsPlaced = [], wpFoundWords = [];
let wpSelection = [], wpSelecting = false;

function setWPTheme(t, btn) {
  wpTheme = t;
  document.querySelectorAll('#cacapalavras-screen .theme-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  initWP();
}

function setWPDiff(d, btn) {
  wpDiff = d;
  document.querySelectorAll('#cacapalavras-screen .diff-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  initWP();
}

function initWP(theme) {
  stopAllTimers();
  if (theme) wpTheme = theme;
  wpFoundWords = []; wpSelection = []; wpSelecting = false;

  const cfg  = WP_DIFF[wpDiff];
  const pool = WP_THEMES[wpTheme];
  wpRows = wpCols = cfg.gridSize;

  // Build word list by difficulty pool
  const allWords = [
    ...(wpDiff === 'facil'   ? pool.easy   : []),
    ...(wpDiff === 'medio'   ? [...pool.easy, ...pool.medium] : []),
    ...(wpDiff === 'dificil' ? [...pool.medium, ...pool.hard] : [])
  ].map(w => w.replace(/\s/g,'').toUpperCase());

  const chosen = shuffle([...new Set(allWords)]).slice(0, cfg.wordCount);
  wpWordsPlaced = [];
  wpGrid = Array.from({ length: wpRows }, () => Array(wpCols).fill(''));

  for (const word of chosen) placeWord(word, cfg.dirs);

  // Fill blanks
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let r = 0; r < wpRows; r++)
    for (let c = 0; c < wpCols; c++)
      if (!wpGrid[r][c]) wpGrid[r][c] = letters[Math.floor(Math.random() * 26)];

  document.getElementById('wp-total').textContent = wpWordsPlaced.length;
  document.getElementById('wp-found').textContent = 0;
  renderWPGrid();
  renderWPWords();
  startTimer('wp', 'wp-time');
}

function placeWord(word, dirs) {
  const shuffledDirs = shuffle([...dirs]);
  for (let attempt = 0; attempt < 200; attempt++) {
    const dir = shuffledDirs[attempt % shuffledDirs.length];
    const r = Math.floor(Math.random() * wpRows);
    const c = Math.floor(Math.random() * wpCols);
    if (canPlace(word, r, c, dir)) {
      for (let i = 0; i < word.length; i++)
        wpGrid[r + dir[0]*i][c + dir[1]*i] = word[i];
      wpWordsPlaced.push({ word, r, c, dr: dir[0], dc: dir[1] });
      return true;
    }
  }
  return false;
}

function canPlace(word, r, c, [dr, dc]) {
  for (let i = 0; i < word.length; i++) {
    const nr = r + dr*i, nc = c + dc*i;
    if (nr < 0 || nr >= wpRows || nc < 0 || nc >= wpCols) return false;
    if (wpGrid[nr][nc] && wpGrid[nr][nc] !== word[i]) return false;
  }
  return true;
}

function renderWPGrid() {
  const grid = document.getElementById('wp-grid');
  const cellSize = wpCols <= 10 ? 34 : wpCols <= 13 ? 28 : 22;
  grid.style.gridTemplateColumns = `repeat(${wpCols}, ${cellSize}px)`;
  grid.innerHTML = '';

  for (let r = 0; r < wpRows; r++) for (let c = 0; c < wpCols; c++) {
    const cell = document.createElement('div');
    cell.className = 'wp-cell';
    cell.style.width = cell.style.height = cellSize + 'px';
    cell.style.fontSize = (cellSize - 14) + 'px';
    cell.textContent = wpGrid[r][c];
    cell.dataset.r = r; cell.dataset.c = c;
    cell.addEventListener('pointerdown', e => { e.preventDefault(); wpStartSelect(r, c); });
    cell.addEventListener('pointermove', e => { e.preventDefault(); if (wpSelecting) wpMoveSelect(r, c); });
    cell.addEventListener('pointerup',   e => { e.preventDefault(); wpEndSelect(); });
    grid.appendChild(cell);
  }
  updateWPCellStyles();
}

function wpStartSelect(r, c) { wpSelecting = true; wpSelection = [{r,c}]; updateWPCellStyles(); }

function wpMoveSelect(r, c) {
  if (!wpSelecting || !wpSelection.length) return;
  const start = wpSelection[0];
  const dr = Math.sign(r - start.r), dc = Math.sign(c - start.c);
  if (dr === 0 && dc === 0) { wpSelection = [start]; updateWPCellStyles(); return; }
  if (dr !== 0 && dc !== 0 && Math.abs(r - start.r) !== Math.abs(c - start.c)) return;
  wpSelection = [];
  let cr = start.r, cc = start.c;
  while (true) {
    wpSelection.push({r: cr, c: cc});
    if (cr === r && cc === c) break;
    cr += dr; cc += dc;
    if (cr < 0 || cr >= wpRows || cc < 0 || cc >= wpCols) break;
  }
  updateWPCellStyles();
}

function wpEndSelect() {
  if (!wpSelecting) return;
  wpSelecting = false;
  // check forward and backward
  const word    = wpSelection.map(({r,c}) => wpGrid[r][c]).join('');
  const wordRev = [...word].reverse().join('');
  let found = null;
  for (const placed of wpWordsPlaced) {
    if ((placed.word === word || placed.word === wordRev) && !wpFoundWords.includes(placed.word)) {
      found = placed; break;
    }
  }
  if (found) {
    wpFoundWords.push(found.word);
    document.getElementById('wp-found').textContent = wpFoundWords.length;
    wpSelection.forEach(({r,c}) => {
      const el = document.querySelector(`.wp-cell[data-r="${r}"][data-c="${c}"]`);
      if (el) el.classList.add('found');
    });
    renderWPWords();
    if (wpFoundWords.length === wpWordsPlaced.length) {
      stopAllTimers();
      const t = document.getElementById('wp-time').textContent;
      showMsg('🎉', 'Parabéns!', `Você encontrou todas as palavras em ${t}!`, initWP);
    }
  }
  wpSelection = [];
  updateWPCellStyles();
}

function updateWPCellStyles() {
  const selSet = new Set(wpSelection.map(({r,c}) => `${r},${c}`));
  document.querySelectorAll('.wp-cell').forEach(cell => {
    const key = `${cell.dataset.r},${cell.dataset.c}`;
    if (!cell.classList.contains('found'))
      cell.classList.toggle('selected', selSet.has(key));
  });
}

function renderWPWords() {
  const el = document.getElementById('wp-words');
  el.innerHTML = '';
  wpWordsPlaced.forEach(({word}) => {
    const span = document.createElement('span');
    span.className = 'wp-word' + (wpFoundWords.includes(word) ? ' found' : '');
    span.textContent = word;
    el.appendChild(span);
  });
}

function wpHint() {
  const remaining = wpWordsPlaced.filter(p => !wpFoundWords.includes(p.word));
  if (!remaining.length) return;
  const pick = remaining[Math.floor(Math.random() * remaining.length)];
  const el = document.querySelector(`.wp-cell[data-r="${pick.r}"][data-c="${pick.c}"]`);
  if (el) { el.style.background = '#FFE066'; setTimeout(() => el.style.background = '', 1500); }
}
