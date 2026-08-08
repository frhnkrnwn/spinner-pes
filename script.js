const $=id=>document.getElementById(id);
let state={players:[],tiers:{elite:[],mid:[],dark:[]},order:[],idx:0,current:null,results:[]};

function lines(id){return $(id).value.split(/\\n/).map(x=>x.trim()).filter(Boolean)}
function shuffle(a){a=[...a];for(let i=a.length-1;i>0;i--){let j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}

$("demo").onclick=()=>{
  $("players").querySelectorAll("input")[0].value="Farhan";
  $("players").querySelectorAll("input")[1].value="Rio";
  $("players").querySelectorAll("input")[2].value="Dani";
  $("elite").value="Real Madrid\\nBarcelona\\nManchester City";
  $("mid").value="Liverpool\\nArsenal\\nInter";
  $("dark").value="Roma\\nPorto\\nDortmund";
};

$("start").onclick=()=>{
  const p=[...$("players").querySelectorAll("input")].map(x=>x.value.trim()||"Player");
  const e=lines("elite"),m=lines("mid"),d=lines("dark");
  if(p.length!==3||e.length!==3||m.length!==3||d.length!==3){alert("Isi tepat 3 pemain dan tepat 3 tim pada masing-masing kategori.");return}
  state={players:p,tiers:{elite:shuffle(e),mid:shuffle(m),dark:shuffle(d)},order:shuffle(["elite","mid","dark"]),idx:0,current:null,results:p.map(()=>[])};
  $("setup").classList.add("hidden");$("draw").classList.remove("hidden");$("result").classList.add("hidden");$("bracketSection").classList.add("hidden");
  updateTurn(); $("status").textContent="Kategori pertama sudah diacak. Tekan SPIN.";
};

function updateTurn(){
  $("playerName").textContent=state.players[state.idx];
  $("slotText").textContent="READY";
  $("status").textContent="Kategori: "+label(state.order[state.results[state.idx].length]);
}
function label(k){return k==="elite"?"ELITE":k==="mid"?"MENENGAH":"DARK HORSE"}

let timer=null;
$("spin").onclick=()=>spin(false);
$("skip").onclick=()=>spin(true);

function spin(skip){
  if(timer) return;
  const cat=state.order[state.results[state.idx].length];
  const pool=state.tiers[cat];
  if(!pool.length){advance();return}
  $("spin").disabled=true;$("skip").disabled=true;
  $("ball").classList.add("spinning");
  let n=0;
  if(skip){finish(cat,Math.floor(Math.random()*pool.length));return}
  timer=setInterval(()=>{
    $("slotText").textContent=pool[n%pool.length]; n++;
    if(n>=32){clearInterval(timer);timer=null;finish(cat,Math.floor(Math.random()*pool.length))}
  },55);
}
function finish(cat,i){
  const team=state.tiers[cat].splice(i,1)[0];
  state.results[state.idx].push({team,cat});
  $("slotText").textContent=team;
  $("status").textContent="✓ TERPILIH • "+label(cat);
  $("ball").classList.remove("spinning");
  setTimeout(()=>{timer=null;$("spin").disabled=false;$("skip").disabled=false;advance()},900);
}
function advance(){
  if(state.results.every(r=>r.length===3)){showResults();return}
  state.idx++;
  if(state.idx>=3)state.idx=0;
  updateTurn();
}
function showResults(){
  $("draw").classList.add("hidden");$("result").classList.remove("hidden");
  $("resultCards").innerHTML=state.players.map((p,i)=>`
    <div class="card"><h3>${esc(p)}</h3>
      ${state.results[i].map(x=>`<div class="team"><span>${esc(x.team)}</span><span class="badge ${x.cat==='elite'?'elite':x.cat==='mid'?'mid':'dark'}">${label(x.cat)}</span></div>`).join("")}
    </div>`).join("");
}
$("again").onclick=()=>{location.reload()};
$("bracketBtn").onclick=()=>{
  $("bracketSection").classList.remove("hidden");
  const clubs=state.results.flat().map(x=>x.team);
  const pairs=[];
  for(let i=0;i<clubs.length;i+=2)pairs.push([clubs[i],clubs[i+1]||"BYE"]);
  $("bracket").innerHTML=pairs.map((m,i)=>`<div class="match"><b>MATCH ${i+1}</b><br>⚽ ${esc(m[0])}<br>⚽ ${esc(m[1])}</div>`).join("");
  $("bracketSection").scrollIntoView({behavior:"smooth"});
};
function esc(s){return s.replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}