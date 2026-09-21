
// Floating flowers + ribbons for the surprise and confirmation pages.
function buildCelebration(containerId, seedOffset=0){
  const root = document.getElementById(containerId);
  if(!root || root.dataset.ready) return;
  root.dataset.ready = 'true';

  const flowers = ['🌸','🌷','🌼','💮','🌺'];
  for(let i=0;i<13;i++){
    const el = document.createElement('span');
    el.className = 'float-flower';
    el.textContent = flowers[(i + seedOffset) % flowers.length];
    el.style.setProperty('--x', `${4 + ((i*17 + seedOffset*9) % 92)}%`);
    el.style.setProperty('--delay', `${-(i*1.37 + seedOffset*.6)}s`);
    el.style.setProperty('--dur', `${10 + (i%5)*1.8}s`);
    el.style.setProperty('--drift', `${-36 + (i%7)*12}px`);
    el.style.setProperty('--size', `${18 + (i%4)*6}px`);
    root.appendChild(el);
  }

  for(let i=0;i<10;i++){
    const ribbon = document.createElement('span');
    ribbon.className = 'float-ribbon';
    ribbon.style.setProperty('--x', `${7 + ((i*23 + seedOffset*11) % 86)}%`);
    ribbon.style.setProperty('--delay', `${-(i*1.71 + 1.2 + seedOffset*.4)}s`);
    ribbon.style.setProperty('--dur', `${11 + (i%4)*2.1}s`);
    ribbon.style.setProperty('--drift', `${-42 + (i%6)*16}px`);
    ribbon.style.setProperty('--turn', `${120 + (i%5)*55}deg`);
    ribbon.style.setProperty('--tone', `${i%4}`);
    root.appendChild(ribbon);
  }
}
buildCelebration('celebrationIntro', 0);
buildCelebration('celebrationConfirm', 3);


const data = window.SITE_DATA;
const scenes = [...document.querySelectorAll('.scene')];
let currentScene = 0;
let openedGift = false;

function go(sceneIndex){
  // The loading animation belongs only immediately after the secret-code unlock.
  // Once it has completed, never show that screen again.
  if(sceneIndex === 1 && loadingStarted && currentScene !== 0) return;
  currentScene = sceneIndex;
  scenes.forEach((scene,idx)=>scene.classList.toggle('active', idx===sceneIndex));
  if(sceneIndex >= 5){
    playPhotograph();
  } else {
    stopPhotograph();
  }
  if(sceneIndex===1 && unlockAccepted) startLoadingSequence();
  if(sceneIndex===4) renderPoem();
  finalConfettiActive = false;
  if(sceneIndex===10) burst(55, window.innerWidth/2, window.innerHeight*.22);
}

const unlockBtn = document.getElementById('unlockBtn');
const passwordFeedback = document.getElementById('passwordFeedback');
const codeInputs = [...document.querySelectorAll('.code-input')];
let loadingTimer = null;
let loadingStarted = false;
let unlockAccepted = false;

function getEnteredCode(){
  return codeInputs.map(input => input.value).join('');
}
function clearCode(){
  codeInputs.forEach(input => input.value = '');
  codeInputs[0]?.focus();
}
async function startLoadingSequence(){
  if(loadingStarted) return;
  loadingStarted = true;

  const card = document.querySelector('.loading-card');
  const targets = [...document.querySelectorAll('.loading-write')];

  for(const el of targets) el.textContent = '';
  card?.classList.remove('writing-done');

  for(let idx = 0; idx < targets.length; idx++){
    const el = targets[idx];
    const text = el.dataset.text || '';
    const chars = Array.from(text);

    for(let i = 0; i < chars.length; i++){
      el.textContent += chars[i];
      const baseDelay = window.innerWidth < 600 ? 26 : 34;
      const punctuationPause = /[.,…♡]/.test(chars[i]) ? 95 : 0;
      await new Promise(r => setTimeout(r, baseDelay + punctuationPause));
    }
    await new Promise(r => setTimeout(r, idx === targets.length - 1 ? 500 : 280));
  }

  card?.classList.add('writing-done');
  await new Promise(r => setTimeout(r, 650));
  go(2);
}
function checkPassword(){
  const code = getEnteredCode();
  if(code === '2210'){
    unlockAccepted = true;
    passwordFeedback.textContent = 'Unlocked ✨';
    passwordFeedback.classList.remove('error');
    passwordFeedback.classList.add('success');
    unlockBtn.disabled = true;
    setTimeout(()=>go(1), 450);
  } else {
    passwordFeedback.textContent = 'Wrong password, try again';
    passwordFeedback.classList.remove('success');
    passwordFeedback.classList.add('error');
    codeInputs.forEach(input => input.value = '');
    codeInputs[0]?.focus();
  }
}
codeInputs.forEach((input, idx) => {
  input.addEventListener('input', (e) => {
    input.value = input.value.replace(/\D/g, '').slice(0,1);
    if(input.value && idx < codeInputs.length - 1) codeInputs[idx+1].focus();
    if(getEnteredCode().length === codeInputs.length) checkPassword();
  });
  input.addEventListener('keydown', (e) => {
    if(e.key === 'Backspace' && !input.value && idx > 0) codeInputs[idx-1].focus();
    if(e.key === 'Enter') checkPassword();
  });
  input.addEventListener('paste', (e) => {
    e.preventDefault();
    const pasted = (e.clipboardData.getData('text') || '').replace(/\D/g,'').slice(0,4).split('');
    if(!pasted.length) return;
    codeInputs.forEach((box,i)=>box.value = pasted[i] || '');
    const focusIndex = Math.min(pasted.length, codeInputs.length - 1);
    codeInputs[focusIndex].focus();
    if(getEnteredCode().length === codeInputs.length) checkPassword();
  });
});
unlockBtn.addEventListener('click', checkPassword);
setTimeout(()=>codeInputs[0]?.focus(), 200);

document.querySelectorAll('[data-go]').forEach(btn=>btn.addEventListener('click',()=>go(Number(btn.dataset.go))));

// Gift interaction
const giftBox = document.getElementById('giftBox');
const openBtn = document.getElementById('openBtn');
function openGift(){
  openedGift = true;
  giftBox.classList.add('open');
  setTimeout(()=>go(3), 650);
}
giftBox.addEventListener('click', openGift);
openBtn.addEventListener('click', openGift);

// Playful yes button; the no button stays put.
const yesBtn = document.getElementById('yesBtn');
const noBtn = document.getElementById('noBtn');
let yesDodges = 0;
const yesTexts = ['catch me first 🤭','are you really sure? 🥺','okay okay… one more 😇','fine, you win 💗'];
function teaseYes(){
  if(yesDodges >= 3){
    yesBtn.style.transform = 'none';
    yesBtn.textContent = 'Okay, open it 💗';
    return;
  }
  yesDodges++;
  yesBtn.textContent = yesTexts[yesDodges-1];
  if(window.innerWidth > 700){
    const x = (Math.random() * 190) - 95;
    const y = (Math.random() * 76) - 38;
    yesBtn.style.transform = `translate(${x}px, ${y}px)`;
  }
}
yesBtn.addEventListener('mouseenter', teaseYes);
yesBtn.addEventListener('click', (e)=>{
  if(yesDodges < 3){ e.preventDefault(); teaseYes(); }
  else { go(4); }
});
noBtn.addEventListener('click', ()=>go(2));

// Film strips
function fillFilm(containerId, list){
  const el = document.getElementById(containerId);
  const doubled = [...list, ...list];
  el.innerHTML = `<div class="film-track">${doubled.map(src => `<div class="film-frame"><img src="assets/${src}" alt="memory"></div>`).join('')}</div>`;
}
fillFilm('filmLeft', data.poemStrips.left);
fillFilm('filmRight', data.poemStrips.right);

// Full poem reveal — no “next stanza” controls.
const poemParts = [
`A cute little kid,
hard to resist,
Now turning 28,
Disciplined , determined, he persists`,
`A soul so pure,
with a heart so nice,
hardworking and Driven,
De Shaw is yours for sure !!`,
`Your good morning messages make me smile
Making every sunrise worthwhile ♥️`,
`From secrets to endless gossip,
No day goes by without a single detail to skip
Every tiny moment , every story in view
somehow every little thing finds its way to you`,
`Hope this birthday brings abundance of joy,
Not leaving a single moment you don't enjoy`
];
let poemRendered = false;
function renderPoem(){
  const target = document.getElementById('poemFull');
  if(!target) return;
  if(!poemRendered){
    target.innerHTML = poemParts.map(p=>`<div class="stanza">${p.split('\n').join('<br>')}</div>`).join('');
    poemRendered = true;
  }
}

// Memory boards — all photos are visible immediately in a larger scrapbook grid.
const rotations = [-3,2,-1,3,-2,1,-2,2,-1,3,-3,1];
function initScrapbook(n){
  const page = data.memoryPages[n-1];
  const board = document.getElementById(`scrapbook${n}`);
  document.getElementById(`memoryTitle${n}`).textContent = page.title;
  document.getElementById(`memorySub${n}`).textContent = page.subtitle;
  if(page.photos.length > 9) board.classList.add('scrapbook-many');
  board.innerHTML = page.photos.map((photo,idx)=>{
    const tapeClass = idx % 3 === 0 ? 'tape-top' : idx % 3 === 1 ? 'pin-dot' : 'tape-corner';
    return `<article class="scrap-card ${tapeClass}" style="--r:${rotations[idx % rotations.length]}deg;--delay:${idx*35}ms" tabindex="0">
      <img src="assets/${photo.src}" alt="${photo.caption}">
      <div class="scrap-caption">${photo.caption}</div>
    </article>`;
  }).join('');
  board.querySelectorAll('.scrap-card').forEach(card=>{
    card.addEventListener('click',()=>{
      board.querySelectorAll('.scrap-card').forEach(c=>c.classList.remove('focus-card'));
      card.classList.add('focus-card');
      setTimeout(()=>card.classList.remove('focus-card'), 900);
    });
  });
}
initScrapbook(1); initScrapbook(2); initScrapbook(3); initScrapbook(4); initScrapbook(5);


// Final note handwriting/typewriter animation.
let finalWritingStarted = false;
function typeTextInto(el, text, speed=34){
  return new Promise(async resolve=>{
    el.innerHTML = '';
    el.classList.add('is-writing');

    for(const ch of Array.from(text)){
      const span = document.createElement('span');
      span.className = 'ink-char';
      span.textContent = ch;
      el.appendChild(span);

      const pause = /[.,!?🥺♥️🎉]/.test(ch) ? 95 : 0;
      await new Promise(r => setTimeout(r, speed + pause));
    }

    el.classList.remove('is-writing');
    resolve();
  });
}
async function startFinalWriting(){
  if(finalWritingStarted) return;
  finalWritingStarted = true;
  const lines = [...document.querySelectorAll('#finalMessage .write-line')];
  const cursor = document.querySelector('#finalMessage .writing-cursor');
  if(cursor) cursor.style.opacity = '1';
  for(const line of lines){
    const text = line.dataset.text || '';
    await typeTextInto(line, text, window.innerWidth < 600 ? 24 : 30);
    await new Promise(r=>setTimeout(r, 180));
  }
  if(cursor) cursor.style.opacity = '.35';
}

// Envelope and confetti
const envelope = document.getElementById('envelope');
const sceneFinal = document.getElementById('scene-10');
envelope.addEventListener('click', ()=>{
  envelope.classList.add('open');
  burst(120, window.innerWidth/2, window.innerHeight*0.45);
  setTimeout(()=>{ sceneFinal.classList.add('revealed'); finalConfettiActive = true; startFinalWriting(); }, 1650);
});

const finalHeart = document.getElementById('finalHeart');
finalHeart?.addEventListener('click', ()=>{
  const rect = finalHeart.getBoundingClientRect();
  finalHeart.classList.remove('heart-pop');
  void finalHeart.offsetWidth;
  finalHeart.classList.add('heart-pop');
  burst(260, rect.left + rect.width/2, rect.top + rect.height/2);
  setTimeout(()=>finalHeart.classList.remove('heart-pop'), 650);
});


// No opening music. The user-provided Photograph track begins only when the memories start.
const photographAudio = document.getElementById('photographMusic');
photographAudio.volume = 0.34;

function playPhotograph(){
  if(photographAudio.paused){
    photographAudio.currentTime = 0;
    photographAudio.play().catch(()=>{});
  }
}
function stopPhotograph(){
  photographAudio.pause();
  photographAudio.currentTime = 0;
}

// Confetti
const canvas = document.getElementById('confetti');
const ctx = canvas.getContext('2d');
let confetti = [];
let finalConfettiActive = false;
let confettiFrame = 0;
function resizeCanvas(){ canvas.width = innerWidth * devicePixelRatio; canvas.height = innerHeight * devicePixelRatio; canvas.style.width = innerWidth + 'px'; canvas.style.height = innerHeight + 'px'; ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0); }
resizeCanvas(); window.addEventListener('resize', resizeCanvas);
function burst(count=90, x=innerWidth/2, y=innerHeight/3){
  for(let i=0;i<count;i++) confetti.push({ x, y, vx:(Math.random()-.5)*10, vy:-Math.random()*8-2, g:.18 + Math.random()*0.05, s:Math.random()*7+4, r:Math.random()*6.28, vr:(Math.random()-.5)*.3, life:120+Math.random()*70 });
}
function animate(){
  confettiFrame++;
  if(finalConfettiActive && confettiFrame % 3 === 0){
    confetti.push({x:Math.random()*innerWidth,y:-12,vx:(Math.random()-.5)*1.2,vy:1+Math.random()*2,g:.035,s:Math.random()*6+3,r:Math.random()*6.28,vr:(Math.random()-.5)*.16,life:320});
  }
  ctx.clearRect(0,0,innerWidth,innerHeight);
  confetti = confetti.filter(c=>c.life-- > 0);
  confetti.forEach((c,i)=>{
    c.x += c.vx; c.y += c.vy; c.vy += c.g; c.r += c.vr;
    ctx.save(); ctx.translate(c.x,c.y); ctx.rotate(c.r);
    ctx.fillStyle = ['#f4cddb','#f6e1b6','#f7f2ef','#d8a8bf','#b7d9f2'][i%5];
    ctx.fillRect(-c.s/2,-c.s/2,c.s,c.s*.65);
    ctx.restore();
  });
  requestAnimationFrame(animate);
}
animate();
