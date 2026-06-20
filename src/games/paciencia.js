// ══════════════════════════════════════
// PACIÊNCIA (Klondike Solitaire)
// ══════════════════════════════════════
const SUITS = ['♠','♥','♦','♣'];
const SUIT_NAMES = ['spades','hearts','diamonds','clubs'];
const RANKS = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];

let solStock = [], solWaste = [], solFoundations = [[],[],[],[]], solTableau = [[],[],[],[],[],[],[]];
let solSelectedFrom = null; // {area, col, idx}
let solScore = 0, solMoves = 0;

function makeDeck() {
  const deck = [];
  for (let s=0;s<4;s++) for (let r=0;r<13;r++) {
    deck.push({suit:s, rank:r, faceUp:false});
  }
  return shuffle(deck);
}

function cardColor(suit) { return suit===1||suit===2?'red':'black'; }
function cardLabel(card) { return RANKS[card.rank]+SUITS[card.suit]; }

function initSolitaire() {
  stopAllTimers();
  solScore=0; solMoves=0;
  document.getElementById('sol-score').textContent='0';
  document.getElementById('sol-moves').textContent='0';
  document.getElementById('sol-time').textContent='00:00';
  solSelectedFrom=null;
  solFoundations=[[],[],[],[]];
  solTableau=[[],[],[],[],[],[],[]];

  const deck=makeDeck();
  let di=0;
  for (let col=0;col<7;col++) {
    for (let row=0;row<=col;row++) {
      const card={...deck[di++]};
      card.faceUp=row===col;
      solTableau[col].push(card);
    }
  }
  solStock=deck.slice(di).map(c=>({...c,faceUp:false}));
  solWaste=[];

  renderSolitaire();
  startTimer('sol','sol-time');
}

function renderSolitaire() {
  // Foundations
  for (let i=0;i<4;i++) {
    const el=document.getElementById(`sol-f${i}`);
    el.innerHTML='';
    if (solFoundations[i].length) {
      const card=solFoundations[i][solFoundations[i].length-1];
      el.appendChild(makeCardEl(card,{area:'foundation',col:i}));
    } else {
      el.textContent=SUITS[i];
    }
  }
  // Stock
  const stock=document.getElementById('sol-stock');
  stock.innerHTML='';
  if (solStock.length) {
    const back=document.createElement('div');
    back.className='sol-card face-down';
    stock.appendChild(back);
  } else {
    stock.innerHTML='🔄<br><small>Reset</small>';
  }
  // Waste
  const waste=document.getElementById('sol-waste');
  waste.innerHTML='';
  if (solWaste.length) {
    const card=solWaste[solWaste.length-1];
    waste.appendChild(makeCardEl(card,{area:'waste',col:0,idx:solWaste.length-1}));
  }
  // Tableau
  const tab=document.getElementById('sol-tableau');
  tab.innerHTML='';
  for (let col=0;col<7;col++) {
    const colEl=document.createElement('div');
    colEl.className='sol-col';
    colEl.dataset.col=col;
    colEl.style.minHeight='80px';
    if (!solTableau[col].length) {
      const slot=document.createElement('div');
      slot.className='sol-card-slot';
      slot.textContent='K';
      slot.addEventListener('click',()=>solClickCol(col,-1));
      colEl.appendChild(slot);
    }
    solTableau[col].forEach((card,idx)=>{
      const el=makeCardEl(card,{area:'tableau',col,idx});
      el.style.marginTop=idx>0?'-60px':'0';
      colEl.appendChild(el);
    });
    tab.appendChild(colEl);
  }
  checkSolWin();
}

function makeCardEl(card, loc) {
  const el=document.createElement('div');
  if (!card.faceUp) { el.className='sol-card face-down'; return el; }
  el.className=`sol-card ${cardColor(card.suit)}`;
  // Is selected?
  if (solSelectedFrom && solSelectedFrom.area===loc.area && solSelectedFrom.col===loc.col) {
    if (loc.area==='waste' || (loc.area==='tableau' && solSelectedFrom.idx===loc.idx)) {
      el.classList.add('selected-card');
    }
  }
  el.innerHTML=`<span>${RANKS[card.rank]}</span><span class="suit">${SUITS[card.suit]}</span>`;
  el.addEventListener('click',()=>solClick(loc));
  return el;
}

function solClick(loc) {
  const {area,col,idx}=loc;
  // If nothing selected — select
  if (!solSelectedFrom) {
    if (area==='waste') solSelectedFrom=loc;
    else if (area==='foundation') {} // can't pick from foundation in simple mode
    else if (area==='tableau') {
      const card=solTableau[col][idx];
      if (card && card.faceUp) solSelectedFrom=loc;
    }
    renderSolitaire();
    return;
  }
  // Already selected — try to move
  solTryMove(loc);
}

function solClickCol(col, idx) {
  if (!solSelectedFrom) return;
  solTryMove({area:'tableau',col,idx:-1});
}

function solTryMove(dest) {
  const src=solSelectedFrom;
  let card=null;
  let stackSize=1;

  if (src.area==='waste') card=solWaste[solWaste.length-1];
  else if (src.area==='tableau') {
    card=solTableau[src.col][src.idx];
    stackSize=solTableau[src.col].length-src.idx;
  }

  if (!card) { solSelectedFrom=null; renderSolitaire(); return; }

  let moved=false;

  if (dest.area==='foundation') {
    const f=solFoundations[dest.col];
    const topF=f.length?f[f.length-1]:null;
    if (stackSize===1 && canPlaceFoundation(card,topF,dest.col)) {
      f.push({...card});
      removeFromSource(src);
      moved=true;
      solScore+=10;
    }
  } else if (dest.area==='tableau') {
    const col=dest.col;
    const top=solTableau[col].length?solTableau[col][solTableau[col].length-1]:null;
    if (canPlaceTableau(card,top)) {
      const stack=src.area==='tableau'?solTableau[src.col].splice(src.idx):null;
      if (src.area==='waste') solTableau[col].push({...card,faceUp:true});
      else if (stack) solTableau[col].push(...stack.map(c=>({...c,faceUp:true})));
      if (src.area==='waste') solWaste.pop();
      // Flip next card in source col
      if (src.area==='tableau' && solTableau[src.col].length) {
        solTableau[src.col][solTableau[src.col].length-1].faceUp=true;
        solScore+=5;
      }
      moved=true;
      solScore+=5;
    }
  }

  if (moved) {
    solMoves++;
    document.getElementById('sol-score').textContent=solScore;
    document.getElementById('sol-moves').textContent=solMoves;
  }
  solSelectedFrom=null;
  renderSolitaire();
}

function removeFromSource(src) {
  if (src.area==='waste') solWaste.pop();
  else if (src.area==='tableau') {
    solTableau[src.col].splice(src.idx);
    if (solTableau[src.col].length) solTableau[src.col][solTableau[src.col].length-1].faceUp=true;
  }
}

function canPlaceFoundation(card, top, fi) {
  if (!top) return card.rank===0; // Ace
  return card.suit===top.suit && card.rank===top.rank+1;
}

function canPlaceTableau(card, top) {
  if (!top) return card.rank===12; // King
  return cardColor(card.suit)!==cardColor(top.suit) && card.rank===top.rank-1;
}

function solDrawCard() {
  if (solStock.length) {
    const card=solStock.pop();
    card.faceUp=true;
    solWaste.push(card);
  } else {
    // Reset
    solStock=[...solWaste.reverse().map(c=>({...c,faceUp:false}))];
    solWaste=[];
  }
  solSelectedFrom=null;
  renderSolitaire();
}

function checkSolWin() {
  if (solFoundations.every(f=>f.length===13)) {
    stopAllTimers();
    showMsg('🎉','Você ganhou!',`Parabéns! Paciência completa com ${solScore} pontos!`,initSolitaire);
  }
}

function solAutoComplete() {
  // Try to move cards to foundation automatically
  let moved=true;
  while(moved) {
    moved=false;
    // from waste
    if (solWaste.length) {
      const card=solWaste[solWaste.length-1];
      for (let fi=0;fi<4;fi++) {
        const f=solFoundations[fi];
        if (canPlaceFoundation(card,f.length?f[f.length-1]:null,fi)) {
          f.push(solWaste.pop()); moved=true; break;
        }
      }
    }
    // from tableau
    for (let col=0;col<7;col++) {
      if (!solTableau[col].length) continue;
      const card=solTableau[col][solTableau[col].length-1];
      if (!card.faceUp) continue;
      for (let fi=0;fi<4;fi++) {
        const f=solFoundations[fi];
        if (canPlaceFoundation(card,f.length?f[f.length-1]:null,fi)) {
          f.push(solTableau[col].pop());
          if (solTableau[col].length) solTableau[col][solTableau[col].length-1].faceUp=true;
          moved=true; break;
        }
      }
    }
  }
  renderSolitaire();
}

// Foundation click handlers
document.addEventListener('DOMContentLoaded',()=>{
  for (let i=0;i<4;i++) {
    const el=document.getElementById(`sol-f${i}`);
    if (el) el.addEventListener('click',()=>{
      if (solSelectedFrom) solTryMove({area:'foundation',col:i});
    });
  }
});
