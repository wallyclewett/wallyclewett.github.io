/* global React, ReactDOM, IntroReveal, Hero, Countdown, Briefing, Coordinates, BringList, RSVP, Footer, SoundToggle, useTweaks, TweaksPanel, TweakSection, TweakText, TweakRadio, TweakToggle */
const { useState, useEffect, useRef } = React;

// Starfield generator (canvas) — runs once
function initStars() {
  const host = document.getElementById('stars');
  if (!host) return;
  const c = document.createElement('canvas');
  c.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block';
  host.appendChild(c);
  const ctx = c.getContext('2d');
  let stars = [];
  function resize() {
    c.width = window.innerWidth * devicePixelRatio;
    c.height = window.innerHeight * devicePixelRatio;
    c.style.width = window.innerWidth + 'px';
    c.style.height = window.innerHeight + 'px';
    const count = Math.floor((window.innerWidth * window.innerHeight) / 4500);
    stars = Array.from({length: count}, () => ({
      x: Math.random() * c.width,
      y: Math.random() * c.height,
      r: Math.random() * 1.4 * devicePixelRatio + 0.3,
      t: Math.random() * Math.PI * 2,
      s: Math.random() * 0.012 + 0.004,
      hue: Math.random() < 0.15 ? 340 : (Math.random() < 0.5 ? 200 : 285),
    }));
  }
  resize();
  window.addEventListener('resize', resize);
  function draw() {
    ctx.clearRect(0, 0, c.width, c.height);
    for (const s of stars) {
      s.t += s.s;
      const a = 0.4 + Math.sin(s.t) * 0.5;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      const lightness = s.hue === 285 ? 0.92 : (s.hue === 340 ? 0.72 : 0.82);
      const chroma = s.hue === 285 ? 0.02 : 0.18;
      ctx.fillStyle = `oklch(${lightness} ${chroma} ${s.hue} / ${Math.max(0, a)})`;
      ctx.fill();
    }
    requestAnimationFrame(draw);
  }
  draw();
}

function App() {
  const [tweaks, setTweak] = useTweaks(window.__TWEAK_DEFAULTS);
  const [introDone, setIntroDone] = useState(false);
  const [soundOn, setSoundOn] = useState(false);

  useEffect(() => {
    window.__soundOn = soundOn;
  }, [soundOn]);

  useEffect(() => {
    document.body.classList.remove('bg-stars', 'bg-gradient', 'bg-solid');
    document.body.classList.add('bg-' + tweaks.bgStyle);
  }, [tweaks.bgStyle]);

  useEffect(() => {
    initStars();
    // inject pulse keyframes once
    const s = document.createElement('style');
    s.textContent = `
      @keyframes remi-pulse {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.6; transform: scale(0.9); }
      }
      input:focus, textarea:focus { border-color: var(--cyan) !important; }
      button:hover:not(:disabled) { opacity: 0.9; }
      button:disabled { opacity: 0.4; cursor: not-allowed; }
      li[data-item]:hover { border-color: var(--cyan-soft) !important; }
      a:hover { background: oklch(0.14 0.04 290 / 0.6); }
      @media print {
        body { background: white !important; }
        section { page-break-inside: avoid; }
        h1, h2 { color: black !important; -webkit-text-fill-color: black !important; background: none !important; }
      }
    `;
    document.head.appendChild(s);
  }, []);

  return (
    <>
      {!introDone && <IntroReveal name={tweaks.name} onDone={() => setIntroDone(true)} />}
      <SoundToggle on={soundOn} onToggle={() => setSoundOn(v => !v)} />
      <main data-screen-label="01 Invite">
        <Hero name={tweaks.name} mascot={tweaks.mascot} date={tweaks.date} startTime={tweaks.startTime} />
        <Briefing name={tweaks.name} date={tweaks.date} startTime={tweaks.startTime} endTime={tweaks.endTime} />
        <Countdown date={tweaks.date} time={tweaks.startTime} />
        <Coordinates address={tweaks.address} date={tweaks.date} startTime={tweaks.startTime} endTime={tweaks.endTime} />
        <BringList />
        {tweaks.rsvpEnabled && <RSVP name={tweaks.name} phone={tweaks.rsvpPhone} />}
        <Footer name={tweaks.name} />
      </main>
      <TweaksPanel title="Tweaks" defaultOpen={false}>
        <TweakSection title="Commander">
          <TweakText label="Name" value={tweaks.name} onChange={v => setTweak('name', v)} />
          <TweakRadio label="Mascot" value={tweaks.mascot} onChange={v => setTweak('mascot', v)} options={[
            {value: 'photo', label: 'Photo'},
            {value: 'helmet', label: 'Helmet'},
            {value: 'planet', label: 'Planet'},
            {value: 'comet', label: 'Comet'},
            {value: 'star', label: 'Star'},
          ]} />
        </TweakSection>
        <TweakSection title="Logistics">
          <TweakText label="Date (YYYY-MM-DD)" value={tweaks.date} onChange={v => setTweak('date', v)} />
          <TweakText label="Arrive" value={tweaks.startTime} onChange={v => setTweak('startTime', v)} />
          <TweakText label="Depart" value={tweaks.endTime} onChange={v => setTweak('endTime', v)} />
          <TweakText label="Address" value={tweaks.address} onChange={v => setTweak('address', v)} />
        </TweakSection>
        <TweakSection title="Visuals">
          <TweakRadio label="Background" value={tweaks.bgStyle} onChange={v => setTweak('bgStyle', v)} options={[
            {value: 'stars', label: 'Stars'},
            {value: 'gradient', label: 'Gradient'},
            {value: 'solid', label: 'Solid'},
          ]} />
        </TweakSection>
        <TweakSection title="Sections">
          <TweakText label="RSVP phone (e.g. +447…)" value={tweaks.rsvpPhone} onChange={v => setTweak('rsvpPhone', v)} />
          <TweakToggle label="Show RSVP form" value={tweaks.rsvpEnabled} onChange={v => setTweak('rsvpEnabled', v)} />
        </TweakSection>
      </TweaksPanel>
    </>
  );
}

ReactDOM.createRoot(document.getElementById('app')).render(<App />);
