// ══════════════════════════════════════
// DAMA (Checkers simplificado)
// ══════════════════════════════════════
// Board: 8x8, pieces on dark squares
// player=1 (red, moves up), ai=2 (black, moves down)
// king=3(player king), 4(ai king)

let ckBoard = [];
let ckSelected = null;
let ckValidMoves = [];
let ckTurn = 'player'; // player or ai
let ckGameOver = false;

function initCheckers() {
  ckGameOver = false;
  ckSelected = null;
  ckValidMoves = [];
  ckTurn = 'player';
  ckBoard = Array.from({length:8},()=>Array(8).fill(0));

  // Place pieces on dark squares
  for (let r=0;r<3;r++) for (let c=0;c<8;c++) {
    if ((r+c)%2===1) ckBoard[r][c]=2; // ai black pieces top
  }
  for (let r=5;r<8;r++) for (let c=0;c<8;c++) {
    if ((r+c)%2===1) ckBoard[r][c]=1; // player red pieces bottom
  }

  document.getElementById('checkers-status').textContent='Sua vez — você é o 🔴';
  renderCheckers();
}

function renderCheckers() {
  const board = document.getElementById('checkers-board');
  board.innerHTML='';
  const validSet = new Set(ckValidMoves.map(m=>`${m.tr},${m.tc}`));

  for (let r=0;r<8;r++) for (let c=0;c<8;c++) {
    const cell=document.createElement('div');
    cell.className=`ch-cell ${(r+c)%2===0?'light':'dark'}`;
    const key=`${r},${c}`;
    if (validSet.has(key)) cell.classList.add('highlight');

    const p=ckBoard[r][c];
    if (p) {
      const piece=document.createElement('div');
      const isPlayer=p===1||p===3;
      piece.className=`ch-piece ${isPlayer?'player':'ai'}`;
      if (p===3||p===4) piece.textContent='👑';
      if (ckSelected && ckSelected[0]===r && ckSelected[1]===c) piece.classList.add('selected');
      cell.appendChild(piece);
    }

    cell.addEventListener('click',()=>ckClick(r,c));
    board.appendChild(cell);
  }
}

function ckClick(r,c) {
  if (ckTurn!=='player'||ckGameOver) return;
  const p=ckBoard[r][c];
  const isPlayer=p===1||p===3;

  // If clicking a valid destination
  if (ckSelected && ckValidMoves.find(m=>m.tr===r&&m.tc===c)) {
    ckExecuteMove(ckSelected[0],ckSelected[1],r,c);
    return;
  }

  // Select own piece
  if (isPlayer) {
    ckSelected=[r,c];
    ckValidMoves=getValidMoves(r,c,p);
    renderCheckers();
  } else {
    ckSelected=null; ckValidMoves=[];
    renderCheckers();
  }
}

function getValidMoves(r,c,p) {
  const moves=[];
  const isKing=p===3||p===4;
  const isPlayer=p===1||p===3;
  const dirs=isPlayer?[[-1,-1],[-1,1]]:[[1,-1],[1,1]];
  if (isKing) dirs.push(...(isPlayer?[[1,-1],[1,1]]:[ [-1,-1],[-1,1]]));

  for (const [dr,dc] of dirs) {
    const nr=r+dr, nc=c+dc;
    if (nr<0||nr>=8||nc<0||nc>=8) continue;
    const target=ckBoard[nr][nc];
    if (!target) { moves.push({tr:nr,tc:nc,jumped:null}); continue; }
    // Check jump
    const isEnemy=isPlayer?(target===2||target===4):(target===1||target===3);
    if (isEnemy) {
      const jr=nr+dr, jc=nc+dc;
      if (jr>=0&&jr<8&&jc>=0&&jc<8&&!ckBoard[jr][jc]) {
        moves.push({tr:jr,tc:jc,jumped:[nr,nc]});
      }
    }
  }
  return moves;
}

function ckExecuteMove(fr,fc,tr,tc) {
  const move=ckValidMoves.find(m=>m.tr===tr&&m.tc===tc);
  if (!move) return;

  const p=ckBoard[fr][fc];
  ckBoard[fr][fc]=0;
  if (move.jumped) ckBoard[move.jumped[0]][move.jumped[1]]=0;

  // King promotion
  let newP=p;
  if (p===1&&tr===0) newP=3;
  if (p===2&&tr===7) newP=4;
  ckBoard[tr][tc]=newP;

  ckSelected=null; ckValidMoves=[];
  renderCheckers();

  if (checkCkWinner()) return;

  ckTurn='ai';
  document.getElementById('checkers-status').textContent='⚫ Computador pensando...';
  setTimeout(doAIMove,700);
}

function doAIMove() {
  if (ckGameOver) return;
  const allMoves=[];
  for (let r=0;r<8;r++) for (let c=0;c<8;c++) {
    const p=ckBoard[r][c];
    if (p===2||p===4) {
      const moves=getValidMoves(r,c,p);
      moves.forEach(m=>allMoves.push({fr:r,fc:c,...m}));
    }
  }
  if (!allMoves.length) {
    ckGameOver=true;
    document.getElementById('checkers-status').textContent='🎉 Você ganhou!';
    showMsg('🎉','Você venceu!','Parabéns! O computador ficou sem movimentos!',initCheckers);
    return;
  }

  // Prefer jumps, else random
  const jumps=allMoves.filter(m=>m.jumped);
  const pick=(jumps.length?jumps:allMoves)[Math.floor(Math.random()*(jumps.length||allMoves.length))];

  const p=ckBoard[pick.fr][pick.fc];
  ckBoard[pick.fr][pick.fc]=0;
  if (pick.jumped) ckBoard[pick.jumped[0]][pick.jumped[1]]=0;
  let newP=p;
  if (p===2&&pick.tr===7) newP=4;
  ckBoard[pick.tr][pick.tc]=newP;

  ckTurn='player';
  renderCheckers();
  if (!checkCkWinner()) {
    document.getElementById('checkers-status').textContent='Sua vez — você é o 🔴';
  }
}

function checkCkWinner() {
  let hasPlayer=false,hasAI=false;
  for (let r=0;r<8;r++) for (let c=0;c<8;c++) {
    if (ckBoard[r][c]===1||ckBoard[r][c]===3) hasPlayer=true;
    if (ckBoard[r][c]===2||ckBoard[r][c]===4) hasAI=true;
  }
  if (!hasPlayer) {
    ckGameOver=true;
    document.getElementById('checkers-status').textContent='😔 Computador ganhou!';
    setTimeout(()=>showMsg('😔','Computador ganhou','Não desanime — tente de novo!',initCheckers),200);
    return true;
  }
  if (!hasAI) {
    ckGameOver=true;
    document.getElementById('checkers-status').textContent='🎉 Você ganhou!';
    setTimeout(()=>showMsg('🎉','Você venceu!','Incrível! Você capturou todas as peças!',initCheckers),200);
    return true;
  }
  return false;
}
