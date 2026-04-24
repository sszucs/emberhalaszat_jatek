const App = (() => {
  const screens = Array.from(document.querySelectorAll('.screen'));
  const lockables = Array.from(document.querySelectorAll('.lockable'));
  const progressContainer = document.getElementById('menuProgressSteps');

  const defaultProgress = { fishing: false, story: false, lesson: false };
  let progress = loadProgress();

  function loadProgress() {
    try {
      const raw = localStorage.getItem('lukacs5-progress');
      return raw ? { ...defaultProgress, ...JSON.parse(raw) } : { ...defaultProgress };
    } catch {
      return { ...defaultProgress };
    }
  }
  function saveProgress() {
    localStorage.setItem('lukacs5-progress', JSON.stringify(progress));
  }
  function markDone(key) {
    progress[key] = true;
    saveProgress();
    renderMenuLocks();
  }
  function resetProgress() {
    progress = { ...defaultProgress };
    saveProgress();
    renderMenuLocks();
    FishingGame.reset();
    StoryGame.reset();
    LessonGame.reset();
    goTo('menu');
  }

  function goTo(name) {
    screens.forEach(scr => scr.classList.toggle('active', scr.id === `screen-${name}`));
    if (name === 'fishing') FishingGame.start();
    if (name === 'story') StoryGame.render();
    if (name === 'lesson') LessonGame.render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    renderMenuLocks();
  }

  function renderMenuLocks() {
    const order = ['fishing', 'story', 'lesson'];
    progressContainer.innerHTML = '';
    order.forEach((key, idx) => {
      const el = document.createElement('div');
      el.className = 'step-pill';
      const done = progress[key];
      if (done) el.classList.add('done');
      else if (idx === order.findIndex(k => !progress[k])) el.classList.add('current');
      el.textContent = `${idx + 1}. ${labels[key]}${done ? ' ✓' : ''}`;
      progressContainer.appendChild(el);
    });

    lockables.forEach(card => {
      const key = card.dataset.lock;
      const unlocked = key === 'story' ? progress.fishing || false : progress.story || false;
      card.classList.toggle('is-locked', !unlocked);
      const btn = card.querySelector('button[data-go]');
      btn.disabled = false; // allow direct access too
      const note = card.querySelector('.locked-text');
      note.textContent = unlocked ? 'Megnyitva – bármikor folytatható.' : 'Ajánlott sorrend: előbb az előző játékmód.';
    });
  }

  const labels = {
    fishing: 'Emberhalászat',
    story: 'Interaktív történet',
    lesson: 'Tanulság-kihívások'
  };

  document.addEventListener('click', (e) => {
    const go = e.target.closest('[data-go]');
    if (go) goTo(go.dataset.go);
  });

  document.getElementById('resetProgressBtn').addEventListener('click', resetProgress);

  return { goTo, markDone, renderMenuLocks, get progress() { return progress; } };
})();

const FishingGame = (() => {
  const arena = document.getElementById('fishingArena');
  const boat = document.getElementById('boatSprite');
  const dropLine = document.getElementById('dropLine');
  const netEffect = document.getElementById('netEffect');
  const castBtn = document.getElementById('castNetBtn');
  const restartBtn = document.getElementById('restartFishingBtn');
  const timeEl = document.getElementById('fishingTime');
  const scoreEl = document.getElementById('fishingScore');
  const comboEl = document.getElementById('fishingCombo');
  const teachingText = document.getElementById('teachingText');
  const endOverlay = document.getElementById('fishingEndOverlay');
  const endTitle = document.getElementById('fishingEndTitle');
  const endSummary = document.getElementById('fishingEndSummary');
  const continueBtn = document.getElementById('fishingContinueBtn');
  const replayBtn = document.getElementById('fishingReplayBtn');

  const teachings = [
    'Jézus ott is tud adni, ahol mi már hiába próbálkoztunk.',
    'Az engedelmesség sokszor megelőzi a csodát.',
    'A történet lényege nem csak a hal, hanem az elhívás.',
    'Péter fáradt volt, mégis hitt Jézus szavának.',
    '„Ne félj” – Jézus a bizonytalanságban is vezet.',
    'Az emberek fontosak Jézusnak; ezért hív emberhalászatra.',
  ];

  let started = false;
  let running = false;
  let rafId = null;
  let timerId = null;
  let fishSpawnId = null;
  let timeLeft = 30;
  let score = 0;
  let combo = 1;
  let lastCatchAt = 0;
  let lastTeachIndex = 0;
  let boatX = 10;
  let boatDir = 1;
  let targets = [];

  function resetState() {
    timeLeft = 30;
    score = 0;
    combo = 1;
    lastCatchAt = 0;
    lastTeachIndex = 0;
    boatX = 10;
    boatDir = 1;
    targets = [];
    timeEl.textContent = String(timeLeft);
    scoreEl.textContent = String(score);
    comboEl.textContent = `x${combo}`;
    teachingText.textContent = '„A te szavadra mégis kivetem a hálót.”';
    clearTargets();
    hideOverlay(endOverlay);
  }

  function clearTargets() {
    arena.querySelectorAll('.target').forEach(el => el.remove());
  }

  function createTarget() {
    const type = Math.random() > 0.28 ? 'person' : 'thought';
    const el = document.createElement('div');
    el.className = `target ${type}`;
    el.textContent = type === 'person' ? '❤️' : '💭';
    el.style.left = `${rand(8, 90)}%`;
    el.style.top = `${rand(34, 84)}%`;
    const target = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      type,
      x: parseFloat(el.style.left),
      y: parseFloat(el.style.top),
      speed: rand(8, 18) / 10,
      dir: Math.random() > 0.5 ? 1 : -1,
      el,
    };
    arena.appendChild(el);
    targets.push(target);
  }

  function fillTargets() {
    while (targets.length < 8) createTarget();
  }

  function loop() {
    if (!running) return;
    boatX += 0.22 * boatDir;
    if (boatX >= 86) boatDir = -1;
    if (boatX <= 6) boatDir = 1;
    boat.style.left = `${boatX}%`;

    targets.forEach(target => {
      target.x += 0.12 * target.speed * target.dir;
      if (target.x > 92) target.dir = -1;
      if (target.x < 6) target.dir = 1;
      target.el.style.left = `${target.x}%`;
    });

    rafId = requestAnimationFrame(loop);
  }

  function castNet() {
    if (!running) return;
    castBtn.disabled = true;
    const x = boatX;
    dropLine.style.opacity = '1';
    dropLine.style.left = `${x}%`;
    dropLine.style.height = '0px';
    const arenaRect = arena.getBoundingClientRect();
    const dropHeight = Math.max(220, arenaRect.height * 0.72);

    requestAnimationFrame(() => {
      dropLine.style.transition = 'height .28s ease';
      dropLine.style.height = `${dropHeight}px`;
    });

    setTimeout(() => {
      netEffect.style.opacity = '1';
      netEffect.style.left = `${x}%`;
      netEffect.style.top = '74%';
      netEffect.style.transform = 'translate(-50%, -50%) scale(1.25)';

      const caught = targets.filter(t => Math.abs(t.x - x) < 8 && t.y > 34);
      const goodCatch = caught.filter(t => t.type === 'person');

      if (goodCatch.length) {
        const now = Date.now();
        combo = now - lastCatchAt < 2400 ? Math.min(combo + 1, 5) : 1;
        lastCatchAt = now;
        score += goodCatch.length * combo;
        scoreEl.textContent = String(score);
        comboEl.textContent = `x${combo}`;
        teachingText.textContent = teachings[lastTeachIndex % teachings.length];
        lastTeachIndex += 1;
      } else {
        combo = 1;
        comboEl.textContent = `x${combo}`;
        teachingText.textContent = 'Nem minden próbálkozás sikerül elsőre – Péter is Jézus szavára ment tovább.';
      }

      caught.forEach(t => {
        t.el.classList.add('caught');
      });
      targets = targets.filter(t => !caught.includes(t));
      setTimeout(() => {
        arena.querySelectorAll('.target.caught').forEach(el => el.remove());
        fillTargets();
      }, 420);
    }, 280);

    setTimeout(() => {
      dropLine.style.transition = 'height .24s ease, opacity .2s ease';
      dropLine.style.height = '0px';
      dropLine.style.opacity = '0';
      netEffect.style.opacity = '0';
      netEffect.style.transform = 'translate(-50%, -50%) scale(.5)';
      castBtn.disabled = false;
    }, 760);
  }

  function endGame() {
    running = false;
    started = true;
    cancelAnimationFrame(rafId);
    clearInterval(timerId);
    clearInterval(fishSpawnId);

    const title = score >= 16 ? 'Csodás fogás!' : score >= 8 ? 'Szép haladás!' : 'Jó kezdet!';
    const summary = score >= 16
      ? 'Jól időzítettél, és sok „embert” értél el. A történetben is Jézus szava nyitotta meg a lehetetlent.'
      : score >= 8
        ? 'Megérezted a játék ritmusát. Menj tovább a történethez, és nézd meg, hogyan válaszolt Péter Jézusnak.'
        : 'Nem baj, ha most kevesebb lett a fogás. Péter sem a saját erejére, hanem Jézus szavára támaszkodott.';

    endTitle.textContent = title;
    endSummary.textContent = `${summary} Pontszámod: ${score}.`;
    showOverlay(endOverlay);
    App.markDone('fishing');
  }

  function start() {
    if (running) return;
    resetState();
    running = true;
    fillTargets();
    loop();
    timerId = setInterval(() => {
      timeLeft -= 1;
      timeEl.textContent = String(timeLeft);
      if (timeLeft <= 0) endGame();
    }, 1000);
    fishSpawnId = setInterval(() => fillTargets(), 1800);
  }

  function reset() {
    running = false;
    cancelAnimationFrame(rafId);
    clearInterval(timerId);
    clearInterval(fishSpawnId);
    resetState();
  }

  castBtn.addEventListener('click', castNet);
  restartBtn.addEventListener('click', () => { reset(); start(); });
  replayBtn.addEventListener('click', () => { hideOverlay(endOverlay); reset(); start(); });
  continueBtn.addEventListener('click', () => { hideOverlay(endOverlay); App.goTo('story'); });

  return { start, reset };
})();

const StoryGame = (() => {
  const storyText = document.getElementById('storyText');
  const storySpeaker = document.getElementById('storySpeaker');
  const storyChoices = document.getElementById('storyChoices');
  const feedback = document.getElementById('storyFeedback');
  const stepLabel = document.getElementById('storyStepLabel');
  const progressFill = document.getElementById('storyProgressFill');
  const restartBtn = document.getElementById('restartStoryBtn');
  const endOverlay = document.getElementById('storyEndOverlay');
  const continueBtn = document.getElementById('storyContinueBtn');
  const menuBtn = document.getElementById('storyMenuBtn');

  const scenes = [
    {
      speaker: 'Jézus',
      text: 'Evezz a mélyre, és vessétek ki a hálókat fogásra!',
      correct: 1,
      options: [
        { text: '„Uram, most inkább csomagoljunk össze… egész éjjel dolgoztunk.”', feedback: 'Ez érthető lenne, mert Péter fáradt volt. Mégis továbbment Jézus szavára.' },
        { text: '„A te szavadra mégis kivetem a hálót.”', success: 'Igen! A történet egyik kulcsa az engedelmesség.' },
        { text: '„Rendben, de csak ha előre megígéred a sok halat!” 😄', feedback: 'A hit nem biztosítékokra, hanem Jézus szavára épül.' },
      ]
    },
    {
      speaker: 'Narrátor',
      text: 'Annyi hal került a hálóba, hogy majdnem elszakadt. Péter megrendülten Jézus elé borult.',
      correct: 2,
      options: [
        { text: '„Na ugye, én vagyok a legjobb halász!” 😄', feedback: 'Péter nem dicsekedett, hanem alázattal reagált.' },
        { text: '„Gyorsan nyissunk halboltot!”', feedback: 'A halfogás nagy volt, de a történet nem üzletről szól.' },
        { text: '„Uram, menj el tőlem, mert bűnös ember vagyok.”', success: 'Igen. Péter felismerte Jézus szentségét és saját kicsiségét.' },
      ]
    },
    {
      speaker: 'Jézus',
      text: 'Ne félj! Mostantól embereket fogsz halászni.',
      correct: 0,
      options: [
        { text: 'Péter és társai mindent otthagytak, és követték Jézust.', success: 'Pontosan. Az elhívás választ kért, és Péter igent mondott.' },
        { text: 'Péter azt mondta: „Majd még átgondolom.”', feedback: 'A történet szerint Péter azonnal reagált Jézus hívására.' },
        { text: 'Péter azt kérte: „Előbb szerezzünk még több hálót.”', feedback: 'Jézus nem jobb felszerelésre, hanem követésre hívta.' },
      ]
    },
    {
      speaker: 'Péter',
      text: 'Mit jelent számodra ma Jézus szava?',
      correct: 1,
      options: [
        { text: '„Csak akkor lépek, ha minden logikus.”', feedback: 'A hit nem vak, de sokszor megelőzi a teljes megértést.' },
        { text: '„Bízhatok Jézusban akkor is, ha most nem látom előre a végeredményt.”', success: 'Ez a történet egyik mai üzenete.' },
        { text: '„Majd egyszer talán figyelek rá.”', feedback: 'Jézus megszólítása személyes választ vár.' },
      ]
    }
  ];

  let index = 0;
  let removedMap = {};

  function render() {
    hideOverlay(endOverlay);
    const scene = scenes[index];
    stepLabel.textContent = `Jelenet ${index + 1} / ${scenes.length}`;
    progressFill.style.width = `${(index / scenes.length) * 100}%`;
    storySpeaker.textContent = scene.speaker;
    storyText.textContent = scene.text;
    feedback.classList.add('hidden');
    feedback.classList.remove('success');
    feedback.textContent = '';
    storyChoices.innerHTML = '';

    scene.options.forEach((option, idx) => {
      if (removedMap[index]?.includes(idx)) return;
      const btn = document.createElement('button');
      btn.className = 'choice-btn';
      btn.type = 'button';
      btn.textContent = option.text;
      btn.addEventListener('click', () => choose(idx));
      storyChoices.appendChild(btn);
    });
  }

  function choose(idx) {
    const scene = scenes[index];
    const option = scene.options[idx];
    if (idx === scene.correct) {
      feedback.textContent = option.success || 'Helyes válasz.';
      feedback.classList.remove('hidden');
      feedback.classList.add('success');
      storyChoices.querySelectorAll('button').forEach(btn => btn.disabled = true);
      setTimeout(() => {
        if (index < scenes.length - 1) {
          index += 1;
          render();
        } else {
          progressFill.style.width = '100%';
          App.markDone('story');
          showOverlay(endOverlay);
        }
      }, 950);
    } else {
      feedback.textContent = option.feedback + ' Most már csak a helyes út marad nyitva.';
      feedback.classList.remove('hidden');
      feedback.classList.remove('success');
      removedMap[index] = [...(removedMap[index] || []), idx];
      setTimeout(render, 900);
    }
  }

  function reset() {
    index = 0;
    removedMap = {};
    render();
  }

  restartBtn.addEventListener('click', reset);
  continueBtn.addEventListener('click', () => { hideOverlay(endOverlay); App.goTo('lesson'); });
  menuBtn.addEventListener('click', () => { hideOverlay(endOverlay); App.goTo('menu'); });

  return { render, reset };
})();

const LessonGame = (() => {
  const stage = document.getElementById('lessonStage');
  const stepLabel = document.getElementById('lessonStepLabel');
  const progressFill = document.getElementById('lessonProgressFill');
  const restartBtn = document.getElementById('restartLessonBtn');
  const endOverlay = document.getElementById('lessonEndOverlay');
  const endSummary = document.getElementById('lessonEndSummary');
  const menuBtn = document.getElementById('lessonMenuBtn');
  const replayBtn = document.getElementById('lessonReplayBtn');

  let index = 0;
  let score = 0;

  const challenges = [
    {
      type: 'fear',
      title: '„Ne félj” – mit teszel a félelmeiddel?',
      text: 'Koppints azokra a félelmekre, amelyeket Jézus elé vihetsz. Ha mind eltűnik, megjelenik az üzenet.',
      fears: ['Mi lesz, ha nem sikerül?', 'Fáradt vagyok.', 'Nem látom előre.', 'Mit szólnak mások?'],
      reveal: 'Jézus nem csak feladatot ad, hanem bátorít is: „Ne félj.”'
    },
    {
      type: 'decision',
      title: 'Hit a szavára – amikor emberileg nincs értelme',
      text: 'Képzeld el: mindent megtettél, mégsem történt semmi. Mi visz tovább?',
      options: [
        { text: 'Feladom, mert úgysem érdemes már próbálkozni.', correct: false, feedback: 'Érthető reakció, de a történet arra hív, hogy Jézus szava szerint lépj tovább.' },
        { text: 'Megteszem Jézus szavára a következő lépést.', correct: true, feedback: 'Igen! Péter sem a körülmények alapján döntött, hanem Jézus szavára.' },
        { text: 'Csak akkor indulok, ha minden részlet biztos.', correct: false, feedback: 'A hit sokszor megelőzi a teljes megértést.' },
      ]
    },
    {
      type: 'metaphor',
      title: '„Ezután emberhalász leszel”',
      text: 'Érintsd meg az átalakulás gombot, és figyeld meg a képet: a munka eszköze küldetéssé válik.',
      reveal: 'Jézus nem lecserélte Pétert, hanem új célt adott annak, amit már ismert.',
    }
  ];

  function render() {
    hideOverlay(endOverlay);
    const challenge = challenges[index];
    stepLabel.textContent = `Kihívás ${index + 1} / ${challenges.length}`;
    progressFill.style.width = `${(index / challenges.length) * 100}%`;

    if (challenge.type === 'fear') renderFear(challenge);
    if (challenge.type === 'decision') renderDecision(challenge);
    if (challenge.type === 'metaphor') renderMetaphor(challenge);
  }

  function renderFear(challenge) {
    stage.innerHTML = `
      <div class="lesson-stage-grid">
        <div class="lesson-main">
          <h3>${challenge.title}</h3>
          <p>${challenge.text}</p>
          <div class="fear-bubbles" id="fearBubbles"></div>
          <div class="lesson-feedback hidden" id="lessonFeedback"></div>
        </div>
        <aside class="lesson-panel">
          <p class="eyebrow">Vizuális fókusz</p>
          <h3>Bátorság Jézustól</h3>
          <p>Ebben a történetben Jézus nem elbagatellizálja Péter félelmét, hanem reménnyel szól hozzá.</p>
        </aside>
      </div>`;

    const wrap = document.getElementById('fearBubbles');
    const feedback = document.getElementById('lessonFeedback');
    let dismissed = 0;

    challenge.fears.forEach(fear => {
      const btn = document.createElement('button');
      btn.className = 'fear-bubble';
      btn.type = 'button';
      btn.textContent = fear;
      btn.addEventListener('click', () => {
        if (btn.classList.contains('dismissed')) return;
        btn.classList.add('dismissed');
        dismissed += 1;
        if (dismissed === challenge.fears.length) {
          score += 1;
          feedback.textContent = challenge.reveal;
          feedback.classList.remove('hidden');
          setTimeout(next, 1200);
        }
      });
      wrap.appendChild(btn);
    });
  }

  function renderDecision(challenge) {
    stage.innerHTML = `
      <div class="lesson-stage-grid">
        <div class="lesson-main">
          <h3>${challenge.title}</h3>
          <p>${challenge.text}</p>
          <div class="challenge-options" id="challengeOptions"></div>
          <div class="lesson-feedback hidden" id="lessonFeedback"></div>
        </div>
        <aside class="lesson-panel">
          <p class="eyebrow">Kulcsvers</p>
          <h3>„A te szavadra...”</h3>
          <p>A hit itt nem érzés, hanem válasz Jézus megszólítására.</p>
        </aside>
      </div>`;

    const wrap = document.getElementById('challengeOptions');
    const feedback = document.getElementById('lessonFeedback');
    challenge.options.forEach(option => {
      const btn = document.createElement('button');
      btn.className = 'challenge-btn';
      btn.type = 'button';
      btn.textContent = option.text;
      btn.addEventListener('click', () => {
        wrap.querySelectorAll('button').forEach(b => b.disabled = true);
        feedback.textContent = option.feedback;
        feedback.classList.remove('hidden');
        if (option.correct) score += 1;
        setTimeout(next, 1200);
      });
      wrap.appendChild(btn);
    });
  }

  function renderMetaphor(challenge) {
    stage.innerHTML = `
      <div class="lesson-stage-grid">
        <div class="lesson-main">
          <h3>${challenge.title}</h3>
          <p>${challenge.text}</p>
          <div class="metaphor-wrap">
            <div class="metaphor-card">🐟🎣</div>
            <div class="metaphor-arrow">→</div>
            <div class="metaphor-card" id="metaphorTarget">❤️🧭</div>
          </div>
          <div class="challenge-options">
            <button class="primary-btn" id="revealMissionBtn" type="button">Átalakulás megmutatása</button>
          </div>
          <div class="lesson-feedback hidden" id="lessonFeedback"></div>
        </div>
        <aside class="lesson-panel">
          <p class="eyebrow">Lelki üzenet</p>
          <h3>Elhívás</h3>
          <p>Jézus a hétköznapi készségekből is tud küldetést formálni.</p>
        </aside>
      </div>`;

    const feedback = document.getElementById('lessonFeedback');
    const revealBtn = document.getElementById('revealMissionBtn');
    const metaphorTarget = document.getElementById('metaphorTarget');
    revealBtn.addEventListener('click', () => {
      metaphorTarget.textContent = '🫶👣';
      feedback.textContent = challenge.reveal;
      feedback.classList.remove('hidden');
      score += 1;
      setTimeout(() => {
        progressFill.style.width = '100%';
        App.markDone('lesson');
        endSummary.textContent = `3 kihívásból ${score} pontot szereztél. A történet üzenete ma is él: Jézus szava megbízható, ezért bátran lehet rálépni az útra, amerre hív.`;
        showOverlay(endOverlay);
      }, 1300);
    }, { once: true });
  }

  function next() {
    if (index < challenges.length - 1) {
      index += 1;
      render();
    }
  }

  function reset() {
    index = 0;
    score = 0;
    render();
  }

  restartBtn.addEventListener('click', reset);
  menuBtn.addEventListener('click', () => { hideOverlay(endOverlay); App.goTo('menu'); });
  replayBtn.addEventListener('click', () => { hideOverlay(endOverlay); reset(); });

  return { render, reset };
})();

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function showOverlay(el) { el.classList.remove('hidden'); }
function hideOverlay(el) { el.classList.add('hidden'); }

App.renderMenuLocks();
StoryGame.reset();
LessonGame.reset();
