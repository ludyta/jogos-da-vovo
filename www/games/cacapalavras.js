// ══════════════════════════════════════
// CAÇA-PALAVRAS — seleção por toque individual
// Sempre novo a cada partida
// ══════════════════════════════════════
const WP_THEMES = {
  animais:   { label:'Animais',
    easy:['GATO','CÃO','PEIXE','PATO','LEÃO','URSO','LOBO','RATO'],
    medium:['PÁSSARO','ELEFANTE','GIRAFA','MACACO','TIGRE','CAVALO','COBRA','RAPOSA'],
    hard:['CROCODILO','RINOCERONTE','CHIMPANZÉ','ORNITORRINCO','HIPOPÓTAMO','CAMALEÃO'] },
  flores:    { label:'Flores',
    easy:['ROSA','CRAVO','LÍRIO','TULIPA','VIOLETA','JASMIM','DÁLIA'],
    medium:['MARGARIDA','ORQUÍDEA','GIRASSOL','LAVANDA','AZALEIA','BEGÔNIA'],
    hard:['BOUGAINVILLEA','ONAGRÁCEA','HELICÔNIA','BROMÉLIA','ANTÚRIO'] },
  culinaria: { label:'Culinária',
    easy:['ARROZ','PÃO','BOLO','SOPA','CARNE','SALADA','OVO'],
    medium:['FEIJÃO','FRANGO','PUDIM','MACARRÃO','TORTA','FAROFA','VATAPÁ'],
    hard:['ESCONDIDINHO','MOQUECA','COXINHA','BRIGADEIRO','QUINDIM','PAÇOCA'] },
  familia:   { label:'Família',
    easy:['MÃE','PAI','AVÓ','AVÔ','TIA','TIO','FILHA','FILHO'],
    medium:['PRIMA','PRIMO','NETA','NETO','SOGRA','SOGRO','CUNHADA'],
    hard:['BISNETA','BISNETO','MADRINHA','PADRINHO','ENTEADA','GENRO'] },
  geografia: { label:'Geografia',
    easy:['BRASIL','PARIS','ROMA','CHINA','CUBA','PERU','CHILE'],
    medium:['BRASÍLIA','ARGENTINA','PORTUGAL','ESPANHA','AFRICA','EUROPA'],
    hard:['MONTEVIDÉU','GUADALUPE','MOZAMBIQUE','AZERBAIJÃO','CAZAQUISTÃO'] },
  ciencias:  { label:'Ciências',
    easy:['SOL','LUA','MAR','RIO','TERRA','ÁGUA','FOGO','AR'],
    medium:['OXIGÊNIO','PLANETAS','ÁTOMO','CÉLULA','ENERGIA','GRAVIDADE'],
    hard:['FOTOSSÍNTESE','EVAPORAÇÃO','TERMODINÂMICA','ELETRICIDADE','MAGNETISMO'] },
  musica:    { label:'Música',
    easy:['NOTA','SOM','VOZ','RITMO','CANTO','FLAUTA','VIOLA'],
    medium:['VIOLINO','BATERIA','GUITARRA','TECLADO','SAXOFONE','CLARINETE'],
    hard:['CONTRABAIXO','TROMPETE','HARMÔNICA','BANDONEON','PERCUSSÃO'] },
};

const WP_DIFF = {
  facil:   { gridSize:10, wordCount:6,  dirs:[[0,1],[1,0]],                             label:'Fácil' },
  medio:   { gridSize:13, wordCount:8,  dirs:[[0,1],[1,0],[1,1],[-1,1]],                label:'Médio' },
  dificil: { gridSize:16, wordCount:10, dirs:[[0,1],[1,0],[1,1],[-1,1],[0,-1],[-1,0],[-1,-1],[1,-1]], label:'Difícil' },
};

let wpTheme='animais', wpDiff='facil';
let wpGrid=[], wpRows=10, wpCols=10;
let wpWordsPlaced=[], wpFoundWords=[];
let wpSelection=[]; // array of {r,c}
let wpFirstClick=null;

function setWPTheme(t) {
  wpTheme = t; initWP();
}
function setWPDiff(d) {
  wpDiff = d; initWP();
}

function initWP() {
  stopAllTimers();
  wpFoundWords=[]; wpSelection=[]; wpFirstClick=null;

  const cfg  = WP_DIFF[wpDiff];
  const pool = WP_THEMES[wpTheme];
  wpRows = wpCols = cfg.gridSize;

  const allWords = [
    ...(wpDiff==='facil'   ? pool.easy   : []),
    ...(wpDiff==='medio'   ? [...pool.easy,...pool.medium] : []),
    ...(wpDiff==='dificil' ? [...pool.medium,...pool.hard] : []),
  ].map(w=>w.replace(/\s/g,'').toUpperCase());

  const chosen = shuffle([...new Set(allWords)]).slice(0, cfg.wordCount);
  wpWordsPlaced = [];
  wpGrid = Array.from({length:wpRows}, ()=>Array(wpCols).fill(''));

  for (const word of chosen) placeWord(word, cfg.dirs);

  // Fill blanks with random letters — new seed every game
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let r=0;r<wpRows;r++) for (let c=0;c<wpCols;c++)
    if (!wpGrid[r][c]) wpGrid[r][c] = letters[Math.floor(Math.random()*26)];

  document.getElementById('wp-total').textContent = wpWordsPlaced.length;
  document.getElementById('wp-found').textContent = 0;
  renderWPGrid();
  renderWPWords();
  startTimer('wp','wp-time');
}

function placeWord(word, dirs) {
  const shuffledDirs = shuffle([...dirs]);
  for (let attempt=0; attempt<200; attempt++) {
    const dir = shuffledDirs[attempt % shuffledDirs.length];
    const r = Math.floor(Math.random()*wpRows);
    const c = Math.floor(Math.random()*wpCols);
    if (canPlace(word,r,c,dir)) {
      for (let i=0;i<word.length;i++) wpGrid[r+dir[0]*i][c+dir[1]*i]=word[i];
      wpWordsPlaced.push({word,r,c,dr:dir[0],dc:dir[1]});
      return true;
    }
  }
  return false;
}

function canPlace(word,r,c,[dr,dc]) {
  for (let i=0;i<word.length;i++) {
    const nr=r+dr*i, nc=c+dc*i;
    if (nr<0||nr>=wpRows||nc<0||nc>=wpCols) return false;
    if (wpGrid[nr][nc] && wpGrid[nr][nc]!==word[i]) return false;
  }
  return true;
}

function renderWPGrid() {
  const grid = document.getElementById('wp-grid');
  const cellSize = wpCols<=10?34:wpCols<=13?28:22;
  grid.style.gridTemplateColumns = `repeat(${wpCols},${cellSize}px)`;
  grid.innerHTML='';
  for (let r=0;r<wpRows;r++) for (let c=0;c<wpCols;c++) {
    const cell=document.createElement('div');
    cell.className='wp-cell';
    cell.style.width=cell.style.height=cellSize+'px';
    cell.style.fontSize=(cellSize-14)+'px';
    cell.textContent=wpGrid[r][c];
    cell.dataset.r=r; cell.dataset.c=c;
    cell.addEventListener('click', ()=>wpTapCell(r,c));
    grid.appendChild(cell);
  }
  updateWPStyles();
}

function wpTapCell(r, c) {
  // If already found cell, ignore
  const el = document.querySelector(`.wp-cell[data-r="${r}"][data-c="${c}"]`);
  if (el && el.classList.contains('found')) return;

  if (!wpFirstClick) {
    // First tap — start selection
    wpFirstClick = {r,c};
    wpSelection = [{r,c}];
    updateWPStyles();
    return;
  }

  const start = wpFirstClick;
  const dr = r - start.r;
  const dc = c - start.c;

  // Must be on same row, col, or diagonal
  const onLine =
    dr===0 || dc===0 ||
    (Math.abs(dr)===Math.abs(dc));

  if (!onLine) {
    // Invalid — restart selection from this cell
    wpFirstClick = {r,c};
    wpSelection = [{r,c}];
    updateWPStyles();
    return;
  }

  // Build selection from start to this cell
  const stepR = dr===0?0:Math.sign(dr);
  const stepC = dc===0?0:Math.sign(dc);
  wpSelection=[];
  let cr=start.r, cc=start.c;
  while(true) {
    wpSelection.push({r:cr,c:cc});
    if(cr===r&&cc===c) break;
    cr+=stepR; cc+=stepC;
    if(cr<0||cr>=wpRows||cc<0||cc>=wpCols) break;
  }

  // Check if tapping same cell as first — treat as deselect
  if (r===start.r && c===start.c) {
    wpFirstClick=null; wpSelection=[];
    updateWPStyles(); return;
  }

  // Check word
  const word    = wpSelection.map(({r,c})=>wpGrid[r][c]).join('');
  const wordRev = [...word].reverse().join('');
  let found=null;
  for (const placed of wpWordsPlaced) {
    if ((placed.word===word||placed.word===wordRev) && !wpFoundWords.includes(placed.word)) {
      found=placed; break;
    }
  }

  if (found) {
    wpFoundWords.push(found.word);
    document.getElementById('wp-found').textContent=wpFoundWords.length;
    wpSelection.forEach(({r,c})=>{
      const el=document.querySelector(`.wp-cell[data-r="${r}"][data-c="${c}"]`);
      if(el) el.classList.add('found');
    });
    renderWPWords();
    wpFirstClick=null; wpSelection=[];
    if(wpFoundWords.length===wpWordsPlaced.length) {
      stopAllTimers();
      const t=document.getElementById('wp-time').textContent;
      showMsg('🎉','Parabéns!',`Todas as palavras encontradas em ${t}!`,initWP);
    }
  }
  // Keep selection visible so she can see what she picked
  updateWPStyles();
}

function updateWPStyles() {
  const selSet=new Set(wpSelection.map(({r,c})=>`${r},${c}`));
  // First click highlight
  document.querySelectorAll('.wp-cell').forEach(cell=>{
    const key=`${cell.dataset.r},${cell.dataset.c}`;
    if(!cell.classList.contains('found')) {
      cell.classList.toggle('selected', selSet.has(key));
      cell.classList.toggle('first-pick',
        wpFirstClick && +cell.dataset.r===wpFirstClick.r && +cell.dataset.c===wpFirstClick.c && !selSet.has(key));
    }
  });
}

function renderWPWords() {
  const el=document.getElementById('wp-words');
  el.innerHTML='';
  wpWordsPlaced.forEach(({word})=>{
    const span=document.createElement('span');
    span.className='wp-word'+(wpFoundWords.includes(word)?' found':'');
    span.textContent=word;
    el.appendChild(span);
  });
}

function wpHint() {
  const remaining=wpWordsPlaced.filter(p=>!wpFoundWords.includes(p.word));
  if(!remaining.length) return;
  const pick=remaining[Math.floor(Math.random()*remaining.length)];
  const el=document.querySelector(`.wp-cell[data-r="${pick.r}"][data-c="${pick.c}"]`);
  if(el){el.style.background='#FFE066';setTimeout(()=>el.style.background='',1500);}
}
