// Study Timer - minimal plain-web Pomodoro
(function(){
  const display = document.getElementById('display');
  const startBtn = document.getElementById('start');
  const pauseBtn = document.getElementById('pause');
  const resetBtn = document.getElementById('reset');
  const presets = document.querySelectorAll('.preset');
  const customMin = document.getElementById('custom-min');
  const setCustom = document.getElementById('set-custom');
  const modeLabel = document.getElementById('mode');
  const notifyToggle = document.getElementById('notify-toggle');
  const soundToggle = document.getElementById('sound-toggle');
  const totalMinEl = document.getElementById('total-min');
  const sessionsCountEl = document.getElementById('sessions-count');
  const historyEl = document.getElementById('history');

  const STORAGE_KEY = 'study-timer-data-v1';
  let data = {sessions:[], totalFocusMinutes:0, sessionsCompleted:0};
  try{const raw = localStorage.getItem(STORAGE_KEY); if(raw) data = JSON.parse(raw)}catch(e){console.warn(e)}

  function save(){localStorage.setItem(STORAGE_KEY, JSON.stringify(data))}

  function updateStatsUI(){totalMinEl.textContent = data.totalFocusMinutes; sessionsCountEl.textContent = data.sessionsCompleted; renderHistory()}

  function renderHistory(){historyEl.innerHTML=''; data.sessions.slice().reverse().forEach(s=>{
    const li = document.createElement('li');
    const d = new Date(s.t).toLocaleString();
    li.textContent = `${s.type} • ${s.minutes} min — ${d}`;
    historyEl.appendChild(li);
  })}

  // Timer state
  let duration = 25*60; // seconds
  let remaining = duration;
  let timerId = null;
  let running = false;
  let currentMode = 'Focus';

  function format(s){const m=Math.floor(s/60);const sec=s%60;return `${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`}

  function render(){display.textContent = format(remaining); modeLabel.textContent = currentMode}

  function start(){if(running) return; running=true; startBtn.disabled=true; pauseBtn.disabled=false; timerId=setInterval(tick,1000)}
  function pause(){if(!running) return; running=false; startBtn.disabled=false; pauseBtn.disabled=true; clearInterval(timerId)}
  function reset(){pause(); remaining = duration; render()}

  function tick(){if(remaining>0){remaining--; render()} else {finishSession()}}

  function finishSession(){pause(); playSound(); sendNotification(`${currentMode} finished`,'Time is up!'); // record
    const minutes = Math.round(duration/60);
    data.sessions.push({type:currentMode, minutes, t:Date.now()});
    if(currentMode === 'Focus'){data.totalFocusMinutes += minutes; data.sessionsCompleted += 1}
    save(); updateStatsUI(); // auto-switch mode
    if(currentMode==='Focus'){currentMode='Break'; duration=5*60 } else {currentMode='Focus'; duration=25*60}
    remaining = duration; render()
  }

  function setDurationMinutes(n, mode='Focus'){currentMode = mode; duration = Math.max(1,Math.round(n))*60; remaining = duration; render()}

  presets.forEach(b=>b.addEventListener('click', ()=>{
    const m = Number(b.dataset.minutes)||25;
    const label = b.textContent.toLowerCase().includes('break') ? 'Break' : 'Focus';
    setDurationMinutes(m,label);
  }))

  setCustom.addEventListener('click', ()=>{const m = Number(customMin.value)||25; setDurationMinutes(m,'Focus')})
  startBtn.addEventListener('click', ()=>{start();})
  pauseBtn.addEventListener('click', ()=>{pause();})
  resetBtn.addEventListener('click', ()=>{reset();})

  // Notification
  let notifyEnabled = false;
  notifyToggle.addEventListener('click', async ()=>{
    if(Notification.permission === 'granted'){notifyEnabled = !notifyEnabled; notifyToggle.textContent = notifyEnabled? 'Disable Notifications':'Enable Notifications'}
    else if(Notification.permission !== 'denied'){
      const p = await Notification.requestPermission(); if(p==='granted'){notifyEnabled=true; notifyToggle.textContent='Disable Notifications'}
    }
  })

  function sendNotification(title, body){if(!notifyEnabled) return; try{new Notification(title,{body})}catch(e){console.warn('notif',e)}}

  // Simple beep via AudioContext
  let audioCtx = null;
  function playSound(){if(!soundToggle.checked) return; try{if(!audioCtx) audioCtx = new (window.AudioContext||window.webkitAudioContext)(); const o = audioCtx.createOscillator(); const g = audioCtx.createGain(); o.type='sine'; o.frequency.value = 880; g.gain.value = 0.05; o.connect(g); g.connect(audioCtx.destination); o.start(); setTimeout(()=>{o.stop()},200)}catch(e){console.warn(e)}}

  // Initialize
  render(); updateStatsUI();

  // Expose for debugging
  window.__studyTimer = {setDurationMinutes, data, save}
})();
