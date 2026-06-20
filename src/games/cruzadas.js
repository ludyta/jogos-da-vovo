// ══════════════════════════════════════
// PALAVRAS CRUZADAS — temas + dificuldade
// Cada tema tem puzzles para 3 dificuldades
// ══════════════════════════════════════

const CW_BANK = {
  animais: {
    facil: [
      { size:8, words:[
        {word:'GATO', r:0,c:0,dir:'h', clue:'1→ Animal que mia'},
        {word:'GALINHA',r:0,c:0,dir:'v', clue:'1↓ Ave que dá ovos'},
        {word:'LOBO', r:2,c:2,dir:'h', clue:'2→ Animal selvagem da floresta'},
        {word:'LEÃO', r:4,c:0,dir:'h', clue:'3→ Rei da selva'},
        {word:'LAGO', r:0,c:5,dir:'v', clue:'4↓ Onde patos nadam'},
        {word:'RATO', r:6,c:0,dir:'h', clue:'5→ Pequeno roedor'},
        {word:'OVO',  r:2,c:6,dir:'v', clue:'6↓ O que a galinha bota'},
      ]}
    ],
    medio: [
      { size:10, words:[
        {word:'ELEFANTE',r:0,c:0,dir:'h', clue:'1→ Maior animal terrestre'},
        {word:'ESCAMA', r:0,c:0,dir:'v', clue:'1↓ Cobertura do peixe'},
        {word:'MACACO', r:2,c:3,dir:'h', clue:'2→ Primata esperto'},
        {word:'MIGRAR', r:0,c:8,dir:'v', clue:'3↓ O que as aves fazem no inverno'},
        {word:'COBRA', r:5,c:0,dir:'h', clue:'4→ Réptil sem pernas'},
        {word:'CASULO',r:4,c:4,dir:'v', clue:'5↓ Casa da borboleta'},
        {word:'RAPOSA',r:8,c:1,dir:'h', clue:'6→ Animal esperto da fábula'},
      ]}
    ],
    dificil: [
      { size:12, words:[
        {word:'CROCODILO', r:0,c:0,dir:'h', clue:'1→ Réptil de dentes afiados'},
        {word:'CAMALEÃO', r:0,c:0,dir:'v', clue:'1↓ Muda de cor'},
        {word:'ORNITORRINCO',r:2,c:0,dir:'h', clue:'2→ Mamífero que bota ovos'},
        {word:'MIGRAÇÃO',r:0,c:8,dir:'v', clue:'3↓ Viagem das aves'},
        {word:'HIBERNAR',r:5,c:2,dir:'h', clue:'4→ O que o urso faz no inverno'},
        {word:'CRISÁLIDA',r:8,c:0,dir:'h', clue:'5→ Fase da borboleta'},
        {word:'NOCTURNO',r:10,c:1,dir:'h', clue:'6→ Ativo de noite'},
      ]}
    ]
  },
  flores: {
    facil: [
      { size:8, words:[
        {word:'ROSA', r:0,c:0,dir:'h', clue:'1→ Flor muito perfumada'},
        {word:'RIO',  r:0,c:0,dir:'v', clue:'1↓ Curso de água'},
        {word:'CRAVO',r:2,c:0,dir:'h', clue:'2→ Flor vermelha cravada'},
        {word:'CAULE',r:0,c:4,dir:'v', clue:'3↓ Haste da planta'},
        {word:'LÍRIO',r:5,c:0,dir:'h', clue:'4→ Flor branca elegante'},
        {word:'LUAR', r:0,c:7,dir:'v', clue:'5↓ Luz da lua'},
        {word:'PÉTALA',r:4,c:2,dir:'h', clue:'6→ Folha da flor'},
      ]}
    ],
    medio: [
      { size:10, words:[
        {word:'GIRASSOL', r:0,c:0,dir:'h', clue:'1→ Segue o sol'},
        {word:'GARDÊNIA',r:0,c:0,dir:'v', clue:'1↓ Flor branca perfumada'},
        {word:'ORQUÍDEA',r:2,c:2,dir:'h', clue:'2→ Flor exótica tropical'},
        {word:'OSMOSE',  r:0,c:8,dir:'v', clue:'3↓ Como a planta absorve água'},
        {word:'LAVANDA', r:5,c:1,dir:'h', clue:'4→ Flor roxa calmante'},
        {word:'LÓTUS',   r:4,c:5,dir:'v', clue:'5↓ Flor sagrada oriental'},
        {word:'AZALEIA', r:8,c:0,dir:'h', clue:'6→ Arbusto com flores coloridas'},
      ]}
    ],
    dificil: [
      { size:12, words:[
        {word:'BOUGAINVILLEA',r:0,c:0,dir:'h', clue:'1→ Trepadeira colorida'},
        {word:'BROMÉLIA',r:0,c:0,dir:'v', clue:'1↓ Planta tropical brasileira'},
        {word:'ANTÚRIO',r:3,c:1,dir:'h', clue:'2→ Flor tropical vermelha'},
        {word:'HELICÔNIA',r:0,c:7,dir:'v', clue:'3↓ Flor tropical vistosa'},
        {word:'POLINIZAÇÃO',r:6,c:0,dir:'h', clue:'4→ Processo das abelhas'},
        {word:'CRISÂNTEMO',r:9,c:0,dir:'h', clue:'5→ Flor oriental'},
        {word:'FOTOSSÍNTESE',r:11,c:0,dir:'h', clue:'6→ Como a planta faz comida'},
      ]}
    ]
  },
  culinaria: {
    facil: [
      { size:8, words:[
        {word:'PÃO',  r:0,c:0,dir:'h', clue:'1→ Feito de farinha assada'},
        {word:'PAI',  r:0,c:0,dir:'v', clue:'1↓ Cabeça da família'},
        {word:'BOLO', r:2,c:0,dir:'h', clue:'2→ Doce de aniversário'},
        {word:'BROA', r:0,c:3,dir:'v', clue:'3↓ Pão de milho'},
        {word:'OVO',  r:4,c:0,dir:'h', clue:'4→ Ingrediente essencial'},
        {word:'SOPA', r:6,c:0,dir:'h', clue:'5→ Prato líquido quente'},
        {word:'SAL',  r:0,c:7,dir:'v', clue:'6↓ Tempero branco'},
      ]}
    ],
    medio: [
      { size:10, words:[
        {word:'FEIJÃO',r:0,c:0,dir:'h', clue:'1→ Base do prato brasileiro'},
        {word:'FAROFA',r:0,c:0,dir:'v', clue:'1↓ Acompanhamento com farinha'},
        {word:'TORTA', r:2,c:2,dir:'h', clue:'2→ Massa recheada assada'},
        {word:'TEMPERO',r:0,c:7,dir:'v', clue:'3↓ Dá sabor à comida'},
        {word:'VATAPÁ',r:5,c:0,dir:'h', clue:'4→ Prato da Bahia'},
        {word:'VINAGRE',r:4,c:4,dir:'v', clue:'5↓ Azedo, vai na salada'},
        {word:'MACARRÃO',r:8,c:0,dir:'h', clue:'6→ Massa italiana'},
      ]}
    ],
    dificil: [
      { size:12, words:[
        {word:'ESCONDIDINHO',r:0,c:0,dir:'h', clue:'1→ Purê com carne'},
        {word:'ESTROGONOFE',r:0,c:0,dir:'v', clue:'1↓ Prato com creme de leite'},
        {word:'BRIGADEIRO',r:2,c:1,dir:'h', clue:'2→ Doce brasileiro famoso'},
        {word:'BAUNILHA',r:0,c:9,dir:'v', clue:'3↓ Sabor de sorvete clássico'},
        {word:'MOQUECA',r:5,c:0,dir:'h', clue:'4→ Peixe no azeite de dendê'},
        {word:'CARAMELIZAR',r:8,c:0,dir:'h', clue:'5→ O que fazer com o açúcar'},
        {word:'QUINDIM',r:10,c:0,dir:'h', clue:'6→ Doce amarelo com coco'},
      ]}
    ]
  },
  familia: {
    facil: [
      { size:8, words:[
        {word:'MÃE', r:0,c:0,dir:'h', clue:'1→ Ela cuida de todos'},
        {word:'MAR', r:0,c:0,dir:'v', clue:'1↓ Grande extensão de água'},
        {word:'PAI', r:2,c:0,dir:'h', clue:'2→ Chefe da família'},
        {word:'PAZ', r:0,c:3,dir:'v', clue:'3↓ Harmonia em casa'},
        {word:'AVÓ', r:4,c:0,dir:'h', clue:'4→ Mãe da mãe'},
        {word:'AMOR',r:6,c:0,dir:'h', clue:'5→ Une a família'},
        {word:'ANEL',r:0,c:6,dir:'v', clue:'6↓ Símbolo do casamento'},
      ]}
    ],
    medio: [
      { size:10, words:[
        {word:'SAUDADE',r:0,c:0,dir:'h', clue:'1→ Sentimento só nosso'},
        {word:'SOGRA',  r:0,c:0,dir:'v', clue:'1↓ Mãe do marido'},
        {word:'CUNHADA',r:2,c:2,dir:'h', clue:'2→ Irmã do cônjuge'},
        {word:'CARINHO',r:0,c:8,dir:'v', clue:'3↓ Afeto com ternura'},
        {word:'BISNETA',r:5,c:0,dir:'h', clue:'4→ Filha da neta'},
        {word:'BATISMO',r:4,c:4,dir:'v', clue:'5↓ Sacramento do bebê'},
        {word:'MADRINHA',r:8,c:0,dir:'h', clue:'6→ Protetora do afilhado'},
      ]}
    ],
    dificil: [
      { size:12, words:[
        {word:'ANIVERSÁRIO',r:0,c:0,dir:'h', clue:'1→ Comemoração do nascimento'},
        {word:'APADRINHADO',r:0,c:0,dir:'v', clue:'1↓ Protegido pelo padrinho'},
        {word:'FRATERNIDADE',r:2,c:0,dir:'h', clue:'2→ Amor entre irmãos'},
        {word:'FIDELIDADE',r:0,c:9,dir:'v', clue:'3↓ Lealdade no casamento'},
        {word:'CASAMENTO',r:5,c:0,dir:'h', clue:'4→ União oficial'},
        {word:'CONSANGUÍNEO',r:8,c:0,dir:'h', clue:'5→ Parente de sangue'},
        {word:'LEALDADE',r:10,c:2,dir:'h', clue:'6→ Fidelidade à família'},
      ]}
    ]
  },
  geografia: {
    facil: [
      { size:8, words:[
        {word:'BRASIL',r:0,c:0,dir:'h', clue:'1→ Nosso país'},
        {word:'BELO',  r:0,c:0,dir:'v', clue:'1↓ Adjetivo para lindo'},
        {word:'PARIS', r:2,c:0,dir:'h', clue:'2→ Capital da França'},
        {word:'PERU',  r:0,c:5,dir:'v', clue:'3↓ País da América do Sul'},
        {word:'ROMA',  r:4,c:0,dir:'h', clue:'4→ Capital da Itália'},
        {word:'RIO',   r:2,c:4,dir:'v', clue:'5↓ Cidade do carnaval'},
        {word:'CHILE', r:6,c:0,dir:'h', clue:'6→ País longo e estreito'},
      ]}
    ],
    medio: [
      { size:10, words:[
        {word:'BRASÍLIA',r:0,c:0,dir:'h', clue:'1→ Capital do Brasil'},
        {word:'BELÉM',  r:0,c:0,dir:'v', clue:'1↓ Cidade da Amazônia'},
        {word:'AMAZÔNIA',r:2,c:1,dir:'h', clue:'2→ Maior floresta do mundo'},
        {word:'ATLÂNTICO',r:0,c:8,dir:'v', clue:'3↓ Oceano do Brasil'},
        {word:'PORTUGAL',r:5,c:0,dir:'h', clue:'4→ Nossa língua veio de lá'},
        {word:'PAMPA',  r:4,c:5,dir:'v', clue:'5↓ Planície do sul do Brasil'},
        {word:'SALVADOR',r:8,c:0,dir:'h', clue:'6→ Cidade da Bahia'},
      ]}
    ],
    dificil: [
      { size:12, words:[
        {word:'MEDITERRÂNEO',r:0,c:0,dir:'h', clue:'1→ Mar entre Europa e África'},
        {word:'MISSISSIPI',r:0,c:0,dir:'v', clue:'1↓ Grande rio americano'},
        {word:'HIMALAIA',r:3,c:0,dir:'h', clue:'2→ Montanhas mais altas'},
        {word:'HEMISFERIO',r:0,c:8,dir:'v', clue:'3↓ Metade do globo'},
        {word:'EQUADOR',r:6,c:0,dir:'h', clue:'4→ Linha que divide o globo'},
        {word:'TRÓPICOS',r:9,c:0,dir:'h', clue:'5→ Linhas do calor'},
        {word:'MERIDIANO',r:11,c:0,dir:'h', clue:'6→ Linha de longitude'},
      ]}
    ]
  },
  ciencias: {
    facil: [
      { size:8, words:[
        {word:'SOL',  r:0,c:0,dir:'h', clue:'1→ Nossa estrela'},
        {word:'SOM',  r:0,c:0,dir:'v', clue:'1↓ O que o ouvido capta'},
        {word:'LUA',  r:2,c:0,dir:'h', clue:'2→ Satélite da Terra'},
        {word:'LUZ',  r:0,c:3,dir:'v', clue:'3↓ O que o olho capta'},
        {word:'ÁGUA', r:4,c:0,dir:'h', clue:'4→ H₂O'},
        {word:'ÁTOMO',r:4,c:4,dir:'v', clue:'5↓ Menor parte da matéria'},
        {word:'CALOR',r:6,c:0,dir:'h', clue:'6→ Energia que aquece'},
      ]}
    ],
    medio: [
      { size:10, words:[
        {word:'OXIGÊNIO',r:0,c:0,dir:'h', clue:'1→ Gás que respiramos'},
        {word:'ÓRBITA',r:0,c:0,dir:'v', clue:'1↓ Caminho do planeta'},
        {word:'GRAVIDADE',r:2,c:1,dir:'h', clue:'2→ Força que nos prende ao chão'},
        {word:'GALÁXIA',r:0,c:8,dir:'v', clue:'3↓ Conjunto de estrelas'},
        {word:'ENERGIA',r:5,c:0,dir:'h', clue:'4→ Capacidade de fazer trabalho'},
        {word:'ECLIPSE',r:4,c:4,dir:'v', clue:'5↓ Quando um astro encobre outro'},
        {word:'CÉLULA', r:8,c:0,dir:'h', clue:'6→ Menor unidade de vida'},
      ]}
    ],
    dificil: [
      { size:12, words:[
        {word:'FOTOSSÍNTESE',r:0,c:0,dir:'h', clue:'1→ Plantas fazem comida com luz'},
        {word:'FISSÃO',r:0,c:0,dir:'v', clue:'1↓ Divisão do núcleo atômico'},
        {word:'TERMODINÂMICA',r:2,c:0,dir:'h', clue:'2→ Ciência do calor'},
        {word:'TELESCÓPIO',r:0,c:9,dir:'v', clue:'3↓ Observa estrelas distantes'},
        {word:'ELETRICIDADE',r:5,c:0,dir:'h', clue:'4→ Energia dos raios'},
        {word:'MAGNETISMO',r:8,c:0,dir:'h', clue:'5→ Força do ímã'},
        {word:'RELATIVIDADE',r:10,c:0,dir:'h', clue:'6→ Teoria de Einstein'},
      ]}
    ]
  },
  musica: {
    facil: [
      { size:8, words:[
        {word:'NOTA', r:0,c:0,dir:'h', clue:'1→ Dó, ré, mi...'},
        {word:'NATA', r:0,c:0,dir:'v', clue:'1↓ Creme do leite'},
        {word:'SOM',  r:2,c:0,dir:'h', clue:'2→ O que o ouvido escuta'},
        {word:'SOUL', r:0,c:3,dir:'v', clue:'3↓ Estilo musical americano'},
        {word:'VIOLA',r:4,c:0,dir:'h', clue:'4→ Instrumento de cordas caipira'},
        {word:'VOZ',  r:2,c:5,dir:'v', clue:'5↓ Instrumento natural do cantor'},
        {word:'RITMO',r:6,c:0,dir:'h', clue:'6→ Pulsação da música'},
      ]}
    ],
    medio: [
      { size:10, words:[
        {word:'GUITARRA',r:0,c:0,dir:'h', clue:'1→ Instrumento do rock'},
        {word:'GAITA',  r:0,c:0,dir:'v', clue:'1↓ Instrumento de sopro gaúcho'},
        {word:'VIOLINO',r:2,c:2,dir:'h', clue:'2→ Instrumento de corda clássico'},
        {word:'VIBRATO',r:0,c:8,dir:'v', clue:'3↓ Tremor bonito na voz'},
        {word:'BATERIA',r:5,c:0,dir:'h', clue:'4→ Instrumento de percussão'},
        {word:'BOSSANOVA',r:4,c:4,dir:'v', clue:'5↓ Estilo musical brasileiro'},
        {word:'MAESTRO',r:8,c:0,dir:'h', clue:'6→ Rege a orquestra'},
      ]}
    ],
    dificil: [
      { size:12, words:[
        {word:'CONTRABAIXO',r:0,c:0,dir:'h', clue:'1→ Instrumento grande de cordas'},
        {word:'CLARINETE',r:0,c:0,dir:'v', clue:'1↓ Instrumento de sopro de palheta'},
        {word:'SINFONIA',r:3,c:1,dir:'h', clue:'2→ Composição para orquestra'},
        {word:'SAXOFONE',r:0,c:8,dir:'v', clue:'3↓ Criado por Adolphe Sax'},
        {word:'HARMONIA',r:6,c:0,dir:'h', clue:'4→ Acordes combinados'},
        {word:'POLIFONIA',r:9,c:0,dir:'h', clue:'5→ Várias vozes juntas'},
        {word:'MODULAÇÃO',r:11,c:0,dir:'h', clue:'6→ Mudança de tonalidade'},
      ]}
    ]
  }
};

let cwTheme = 'animais';
let cwDiff  = 'facil';
let cwPuzzle = null;
let cwGrid   = [];
let cwAnswers = {};
let cwSize   = 8;

function setCWTheme(t, btn) {
  cwTheme = t;
  document.querySelectorAll('#crossword-screen .theme-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  initCrossword();
}

function setCWDiff(d, btn) {
  cwDiff = d;
  document.querySelectorAll('#crossword-screen .diff-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  initCrossword();
}

function initCrossword() {
  const pool = CW_BANK[cwTheme]?.[cwDiff];
  if (!pool || !pool.length) { initCrossword_fallback(); return; }
  cwPuzzle = pool[Math.floor(Math.random() * pool.length)];
  cwSize   = cwPuzzle.size;
  cwAnswers = {};

  // Build blank grid
  cwGrid = Array.from({length: cwSize}, () => Array(cwSize).fill(null));
  for (const w of cwPuzzle.words) {
    for (let i = 0; i < w.word.length; i++) {
      const r = w.r + (w.dir==='v' ? i : 0);
      const c = w.c + (w.dir==='h' ? i : 0);
      if (r < cwSize && c < cwSize) cwGrid[r][c] = {solution: w.word[i], number: null};
    }
  }
  // Assign numbers
  let num = 1;
  const numbered = {};
  for (const w of cwPuzzle.words) {
    const key = `${w.r},${w.c}`;
    if (!numbered[key]) numbered[key] = num++;
    if (cwGrid[w.r] && cwGrid[w.r][w.c] && !cwGrid[w.r][w.c].number)
      cwGrid[w.r][w.c].number = numbered[key];
  }

  renderCWGrid();
  renderCWClues();
}

function initCrossword_fallback() {
  // Generic easy puzzle as fallback
  cwTheme = 'animais'; cwDiff = 'facil';
  initCrossword();
}

function renderCWGrid() {
  const grid = document.getElementById('crossword-grid');
  const cellSize = cwSize <= 8 ? 40 : cwSize <= 10 ? 36 : 30;
  grid.style.gridTemplateColumns = `repeat(${cwSize}, ${cellSize}px)`;
  grid.innerHTML = '';

  for (let r = 0; r < cwSize; r++) for (let c = 0; c < cwSize; c++) {
    const cell = document.createElement('div');
    cell.style.width = cell.style.height = cellSize + 'px';
    if (!cwGrid[r][c]) {
      cell.className = 'cw-cell black';
    } else {
      const val = cwAnswers[`${r},${c}`] || '';
      const correct = val && val === cwGrid[r][c].solution;
      cell.className = 'cw-cell' + (correct ? ' correct' : '');
      if (cwGrid[r][c].number) {
        const num = document.createElement('span');
        num.className = 'cw-number';
        num.textContent = cwGrid[r][c].number;
        cell.appendChild(num);
      }
      const inp = document.createElement('input');
      inp.type = 'text'; inp.maxLength = 1; inp.value = val;
      inp.style.fontSize = (cellSize - 16) + 'px';
      inp.dataset.r = r; inp.dataset.c = c;
      inp.addEventListener('input', e => {
        const v = e.target.value.toUpperCase().replace(/[^A-ZÁÉÍÓÚÃÕÂÊÎÔÛÇ]/g, '');
        cwAnswers[`${r},${c}`] = v; e.target.value = v;
        cell.classList.toggle('correct', v === cwGrid[r][c].solution);
        checkCWWin();
      });
      cell.appendChild(inp);
    }
    grid.appendChild(cell);
  }
}

function renderCWClues() {
  const across = cwPuzzle.words.filter(w => w.dir === 'h');
  const down   = cwPuzzle.words.filter(w => w.dir === 'v');
  document.getElementById('cw-clues').innerHTML = `
    <div><h3>→ Horizontal</h3><ul>${across.map(w=>`<li>${w.clue}</li>`).join('')}</ul></div>
    <div><h3>↓ Vertical</h3><ul>${down.map(w=>`<li>${w.clue}</li>`).join('')}</ul></div>`;
}

function checkCWWin() {
  let total = 0, correct = 0;
  for (let r = 0; r < cwSize; r++) for (let c = 0; c < cwSize; c++) {
    if (cwGrid[r][c]) { total++; if (cwAnswers[`${r},${c}`] === cwGrid[r][c].solution) correct++; }
  }
  if (correct === total && total > 0)
    showMsg('🎉', 'Parabéns!', 'Você completou as palavras cruzadas!', initCrossword);
}

function cwReveal() {
  for (let r = 0; r < cwSize; r++) for (let c = 0; c < cwSize; c++)
    if (cwGrid[r][c]) cwAnswers[`${r},${c}`] = cwGrid[r][c].solution;
  renderCWGrid();
}
