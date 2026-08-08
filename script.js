const $=id=>document.getElementById(id);

// Default teams dari berbagai liga top Eropa
const DEFAULT_TEAMS={
  "🏆 ELITE TIER":`Manchester City
Real Madrid
Barcelona
Liverpool
Bayern Munich
Paris Saint-Germain`,
  
  "⚡ KUAT":`Arsenal
Chelsea
Manchester United
Tottenham
AC Milan
Inter Milan
Juventus
Borussia Dortmund
RB Leipzig
Atletico Madrid`,
  
  "💪 MENENGAH":`Brighton
Aston Villa
West Ham
Bayer Leverkusen
Fiorentina
Roma
Napoli
Lazio
Valencia
Sevilla
Real Sociedad
Porto
Ajax
Benfica
Galatasaray`,
  
  "🔥 DARK HORSE":`Ipswich
Fulham
Southampton
Nottingham
Lens
Marseille
Monaco
Rennes
Union Berlin
Hoffenheim
Sassuolo
Monza
Real Betis
Girona
Almeria
Eintracht Frankfurt
Lens
Bologna
Lecce
Cagliari`
};

let state={players:[],tiers:{},order:[],idx:0,results:[]};

function $$(selector,parent=document){return Array.from((parent||document).querySelectorAll(selector))}

function lines(text){return text.split(/\n/).map(x=>x.trim()).filter(Boolean)}
function shuffle(a){a=[...a];for(let i=a.length-1;i>0;i--){let j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}

// DEMO DATA
$("demo").onclick=()=>{
  $$("input[data-type='player']").forEach((inp,i)=>{
    inp.value=["Farhan","Rio","Dani","Budi"][i]||"Player "+(i+1)
  });
  $$("textarea[data-type='tier']").forEach((ta,i)=>{
    const keys=Object.keys(DEFAULT_TEAMS);
    ta.value=DEFAULT_TEAMS[keys[i]]||""
  })
};

// ADD PLAYER
$("addPlayerBtn").onclick=()=>{
  const count=$$("input[data-type='player']").length;
  const div=document.createElement("div");
  div.className="player-input-group";
  div.innerHTML=`
    <input type="text" data-type="player" placeholder="Player ${count+1}" value="Player ${count+1}">
    <button class="danger" onclick="this.parentElement.remove()">×</button>
  `;
  $("playersContainer").appendChild(div);
};

// ADD TIER
$("addTierBtn").onclick=()=>{
  const count=$$("[data-type='tier']").length;
  const div=document.createElement("div");
  div.className="tier";
  div.innerHTML=`
    <h3>
      <input type="text" placeholder="Tier Name" data-type="tier-name" value="Tier ${count+1}" style="flex:1;margin:0 10px 0 0">
      <button class="danger" style="padding:6px 10px;font-size:11px;margin:0" onclick="this.parentElement.parentElement.remove()">×</button>
    </h3>
    <small>Tim dalam tier ini akan dibagi rata ke semua peserta</small>
    <textarea data-type="tier" placeholder="Masukkan nama tim, 1 baris per tim"></textarea>
  `;
  $("tiersContainer").appendChild(div);
};

// INIT SETUP
window.addEventListener("load",()=>{
  // Add 3 default players
  for(let i=0;i<3;i++){
    const div=document.createElement("div");
    div.className="player-input-group";
    div.innerHTML=`
      <input type="text" data-type="player" placeholder="Player ${i+1}" value="Player ${i+1}">
      <button class="danger" onclick="this.parentElement.remove()">×</button>
    `;
    $("playersContainer").appendChild(div);
  }
  
  // Add 4 default tiers
  Object.entries(DEFAULT_TEAMS).slice(0,4).forEach(([name,teams])=>{
    const div=document.createElement("div");
    div.className="tier";
    div.innerHTML=`
      <h3>
        <input type="text" placeholder="Tier Name" data-type="tier-name" value="${name}" style="flex:1;margin:0 10px 0 0">
        <button class="danger" style="padding:6px 10px;font-size:11px;margin:0" onclick="this.parentElement.parentElement.remove()">×</button>
      </h3>
      <small>Tim dalam tier ini akan dibagi rata ke semua peserta</small>
      <textarea data-type="tier" placeholder="Masukkan nama tim, 1 baris per tim">${teams}</textarea>
    `;
    $("tiersContainer").appendChild(div);
  });
});

// START DRAW
$("start").onclick=()=>{
  const playerInputs=$$("input[data-type='player']");
  const tierInputs=$$("textarea[data-type='tier']");
  const tierNames=$$("input[data-type='tier-name']");
  
  if(playerInputs.length<2){alert("Minimal 2 peserta. Tambahkan peserta terlebih dahulu.");return}
  if(tierInputs.length<2){alert("Minimal 2 tier. Tambahkan tier terlebih dahulu.");return}
  
  const players=playerInputs.map(x=>x.value.trim()||"Player").filter(Boolean);
  const tiers={};
  let allValid=true;
  
  tierInputs.forEach((ta,i)=>{
    const tierName=tierNames[i].value.trim()||`Tier ${i+1}`;
    const teams=lines(ta.value);
    if(teams.length%players.length!==0){
      alert(`Tier "${tierName}": Jumlah tim (${teams.length}) harus habis dibagi dengan jumlah peserta (${players.length})`);
      allValid=false;
      return;
    }
    tiers[tierName]=shuffle(teams);
  });
  
  if(!allValid)return;
  
  state={
    players,
    tiers,
    order:shuffle(Object.keys(tiers)),
    idx:0,
    results:players.map(()=>[])
  };
  
  $("setup").classList.add("hidden");
  $("draw").classList.remove("hidden");
  $("result").classList.add("hidden");
  $("bracketSection").classList.add("hidden");
  updateTurn();
  $("status").textContent="Tier pertama sudah diacak. Tekan SPIN.";
};

function updateTurn(){
  const currentPlayer=state.players[state.idx];
  const tierIndex=state.results[state.idx].length;
  const currentTier=state.order[tierIndex];
  const teamsPerPlayer=state.tiers[currentTier].length/state.players.length;
  const playerDrawCount=Math.floor(state.results[state.idx].length/Object.keys(state.tiers).length);
  const totalTeamsPerTier=state.tiers[currentTier].length;
  
  $("playerName").textContent=currentPlayer;
  $("slotText").textContent="READY";
  $("tierInfo").textContent=`Tier: ${currentTier}`;
  $("progress").textContent=`${state.results[state.idx].length}/${Object.keys(state.tiers).length}`;
  $("status").textContent=`Kategori: ${currentTier}`;
}

let timer=null;
$("spin").onclick=()=>spin(false);
$("skip").onclick=()=>spin(true);

function spin(skip){
  if(timer)return;
  const tierIndex=state.results[state.idx].length;
  const currentTier=state.order[tierIndex];
  const pool=state.tiers[currentTier];
  
  if(!pool||!pool.length){advance();return}
  
  $("spin").disabled=true;
  $("skip").disabled=true;
  $("ball").classList.add("spinning");
  
  let n=0;
  if(skip){finish(currentTier,Math.floor(Math.random()*pool.length));return}
  
  timer=setInterval(()=>{
    $("slotText").textContent=pool[n%pool.length];
    n++;
    if(n>=40){
      clearInterval(timer);
      timer=null;
      finish(currentTier,Math.floor(Math.random()*pool.length));
    }
  },50);
}

function finish(tier,i){
  const pool=state.tiers[tier];
  const team=pool.splice(i,1)[0];
  state.results[state.idx].push({team,tier});
  $("slotText").textContent=team;
  $("status").textContent=`✓ TERPILIH • ${tier}`;
  $("ball").classList.remove("spinning");
  
  setTimeout(()=>{
    timer=null;
    $("spin").disabled=false;
    $("skip").disabled=false;
    advance();
  },900);
}

function advance(){
  const totalTeams=Object.keys(state.tiers).length;
  if(state.results.every(r=>r.length===totalTeams)){
    showResults();
    return;
  }
  state.idx++;
  if(state.idx>=state.players.length)state.idx=0;
  updateTurn();
}

function showResults(){
  $("draw").classList.add("hidden");
  $("result").classList.remove("hidden");
  
  const html=state.players.map((p,i)=>{
    const teams=state.results[i];
    return `
      <div class="card">
        <h3>${esc(p)}</h3>
        ${teams.map(x=>`
          <div class="team">
            <span>${esc(x.team)}</span>
            <span class="badge">${esc(x.tier)}</span>
          </div>
        `).join("")}
      </div>
    `;
  }).join("");
  
  $("resultCards").innerHTML=html;
}

$("again").onclick=()=>{location.reload()};

$("bracketBtn").onclick=()=>{
  const clubs=state.results.flat().map(x=>x.team);
  const pairs=[];
  for(let i=0;i<clubs.length;i+=2){
    pairs.push([clubs[i],clubs[i+1]||"BYE"]);
  }
  
  $("bracketSection").classList.remove("hidden");
  $("bracket").innerHTML=pairs.map((m,i)=>`
    <div class="match">
      <b>MATCH ${i+1}</b>
      ⚽ ${esc(m[0])}<br>
      VS<br>
      ⚽ ${esc(m[1])}
    </div>
  `).join("");
};

$("backBtn").onclick=()=>{
  $("bracketSection").classList.add("hidden");
  $("result").classList.remove("hidden");
};

function esc(s){
  return s.replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))
}
