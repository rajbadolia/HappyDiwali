const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];

// A deliberate, cinematic first impression before the celebration opens.
const entryScreen = $('#entryScreen');
const enterBtn = $('#enterBtn');
$('#heroExploreBtn').addEventListener('click', () => $('#celebrate').scrollIntoView({behavior:'smooth'}));
enterBtn.addEventListener('click', async () => {
  entryScreen.classList.add('opening');
  document.body.classList.add('entered');
  if (soundOn) await startMusic();
  setTimeout(() => { entryScreen.hidden = true; $('#celebrate').scrollIntoView({behavior:'smooth'}); }, 850);
});

const modal = $('#messageModal');
$$('.diya-tile').forEach(tile => tile.addEventListener('click', () => {
  $('#modalTitle').textContent = tile.dataset.title;
  $('#modalMessage').textContent = tile.dataset.message;
  modal.classList.add('show');
}));
$('#modalClose').addEventListener('click', () => modal.classList.remove('show'));
modal.addEventListener('click', e => { if(e.target === modal) modal.classList.remove('show'); });
document.addEventListener('keydown', e => { if(e.key === 'Escape') modal.classList.remove('show'); });


// Custom on-brand wish form. Only name and wish are collected; Google Form receives both through an invisible iframe.
const wishForm = $('#wishForm');
if (wishForm) {
  const wishMessage = $('#wishMessage');
  const wishCounter = $('#wishCounter');
  const wishStatus = $('#wishStatus');
  const wishSubmit = $('#wishSubmit');
  const wishSink = $('#googleWishSink');
  let wishSending = false;

  wishMessage.addEventListener('input', () => {
    wishCounter.textContent = `${wishMessage.value.length} / 500`;
  });

  wishForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if (wishSending || !wishForm.reportValidity()) return;

    wishSending = true;
    wishSubmit.disabled = true;
    wishSubmit.innerHTML = 'SENDING YOUR WISH… <span>✦</span>';
    wishStatus.classList.remove('error');
    wishStatus.textContent = 'Sending a little Diwali magic…';

    const postForm = document.createElement('form');
    postForm.method = 'POST';
    postForm.acceptCharset = 'UTF-8';
    postForm.action = 'https://docs.google.com/forms/d/e/1FAIpQLScBaesqgfgQ07kNYZNxsMXlQf8N5hTyHxJ7-cwMM9ZE6J2v_w/formResponse';
    postForm.target = 'googleWishSink';

    const answers = {
      'entry.1424073086': $('#wishName').value.trim(),
      'entry.1837834960': wishMessage.value.trim()
    };
    Object.entries(answers).forEach(([name, value]) => {
      const input = document.createElement('input');
      input.type = 'hidden'; input.name = name; input.value = value;
      postForm.appendChild(input);
    });

    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      wishSink.removeEventListener('load', onSinkLoad);
      postForm.remove();
      wishSending = false;
      wishSubmit.disabled = false;
      wishSubmit.innerHTML = 'SEND ANOTHER WISH <span>✦</span>';
      wishStatus.textContent = '✦ Thank you! Your wish has been submitted. Add another whenever you like.';
      wishForm.reset();
      wishCounter.textContent = '0 / 500';
    };
    const onSinkLoad = () => {
      // Ignore the iframe's initial about:blank load; only finish after the response navigation.
      if (postForm.isConnected) finish();
    };
    wishSink.addEventListener('load', onSinkLoad);
    document.body.appendChild(postForm);
    postForm.submit();

    // Cross-origin Google Forms does not expose its response body. This fallback prevents a stuck button.
    window.setTimeout(finish, 9000);
  });
}

// High-DPI canvas fireworks: rising comets, glowing multi-ring bursts, sparks and falling embers.
const canvas = $('#sparkCanvas'), ctx = canvas.getContext('2d');
let particles = [], rockets = [], raf;
const palette = ['#ffe8a3','#ffc45c','#fff7df','#f18b55','#e95c4b','#a8e6d5','#d8b4fe'];
function resize(){ const d=Math.min(devicePixelRatio||1,2); canvas.width=innerWidth*d; canvas.height=innerHeight*d; ctx.setTransform(d,0,0,d,0,0); }
addEventListener('resize', resize); resize();
function launchRocket(x,yTarget){ rockets.push({x, y:innerHeight+10, target:yTarget, vx:(Math.random()-.5)*1.5, vy:- (8+Math.random()*3), hue:palette[Math.floor(Math.random()*palette.length)], trail:[]}); }
function burst(x,y,amount=100,color){
  const base=color||palette[Math.floor(Math.random()*palette.length)];
  for(let i=0;i<amount;i++){
    const a=Math.random()*Math.PI*2, speed=(Math.random()**.45)* (2.1+Math.random()*5.8);
    particles.push({x,y,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed,life:55+Math.random()*45,max:100,size:.8+Math.random()*2.4,color:Math.random()<.18?'#fff9e8':base,drag:.982,gravity:.055,twinkle:Math.random()});
  }
  // A fine outer ring gives the burst a fuller, more realistic silhouette.
  for(let i=0;i<34;i++){const a=i/34*Math.PI*2;particles.push({x,y,vx:Math.cos(a)*5.2,vy:Math.sin(a)*5.2,life:38,max:38,size:1.2,color:'#fff2c4',drag:.99,gravity:.035,twinkle:0});}
}
function frame(){
  ctx.clearRect(0,0,innerWidth,innerHeight);
  rockets.forEach((r,i)=>{
    r.trail.push({x:r.x,y:r.y}); if(r.trail.length>9)r.trail.shift();
    r.x+=r.vx;r.y+=r.vy;r.vy+=.045;
    r.trail.forEach((p,j)=>{ctx.globalAlpha=j/r.trail.length*.65;ctx.fillStyle=r.hue;ctx.beginPath();ctx.arc(p.x,p.y,1.5,0,Math.PI*2);ctx.fill();});
    ctx.globalAlpha=1;ctx.shadowBlur=16;ctx.shadowColor=r.hue;ctx.fillStyle='#fff8df';ctx.beginPath();ctx.arc(r.x,r.y,2.2,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
    if(r.y<=r.target||r.vy>=-1){burst(r.x,r.y,95+Math.floor(Math.random()*45),r.hue);rockets.splice(i,1);}
  });
  particles=particles.filter(p=>p.life>0);
  particles.forEach(p=>{
    p.x+=p.vx;p.y+=p.vy;p.vx*=p.drag;p.vy=p.vy*p.drag+p.gravity;p.life--;
    const alpha=Math.min(1,p.life/18)*(p.twinkle&&Math.random()<.08?.35:1);
    ctx.globalAlpha=alpha;ctx.fillStyle=p.color;ctx.shadowBlur= p.size>2?8:3;ctx.shadowColor=p.color;
    ctx.beginPath();ctx.arc(p.x,p.y,p.size,0,Math.PI*2);ctx.fill();
  });
  ctx.globalAlpha=1;ctx.shadowBlur=0;raf=requestAnimationFrame(frame);
}
frame();

// Original, locally synthesised festive ambience and layered firework SFX (no external audio files).
let audioCtx=null, master=null, soundOn=false, musicNodes=[], musicTimer=null;
async function audioReady(){
  if(!audioCtx){audioCtx=new (window.AudioContext||window.webkitAudioContext)();master=audioCtx.createGain();master.gain.value=.42;master.connect(audioCtx.destination);} master.gain.setTargetAtTime(.42,audioCtx.currentTime,.15);
  if(audioCtx.state==='suspended') await audioCtx.resume();
}
function tone(freq,start,duration,type='sine',volume=.025,detune=0){
  const o=audioCtx.createOscillator(),g=audioCtx.createGain();o.type=type;o.frequency.setValueAtTime(freq,start);o.detune.value=detune;
  g.gain.setValueAtTime(.0001,start);g.gain.exponentialRampToValueAtTime(volume,start+.12);g.gain.exponentialRampToValueAtTime(.0001,start+duration);
  o.connect(g);g.connect(master);o.start(start);o.stop(start+duration+.03);musicNodes.push(o);
}
function chord(at,notes){notes.forEach((n,i)=>{tone(n,at,3.7,'sine',.012,i%2?4:-4);tone(n*2,at+.08,2.5,'triangle',.004);});}
async function startMusic(){
  await audioReady(); if(musicTimer)return;
  const now=audioCtx.currentTime;
  // Soft, warm, original ambient progression with bell-like notes.
  const progression=[[220,261.63,329.63],[196,246.94,293.66],[174.61,220,261.63],[196,246.94,329.63]];
  let step=0;
  const playBar=()=>{if(!soundOn)return;const t=audioCtx.currentTime;chord(t,progression[step%progression.length]);const melody=[659.25,587.33,523.25,587.33,783.99,659.25,587.33,523.25];[0,.55,1.1,1.65,2.2,2.75,3.3,3.85].forEach((d,i)=>tone(melody[(i+step)%melody.length],t+d,.75,'sine',.012));step++;};
  playBar();musicTimer=setInterval(playBar,4000);
}
function stopMusic(){if(musicTimer){clearInterval(musicTimer);musicTimer=null;} if(audioCtx)master.gain.setTargetAtTime(.0001,audioCtx.currentTime,.12);}
async function fireworkSound(intensity=1){
  if(!soundOn)return;await audioReady();const t=audioCtx.currentTime;
  // low distant thump
  const boom=audioCtx.createOscillator(),bg=audioCtx.createGain();boom.type='sine';boom.frequency.setValueAtTime(105,t);boom.frequency.exponentialRampToValueAtTime(38,t+.42);bg.gain.setValueAtTime(.0001,t);bg.gain.exponentialRampToValueAtTime(.22*intensity,t+.025);bg.gain.exponentialRampToValueAtTime(.0001,t+.75);boom.connect(bg);bg.connect(master);boom.start(t);boom.stop(t+.8);
  // bright crackling noise burst
  const length=Math.floor(audioCtx.sampleRate*.55),buffer=audioCtx.createBuffer(1,length,audioCtx.sampleRate),data=buffer.getChannelData(0);
  for(let i=0;i<length;i++)data[i]=(Math.random()*2-1)*Math.pow(1-i/length,2.4);
  const noise=audioCtx.createBufferSource(),filter=audioCtx.createBiquadFilter(),ng=audioCtx.createGain();noise.buffer=buffer;filter.type='highpass';filter.frequency.value=850;ng.gain.setValueAtTime(.0001,t+.035);ng.gain.exponentialRampToValueAtTime(.13*intensity,t+.07);ng.gain.exponentialRampToValueAtTime(.0001,t+.58);noise.connect(filter);filter.connect(ng);ng.connect(master);noise.start(t+.03);
}
$('#soundToggle').addEventListener('click',async()=>{
  soundOn=!soundOn;$('#soundIcon').textContent=soundOn?'♫':'♪';$('#soundLabel').textContent=soundOn?'MUSIC ON':'MUSIC OFF';
  $('#soundToggle').setAttribute('aria-pressed',String(soundOn));
  if(soundOn)await startMusic();else stopMusic();
});

let finaleRunning=false;
$('#celebrateBtn').addEventListener('click',async()=>{
  if(finaleRunning)return;finaleRunning=true;
  const btn=$('#celebrateBtn');btn.textContent='✨ CELEBRATING OUR TEAM ✨';
  const duration=9500, start=performance.now();
  const salvo=()=>{
    const count=innerWidth<600?2:3;
    for(let i=0;i<count;i++){const x=innerWidth*(.12+Math.random()*.76),y=innerHeight*(.12+Math.random()*.48);launchRocket(x,y);}
    fireworkSound(Math.random()>.7?1.25:.85);
  };
  salvo();const interval=setInterval(salvo,620);
  // A few immediate gold starbursts make the opening of the finale feel grand.
  for(let i=0;i<5;i++)setTimeout(()=>{burst(innerWidth*(.12+.19*i),innerHeight*(.22+Math.random()*.25),120,'#ffd879');fireworkSound(1.1);},i*260);
  setTimeout(()=>{clearInterval(interval);for(let i=0;i<8;i++)setTimeout(()=>launchRocket(innerWidth*(.08+Math.random()*.84),innerHeight*(.08+Math.random()*.35)),i*170);},duration-1800);
  const toast=$('#toast');toast.textContent='HAPPY DIWALI, SMART BAZAAR FAMILY!';toast.classList.add('show');setTimeout(()=>toast.classList.remove('show'),4200);
  setTimeout(()=>{btn.innerHTML='LIGHT UP THE NIGHT <span>✦</span>';finaleRunning=false;},duration+500);
});
