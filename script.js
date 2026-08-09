const $=id=>document.getElementById(id);

// Tim dari berbagai liga Eropa — dua kategori: kuat & biasa
const DEFAULT_TEAMS={
  "⭐ TIM KUAT":`Real Madrid
Barcelona
Atletico Madrid
Manchester City
Arsenal
Liverpool
Chelsea
Paris Saint-Germain
Bayern München
Inter Milan
Juventus
AC Milan
Manchester United`,

  "🔴 TIM BIASA":`Bayer Leverkusen
Newcastle United
Tottenham Hotspur
RB Leipzig
Real Sociedad
Napoli
Real Betis
Sevilla
Valencia
Girona
Celta Vigo
Osasuna
Aston Villa
West Ham United
Brighton & Hove Albion
Crystal Palace
Fulham
Everton
Nottingham Forest
Bournemouth
Lyon
Lille
Nice
Rennes
Lens
Strasbourg
Eintracht Frankfurt
VfB Stuttgart
SC Freiburg
Wolfsburg
Mainz 05
AZ Alkmaar
Villarreal
Ajax Amsterdam
Feyenoord
Athletic Bilbao
PSV Eindhoven
Atalanta
Marseille
Borussia Dortmund
Monaco`,
};

let state={players:[],tiers:{},order:[],step:0,results:[]};

// Negara asal tiap tim di pool default, dipakai buat nampilin bendera
const TEAM_COUNTRY={
  "Real Madrid":"ES","Barcelona":"ES","Atletico Madrid":"ES","Athletic Bilbao":"ES","Villarreal":"ES",
  "Real Sociedad":"ES","Real Betis":"ES","Sevilla":"ES","Valencia":"ES","Girona":"ES","Celta Vigo":"ES","Osasuna":"ES",
  "Manchester City":"GB","Arsenal":"GB","Liverpool":"GB","Chelsea":"GB","Newcastle United":"GB","Tottenham Hotspur":"GB",
  "Manchester United":"GB",
  "Aston Villa":"GB","West Ham United":"GB","Brighton & Hove Albion":"GB","Crystal Palace":"GB","Fulham":"GB",
  "Everton":"GB","Nottingham Forest":"GB","Bournemouth":"GB",
  "Paris Saint-Germain":"FR","Monaco":"FR","Marseille":"FR","Lyon":"FR","Lille":"FR","Nice":"FR","Rennes":"FR","Lens":"FR","Strasbourg":"FR",
  "Bayern München":"DE","Borussia Dortmund":"DE","RB Leipzig":"DE","Bayer Leverkusen":"DE",
  "Eintracht Frankfurt":"DE","VfB Stuttgart":"DE","SC Freiburg":"DE","Wolfsburg":"DE","Mainz 05":"DE",
  "PSV Eindhoven":"NL","Ajax Amsterdam":"NL","Feyenoord":"NL","AZ Alkmaar":"NL","FC Twente":"NL","FC Utrecht":"NL","Go Ahead Eagles":"NL",
  "Inter Milan":"IT","Juventus":"IT","Napoli":"IT","AC Milan":"IT","Atalanta":"IT",
};
const COUNTRY_FLAG={ES:"🇪🇸",GB:"🇬🇧",FR:"🇫🇷",DE:"🇩🇪",NL:"🇳🇱",IT:"🇮🇹"};

function flagFor(team){ return COUNTRY_FLAG[TEAM_COUNTRY[team]]||"" }
function withFlag(team){ const f=flagFor(team); return f?`${f} ${team}`:team }

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
    <small>Masukkan tim untuk kategori ini — tiap pemain dijamin dapat jatah rata dari tier ini</small>
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
  Object.entries(DEFAULT_TEAMS).forEach(([name,teams])=>{
    const div=document.createElement("div");
    div.className="tier";
    div.innerHTML=`
      <h3>
        <input type="text" placeholder="Tier Name" data-type="tier-name" value="${name}" style="flex:1;margin:0 10px 0 0">
        <button class="danger" style="padding:6px 10px;font-size:11px;margin:0" onclick="this.parentElement.parentElement.remove()">×</button>
      </h3>
      <small>Masukkan tim untuk kategori ini — tiap pemain dijamin dapat jatah rata dari tier ini</small>
      <textarea data-type="tier" placeholder="Masukkan nama tim, 1 baris per tim">${teams}</textarea>
    `;
    $("tiersContainer").appendChild(div);
  });
});

// START DRAW
$("start").onclick=()=>{
  const playerInputs=$$("input[data-type='player']");
  const tierInputs=$$("textarea[data-type='tier']");
  const tierNameInputs=$$("input[data-type='tier-name']");
  
  if(playerInputs.length<2){alert("Minimal 2 peserta.");return}
  if(tierInputs.length<1){alert("Minimal 1 tier.");return}
  
  const players=playerInputs.map(x=>x.value.trim()||"Player").filter(Boolean);
  const tiers={};
  const tierNames=[];
  
  tierInputs.forEach((ta,i)=>{
    const tierName=tierNameInputs[i].value.trim()||`Tier ${i+1}`;
    const teams=lines(ta.value);
    if(teams.length===0){
      alert(`Tier "${tierName}": Masukkan minimal 1 tim`);
      return;
    }
    tiers[tierName]=shuffle(teams);
    tierNames.push(tierName);
  });
  
  const T=tierNames.length;
  const teamsPerPlayer=parseInt($("teamsPerPlayer").value,10)||1;
  
  // Split each player's quota as evenly as possible across tiers,
  // e.g. 2 tim/pemain + 2 tier => 1 dari tiap tier. Sisa (kalau ganjil)
  // selalu jatuh ke tier pertama yang sama untuk SEMUA pemain, jadi tetap adil antar pemain.
  const base=Math.floor(teamsPerPlayer/T);
  const extra=teamsPerPlayer%T;
  const tierQuota={}; // tierName -> jumlah per pemain
  tierNames.forEach((t,i)=>{ tierQuota[t]=base+(i<extra?1:0) });
  
  // Validasi tiap tier punya cukup tim
  for(const t of tierNames){
    const needed=players.length*tierQuota[t];
    if(tiers[t].length<needed){
      alert(`Tier "${t}" tidak cukup tim. Butuh ${needed} (${players.length} peserta × ${tierQuota[t]} tim dari tier ini), baru ada ${tiers[t].length}.`);
      return;
    }
  }
  
  // Urutan pengambilan tiap pemain, tier diselang-seling sesuai kuota
  function buildPlayerSeq(){
    const remaining={...tierQuota};
    const seq=[];
    while(seq.length<teamsPerPlayer){
      for(const t of tierNames){
        if(remaining[t]>0){ seq.push(t); remaining[t]--; }
      }
    }
    return seq;
  }
  const perPlayerSeq=players.map(()=>buildPlayerSeq());
  
  // Urutan giliran global: ronde demi ronde, tiap ronde semua pemain jalan satu kali
  const order=[];
  for(let round=0;round<teamsPerPlayer;round++){
    for(let p=0;p<players.length;p++){
      order.push({player:p,tier:perPlayerSeq[p][round]});
    }
  }
  
  state={
    players,
    tiers,
    tierNames,
    tierQuota,
    order,
    step:0,
    teamPerPlayer:teamsPerPlayer,
    results:players.map(()=>[])
  };
  
  $("setup").classList.add("hidden");
  $("draw").classList.remove("hidden");
  $("result").classList.add("hidden");
  $("bracketSection").classList.add("hidden");
  updateTurn();
  $("status").textContent="Tim sudah diacak per tier. Tekan SPIN.";
};

function renderWheel(){
  const current=state.order[state.step];
  const pool=state.tiers[current.tier];
  const wheelEl=$("wheel");
  wheelEl.style.transition="none";
  wheelEl.style.transform="rotate(0deg)";
  wheelEl.innerHTML="";
  const n=pool.length;
  if(n===0)return;
  const seg=360/n;
  // warna tier pertama (kuat) = emas, tier lain (biasa) = cyan
  const isFirstTier=current.tier===state.tierNames[0];
  const colors=isFirstTier?["#ffd700","#ff9d00"]:["#00d9ff","#0878d1"];
  const stops=pool.map((_,i)=>`${colors[i%2]} ${i*seg}deg ${(i+1)*seg}deg`).join(",");
  wheelEl.style.background=`conic-gradient(from 0deg, ${stops})`;
  
  pool.forEach((team,i)=>{
    const angle=i*seg+seg/2;
    if(n>14)return; // pool kegedean, label bakal numpuk — biarin cuma warna aja
    const label=document.createElement("div");
    label.className="wheel-label";
    label.style.transform=`rotate(${angle}deg)`;
    const span=document.createElement("span");
    span.textContent=team;
    label.appendChild(span);
    wheelEl.appendChild(label);
  });
}

function updateTurn(){
  const current=state.order[state.step];
  const currentPlayer=state.players[current.player];
  const drawnCount=state.results[current.player].length;
  
  $("playerName").textContent=currentPlayer;
  $("progress").textContent=`${drawnCount}/${state.teamPerPlayer}`;
  $("tierInfo").textContent=`${current.tier} — Team ${drawnCount+1}`;
  $("status").textContent="Tekan SPIN untuk memutar roda";
  $("readoutText").textContent="READY";
  renderWheel();
}

let spinTimer=null;
let readoutTimer=null;
$("spin").onclick=()=>spin(false);
$("skip").onclick=()=>spin(true);

function spin(skip){
  if(spinTimer)return;
  const current=state.order[state.step];
  const pool=state.tiers[current.tier];
  if(!pool||!pool.length){advance();return}
  
  $("spin").disabled=true;
  $("skip").disabled=true;
  
  const n=pool.length;
  const seg=360/n;
  const target=Math.floor(Math.random()*n);
  const targetMid=target*seg+seg/2;
  const wheelEl=$("wheel");
  
  if(skip){
    finish(target);
    return;
  }
  
  const spins=4+Math.floor(Math.random()*3);
  const finalRotation=spins*360+((360-targetMid)%360);
  $("status").textContent="Memutar...";
  wheelEl.style.transition="transform 4s cubic-bezier(0.12,0.67,0.15,1)";
  requestAnimationFrame(()=>{ wheelEl.style.transform=`rotate(${finalRotation}deg)`; });
  
  // teks nama tim ikut "berputar" di kotak baca biar tetap kebaca walau pool-nya besar
  let ri=0;
  readoutTimer=setInterval(()=>{
    $("readoutText").textContent=pool[ri%pool.length];
    ri++;
  },70);
  
  spinTimer=setTimeout(()=>{
    spinTimer=null;
    finish(target);
  },4200);
}

function finish(i){
  const current=state.order[state.step];
  const pool=state.tiers[current.tier];
  const team=pool.splice(i,1)[0];
  state.results[current.player].push({team,tier:current.tier});
  if(readoutTimer){clearInterval(readoutTimer);readoutTimer=null}
  $("readoutText").textContent=withFlag(team);
  $("status").textContent=`✓ ${withFlag(team)}`;
  
  setTimeout(()=>{
    $("spin").disabled=false;
    $("skip").disabled=false;
    advance();
  },900);
}

function advance(){
  state.step++;
  if(state.step>=state.order.length){showResults();return}
  updateTurn();
}

function showResults(){
  $("draw").classList.add("hidden");
  $("result").classList.remove("hidden");
  
  const html=state.players.map((p,i)=>{
    const teams=state.results[i];
    return `<div class="card"><h3>${esc(p)}</h3>${teams.map(x=>`<div class="team"><span>${esc(withFlag(x.team))}</span><span class="badge">${esc(x.tier.replace(/[^\w\s]/g,'').trim())}</span></div>`).join("")}</div>`;
  }).join("");
  
  $("resultCards").innerHTML=html;
}

$("again").onclick=()=>{location.reload()};

$("bracketBtn").onclick=()=>{
  const clubs=state.results.flat().map(x=>x.team);
  const pairs=[];
  for(let i=0;i<clubs.length;i+=2)pairs.push([clubs[i],clubs[i+1]||"BYE"]);
  
  $("bracketSection").classList.remove("hidden");
  $("bracket").innerHTML=pairs.map((m,i)=>`<div class="match"><b>MATCH ${i+1}</b>${esc(withFlag(m[0]))}<br>VS<br>${esc(withFlag(m[1]))}</div>`).join("");
};

$("backBtn").onclick=()=>{$("bracketSection").classList.add("hidden");$("result").classList.remove("hidden")};

function esc(s){return s.replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
