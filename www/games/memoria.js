// ══════════════════════════════════════
// JOGO DA MEMÓRIA — sempre embaralhado novo
// ══════════════════════════════════════
const MEM_EMOJIS = ['🌸','🌺','🌻','🌹','🌷','🍀','🦋','🐝','🐞','🌈','⭐','💎','🎀','🍓','🍇','🎵'];

let memCards=[],memFlipped=[],memMatched=0,memMoves=0,memLocked=false,memTotalPairs=8;

function initMemory(pairs){
  stopAllTimers();
  if(pairs!==undefined) memTotalPairs=pairs;
  memMatched=0; memMoves=0; memFlipped=[]; memLocked=false;
  document.getElementById('mem-pairs').textContent='0';
  document.getElementById('mem-moves').textContent='0';
  document.getElementById('mem-time').textContent='00:00';
  document.querySelectorAll('.mem-pairs-btn').forEach(b=>b.classList.toggle('active',+b.dataset.pairs===memTotalPairs));
  // Always fresh shuffle — different every game
  const chosen=shuffle([...MEM_EMOJIS]).slice(0,memTotalPairs);
  const allCards=shuffle([...chosen,...chosen]);
  memCards=allCards.map((emoji,i)=>({emoji,id:i,matched:false,flipped:false}));
  renderMemoryGrid();
  startTimer('mem','mem-time');
}

function renderMemoryGrid(){
  const grid=document.getElementById('memory-grid');
  grid.style.gridTemplateColumns='repeat(4,1fr)';
  grid.innerHTML='';
  memCards.forEach((card,i)=>{
    const el=document.createElement('div');
    el.className='mem-card'+(card.flipped?' flipped':'')+(card.matched?' matched':'');
    el.innerHTML=`<span class="face">${card.emoji}</span><span class="back">🌸</span>`;
    el.addEventListener('click',()=>memFlip(i));
    grid.appendChild(el);
  });
}

function memFlip(i){
  if(memLocked||memCards[i].flipped||memCards[i].matched||memFlipped.length>=2) return;
  memCards[i].flipped=true; memFlipped.push(i);
  renderMemoryGrid();
  if(memFlipped.length===2){
    memMoves++; document.getElementById('mem-moves').textContent=memMoves; memLocked=true;
    const[a,b]=memFlipped;
    if(memCards[a].emoji===memCards[b].emoji){
      memCards[a].matched=true; memCards[b].matched=true; memMatched++;
      document.getElementById('mem-pairs').textContent=memMatched;
      memFlipped=[]; memLocked=false; renderMemoryGrid();
      if(memMatched===memTotalPairs){
        stopAllTimers();
        const t=document.getElementById('mem-time').textContent;
        showMsg('🎉','Parabéns!',`Todos os ${memTotalPairs} pares em ${memMoves} tentativas e ${t}!`,()=>initMemory());
      }
    } else {
      setTimeout(()=>{memCards[a].flipped=false;memCards[b].flipped=false;memFlipped=[];memLocked=false;renderMemoryGrid();},1000);
    }
  }
}
