/* ============================================================
   AUDIO: Türknarzen (echte Aufnahme oder Synth-Fallback),
   Sound-Toggle und Kassettenrekorder
   Stellt window.TCD.playCreak / TCD.isSoundOn / TCD.reduced bereit.
   ============================================================ */
window.TCD = window.TCD || {};

(function(){
  TCD.reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let soundOn = false, audioCtx = null;
  const realCreak = new Audio('assets/audio/tuerknarzen.mp3');

  function synthCreak(duration = 2.4){
    if(!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const ctx = audioCtx;
    const osc = ctx.createOscillator(), gain = ctx.createGain(), filt = ctx.createBiquadFilter();
    osc.type = 'sawtooth'; filt.type = 'lowpass'; filt.frequency.value = 850; filt.Q.value = 9;
    osc.connect(filt); filt.connect(gain); gain.connect(ctx.destination);
    let t = ctx.currentTime; const end = t + duration;
    osc.frequency.setValueAtTime(120, t);
    let rising = true;
    while(t < end){
      t += 0.04 + Math.random() * 0.1;
      const base = rising ? 140 + (1 - (end - t) / duration) * 160 : 120;
      osc.frequency.linearRampToValueAtTime(base + Math.random() * 140, t);
      if(Math.random() < .15) rising = !rising;
    }
    const now = ctx.currentTime;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(.13, now + .2);
    gain.gain.setValueAtTime(.13, end - .5);
    gain.gain.linearRampToValueAtTime(0, end);
    osc.start(now); osc.stop(end + .05);
  }

  function playCreak(dur){
    realCreak.currentTime = 0;
    realCreak.play().catch(() => synthCreak(dur || 2.4));
  }

  TCD.playCreak = playCreak;
  TCD.isSoundOn = () => soundOn;

  /* Sound-Toggle (oben rechts im Tür-Akt) */
  const soundToggle = document.getElementById('soundToggle');
  soundToggle.addEventListener('click', () => {
    soundOn = !soundOn;
    soundToggle.textContent = 'Sound: ' + (soundOn ? 'an' : 'aus');
    soundToggle.setAttribute('aria-pressed', soundOn);
    if(soundOn && !audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if(!soundOn) realCreak.pause();
  });

  /* Kassette in der Story-Sektion */
  const tapeEl = document.getElementById('tape');
  let tapeTimer = null;
  document.getElementById('tapePlay').addEventListener('click', () => {
    tapeEl.classList.add('playing');
    document.getElementById('tapePlay').textContent = '◼ läuft …';
    realCreak.currentTime = 0;
    realCreak.play().then(() => { realCreak.onended = stopTape; }).catch(() => {
      synthCreak(4); tapeTimer = setTimeout(stopTape, 4200);
    });
  });
  function stopTape(){
    clearTimeout(tapeTimer);
    tapeEl.classList.remove('playing');
    document.getElementById('tapePlay').textContent = '▶ Play';
  }
})();
