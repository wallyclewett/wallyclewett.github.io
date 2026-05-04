/* global React, ReactDOM, IntroReveal, LaunchGate, MusicToggle, Hero, Countdown, Briefing, Coordinates, BringList, RSVP, Footer, useTweaks, TweaksPanel, TweakSection, TweakText, TweakRadio, TweakToggle */
const { useState, useEffect, useRef } = React;

// Hyperspace starfield — stars stream outward from center, accelerating
function initStars() {
  const host = document.getElementById('stars');
  if (!host) return;
  const c = document.createElement('canvas');
  c.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block';
  host.appendChild(c);
  const ctx = c.getContext('2d');

  const STAR_COUNT_DENSITY = 9000; // larger = fewer stars
  const SPEED = 0.018;             // base z-velocity per frame
  const TRAIL_FADE = 0.25;         // 0=long trails, 1=no trails
  let stars = [];
  let cx = 0, cy = 0;
  let dpr = Math.min(window.devicePixelRatio || 1, 2);

  function spawnStar(initial) {
    return {
      // x,y in normalized -1..1 space
      x: (Math.random() - 0.5) * 2,
      y: (Math.random() - 0.5) * 2,
      // z is depth: 1 = far, 0 = at camera
      z: initial ? Math.random() : 1,
      hue: Math.random() < 0.12 ? 340 : (Math.random() < 0.4 ? 200 : 285),
      px: 0, py: 0   // previous projected position for trail
    };
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    c.width = window.innerWidth * dpr;
    c.height = window.innerHeight * dpr;
    c.style.width = window.innerWidth + 'px';
    c.style.height = window.innerHeight + 'px';
    cx = c.width / 2;
    cy = c.height / 2;
    const count = Math.floor((window.innerWidth * window.innerHeight) / STAR_COUNT_DENSITY);
    stars = Array.from({ length: count }, () => spawnStar(true));
  }
  resize();
  window.addEventListener('resize', resize);
  window.addEventListener('scroll', () => {}, { passive: true });

  // Track an optional focus element (#warp-target) — if present, stars converge on its center.
  function updateCenter() {
    const el = document.getElementById('warp-target');
    if (el) {
      const r = el.getBoundingClientRect();
      // only use if visible-ish (some part on screen)
      if (r.width > 0 && r.height > 0 && r.bottom > -200 && r.top < window.innerHeight + 200) {
        const targetCx = (r.left + r.width / 2) * dpr;
        const targetCy = (r.top + r.height / 2) * dpr;
        // smooth toward target
        cx += (targetCx - cx) * 0.08;
        cy += (targetCy - cy) * 0.08;
        return;
      }
    }
    // fallback to viewport center
    const dcx = c.width / 2, dcy = c.height / 2;
    cx += (dcx - cx) * 0.04;
    cy += (dcy - cy) * 0.04;
  }

  // Fade-to-black overlay each frame creates motion trails
  function draw() {
    updateCenter();
    // semi-transparent black wipe (creates trails)
    ctx.fillStyle = `rgba(8, 6, 18, ${TRAIL_FADE})`;
    ctx.fillRect(0, 0, c.width, c.height);

    const focal = Math.max(c.width, c.height) * 0.6;

    for (const s of stars) {
      // advance toward camera
      s.z -= SPEED;
      if (s.z <= 0.01) {
        // respawn at far plane with new random x,y
        s.x = (Math.random() - 0.5) * 2;
        s.y = (Math.random() - 0.5) * 2;
        s.z = 1;
        s.px = 0; s.py = 0;
        continue;
      }

      // perspective project
      const k = focal / (s.z * focal + 1);
      const px = cx + s.x * k * focal;
      const py = cy + s.y * k * focal;

      // size + brightness scale as z → 0
      const size = (1 - s.z) * 2.2 * dpr + 0.3;
      const alpha = Math.min(1, (1 - s.z) * 1.4 + 0.05);
      const lightness = s.hue === 285 ? 0.95 : (s.hue === 340 ? 0.78 : 0.86);
      const chroma = s.hue === 285 ? 0.02 : 0.18;
      const color = `oklch(${lightness} ${chroma} ${s.hue} / ${alpha})`;

      // streak from previous projected position
      if (s.px !== 0 || s.py !== 0) {
        ctx.strokeStyle = color;
        ctx.lineWidth = size;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(s.px, s.py);
        ctx.lineTo(px, py);
        ctx.stroke();
      }

      // bright head
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(px, py, size, 0, Math.PI * 2);
      ctx.fill();

      s.px = px; s.py = py;

      // if star has gone off-screen, respawn next frame
      if (px < -50 || px > c.width + 50 || py < -50 || py > c.height + 50) {
        s.x = (Math.random() - 0.5) * 2;
        s.y = (Math.random() - 0.5) * 2;
        s.z = 1;
        s.px = 0; s.py = 0;
      }
    }
    requestAnimationFrame(draw);
  }
  draw();
}

function App() {
  const [tweaks, setTweak] = useTweaks(window.__TWEAK_DEFAULTS);
  const [launched, setLaunched] = useState(false);
  const [introDone, setIntroDone] = useState(false);
  const audioRef = useRef(null);
  const [musicOn, setMusicOn] = useState(true);

  // Create the audio element once
  useEffect(() => {
    const a = new Audio('theme.mp3');
    a.loop = true;
    a.volume = 0.55;
    audioRef.current = a;
    return () => { a.pause(); audioRef.current = null; };
  }, []);

  const launch = () => {
    setLaunched(true);
    const a = audioRef.current;
    if (a && musicOn) {
      a.currentTime = 0;
      a.play().catch(() => {});
    }
  };

  // toggle music
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    if (musicOn && launched) {
      a.play().catch(() => {});
    } else {
      a.pause();
    }
  }, [musicOn, launched]);

  const finishIntro = () => {
    setIntroDone(true);
  };

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
      @keyframes remi-fade-in {
        0% { opacity: 0; }
        100% { opacity: 1; }
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
      {!launched && <LaunchGate onLaunch={launch} name={tweaks.name} />}
      {launched && !introDone && <IntroReveal name={tweaks.name} onDone={finishIntro} />}
      {launched && <MusicToggle on={musicOn} onToggle={() => setMusicOn(v => !v)} />}
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
