// ══════════════════════════════════════
// JOGO DA VELHA (contra IA)
// ══════════════════════════════════════
let velhaBoard = Array(9).fill(null);
let velhaGameOver = false;

function initVelha() {
  velhaBoard = Array(9).fill(null);
  velhaGameOver = false;
  document.getElementById('velha-status').textContent = 'Sua vez — você é o ⭕';
  renderVelha();
}

function renderVelha() {
  const board = document.getElementById('velha-board');
  board.innerHTML = '';
  const wins = getVelhaWins(velhaBoard);
  const winCells = wins ? new Set(wins) : new Set();

  velhaBoard.forEach((val, i) => {
    const cell = document.createElement('div');
    cell.className = 'velha-cell' + (winCells.has(i)?' win':'');
    cell.textContent = val==='O'?'⭕':val==='X'?'❌':'';
    if (!val && !velhaGameOver) cell.addEventListener('click', ()=>velhaMove(i));
    board.appendChild(cell);
  });
}

function velhaMove(i) {
  if (velhaBoard[i] || velhaGameOver) return;
  velhaBoard[i] = 'O';
  renderVelha();

  const w = checkVelhaWinner(velhaBoard);
  if (w==='O') {
    velhaGameOver = true;
    document.getElementById('velha-status').textContent = '🎉 Você ganhou!';
    setTimeout(()=>showMsg('🎉','Você venceu!','Parabéns! Você ganhou no Jogo da Velha!',initVelha),300);
    return;
  }
  if (velhaBoard.every(c=>c)) {
    velhaGameOver = true;
    document.getElementById('velha-status').textContent = '🤝 Empate!';
    setTimeout(()=>showMsg('🤝','Empate!','Ninguém ganhou dessa vez. Tente de novo!',initVelha),300);
    return;
  }

  document.getElementById('velha-status').textContent = '🤔 Computador pensando...';
  setTimeout(() => {
    const move = getBestMove(velhaBoard);
    if (move !== -1) velhaBoard[move] = 'X';
    renderVelha();
    const w2 = checkVelhaWinner(velhaBoard);
    if (w2==='X') {
      velhaGameOver = true;
      document.getElementById('velha-status').textContent = '😔 Computador ganhou!';
      setTimeout(()=>showMsg('😔','Computador ganhou','Não desanime — tente de novo!',initVelha),300);
    } else if (velhaBoard.every(c=>c)) {
      velhaGameOver = true;
      document.getElementById('velha-status').textContent = '🤝 Empate!';
      setTimeout(()=>showMsg('🤝','Empate!','Ninguém ganhou dessa vez!',initVelha),300);
    } else {
      document.getElementById('velha-status').textContent = 'Sua vez — você é o ⭕';
    }
  }, 500);
}

function checkVelhaWinner(board) {
  const lines=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  for (const [a,b,c] of lines) {
    if (board[a] && board[a]===board[b] && board[b]===board[c]) return board[a];
  }
  return null;
}

function getVelhaWins(board) {
  const lines=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  for (const line of lines) {
    const [a,b,c]=line;
    if (board[a] && board[a]===board[b] && board[b]===board[c]) return line;
  }
  return null;
}

function getBestMove(board) {
  // Minimax
  let best = -Infinity, move = -1;
  for (let i=0;i<9;i++) {
    if (!board[i]) {
      board[i]='X';
      const score = minimax(board, 0, false);
      board[i]=null;
      if (score > best) { best=score; move=i; }
    }
  }
  return move;
}

function minimax(board, depth, isMax) {
  const w = checkVelhaWinner(board);
  if (w==='X') return 10-depth;
  if (w==='O') return depth-10;
  if (board.every(c=>c)) return 0;
  if (isMax) {
    let best=-Infinity;
    for (let i=0;i<9;i++) {
      if (!board[i]) { board[i]='X'; best=Math.max(best,minimax(board,depth+1,false)); board[i]=null; }
    }
    return best;
  } else {
    let best=Infinity;
    for (let i=0;i<9;i++) {
      if (!board[i]) { board[i]='O'; best=Math.min(best,minimax(board,depth+1,true)); board[i]=null; }
    }
    return best;
  }
}
