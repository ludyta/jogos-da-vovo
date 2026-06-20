// ══════════════════════════════════════════════════════
// BURACO — Layout de Mesa (cartas cobertas do PC em cima)
// 1 jogadora vs Computador
// ══════════════════════════════════════════════════════
const BUR_SUITS = ['♠','♥','♦','♣'];
const BUR_RANKS = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
const BUR_RANKV = {A:15,2:3,3:3,4:3,5:3,6:3,7:4,8:4,9:4,'10':4,J:5,Q:5,K:5};

let burStock=[],burDiscard=[];
let burHand=[],burAIHand=[];
let burMelds=[],burAIMelds=[];
let burDrawn=false,burGameOver=false;
let burType='aberto',burDiff='facil';
let burScore=0,burAIScore=0;
let burSelectedCards=[];
let burPhase='draw';
let burMeldTarget=null;
let burBuracoTaken=false,burAIBuracoTaken=false;
let burReserve1=null,burReserve2=null;

function makeBurDeck() {
  const deck=[];
  for(let d=0;d<2;d++){
    for(const suit of BUR_SUITS) for(const rank of BUR_RANKS)
      deck.push({rank,suit,id:`${rank}${suit}${d}`,wild:false});
    deck.push({rank:'🃏',suit:'',id:`JK${d}a`,wild:true});
    deck.push({rank:'🃏',suit:'',id:`JK${d}b`,wild:true});
  }
  return shuffle(deck);
}
function cardVal(c){return BUR_RANKV[c.rank]||3;}
function rankIdx(r){return BUR_RANKS.indexOf(r);}
function isWild(c){return c.wild||c.rank==='2';}

function initBuraco(type,diff) {
  stopAllTimers();
  if(type) burType=type;
  if(diff) burDiff=diff;
  document.querySelectorAll('.bur-type-btn').forEach(b=>b.classList.toggle('active',b.dataset.type===burType));
  document.querySelectorAll('#buraco-screen .diff-btn').forEach(b=>b.classList.toggle('active',b.dataset.diff===burDiff));

  const deck=makeBurDeck();
  burHand=deck.splice(0,11);
  burAIHand=deck.splice(0,11);
  burReserve1=deck.splice(0,11);
  burReserve2=deck.splice(0,11);
  burStock=deck; burDiscard=[];
  burMelds=[]; burAIMelds=[];
  burDrawn=false; burGameOver=false;
  burSelectedCards=[]; burPhase='draw'; burMeldTarget=null;
  burBuracoTaken=false; burAIBuracoTaken=false;
  burScore=0; burAIScore=0;

  sortHand(burHand);
  updateBurStatus('Sua vez — compre do monte ou pegue o descarte');
  renderBuraco();
  startTimer('bur','bur-time');
}

function sortHand(hand){
  hand.sort((a,b)=>{
    if(a.wild!==b.wild) return a.wild?1:-1;
    if(a.suit!==b.suit) return a.suit.localeCompare(b.suit);
    return rankIdx(a.rank)-rankIdx(b.rank);
  });
}

function burDrawStock(){
  if(burPhase!=='draw') return;
  if(!burStock.length) burRefill();
  if(!burStock.length) return;
  burHand.push(burStock.pop());
  sortHand(burHand); burDrawn=true; burPhase='play';
  updateBurStatus('Carta comprada! Forme combinações ou descarte.');
  renderBuraco();
}

function burDrawDiscard(){
  if(burPhase!=='draw'||!burDiscard.length) return;
  if(burType==='fechado'){
    const top=burDiscard[burDiscard.length-1];
    if(!canUseDiscard(top)){updateBurStatus('No Buraco Fechado você precisa usar a carta do descarte numa combinação!');return;}
  }
  burHand.push(burDiscard.pop());
  sortHand(burHand); burDrawn=true; burPhase='play';
  updateBurStatus('Carta pega! Forme combinações ou descarte.');
  renderBuraco();
}

function canUseDiscard(card){
  for(const m of burMelds) if(canAddToMeld(card,m)) return true;
  return findBestMeld([...burHand,card])!==null;
}

function burRefill(){
  if(burDiscard.length<2) return;
  const top=burDiscard.pop();
  burStock=[...burDiscard]; shuffle(burStock); burDiscard=[top];
}

function toggleBurCard(idx){
  if(burPhase!=='play') return;
  const pos=burSelectedCards.indexOf(idx);
  if(pos===-1) burSelectedCards.push(idx); else burSelectedCards.splice(pos,1);
  renderBuraco();
}

function burMeld(){
  if(burPhase!=='play'||!burSelectedCards.length) return;
  const cards=burSelectedCards.map(i=>burHand[i]);
  if(burMeldTarget!==null){
    const m=burMelds[burMeldTarget]; let added=0;
    for(const card of cards) if(canAddToMeld(card,m)){m.cards.push(card);added++;}
    if(added){
      burSelectedCards.sort((a,b)=>b-a).forEach(i=>burHand.splice(i,1));
      burSelectedCards=[]; sortHand(burHand); burMeldTarget=null;
      checkBurReserve(); checkBurWin(); renderBuraco(); return;
    }
  }
  const valid=validateMeld(cards);
  if(valid){
    burMelds.push({cards:[...cards],type:valid});
    burSelectedCards.sort((a,b)=>b-a).forEach(i=>burHand.splice(i,1));
    burSelectedCards=[]; sortHand(burHand); burMeldTarget=null;
    checkBurReserve(); checkBurWin(); renderBuraco();
  } else {
    updateBurStatus('❌ Seleção inválida — trios/quadras ou sequências de 3+ mesma naipe.');
    burSelectedCards=[]; renderBuraco();
  }
}

function burAddToMeld(idx){ burMeldTarget=burMeldTarget===idx?null:idx; renderBuraco(); }

function validateMeld(cards){
  if(cards.length<3) return null;
  const wilds=cards.filter(isWild).length;
  const normals=cards.filter(c=>!isWild(c));
  if(wilds>=cards.length) return null;
  if(normals.length&&normals.every(c=>c.rank===normals[0].rank)) return 'set';
  if(normals.length&&normals.every(c=>c.suit===normals[0].suit)){
    const idx=normals.map(c=>rankIdx(c.rank)).sort((a,b)=>a-b);
    const span=idx[idx.length-1]-idx[0]+1;
    if(span<=cards.length&&span<=13) return 'seq';
  }
  return null;
}

function canAddToMeld(card,meld){
  if(isWild(card)) return true;
  if(meld.type==='set'){
    const nw=meld.cards.filter(c=>!isWild(c));
    return nw.every(c=>c.rank===card.rank)&&meld.cards.length<8;
  }
  if(meld.type==='seq'){
    const nw=meld.cards.filter(c=>!isWild(c));
    if(!nw.length) return true;
    if(nw[0].suit!==card.suit) return false;
    const idx=nw.map(c=>rankIdx(c.rank)).sort((a,b)=>a-b);
    const ni=rankIdx(card.rank);
    return (ni===idx[0]-1||ni===idx[idx.length-1]+1)&&meld.cards.length<13;
  }
  return false;
}

function isCanasta(m){return m.cards.length>=7;}
function isPure(m){return isCanasta(m)&&m.cards.every(c=>!isWild(c));}

function burDiscardCard(idx){
  if(burPhase!=='play') return;
  const card=burHand.splice(idx,1)[0];
  burDiscard.push(card); burSelectedCards=[]; burDrawn=false; burPhase='draw';
  sortHand(burHand); checkBurReserve();
  if(checkBurWin()) return;
  renderBuraco();
  updateBurStatus('Computador pensando...');
  setTimeout(doAITurn,900);
}

function burDiscardSelected(){
  if(!burSelectedCards.length){updateBurStatus('Selecione uma carta para descartar.');return;}
  if(burSelectedCards.length>1){updateBurStatus('Descarte apenas UMA carta por vez.');return;}
  burDiscardCard(burSelectedCards[0]);
}

function checkBurReserve(){
  if(!burHand.length&&burReserve1&&!burBuracoTaken){
    burHand=[...burReserve1]; burReserve1=null; burBuracoTaken=true;
    sortHand(burHand); updateBurStatus('🎯 BURACO! Você pegou o montinho reserva!');
  }
  if(!burAIHand.length&&burReserve2&&!burAIBuracoTaken){
    burAIHand=[...burReserve2]; burReserve2=null; burAIBuracoTaken=true;
  }
}

function checkBurWin(){
  if(!burHand.length&&!burReserve1&&burMelds.some(m=>isCanasta(m))){endBurRound('player');return true;}
  if(!burAIHand.length&&!burReserve2&&burAIMelds.some(m=>isCanasta(m))){endBurRound('ai');return true;}
  return false;
}

function endBurRound(winner){
  stopAllTimers(); burGameOver=true;
  const ps=calcScore(burMelds,burHand,burBuracoTaken,winner==='player');
  const as=calcScore(burAIMelds,burAIHand,burAIBuracoTaken,winner==='ai');
  burScore+=ps; burAIScore+=as;
  showMsg(winner==='player'?'🎉':'😔',
    winner==='player'?'Você venceu!':'Computador venceu!',
    `Você: ${ps} pts | Computador: ${as} pts\nPlacar: Você ${burScore} × ${burAIScore}`,
    ()=>initBuraco());
}

function calcScore(melds,hand,bt,won){
  let s=0;
  melds.forEach(m=>{m.cards.forEach(c=>s+=cardVal(c));if(isPure(m))s+=500;else if(isCanasta(m))s+=300;});
  hand.forEach(c=>s-=cardVal(c));
  if(bt)s+=100; if(won)s+=100;
  return Math.max(0,s);
}

// ── AI ──
function doAITurn(){
  if(burGameOver) return;
  let drawn=false;
  if(burDiscard.length){
    const top=burDiscard[burDiscard.length-1];
    if(burDiff!=='facil'&&aiWantsDiscard(top)){burAIHand.push(burDiscard.pop());drawn=true;}
  }
  if(!drawn){if(!burStock.length)burRefill();if(burStock.length)burAIHand.push(burStock.pop());}
  let improved=true;
  while(improved){
    improved=false;
    for(const m of burAIMelds) for(let i=burAIHand.length-1;i>=0;i--)
      if(canAddToMeld(burAIHand[i],m)){m.cards.push(burAIHand.splice(i,1)[0]);improved=true;}
    const meld=findBestMeld(burAIHand);
    if(meld){burAIMelds.push(meld);meld.cards.forEach(c=>{const i=burAIHand.findIndex(h=>h.id===c.id);if(i!==-1)burAIHand.splice(i,1);});improved=true;}
  }
  checkBurReserve(); if(checkBurWin()) return;
  if(burAIHand.length) burDiscard.push(burAIHand.splice(chooseDiscard(),1)[0]);
  burPhase='draw'; burDrawn=false; checkBurReserve();
  if(!checkBurWin()){updateBurStatus('Sua vez — compre do monte ou pegue o descarte');renderBuraco();}
}

function aiWantsDiscard(card){
  for(const m of burAIMelds) if(canAddToMeld(card,m)) return true;
  return findBestMeld([...burAIHand,card])!==null;
}

function chooseDiscard(){
  if(burDiff==='facil') return Math.floor(Math.random()*burAIHand.length);
  let worst=0,ws=-999;
  burAIHand.forEach((c,i)=>{
    if(isWild(c)) return;
    const useful=burAIMelds.some(m=>canAddToMeld(c,m));
    const s=useful?-100:cardVal(c);
    if(s>ws){ws=s;worst=i;}
  });
  return worst;
}

function findBestMeld(hand){
  for(let sz=7;sz>=3;sz--){const r=findMeldSize(hand,sz);if(r)return r;} return null;
}
function findMeldSize(hand,size){
  const idx=hand.map((_,i)=>i);
  for(const combo of combos(idx,size)){
    const cards=combo.map(i=>hand[i]);
    const t=validateMeld(cards);
    if(t) return{cards,type:t};
  }
  return null;
}
function combos(arr,k){
  if(k===0) return [[]];
  if(arr.length<k) return [];
  const[f,...r]=arr;
  return [...combos(r,k-1).map(c=>[f,...c]),...combos(r,k)].slice(0,300);
}

// ── RENDER (mesa de jogo) ──
function renderBuraco(){
  document.getElementById('bur-score').textContent=burScore;
  document.getElementById('bur-ai-score').textContent=burAIScore;

  // AI hand — cartas cobertas em fila
  const aiHandEl=document.getElementById('bur-ai-hand');
  aiHandEl.innerHTML='';
  const aiCount=document.createElement('span');
  aiCount.className='bur-hand-label';
  aiCount.textContent=`Computador — ${burAIHand.length} cartas`;
  aiHandEl.appendChild(aiCount);
  const aiRow=document.createElement('div');
  aiRow.style.cssText='display:flex;flex-wrap:wrap;gap:2px;margin-top:4px';
  burAIHand.forEach(()=>{
    const c=document.createElement('div');
    c.className='bur-card bur-back bur-ai-card';
    c.textContent='🌸';
    aiRow.appendChild(c);
  });
  aiHandEl.appendChild(aiRow);

  // AI melds
  renderBurMelds(document.getElementById('bur-ai-melds'),burAIMelds,false);

  // Center — stock + discard
  const stockEl=document.getElementById('bur-stock');
  stockEl.innerHTML='';
  const backCard=document.createElement('div');
  backCard.className='bur-card bur-back';
  backCard.innerHTML=`<span style="font-size:11px">Monte<br>${burStock.length}</span>`;
  backCard.onclick=()=>{if(burPhase==='draw')burDrawStock();};
  stockEl.appendChild(backCard);
  // Reserve indicator
  if(burReserve1){
    const res=document.createElement('div');
    res.style.cssText='font-size:10px;color:var(--text-lt);text-align:center;margin-top:2px';
    res.textContent='🎯 Reserva';
    stockEl.appendChild(res);
  }

  const discEl=document.getElementById('bur-discard');
  discEl.innerHTML='';
  if(burDiscard.length){
    const top=burDiscard[burDiscard.length-1];
    const el=makeBurCard(top,false);
    el.style.cursor='pointer';
    el.onclick=()=>{if(burPhase==='draw')burDrawDiscard();};
    discEl.appendChild(el);
  } else {
    discEl.innerHTML='<div class="bur-empty-pile">Lixo</div>';
  }

  // Player melds
  renderBurMelds(document.getElementById('bur-melds'),burMelds,true);

  // Player hand
  const handEl=document.getElementById('bur-hand');
  handEl.innerHTML='<span class="bur-hand-label">Sua mão — toque para selecionar · botão direito para descartar</span>';
  const handRow=document.createElement('div');
  handRow.style.cssText='display:flex;flex-wrap:wrap;gap:4px;margin-top:4px';
  burHand.forEach((card,i)=>{
    const el=makeBurCard(card,burSelectedCards.includes(i));
    el.onclick=()=>{if(burPhase==='play')toggleBurCard(i);};
    el.addEventListener('contextmenu',e=>{e.preventDefault();if(burPhase==='play')burDiscardCard(i);});
    handRow.appendChild(el);
  });
  handEl.appendChild(handRow);

  // Buttons state
  document.getElementById('bur-btn-draw-stock').disabled=burPhase!=='draw';
  document.getElementById('bur-btn-draw-disc').disabled=burPhase!=='draw'||!burDiscard.length;
  document.getElementById('bur-btn-meld').disabled=burPhase!=='play'||!burSelectedCards.length;
  document.getElementById('bur-btn-meld').textContent=
    burSelectedCards.length?`▶️ Jogar (${burSelectedCards.length} cartas)`:'▶️ Jogar Combinação';
}

function renderBurMelds(container,melds,interactive){
  container.innerHTML='';
  if(!melds.length){container.innerHTML='<span style="color:#bbb;font-size:12px">Nenhuma combinação ainda</span>';return;}
  melds.forEach((meld,mi)=>{
    const el=document.createElement('div');
    el.className='bur-meld'+(mi===burMeldTarget?' bur-meld-target':'')+(isCanasta(meld)?isPure(meld)?' bur-pure':' bur-canasta':'');
    const lbl=document.createElement('div');
    lbl.className='bur-meld-label';
    lbl.textContent=(meld.type==='seq'?'Sequência':'Trio/Quadra')+(isPure(meld)?' ✨Pura':isCanasta(meld)?' 🌟Canasta':'');
    el.appendChild(lbl);
    const row=document.createElement('div');
    row.className='bur-meld-cards';
    meld.cards.forEach(c=>row.appendChild(makeBurCard(c,false,true)));
    el.appendChild(row);
    if(interactive){el.onclick=()=>burAddToMeld(mi);el.title='Clique para adicionar cartas aqui';}
    container.appendChild(el);
  });
}

function makeBurCard(card,selected,small=false){
  const el=document.createElement('div');
  const isRed=card.suit==='♥'||card.suit==='♦';
  el.className=`bur-card${isRed?' red':' black'}${card.wild?' wild':''}${selected?' selected':''}${small?' small':''}`;
  if(card.wild) el.textContent='🃏';
  else el.innerHTML=`<span class="bur-rank">${card.rank}</span><span class="bur-suit">${card.suit}</span>`;
  return el;
}

function updateBurStatus(msg){
  const el=document.getElementById('bur-status');
  if(el) el.textContent=msg;
}
