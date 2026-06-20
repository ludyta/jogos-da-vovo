// ══════════════════════════════════════
// PACIÊNCIA SPIDER (2 naipes — Médio)
// ══════════════════════════════════════
const SP_SUITS  = ['♠','♥'];
const SP_RANKS  = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];

let spTableau = []; // 10 colunas
let spStock   = []; // pilhas de 10 para comprar
let spCompleted = 0; // sequências completas removidas
let spMoves   = 0;
let spSelected = null; // {col, idx}
let spGameOver = false;

function makeSpiderDeck() {
  // 2 naipes × 4 cópias × 13 = 104 cartas
  const deck = [];
  for (let copy = 0; copy < 4; copy++) {
    for (const suit of SP_SUITS) {
      for (let r = 0; r < 13; r++) {
        deck.push({suit, rank: SP_RANKS[r], rankIdx: r, faceUp: false, id: `${suit}${r}c${copy}`});
      }
    }
  }
  return shuffle(deck);
}

function initSolitaire() {
  stopAllTimers();
  spCompleted = 0; spMoves = 0; spSelected = null; spGameOver = false;
  document.getElementById('sol-score').textContent  = '0';
  document.getElementById('sol-moves').textContent  = '0';
  document.getElementById('sol-time').textContent   = '00:00';

  const deck = makeSpiderDeck();
  spTableau = Array.from({length:10}, () => []);
  // Deal: cols 0-3 get 6 cards, cols 4-9 get 5 cards
  for (let col = 0; col < 10; col++) {
    const count = col < 4 ? 6 : 5;
    for (let i = 0; i < count; i++) {
      const card = deck.pop();
      card.faceUp = i === count - 1;
      spTableau[col].push(card);
    }
  }
  // Remaining 50 cards split into 5 groups of 10
  spStock = [];
  for (let i = 0; i < 5; i++) {
    spStock.push(deck.splice(0, 10));
  }

  renderSpider();
  startTimer('sol','sol-time');
}

function spGetMovableStack(col, idx) {
  // Stack from idx to end must be same suit, descending rank
  const stack = spTableau[col].slice(idx);
  if (!stack.every(c => c.faceUp)) return null;
  for (let i = 1; i < stack.length; i++) {
    if (stack[i].suit !== stack[0].suit) return null;
    if (stack[i].rankIdx !== stack[i-1].rankIdx - 1) return null;
  }
  return stack;
}

function spCanPlace(card, targetCol) {
  const col = spTableau[targetCol];
  if (col.length === 0) return true;
  const top = col[col.length - 1];
  if (!top.faceUp) return false;
  return card.rankIdx === top.rankIdx - 1;
}

function spClick(col, idx) {
  if (spGameOver) return;
  const card = spTableau[col][idx];
  if (!card.faceUp) return;

  if (!spSelected) {
    const stack = spGetMovableStack(col, idx);
    if (stack) { spSelected = {col, idx}; renderSpider(); }
    return;
  }

  // Clicking same column — deselect
  if (spSelected.col === col) { spSelected = null; renderSpider(); return; }

  // Try to move
  const stack = spGetMovableStack(spSelected.col, spSelected.idx);
  if (stack && spCanPlace(stack[0], col)) {
    // Move stack
    const moved = spTableau[spSelected.col].splice(spSelected.idx);
    spTableau[col].push(...moved);
    // Flip top of source
    const src = spTableau[spSelected.col];
    if (src.length && !src[src.length-1].faceUp) src[src.length-1].faceUp = true;
    spMoves++;
    document.getElementById('sol-moves').textContent = spMoves;
    spSelected = null;
    checkSpiderComplete();
    renderSpider();
  } else {
    // Try selecting new stack
    const newStack = spGetMovableStack(col, idx);
    spSelected = newStack ? {col, idx} : null;
    renderSpider();
  }
}

function checkSpiderComplete() {
  for (let col = 0; col < 10; col++) {
    const pile = spTableau[col];
    if (pile.length < 13) continue;
    // Check if top 13 form a complete K→A sequence same suit
    const start = pile.length - 13;
    const seq = pile.slice(start);
    if (seq[0].rankIdx === 12 && seq.every((c,i) => c.faceUp && c.suit === seq[0].suit && c.rankIdx === 12-i)) {
      spTableau[col].splice(start, 13);
      spCompleted++;
      document.getElementById('sol-score').textContent = spCompleted * 100;
      if (spCompleted === 8) {
        stopAllTimers();
        showMsg('🎉','Você ganhou!','Parabéns! Completou o Spider Paciência!',initSolitaire);
      }
    }
  }
}

function spDeal() {
  if (!spStock.length) return;
  // Each column must have at least 1 card
  const batch = spStock.pop();
  for (let col = 0; col < 10; col++) {
    const card = batch[col];
    card.faceUp = true;
    spTableau[col].push(card);
  }
  spMoves++;
  document.getElementById('sol-moves').textContent = spMoves;
  spSelected = null;
  checkSpiderComplete();
  renderSpider();
}

function renderSpider() {
  // Update stock button
  const stockEl = document.getElementById('sol-stock');
  stockEl.innerHTML = '';
  if (spStock.length > 0) {
    const back = document.createElement('div');
    back.className = 'sol-card face-down';
    back.style.cursor = 'pointer';
    back.onclick = spDeal;
    const lbl = document.createElement('div');
    lbl.style.cssText = 'position:absolute;bottom:2px;right:4px;font-size:10px;color:rgba(255,255,255,.7)';
    lbl.textContent = `×${spStock.length}`;
    back.appendChild(lbl);
    stockEl.appendChild(back);
  } else {
    stockEl.innerHTML = '<div style="font-size:11px;color:#aaa;text-align:center">Sem<br>cartas</div>';
  }

  // Hide waste & foundations (not used in Spider)
  const waste = document.getElementById('sol-waste');
  if (waste) waste.innerHTML = `<div style="font-size:12px;color:var(--green);text-align:center;line-height:1.3">✅ ${spCompleted}<br><small>séries</small></div>`;
  const founds = document.getElementById('sol-foundations');
  if (founds) founds.style.display = 'none';

  // Render tableau
  const tab = document.getElementById('sol-tableau');
  tab.innerHTML = '';
  for (let col = 0; col < 10; col++) {
    const colEl = document.createElement('div');
    colEl.className = 'sol-col';
    colEl.style.minHeight = '80px';
    if (!spTableau[col].length) {
      const slot = document.createElement('div');
      slot.className = 'sol-card-slot';
      slot.style.cursor = 'pointer';
      slot.onclick = () => { if (spSelected) spClick(col, -1); };
      colEl.appendChild(slot);
    }
    spTableau[col].forEach((card, idx) => {
      const el = makeSpiderCardEl(card, col, idx);
      el.style.marginTop = idx > 0 ? '-58px' : '0';
      colEl.appendChild(el);
    });
    tab.appendChild(colEl);
  }
}

function makeSpiderCardEl(card, col, idx) {
  const el = document.createElement('div');
  if (!card.faceUp) {
    el.className = 'sol-card face-down';
    return el;
  }
  const isRed = card.suit === '♥';
  const isSelected = spSelected && spSelected.col === col && idx >= spSelected.idx;
  el.className = `sol-card ${isRed?'red':'black'}${isSelected?' selected-card':''}`;
  el.innerHTML = `<span>${card.rank}</span><span class="suit">${card.suit}</span>`;
  el.addEventListener('click', () => spClick(col, idx));
  return el;
}

// Auto-complete: find any valid move
function solAutoComplete() {
  // Find easiest move
  for (let srcCol = 0; srcCol < 10; srcCol++) {
    for (let idx = 0; idx < spTableau[srcCol].length; idx++) {
      const stack = spGetMovableStack(srcCol, idx);
      if (!stack) continue;
      for (let dstCol = 0; dstCol < 10; dstCol++) {
        if (dstCol === srcCol) continue;
        if (spCanPlace(stack[0], dstCol)) {
          const moved = spTableau[srcCol].splice(idx);
          spTableau[dstCol].push(...moved);
          const src = spTableau[srcCol];
          if (src.length && !src[src.length-1].faceUp) src[src.length-1].faceUp = true;
          spMoves++;
          document.getElementById('sol-moves').textContent = spMoves;
          checkSpiderComplete();
          renderSpider();
          return;
        }
      }
    }
  }
  showMsg('💭','Sem movimento automático','Não encontrei um movimento óbvio. Tente reorganizar as colunas!',null);
}
