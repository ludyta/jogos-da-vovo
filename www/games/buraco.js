// ══════════════════════════════════════════════════════
// BURACO — 1 jogadora vs Computador
// Regras: 2 baralhos (104 cartas + 4 coringas = 108)
// Canastras: sequência de 7+ ou conjunto de 7+
// Buraco Aberto / Buraco Fechado
// Dificuldade: Fácil / Médio / Difícil
// ══════════════════════════════════════════════════════

const BUR_SUITS  = ['♠','♥','♦','♣'];
const BUR_RANKS  = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
const BUR_RANKV  = {A:15,2:3,3:3,4:3,5:3,6:3,7:4,8:4,9:4,'10':4,J:5,Q:5,K:5};

let burStock=[], burDiscard=[];
let burHand=[], burAIHand=[];
let burMelds=[], burAIMelds=[];   // [{cards:[], type:'set'|'seq', locked:false}]
let burDrawn=false, burGameOver=false;
let burType='aberto'; // aberto | fechado
let burDiff='facil';
let burScore=0, burAIScore=0;
let burSelectedCards=[];
let burPhase='draw'; // draw | play | discard
let burMeldTarget=null; // index of meld being built
let burRound=1;
let burBuracoTaken=false, burAIBuracoTaken=false;

// ── Deck ──
function makeBurDeck() {
  const deck=[];
  for (let d=0;d<2;d++) {
    for (const suit of BUR_SUITS) {
      for (const rank of BUR_RANKS) {
        deck.push({rank,suit,id:`${rank}${suit}${d}`,wild:false});
      }
    }
    deck.push({rank:'🃏',suit:'',id:`JK${d}a`,wild:true});
    deck.push({rank:'🃏',suit:'',id:`JK${d}b`,wild:true});
  }
  return shuffle(deck);
}

function cardVal(card) { return BUR_RANKV[card.rank]||3; }
function rankIdx(r) { return BUR_RANKS.indexOf(r); }
function isWild(c) { return c.wild || c.rank==='2'; }

// ── Init ──
function initBuraco(type, diff) {
  stopAllTimers();
  if (type) burType=type;
  if (diff) burDiff=diff;

  // Update UI buttons
  document.querySelectorAll('.bur-type-btn').forEach(b=>b.classList.toggle('active',b.dataset.type===burType));
  document.querySelectorAll('#buraco-screen .diff-btn').forEach(b=>b.classList.toggle('active',b.dataset.diff===burDiff));

  const deck=makeBurDeck();
  burHand   = deck.splice(0,11);
  burAIHand = deck.splice(0,11);
  // Two piles of 11 (buraco reserves) — hidden
  const pile1=deck.splice(0,11);
  const pile2=deck.splice(0,11);
  burStock  = deck;
  burDiscard= [];
  burMelds=[]; burAIMelds=[];
  burDrawn=false; burGameOver=false;
  burSelectedCards=[];
  burPhase='draw';
  burMeldTarget=null;
  burBuracoTaken=false; burAIBuracoTaken=false;
  burScore=0; burAIScore=0;
  burRound=1;

  // Store reserves on stock object for later
  burStock._reserve1=pile1;
  burStock._reserve2=pile2;

  sortHand(burHand);
  updateBuracoStatus('Sua vez: compre uma carta do monte ou do descarte');
  renderBuraco();
  startTimer('bur','bur-time');
}

function sortHand(hand) {
  hand.sort((a,b)=>{
    if (a.wild!==b.wild) return a.wild?1:-1; // wilds at end
    if (a.suit!==b.suit) return a.suit.localeCompare(b.suit);
    return rankIdx(a.rank)-rankIdx(b.rank);
  });
}

// ── Draw ──
function burDrawStock() {
  if (burPhase!=='draw'||burDrawn) return;
  if (!burStock.length) { burRefillStock(); }
  if (!burStock.length) return;
  const card=burStock.pop();
  burHand.push(card);
  sortHand(burHand);
  burDrawn=true;
  burPhase='play';
  updateBuracoStatus('Carta comprada! Forme combinações ou descarte.');
  renderBuraco();
}

function burDrawDiscard() {
  if (burPhase!=='draw'||burDrawn) return;
  if (!burDiscard.length) { updateBuracoStatus('Descarte vazio!'); return; }
  if (burType==='fechado') {
    // Must have a valid meld using top discard card
    const top=burDiscard[burDiscard.length-1];
    if (!canUseDiscard(top, burHand, burMelds)) {
      updateBuracoStatus('No Buraco Fechado, você precisa usar a carta do descarte numa combinação imediata!');
      return;
    }
    const card=burDiscard.pop();
    burHand.push(card);
    sortHand(burHand);
  } else {
    const card=burDiscard.pop();
    burHand.push(card);
    sortHand(burHand);
  }
  burDrawn=true;
  burPhase='play';
  updateBuracoStatus('Carta do descarte pega! Forme combinações ou descarte.');
  renderBuraco();
}

function canUseDiscard(card, hand, melds) {
  // Check if card can extend existing meld or form new one
  for (const m of melds) {
    if (canAddToMeld(card, m)) return true;
  }
  // Check if hand + card has a valid new meld
  const test=[...hand,card];
  return findBestMeld(test)!==null;
}

function burRefillStock() {
  if (burDiscard.length<2) return;
  const top=burDiscard.pop();
  burStock=[...burDiscard];
  shuffle(burStock);
  burDiscard=[top];
}

// ── Selection & Meld ──
function toggleBurCard(idx) {
  if (burPhase!=='play') return;
  const pos=burSelectedCards.indexOf(idx);
  if (pos===-1) burSelectedCards.push(idx);
  else burSelectedCards.splice(pos,1);
  renderBuraco();
}

function burMeld() {
  if (burPhase!=='play'||!burSelectedCards.length) return;
  const cards=burSelectedCards.map(i=>burHand[i]);

  // Try to match to existing meld
  if (burMeldTarget!==null) {
    const m=burMelds[burMeldTarget];
    let added=0;
    for (const card of cards) {
      if (canAddToMeld(card, m)) { m.cards.push(card); added++; }
    }
    if (added) {
      burSelectedCards.sort((a,b)=>b-a).forEach(i=>burHand.splice(i,1));
      burSelectedCards=[];
      sortHand(burHand);
      checkBuracoReserve();
      checkBurWin();
      renderBuraco();
      return;
    }
  }

  // Try new meld
  const valid=validateMeld(cards);
  if (valid) {
    burMelds.push({cards:[...cards], type:valid, locked:false});
    burSelectedCards.sort((a,b)=>b-a).forEach(i=>burHand.splice(i,1));
    burSelectedCards=[];
    sortHand(burHand);
    updateBuracoStatus(`Combinação formada! Continue jogando ou descarte.`);
    checkBuracoReserve();
    checkBurWin();
    renderBuraco();
  } else {
    updateBuracoStatus('❌ Seleção inválida. Trios, quadras ou sequências de 3+ mesma naipe.');
    burSelectedCards=[];
    renderBuraco();
  }
}

function burAddToMeld(meldIdx) {
  burMeldTarget = burMeldTarget===meldIdx ? null : meldIdx;
  renderBuraco();
}

function validateMeld(cards) {
  if (cards.length<3) return null;
  const wilds=cards.filter(isWild).length;
  const normals=cards.filter(c=>!isWild(c));
  if (wilds>=cards.length) return null; // all wilds not allowed

  // Try set (same rank, different suits)
  if (normals.every(c=>c.rank===normals[0].rank)) {
    if (normals.length+wilds===cards.length) return 'set';
  }

  // Try sequence (same suit, consecutive)
  const nonWild=normals;
  if (nonWild.length && nonWild.every(c=>c.suit===nonWild[0].suit)) {
    const indices=nonWild.map(c=>rankIdx(c.rank)).sort((a,b)=>a-b);
    const span=indices[indices.length-1]-indices[0]+1;
    if (span<=cards.length && span<=13) return 'seq';
  }
  return null;
}

function canAddToMeld(card, meld) {
  // Can add wild to any meld
  if (isWild(card)) return true;
  if (meld.type==='set') {
    const nonWild=meld.cards.filter(c=>!isWild(c));
    return nonWild.every(c=>c.rank===card.rank) && meld.cards.length<8;
  }
  if (meld.type==='seq') {
    const nonWild=meld.cards.filter(c=>!isWild(c));
    if (!nonWild.length) return true;
    if (nonWild[0].suit!==card.suit) return false;
    const indices=nonWild.map(c=>rankIdx(c.rank)).sort((a,b)=>a-b);
    const newIdx=rankIdx(card.rank);
    // Can go on either end
    return (newIdx===indices[0]-1 || newIdx===indices[indices.length-1]+1) && meld.cards.length<13;
  }
  return false;
}

function isCanasta(meld) { return meld.cards.length>=7; }
function isPureCanasta(meld) { return isCanasta(meld) && meld.cards.every(c=>!isWild(c)); }

// ── Discard ──
function burDiscard2(cardIdx) {
  if (burPhase!=='play'&&burPhase!=='play_nodraw') return;
  const card=burHand.splice(cardIdx,1)[0];
  burDiscard.push(card);
  burSelectedCards=[];
  burDrawn=false;
  burPhase='draw';
  sortHand(burHand);
  checkBuracoReserve();
  if (checkBurWin()) return;
  renderBuraco();
  updateBuracoStatus('Computador está pensando...');
  setTimeout(doAITurn, 900);
}

function checkBuracoReserve() {
  // If hand empty, take reserve pile
  if (!burHand.length && burStock._reserve1 && !burBuracoTaken) {
    burHand=[...burStock._reserve1];
    burStock._reserve1=null;
    burBuracoTaken=true;
    sortHand(burHand);
    updateBuracoStatus('🎯 BURACO! Você pegou o montinho reserva!');
  }
  if (!burAIHand.length && burStock._reserve2 && !burAIBuracoTaken) {
    burAIHand=[...burStock._reserve2];
    burStock._reserve2=null;
    burAIBuracoTaken=true;
  }
}

function checkBurWin() {
  if (burHand.length===0 && !burStock._reserve1) {
    // Player wins round — must have at least one canasta
    if (burMelds.some(m=>isCanasta(m))) {
      endBurRound('player');
      return true;
    }
  }
  if (burAIHand.length===0 && !burStock._reserve2) {
    if (burAIMelds.some(m=>isCanasta(m))) {
      endBurRound('ai');
      return true;
    }
  }
  return false;
}

function endBurRound(winner) {
  stopAllTimers();
  burGameOver=true;
  const pScore=calcScore(burMelds, burHand, burBuracoTaken, winner==='player');
  const aScore=calcScore(burAIMelds, burAIHand, burAIBuracoTaken, winner==='ai');
  burScore+=pScore; burAIScore+=aScore;

  const msg=winner==='player'
    ? `🎉 Você venceu a rodada! +${pScore} pts (computador: +${aScore})\nPlacar: Você ${burScore} × ${burAIScore} Computador`
    : `😔 Computador venceu a rodada! +${aScore} pts (você: +${pScore})\nPlacar: Você ${burScore} × ${burAIScore} Computador`;

  showMsg(winner==='player'?'🎉':'😔', winner==='player'?'Você venceu!':'Computador venceu!', msg, ()=>initBuraco());
}

function calcScore(melds, hand, buracoTaken, won) {
  let score=0;
  for (const m of melds) {
    m.cards.forEach(c=>score+=cardVal(c));
    if (isPureCanasta(m)) score+=500;
    else if (isCanasta(m)) score+=300;
  }
  hand.forEach(c=>score-=cardVal(c));
  if (buracoTaken) score+=100;
  if (won) score+=100;
  return Math.max(0,score);
}

// ── AI Turn ──
function doAITurn() {
  if (burGameOver) return;

  // Draw
  let drawnCard=null;
  if (burDiscard.length) {
    const top=burDiscard[burDiscard.length-1];
    const testHand=[...burAIHand, top];
    if (aiShouldTakeDiscard(top, testHand)) {
      drawnCard=burDiscard.pop();
      burAIHand.push(drawnCard);
    }
  }
  if (!drawnCard) {
    if (!burStock.length) burRefillStock();
    if (burStock.length) { drawnCard=burStock.pop(); burAIHand.push(drawnCard); }
  }

  // Play melds
  let improved=true;
  while (improved) {
    improved=false;
    // Try extend existing melds
    for (const m of burAIMelds) {
      for (let i=burAIHand.length-1;i>=0;i--) {
        if (canAddToMeld(burAIHand[i],m)) {
          m.cards.push(burAIHand.splice(i,1)[0]);
          improved=true;
        }
      }
    }
    // Try new meld
    const meld=findBestMeld(burAIHand);
    if (meld) {
      burAIMelds.push(meld);
      meld.cards.forEach(c=>{
        const idx=burAIHand.findIndex(h=>h.id===c.id);
        if (idx!==-1) burAIHand.splice(idx,1);
      });
      improved=true;
    }
  }

  checkBuracoReserve();
  if (checkBurWin()) return;

  // Discard worst card
  sortHand(burAIHand);
  const discardIdx=chooseAIDiscard(burAIHand, burDiff);
  if (burAIHand.length>0) {
    burDiscard.push(burAIHand.splice(discardIdx,1)[0]);
  }

  burPhase='draw';
  burDrawn=false;
  checkBuracoReserve();
  if (!checkBurWin()) {
    updateBuracoStatus('Sua vez: compre uma carta do monte ou do descarte');
    renderBuraco();
  }
}

function aiShouldTakeDiscard(card, hand) {
  if (burDiff==='facil') return false; // easy AI never takes discard
  // Check if useful
  for (const m of burAIMelds) if (canAddToMeld(card,m)) return true;
  const meld=findBestMeld(hand);
  return meld!==null;
}

function findBestMeld(hand) {
  // Try all combinations of 3+
  for (let size=7;size>=3;size--) {
    const result=findMeldOfSize(hand,size);
    if (result) return result;
  }
  return null;
}

function findMeldOfSize(hand, size) {
  const indices=Array.from({length:hand.length},(_,i)=>i);
  const combos=combinations(indices,size);
  for (const combo of combos) {
    const cards=combo.map(i=>hand[i]);
    const type=validateMeld(cards);
    if (type) return {cards,type,locked:false};
  }
  return null;
}

function combinations(arr, k) {
  if (k===0) return [[]];
  if (arr.length<k) return [];
  const [first,...rest]=arr;
  const withFirst=combinations(rest,k-1).map(c=>[first,...c]);
  const withoutFirst=combinations(rest,k);
  return [...withFirst,...withoutFirst].slice(0,500); // limit
}

function chooseAIDiscard(hand, diff) {
  if (!hand.length) return 0;
  if (diff==='facil') return Math.floor(Math.random()*hand.length);
  // Discard card least useful — highest value isolated card
  let worst=0, worstScore=-999;
  hand.forEach((card,i)=>{
    if (isWild(card)) return; // never discard wild
    const val=cardVal(card);
    // Penalize if it matches existing melds (don't discard)
    const useful=burAIMelds.some(m=>canAddToMeld(card,m));
    const score=useful ? -100 : val;
    if (score>worstScore) { worstScore=score; worst=i; }
  });
  return worst;
}

// ── Render ──
function renderBuraco() {
  // Score display
  document.getElementById('bur-score').textContent=burScore;
  document.getElementById('bur-ai-score').textContent=burAIScore;

  // Discard pile
  const discEl=document.getElementById('bur-discard');
  discEl.innerHTML='';
  if (burDiscard.length) {
    discEl.appendChild(makeBurCardEl(burDiscard[burDiscard.length-1],null,false));
  } else {
    discEl.innerHTML='<div class="bur-empty-pile">Descarte</div>';
  }

  // Stock
  const stockEl=document.getElementById('bur-stock');
  stockEl.innerHTML='';
  const backCard=document.createElement('div');
  backCard.className='bur-card bur-back';
  backCard.textContent=`🂠 (${burStock.length})`;
  backCard.onclick=()=>{if(burPhase==='draw')burDrawStock();};
  stockEl.appendChild(backCard);

  // AI hand (hidden)
  const aiHandEl=document.getElementById('bur-ai-hand');
  aiHandEl.innerHTML=`<span class="bur-hand-label">Computador: ${burAIHand.length} cartas</span>`;
  burAIHand.forEach(()=>{
    const c=document.createElement('div');
    c.className='bur-card bur-back bur-ai-card';
    c.textContent='🂠';
    aiHandEl.appendChild(c);
  });

  // AI melds
  renderMelds(document.getElementById('bur-ai-melds'), burAIMelds, false);

  // Player melds
  renderMelds(document.getElementById('bur-melds'), burMelds, true);

  // Player hand
  const handEl=document.getElementById('bur-hand');
  handEl.innerHTML='<span class="bur-hand-label">Sua mão</span>';
  burHand.forEach((card,i)=>{
    const el=makeBurCardEl(card,i,burSelectedCards.includes(i));
    el.onclick=()=>{
      if (burPhase==='play') toggleBurCard(i);
      // Discard mode: right-click or long press handled separately
    };
    el.addEventListener('contextmenu',e=>{e.preventDefault();if(burPhase==='play'||burPhase==='play_nodraw')burDiscard2(i);});
    handEl.appendChild(el);
  });

  // Discard button overlay when hand card is selected
  updateBurActionBtns();
}

function updateBurActionBtns() {
  const meldBtn=document.getElementById('bur-btn-meld');
  const drawDiscBtn=document.getElementById('bur-btn-draw-disc');
  const drawStockBtn=document.getElementById('bur-btn-draw-stock');

  drawStockBtn.disabled=burPhase!=='draw';
  drawDiscBtn.disabled=burPhase!=='draw'||!burDiscard.length;
  meldBtn.disabled=burPhase!=='play'||!burSelectedCards.length;

  // Show selected count
  meldBtn.textContent=burSelectedCards.length
    ? `Jogar Combinação (${burSelectedCards.length} cartas)`
    : 'Jogar Combinação';
}

function renderMelds(container, melds, interactive) {
  container.innerHTML='';
  if (!melds.length) { container.innerHTML='<span style="color:#aaa;font-size:13px">Nenhuma combinação ainda</span>'; return; }
  melds.forEach((meld,mi)=>{
    const meldEl=document.createElement('div');
    meldEl.className='bur-meld'+(meld===burMeldTarget?' bur-meld-target':'');
    if (isCanasta(meld)) meldEl.classList.add('bur-canasta');
    if (isPureCanasta(meld)) meldEl.classList.add('bur-pure');
    const label=document.createElement('div');
    label.className='bur-meld-label';
    label.textContent=(meld.type==='seq'?'Sequência':'Trio/Quadra')+
      (isCanasta(meld)?(isPureCanasta(meld)?' ✨Canasta Pura':' 🌟Canasta'):'');
    meldEl.appendChild(label);
    const cardsEl=document.createElement('div');
    cardsEl.className='bur-meld-cards';
    meld.cards.forEach(card=>cardsEl.appendChild(makeBurCardEl(card,null,false,true)));
    meldEl.appendChild(cardsEl);
    if (interactive) {
      meldEl.addEventListener('click',()=>burAddToMeld(mi));
      meldEl.title='Clique para adicionar cartas selecionadas aqui';
    }
    container.appendChild(meldEl);
  });
}

function makeBurCardEl(card, idx, selected, small=false) {
  const el=document.createElement('div');
  const isRed=card.suit==='♥'||card.suit==='♦';
  el.className=`bur-card ${isRed?'red':'black'} ${card.wild?'wild':''} ${selected?'selected':''} ${small?'small':''}`;
  if (card.wild) { el.textContent='🃏'; }
  else { el.innerHTML=`<span class="bur-rank">${card.rank}</span><span class="bur-suit">${card.suit}</span>`; }
  return el;
}

function updateBuracoStatus(msg) {
  const el=document.getElementById('bur-status');
  if (el) el.textContent=msg;
}

function burDiscardSelected() {
  if (!burSelectedCards.length) {
    updateBuracoStatus('Selecione uma carta para descartar.');
    return;
  }
  if (burSelectedCards.length>1) {
    updateBuracoStatus('Descarte apenas UMA carta por vez.');
    return;
  }
  burDiscard2(burSelectedCards[0]);
}
