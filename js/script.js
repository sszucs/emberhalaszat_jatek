// Stage 1 – sequence ordering
const correctOrder = [
  'Fáradtság',
  'Jézus szava',
  'Engedelmesség',
  'Csoda',
  'Felismerés',
  'Bűnbánat',
  'Elhívás',
  'Követés'
];

let shuffled = [...correctOrder].sort(()=>Math.random()-.5);
const seqList = document.getElementById('sequenceList');
const feedback = document.getElementById('sequenceFeedback');
let current = 0;

shuffled.forEach(item=>{
  const el=document.createElement('div');
  el.className='sequence-item';
  el.textContent=item;
  el.onclick=()=>{
    if(el.classList.contains('correct')) return;
    if(item===correctOrder[current]){
      el.classList.add('correct');
      current++;
      if(current===correctOrder.length){
        feedback.textContent='Figyeld meg: a csoda nem indít, hanem követ. A történet belső logikája engedelmességgel kezdődik.';
      }
    }else{
      feedback.textContent='Érdemes újra megnézni: valóban itt történik a fordulat?';
    }
  };
  seqList.appendChild(el);
});

// Stage 2 – turning point
const turningPoints = correctOrder;
const tpWrap = document.getElementById('turningOptions');
const tpRef = document.getElementById('turningReflection');
turningPoints.forEach(p=>{
  const el=document.createElement('div');
  el.className='option';
  el.textContent=p;
  el.onclick=()=>{
    document.querySelectorAll('#turningOptions .option').forEach(o=>o.classList.remove('selected'));
    el.classList.add('selected');
    tpRef.textContent='Miért itt látod a fordulatot? A szöveg nem ad egyetlen helyes választ – a felismerés mélysége számít.';
  };
  tpWrap.appendChild(el);
});

// Stage 3 – personal stage
const personalStates = [
  'Fáradt vagyok és kiürültem',
  'Hallom Jézus szavát, de halogatok',
  'Megléptem, de nem látok eredményt',
  'Valami váratlan történt',
  'Többet látok, mint sikert',
  'Tudom, hogy hív, de félek',
  'Már követem, de tanulom újra'
];
const psWrap = document.getElementById('personalOptions');
const psRef = document.getElementById('personalReflection');

personalStates.forEach(s=>{
  const el=document.createElement('div');
  el.className='option';
  el.textContent=s;
  el.onclick=()=>{
    document.querySelectorAll('#personalOptions .option').forEach(o=>o.classList.remove('selected'));
    el.classList.add('selected');
    psRef.textContent='A történet nem sürget. De nem hagy mozdulatlanul sem.';
  };
  psWrap.appendChild(el);
});
