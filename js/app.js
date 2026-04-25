// Tabs
const tabs=document.querySelectorAll('nav button'),sections=document.querySelectorAll('.tab');
tabs.forEach(b=>b.onclick=()=>{tabs.forEach(x=>x.classList.remove('active'));b.classList.add('active');sections.forEach(s=>s.classList.remove('active'));document.getElementById(b.dataset.tab).classList.add('active')});

// GAME 1 STORY
const story=[
  'A sokaság Jézushoz tódult, és hallgatta Isten igéjét.',
  'A parton két hajó állt; a halászok hálóikat mosták.',
  'Jézus ezt mondta: »Evezz a mélyre.«',
  '»A te szavadra mégis kivetem a hálót.«',
  'A hálók megteltek, Péter megrendült.',
  '»Ne félj; mostantól embereket fogsz halászni.«',
  'Kihúzták a hajókat a partra és követték őt.'
];
let si=0;const card=document.getElementById('storyCard');const prog=document.getElementById('storyProgress');
function renderStory(){card.innerHTML=`<p class='text'>${story[si]}</p>`;prog.style.width=((si+1)/story.length*100)+'%';}
renderStory();
document.getElementById('nextStory').onclick=()=>{if(si<story.length-1){si++;renderStory()}};
document.getElementById('prevStory').onclick=()=>{if(si>0){si--;renderStory()}};

// GAME 2 FISH
const lake=document.getElementById('lake'),cast=document.getElementById('castBtn'),msg=document.getElementById('fishMsg');
function spawn(){const p=document.createElement('div');p.className='person';p.textContent='🧍';p.style.left='110%';p.style.top=(20+Math.random()*160)+'px';lake.appendChild(p);setTimeout(()=>p.remove(),6000);}setInterval(spawn,1800);
cast.onclick=()=>{msg.textContent='Valaki meghívva érezte magát.'};

// GAME 3 LEARN
const steps=['Fáradtság','Jézus megszólít','Tanítás','Engedelmesség','Csoda','Felismerés','Elhívás','Követés'];const order=document.getElementById('order');const orderMsg=document.getElementById('orderMsg');
let cur=0;steps.sort(()=>Math.random()-.5).forEach(t=>{const d=document.createElement('div');d.textContent=t;d.onclick=()=>{if(t===steps[cur]){orderMsg.textContent='Jó irány.';d.style.opacity=.4;cur++;}};order.appendChild(d)});
const states=['Kimerültség','Kétely','Nyitottság','Újrakezdés'];const so=document.getElementById('stateOptions');const sm=document.getElementById('stateMsg');states.forEach(s=>{const d=document.createElement('div');d.textContent=s;d.onclick=()=>sm.textContent='Isten itt is szólítani tud.';so.appendChild(d)});
