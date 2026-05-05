/* global React */
const { useState, useEffect, useRef, useMemo } = React;

// Tiny click sound
let __audioCtx = null;
function getCtx() {
  if (!__audioCtx) {
    try {__audioCtx = new (window.AudioContext || window.webkitAudioContext)();}
    catch (e) {return null;}
  }
  return __audioCtx;
}
window.playBlip = function (freq = 660, dur = 0.08, type = 'square') {
  if (!window.__soundOn) return;
  const ctx = getCtx();if (!ctx) return;
  try {
    const o = ctx.createOscillator();const g = ctx.createGain();
    o.type = type;o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
    o.connect(g).connect(ctx.destination);
    o.start();o.stop(ctx.currentTime + dur);
  } catch (e) {}
};

// ───────────────────────── Intro reveal ─────────────────────────
// Phases:
//  0  preamble fade-in       (0    – 600)
//  1  crawl + decrypt-button rises (600+) — user clicks decrypt OR auto-advances
//  2  decoding handoff
//  3  fade out → onDone
function IntroReveal({ name, onDone }) {
  const [phase, setPhase] = useState(0);
  const [skipped, setSkipped] = useState(false);
  const [hide, setHide] = useState(false);

  const finish = () => {
    setHide(true);
    setTimeout(() => onDone && onDone(), 600);
  };

  const goToDecode = () => {
    setPhase(2);
    setTimeout(() => setPhase(3), 1400);
    setTimeout(() => finish(), 2000);
  };

  useEffect(() => {
    if (skipped) {
      finish();
      return;
    }
    const t1 = setTimeout(() => setPhase(1), 600); // start crawl
    // auto-advance if user doesn't click — generous timeout (text long gone, button settled in middle)
    const tAuto = setTimeout(() => {
      setPhase((p) => p < 2 ? 2 : p);
    }, 30000);
    const tAuto2 = setTimeout(() => setPhase((p) => p < 3 ? 3 : p), 31400);
    const tAuto3 = setTimeout(() => finish(), 32000);
    return () => [t1, tAuto, tAuto2, tAuto3].forEach(clearTimeout);
  }, [skipped]);

  const handleSkip = () => {if (!skipped) setSkipped(true);};

  // Allow skipping with key
  useEffect(() => {
    if (hide) return;
    const onKey = () => handleSkip();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [hide, skipped]);

  const upper = (name || 'REMI').toUpperCase();

  return (
    <div className="intro-reveal" style={{ ...introStyles.wrap, opacity: hide ? 0 : 1, pointerEvents: hide ? 'none' : 'auto' }}>
      {/* deep starfield backdrop */}
      <div style={introStyles.deepStars} />
      <div style={introStyles.scan} />

      {/* preamble */}
      <div style={{ ...introStyles.preamble, opacity: phase === 0 ? 1 : 0 }}>
        <div style={introStyles.preambleLine}>
          <span style={introStyles.dotLive} />
          INCOMING TRANSMISSION
        </div>
        <div style={introStyles.preambleSub}>
          SOURCE: SECTOR 09 · CMDR. {upper}
        </div>
      </div>

      {/* perspective crawl */}
      <div style={introStyles.crawlViewport}>
        <div style={{
          ...introStyles.crawlInner,
          animation: phase >= 1 && !skipped ? 'remi-crawl 22s linear forwards' : 'none',
          opacity: phase >= 1 && phase < 3 ? 1 : 0
        }}>
          <div style={introStyles.crawlEpisode}>EPISODE IX</div>
          <div style={introStyles.crawlTitle}>A BIRTHDAY<br />APPROACHES</div>
          <div style={introStyles.crawlBody}>
            <p style={introStyles.crawlP}>
              Commander {upper} prepares to complete another orbit around the sun.
            </p>
            <p style={introStyles.crawlP}>
              Allies are converging. The fleet stands ready.
            </p>
            <p style={introStyles.crawlP}>
              Your presence is requested.
            </p>
          </div>
        </div>
        <div style={introStyles.crawlFade} />
      </div>

      {/* Decrypt button — fades in at bottom of screen, stays put */}
      {phase >= 1 && phase < 2 && !skipped &&
      <button
        type="button"
        onClick={goToDecode}
        className="remi-decrypt-btn"
        style={introStyles.decryptBtn}
        aria-label="Decrypt transmission">
          <span style={introStyles.decryptGlyph}>▶</span>
          DECRYPT TRANSMISSION
        </button>
      }

      {/* decoding handoff */}
      <div style={{ ...introStyles.handoff, opacity: phase >= 2 ? 1 : 0 }}>
        <div style={introStyles.title}>DECRYPTING TRANSMISSION</div>
        <div style={introStyles.bar}>
          <div style={{ ...introStyles.barFill, width: phase >= 2 ? '100%' : '0%' }} />
        </div>
      </div>

      {/* skip button removed — decrypt button serves the same purpose */}

      <style>{`
        @keyframes remi-crawl {
          0%   { transform: rotateX(28deg) translateY(80vh); }
          100% { transform: rotateX(28deg) translateY(-90vh); }
        }
        @keyframes remi-decrypt-fade {
          0%   { opacity: 0; transform: translate(-50%, 8px); }
          100% { opacity: 1; transform: translate(-50%, 0); }
        }
        .remi-decrypt-btn:hover {
          background: linear-gradient(180deg, oklch(0.90 0.18 200), oklch(0.80 0.26 340)) !important;
          box-shadow: 0 12px 50px oklch(0.72 0.26 340 / 0.6), 0 0 0 1px oklch(0.97 0.01 285 / 0.2) inset !important;
        }
        .remi-decrypt-btn:active {
          opacity: 0.9 !important;
        }
        .remi-skip-btn-removed { display: none; }
      `}</style>
    </div>);

}
const introStyles = {
  wrap: { position: 'fixed', inset: 0, zIndex: 100, background: 'oklch(0.04 0.015 285)', overflow: 'hidden', fontFamily: 'JetBrains Mono, monospace', transition: 'opacity 0.6s' },
  deepStars: { position: 'absolute', inset: 0, background:
    'radial-gradient(2px 2px at 12% 18%, #fff 50%, transparent), ' +
    'radial-gradient(1px 1px at 28% 72%, #fff 50%, transparent), ' +
    'radial-gradient(1.5px 1.5px at 55% 30%, #fff 50%, transparent), ' +
    'radial-gradient(1px 1px at 70% 88%, #fff 50%, transparent), ' +
    'radial-gradient(2px 2px at 82% 14%, #fff 50%, transparent), ' +
    'radial-gradient(1px 1px at 90% 60%, #fff 50%, transparent), ' +
    'radial-gradient(1px 1px at 40% 50%, #fff 50%, transparent), ' +
    'radial-gradient(1.5px 1.5px at 8% 90%, #fff 50%, transparent), ' +
    'radial-gradient(ellipse at 30% 20%, oklch(0.18 0.10 340 / 0.45), transparent 55%), ' +
    'radial-gradient(ellipse at 75% 80%, oklch(0.18 0.10 200 / 0.40), transparent 50%), ' +
    'oklch(0.04 0.015 285)' },
  scan: { position: 'absolute', inset: 0, background: 'repeating-linear-gradient(0deg, transparent 0, transparent 3px, oklch(0.7 0.26 340 / 0.03) 3px, oklch(0.7 0.26 340 / 0.03) 4px)', pointerEvents: 'none' },
  preamble: { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, transition: 'opacity 0.6s' },
  preambleLine: { fontSize: 12, letterSpacing: 2.5, color: 'oklch(0.72 0.26 340)', display: 'flex', alignItems: 'center', gap: 10 },
  preambleSub: { fontSize: 10, letterSpacing: 2, color: 'oklch(0.82 0.16 200)' },
  dotLive: { display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: 'oklch(0.72 0.26 340)', boxShadow: '0 0 12px oklch(0.72 0.26 340)', animation: 'remi-pulse 1s infinite' },
  crawlViewport: { position: 'absolute', inset: 0, perspective: '420px', perspectiveOrigin: '50% 0%', overflow: 'hidden' },
  crawlInner: { position: 'absolute', top: 0, left: '50%', width: 'min(520px, 62vw)', transform: 'rotateX(28deg) translateY(80vh)', transformOrigin: '50% 0%', marginLeft: 'calc(min(520px, 62vw) / -2)', textAlign: 'center', color: 'oklch(0.85 0.16 90)', textShadow: '0 0 12px oklch(0.85 0.16 90 / 0.5)', willChange: 'transform' },
  crawlEpisode: { fontFamily: 'Orbitron, sans-serif', fontWeight: 700, fontSize: 'clamp(14px, 2.6vw, 24px)', letterSpacing: 5, marginBottom: 22 },
  crawlTitle: { fontFamily: 'Orbitron, sans-serif', fontWeight: 900, fontSize: 'clamp(28px, 6.5vw, 64px)', letterSpacing: 2, lineHeight: 1.05, marginBottom: 48 },
  crawlBody: { fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: 'clamp(15px, 2.2vw, 22px)', lineHeight: 1.5, textAlign: 'center' },
  crawlP: { margin: '0 0 36px' },
  crawlFade: { position: 'absolute', top: 0, left: 0, right: 0, height: '38%', background: 'linear-gradient(180deg, oklch(0.04 0.015 285) 20%, transparent)', pointerEvents: 'none' },
  handoff: { position: 'absolute', bottom: '14%', left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, transition: 'opacity 0.5s' },
  title: { fontFamily: 'Orbitron, sans-serif', fontWeight: 900, fontSize: 22, letterSpacing: 4, color: 'oklch(0.97 0.01 285)' },
  bar: { width: 240, height: 3, background: 'oklch(0.2 0.04 290)', borderRadius: 2, overflow: 'hidden' },
  barFill: { height: '100%', background: 'linear-gradient(90deg, oklch(0.72 0.26 340), oklch(0.82 0.16 200))', transition: 'width 1.6s ease-out', width: 0 },
  skipBtn: { position: 'fixed', top: 20, right: 20, zIndex: 110, fontFamily: 'JetBrains Mono, monospace', fontSize: 12, letterSpacing: 2.5, fontWeight: 600, color: 'oklch(0.82 0.16 200)', background: 'oklch(0.10 0.025 285 / 0.85)', border: '1px solid oklch(0.82 0.16 200 / 0.6)', borderRadius: 999, padding: '10px 18px', cursor: 'pointer', backdropFilter: 'blur(8px)', boxShadow: '0 4px 20px oklch(0.04 0.015 285 / 0.6)', transition: 'opacity 0.4s, background 0.2s, border-color 0.2s, color 0.2s' },
  decryptBtn: { position: 'fixed', bottom: 'max(28px, env(safe-area-inset-bottom, 0px) + 24px)', left: '50%', transform: 'translate(-50%, 0)', zIndex: 105, fontFamily: 'Orbitron, sans-serif', fontWeight: 700, fontSize: 14, letterSpacing: 3, color: 'oklch(0.04 0.015 285)', background: 'linear-gradient(180deg, oklch(0.85 0.18 200), oklch(0.72 0.26 340))', border: 'none', borderRadius: 999, padding: '16px 28px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 12, boxShadow: '0 10px 40px oklch(0.72 0.26 340 / 0.5), 0 0 0 1px oklch(0.97 0.01 285 / 0.15) inset', animation: 'remi-decrypt-fade 0.6s ease-out forwards', transition: 'background 0.2s, box-shadow 0.2s, opacity 0.15s' },
  decryptGlyph: { fontSize: 11, transform: 'translateY(-1px)' }
};

// ───────────────────────── Mascot ─────────────────────────
function Mascot({ kind }) {
  const c1 = 'oklch(0.72 0.26 340)',c2 = 'oklch(0.82 0.16 200)';
  const wrapStyle = { filter: 'drop-shadow(0 0 24px oklch(0.72 0.26 340 / 0.5))', marginBottom: 8 };
  if (kind === 'photo') return (
    <div id="warp-target" style={{ position: 'relative', width: 'min(280px, 78vw)', aspectRatio: '2 / 3', margin: '0 auto 12px', borderRadius: 18, overflow: 'hidden', border: '1px solid oklch(0.72 0.26 340 / 0.55)', boxShadow: '0 10px 40px oklch(0.04 0.015 285 / 0.6), 0 0 60px oklch(0.72 0.26 340 / 0.35)' }}>
      <div style={{ position: 'absolute', inset: -16, borderRadius: '50%', background: 'radial-gradient(circle, oklch(0.72 0.26 340 / 0.3), transparent 70%)', filter: 'blur(20px)', zIndex: -1 }} />
      <img src="remi-photo.png" alt="Commander Remi" style={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 30%' }} />
      {/* subtle scanline overlay to match comms aesthetic */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'repeating-linear-gradient(0deg, transparent 0, transparent 3px, oklch(0.7 0.26 340 / 0.04) 3px, oklch(0.7 0.26 340 / 0.04) 4px)' }} />
      {/* corner brackets */}
      <div style={{ position: 'absolute', top: 8, left: 8, width: 18, height: 18, borderTop: '2px solid oklch(0.82 0.16 200)', borderLeft: '2px solid oklch(0.82 0.16 200)' }} />
      <div style={{ position: 'absolute', top: 8, right: 8, width: 18, height: 18, borderTop: '2px solid oklch(0.82 0.16 200)', borderRight: '2px solid oklch(0.82 0.16 200)' }} />
      <div style={{ position: 'absolute', bottom: 8, left: 8, width: 18, height: 18, borderBottom: '2px solid oklch(0.82 0.16 200)', borderLeft: '2px solid oklch(0.82 0.16 200)' }} />
      <div style={{ position: 'absolute', bottom: 8, right: 8, width: 18, height: 18, borderBottom: '2px solid oklch(0.82 0.16 200)', borderRight: '2px solid oklch(0.82 0.16 200)' }} />
      {/* live transmission tag */}
      <div style={{ position: 'absolute', top: 12, left: 0, right: 0, display: 'flex', justifyContent: 'center', pointerEvents: 'none' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: 1.8, color: 'oklch(0.97 0.01 285)', background: 'oklch(0.10 0.025 285 / 0.7)', border: '1px solid oklch(0.72 0.26 340 / 0.6)', borderRadius: 999, padding: '4px 10px', backdropFilter: 'blur(6px)' }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'oklch(0.72 0.26 340)', boxShadow: '0 0 8px oklch(0.72 0.26 340)', animation: 'remi-pulse 1.4s infinite' }} />
          LIVE FEED · CMDR. REMI
        </div>
      </div>
    </div>);

  if (kind === 'helmet') return (
    <svg viewBox="0 0 120 120" width="140" height="140" aria-hidden="true" style={wrapStyle}>
      <defs><linearGradient id="hg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={c1} /><stop offset="1" stopColor={c2} /></linearGradient></defs>
      <circle cx="60" cy="60" r="52" fill="none" stroke="url(#hg)" strokeWidth="1.5" opacity="0.5" />
      <path d="M30 55 Q60 25 90 55 L90 78 Q60 92 30 78 Z" fill="oklch(0.12 0.04 290)" stroke="url(#hg)" strokeWidth="2" />
      <rect x="38" y="58" width="44" height="12" rx="2" fill="oklch(0.05 0.02 285)" stroke={c2} strokeWidth="1" />
      <rect x="42" y="61" width="6" height="6" fill={c2} />
      <rect x="72" y="61" width="6" height="6" fill={c1} />
      <path d="M50 80 L50 90 M70 80 L70 90" stroke={c1} strokeWidth="2" />
      <path d="M55 38 L60 32 L65 38" stroke={c2} strokeWidth="2" fill="none" />
    </svg>);

  if (kind === 'planet') return (
    <svg viewBox="0 0 120 120" width="140" height="140" aria-hidden="true" style={wrapStyle}>
      <defs><radialGradient id="pg" cx="0.35" cy="0.35"><stop offset="0" stopColor={c2} /><stop offset="1" stopColor={c1} /></radialGradient></defs>
      <ellipse cx="60" cy="62" rx="55" ry="14" fill="none" stroke={c2} strokeWidth="1.5" opacity="0.6" />
      <circle cx="60" cy="55" r="32" fill="url(#pg)" />
      <ellipse cx="60" cy="62" rx="55" ry="14" fill="none" stroke={c1} strokeWidth="1.5" opacity="0.8" strokeDasharray="3 4" />
      <circle cx="48" cy="48" r="3" fill="oklch(0.97 0.01 285)" opacity="0.6" />
      <circle cx="68" cy="62" r="2" fill="oklch(0.97 0.01 285)" opacity="0.4" />
    </svg>);

  if (kind === 'comet') return (
    <svg viewBox="0 0 120 120" width="140" height="140" aria-hidden="true" style={wrapStyle}>
      <defs><linearGradient id="cg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="transparent" /><stop offset="1" stopColor={c1} /></linearGradient></defs>
      <path d="M10 100 Q50 80 80 50" stroke="url(#cg)" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M20 108 Q55 85 85 55" stroke={c2} strokeWidth="1.5" fill="none" opacity="0.5" strokeLinecap="round" />
      <circle cx="85" cy="45" r="14" fill={c1} />
      <circle cx="85" cy="45" r="14" fill="none" stroke={c2} strokeWidth="1.5" />
      <circle cx="80" cy="40" r="3" fill="oklch(0.97 0.01 285)" />
    </svg>);

  // star
  return (
    <svg viewBox="0 0 120 120" width="140" height="140" aria-hidden="true" style={wrapStyle}>
      <path d="M60 14 L70 50 L106 56 L78 78 L86 114 L60 94 L34 114 L42 78 L14 56 L50 50 Z" fill="none" stroke={c1} strokeWidth="2.5" />
      <path d="M60 28 L66 52 L92 56 L72 72 L78 98 L60 84 L42 98 L48 72 L28 56 L54 52 Z" fill={c2} opacity="0.25" />
    </svg>);

}

// ───────────────────────── Hero ─────────────────────────
function Hero({ name, mascot, date, startTime }) {
  const dateLabel = formatDateShort(date);
  return (
    <section style={heroStyles.wrap}>
      <div style={heroStyles.tag}>
        <span style={heroStyles.dot} />
        TRANSMISSION · {dateLabel} · {startTime}
      </div>
      <h1 style={heroStyles.h1}>
        <span style={heroStyles.kicker}>YOU'RE INVITED TO THE 9TH BIRTHDAY SLEEPOVER OF</span>
        Jedi Master
        <span style={heroStyles.nameWrap}>
          <span style={heroStyles.name}>{name}</span>
        </span>
      </h1>
      <Mascot kind={mascot} />
    </section>);

}
const heroStyles = {
  wrap: { padding: '56px 24px 24px', textAlign: 'center', position: 'relative' },
  tag: { display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: 2, color: 'var(--cyan)', padding: '6px 12px', border: '1px solid var(--line)', borderRadius: 999, marginBottom: 24, background: 'oklch(0.10 0.025 285 / 0.6)', backdropFilter: 'blur(8px)' },
  dot: { width: 6, height: 6, borderRadius: '50%', background: 'var(--mag)', boxShadow: '0 0 8px var(--mag)', animation: 'remi-pulse 1.4s infinite' },
  h1: { fontFamily: 'var(--display)', fontWeight: 900, fontSize: 'clamp(38px, 11vw, 60px)', letterSpacing: 2, lineHeight: 1, margin: '12px 0 20px', textWrap: 'balance' },
  kicker: { display: 'block', fontSize: '0.30em', letterSpacing: 5, color: 'var(--cyan)', marginBottom: 12, fontWeight: 500 },
  nameWrap: { display: 'block', marginTop: 6 },
  name: { background: 'linear-gradient(135deg, var(--mag), var(--cyan))', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent', filter: 'drop-shadow(0 0 30px oklch(0.72 0.26 340 / 0.4))' },
  sub: { fontSize: 16, lineHeight: 1.55, color: 'var(--ink-dim)', maxWidth: 320, margin: '0 auto 20px' },
  chip: { display: 'inline-block', fontFamily: 'var(--mono)', fontSize: 12, letterSpacing: 2, padding: '2px 8px', border: '1px solid var(--cyan)', color: 'var(--cyan)', borderRadius: 4, margin: '0 2px' },
  coords: { fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: 1.5, color: 'var(--ink-dim)', display: 'flex', justifyContent: 'center', gap: 10, flexWrap: 'wrap' }
};

function formatDateShort(d) {
  try {
    const dt = new Date(d + 'T00:00:00');
    return dt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();
  } catch (e) {return d;}
}
function formatDateLong(d) {
  try {
    const dt = new Date(d + 'T00:00:00');
    return dt.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  } catch (e) {return d;}
}

// ───────────────────────── Countdown ─────────────────────────
function Countdown({ date, time }) {
  const target = useMemo(() => new Date(`${date}T${time}:00`).getTime(), [date, time]);
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const diff = Math.max(0, target - now);
  const d = Math.floor(diff / 86400000);
  const h = Math.floor(diff % 86400000 / 3600000);
  const m = Math.floor(diff % 3600000 / 60000);
  const s = Math.floor(diff % 60000 / 1000);
  return (
    <Section label="T-MINUS" title="Countdown to launch">
      <div style={cdStyles.row}>
        <Cell n={d} l="DAYS" />
        <Sep />
        <Cell n={h} l="HRS" />
        <Sep />
        <Cell n={m} l="MIN" />
        <Sep />
        <Cell n={s} l="SEC" pulse />
      </div>
    </Section>);

}
function Cell({ n, l, pulse }) {
  return (
    <div style={cdStyles.cell}>
      <div style={{ ...cdStyles.num, animation: pulse ? 'remi-pulse 1s infinite' : 'none' }}>{String(n).padStart(2, '0')}</div>
      <div style={cdStyles.lbl}>{l}</div>
    </div>);

}
function Sep() {return <div style={cdStyles.sep}>:</div>;}
const cdStyles = {
  row: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 },
  cell: { flex: '1 1 0', textAlign: 'center', padding: '14px 4px', background: 'oklch(0.08 0.02 285 / 0.6)', border: '1px solid var(--line)', borderRadius: 8, minWidth: 0 },
  num: { fontFamily: 'var(--display)', fontWeight: 900, fontSize: 'clamp(28px, 9vw, 40px)', color: 'var(--ink)', letterSpacing: 1, lineHeight: 1 },
  lbl: { fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: 2, color: 'var(--cyan)', marginTop: 6 },
  sep: { fontFamily: 'var(--display)', fontSize: 24, color: 'var(--mag)', opacity: 0.6 }
};

// ───────────────────────── Section wrapper ─────────────────────────
function Section({ label, title, children, accent = 'mag' }) {
  const c = accent === 'cyan' ? 'var(--cyan)' : 'var(--mag)';
  return (
    <section style={{ ...secStyles.wrap, textAlign: "left" }}>
      <div style={{ ...secStyles.label, color: c }}>
        <span style={{ ...secStyles.labelDot, background: c, boxShadow: `0 0 8px ${c}` }} />
        {label}
      </div>
      {title && <h2 style={{ ...secStyles.h2, textAlign: "left" }}>{title}</h2>}
      {children}
    </section>);

}
const secStyles = {
  wrap: { padding: '12px 24px 24px', position: 'relative' },
  label: { fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: 2.5, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 },
  labelDot: { width: 6, height: 6, borderRadius: '50%' },
  h2: { fontFamily: 'var(--display)', fontWeight: 700, fontSize: 24, letterSpacing: 1, margin: '0 0 16px', color: 'var(--ink)' }
};

// ───────────────────────── Briefing ─────────────────────────
function Briefing({ name, date, startTime, endTime }) {
  const dateLabel = formatDateLong(date);
  return (
    <Section label="MISSION BRIEFING" title="Hi! It's Remi 👋" accent="cyan">
      <p style={brfStyles.body}>
        I'm turning <strong style={{ color: 'var(--ink)' }}>9 </strong> and I want you on my crew for a sleepover. There will be pizza, glow-in-the-dark stuff, a movie, and a midnight mission I can't tell you about yet because it's classified.
      </p>
      <div style={brfStyles.grid}>
        <Stat k="DATE" v={dateLabel} />
        <Stat k="ARRIVE" v={`${startTime} — Saturday`} />
        <Stat k="DEPART" v={`${endTime} — Sunday`} />
      </div>
    </Section>);

}
function Stat({ k, v }) {
  return (
    <div style={brfStyles.stat}>
      <div style={brfStyles.statK}>{k}</div>
      <div style={brfStyles.statV}>{v}</div>
    </div>);

}
const brfStyles = {
  body: { fontSize: 15, lineHeight: 1.6, color: 'var(--ink-dim)', margin: '0 0 18px', textWrap: 'pretty' },
  grid: { display: 'grid', gridTemplateColumns: '1fr', gap: 8 },
  stat: { padding: '12px 14px', background: 'oklch(0.08 0.02 285 / 0.6)', border: '1px solid var(--line)', borderRadius: 8 },
  statK: { fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: 1.8, color: 'var(--cyan)', marginBottom: 4 },
  statV: { fontFamily: 'var(--display)', fontSize: 14, fontWeight: 500, color: 'var(--ink)', letterSpacing: 0.5 }
};

// ───────────────────────── Coordinates / Map ─────────────────────────
function Coordinates({ address, date, startTime, endTime }) {
  const mapUrl = 'https://maps.app.goo.gl/H99Kv4mtBPz7M2tB7';
  const onCalClick = (e) => {
    e.preventDefault();
    window.playBlip(660, 0.1);
    downloadIcs({ address, date, startTime, endTime });
  };
  return (
    <Section label="COORDINATES" title="Rendezvous point">
      <div style={coordStyles.card}>
        <div style={coordStyles.mapWrap}>
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3562.3820922389127!2d153.1158998!3d-26.764087699999997!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6b939e98bbeda899%3A0xa8a8aedffbd77b2b!2s25%20Lomandra%20Dr%2C%20Currimundi%20QLD%204551!5e0!3m2!1sen!2sau!4v1777633736721!5m2!1sen!2sau"
            style={coordStyles.mapFrame}
            loading="lazy"
            allowFullScreen=""
            referrerPolicy="no-referrer-when-downgrade"
            title="Map to rendezvous point" />
          <div style={coordStyles.mapOverlay} aria-hidden="true" />
        </div>
        <div style={coordStyles.addr}>
          <div style={coordStyles.addrLabel}>TARGET ADDRESS</div>
          <div style={coordStyles.addrText}>{address}</div>
        </div>
        <div style={coordStyles.btnRow}>
          <a href={mapUrl} target="_blank" rel="noopener" style={coordStyles.btn} onClick={() => window.playBlip(880, 0.1)}>
            OPEN MAP →
          </a>
          <a href="#" onClick={onCalClick} style={{ ...coordStyles.btn, ...coordStyles.btnAlt }}>
            ADD TO CALENDAR
          </a>
        </div>
      </div>
    </Section>);

}
function downloadIcs({ address, date, startTime, endTime }) {
  // local-time format (no Z) — Apple Calendar treats as device-local
  const dt = (d, t) => `${d.replace(/-/g, '')}T${t.replace(':', '')}00`;
  const start = dt(date, startTime);
  const nextDay = (() => {const x = new Date(date + 'T00:00:00');x.setDate(x.getDate() + 1);return x.toISOString().slice(0, 10).replace(/-/g, '');})();
  const end = `${nextDay}T${endTime.replace(':', '')}00`;
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const uid = `remi-sleepover-${date}@invite.local`;
  const escape = (s) => String(s).replace(/[\\,;]/g, '\\$&').replace(/\n/g, '\\n');
  // CRLF line endings, proper VCALENDAR structure
  const ics = [
  'BEGIN:VCALENDAR',
  'VERSION:2.0',
  'PRODID:-//Remi Invite//EN',
  'CALSCALE:GREGORIAN',
  'METHOD:PUBLISH',
  'BEGIN:VEVENT',
  `UID:${uid}`,
  `DTSTAMP:${stamp}`,
  `DTSTART:${start}`,
  `DTEND:${end}`,
  `SUMMARY:${escape("Remi's Galactic Sleepover")}`,
  `LOCATION:${escape(address)}`,
  `DESCRIPTION:${escape('Mission briefing on arrival.')}`,
  'END:VEVENT',
  'END:VCALENDAR'].
  join('\r\n');
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'remi-sleepover.ics';
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {document.body.removeChild(a);URL.revokeObjectURL(url);}, 1000);
}
const coordStyles = {
  card: { background: 'oklch(0.08 0.02 285 / 0.6)', border: '1px solid var(--line)', borderRadius: 12, overflow: 'hidden' },
  mapWrap: { position: 'relative', width: '100%', aspectRatio: '4 / 3', borderBottom: '1px solid var(--line)', background: 'oklch(0.10 0.04 290)' },
  mapFrame: { position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0, display: 'block', filter: 'saturate(0.85) contrast(1.05)' },
  mapOverlay: { position: 'absolute', inset: 0, pointerEvents: 'none', background: 'linear-gradient(180deg, oklch(0.08 0.02 285 / 0.15), transparent 40%, oklch(0.08 0.02 285 / 0.15))', boxShadow: 'inset 0 0 60px oklch(0.04 0.015 285 / 0.4)' },
  addr: { padding: '14px 16px' },
  addrLabel: { fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: 1.8, color: 'var(--cyan)', marginBottom: 4 },
  addrText: { fontFamily: 'var(--body)', fontSize: 15, color: 'var(--ink)', lineHeight: 1.4 },
  btnRow: { display: 'flex', gap: 0, borderTop: '1px solid var(--line)' },
  btn: { flex: 1, textAlign: 'center', padding: '14px 8px', fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: 1.5, color: 'var(--mag)', textDecoration: 'none', background: 'transparent', border: 'none', cursor: 'pointer', transition: 'background 0.15s' },
  btnAlt: { color: 'var(--cyan)', borderLeft: '1px solid var(--line)' }
};

// ───────────────────────── Bring this (checklist) ─────────────────────────
function BringList() {
  const items = [
  { id: 'sleep', label: 'Sleeping bag + pillow', sub: 'survival pod' },
  { id: 'pj', label: 'Pyjamas (cool ones)', sub: 'standard issue' },
  { id: 'bear', label: 'Soft toy', sub: 'co-pilot' },
  { id: 'brush', label: 'Toothbrush', sub: 'dental defence' },
  { id: 'snack', label: 'A snack to share', sub: 'optional rations' }];

  const [checked, setChecked] = useState({});
  const toggle = (id) => {
    window.playBlip(checked[id] ? 440 : 880, 0.06);
    setChecked((s) => ({ ...s, [id]: !s[id] }));
  };
  return (
    <Section label="SUPPLY MANIFEST" title="Bring this with you" accent="cyan">
      <ul style={blStyles.list}>
        {items.map((it) =>
        <li key={it.id} style={blStyles.item} onClick={() => toggle(it.id)}>
            <span style={{ ...blStyles.box, ...(checked[it.id] ? blStyles.boxOn : {}) }}>
              {checked[it.id] && <svg viewBox="0 0 12 12" width="12" height="12"><path d="M2 6 L5 9 L10 3" stroke="oklch(0.05 0.02 285)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>}
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ ...blStyles.lbl, textDecoration: checked[it.id] ? 'line-through' : 'none', opacity: checked[it.id] ? 0.5 : 1 }}>{it.label}</div>
              <div style={blStyles.sub}>{it.sub}</div>
            </div>
          </li>
        )}
      </ul>
    </Section>);

}
const blStyles = {
  list: { listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 8 },
  item: { display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: 'oklch(0.08 0.02 285 / 0.6)', border: '1px solid var(--line)', borderRadius: 8, cursor: 'pointer', userSelect: 'none', transition: 'border-color 0.15s, background 0.15s' },
  box: { width: 22, height: 22, borderRadius: 6, border: '1.5px solid var(--line)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' },
  boxOn: { background: 'var(--cyan)', borderColor: 'var(--cyan)' },
  lbl: { fontSize: 15, color: 'var(--ink)', transition: 'all 0.15s' },
  sub: { fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: 1.5, color: 'var(--ink-dim)', marginTop: 2, opacity: 0.7 }
};

// ───────────────────────── RSVP ─────────────────────────
function buildSmsBody({ name, form }) {
  const status = form.attending === 'yes' ? 'I\'M IN ✅' : 'STAND DOWN ❌';
  const lines = [
  `🚀 TRANSMISSION TO CMDR. ${name.toUpperCase()}`,
  `// SECTOR 09 RSVP`,
  ``,
  `GUEST: ${form.guest}`,
  `STATUS: ${status}`];

  if (form.dietary && form.dietary.trim()) lines.push(`RATIONS: ${form.dietary.trim()}`);
  if (form.notes && form.notes.trim()) lines.push(`MESSAGE: ${form.notes.trim()}`);
  lines.push(``, `// END TRANSMISSION`);
  return lines.join('\n');
}
function RSVP({ name, phone }) {
  const [form, setForm] = useState({ guest: '', attending: '', dietary: '', notes: '' });
  const [sent, setSent] = useState(false);
  const set = (k, v) => setForm((s) => ({ ...s, [k]: v }));
  const submit = (e) => {
    e.preventDefault();
    if (!form.guest || !form.attending) return;
    window.playBlip(900, 0.15, 'sine');
    setTimeout(() => window.playBlip(1200, 0.15, 'sine'), 120);
    // Open SMS app with pre-filled body
    if (phone) {
      const body = encodeURIComponent(buildSmsBody({ name, form }));
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const sep = isIOS ? '&' : '?';
      const url = `sms:${phone}${sep}body=${body}`;
      window.location.href = url;
    }
    setSent(true);
  };
  if (sent) {
    return (
      <Section label="TRANSMISSION SENT" title="Acknowledged.">
        <div style={rsvpStyles.confirm}>
          <div style={rsvpStyles.confirmIcon}>
            <svg viewBox="0 0 48 48" width="48" height="48"><circle cx="24" cy="24" r="22" fill="none" stroke="var(--cyan)" strokeWidth="2" /><path d="M14 24 L21 31 L34 17" stroke="var(--cyan)" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
          <p style={rsvpStyles.confirmText}>
            {form.attending === 'yes' ?
            <>Crew slot reserved for <strong style={{ color: 'var(--ink)' }}>{form.guest}</strong>. {phone ? <>Check your messages — your reply is queued up to send to {name}'s parents.</> : <>{name} will be in touch.</>}</> :
            <>Got it — {form.guest} can't make it. {phone ? <>Your message is ready in your SMS app — just hit send.</> : <>{name} will save them a slice anyway.</>}</>}
          </p>
          {phone && <a href={`sms:${phone}${/iPad|iPhone|iPod/.test(navigator.userAgent) ? '&' : '?'}body=${encodeURIComponent(buildSmsBody({ name, form }))}`} style={{ ...rsvpStyles.resetBtn, display: 'inline-block', textDecoration: 'none', marginRight: 8, color: 'var(--mag)', borderColor: 'var(--mag)' }}>Re-open SMS</a>}
          <button onClick={() => {setSent(false);setForm({ guest: '', attending: '', dietary: '', notes: '' });}} style={rsvpStyles.resetBtn}>Send another</button>
        </div>
      </Section>);

  }
  return (
    <Section label="RSVP" title="Are you in?">
      <form onSubmit={submit} style={rsvpStyles.form}>
        <Field label="GUEST NAME">
          <input type="text" value={form.guest} onChange={(e) => set('guest', e.target.value)} placeholder="e.g. Maya" style={rsvpStyles.input} required />
        </Field>
        <Field label="STATUS">
          <div style={rsvpStyles.radioRow}>
            <RadioCard checked={form.attending === 'yes'} onClick={() => {window.playBlip(880, 0.06);set('attending', 'yes');}} accent="cyan" label="I'M IN" sub="Joining the crew" />
            <RadioCard checked={form.attending === 'no'} onClick={() => {window.playBlip(440, 0.06);set('attending', 'no');}} accent="mag" label="STAND DOWN" sub="Can't make it" />
          </div>
        </Field>
        <Field label="DIETARY (OPTIONAL)">
          <input type="text" value={form.dietary} onChange={(e) => set('dietary', e.target.value)} placeholder="Allergies, vegetarian, etc" style={rsvpStyles.input} />
        </Field>
        <Field label="MESSAGE FOR JEDI MASTER REMI (OPTIONAL)">
          <textarea value={form.notes} onChange={(e) => set('notes', e.target.value)} placeholder="Anything Remi should know" style={{ ...rsvpStyles.input, ...rsvpStyles.textarea }} />
        </Field>
        <button type="submit" style={rsvpStyles.submit} disabled={!form.guest || !form.attending}>
          {phone ? 'TRANSMIT VIA SMS →' : 'TRANSMIT RESPONSE →'}
        </button>
      </form>
    </Section>);

}
function Field({ label, children }) {
  return (
    <label style={{ display: 'block' }}>
      <div style={rsvpStyles.fieldLbl}>{label}</div>
      {children}
    </label>);

}
function RadioCard({ checked, onClick, accent, label, sub }) {
  const c = accent === 'cyan' ? 'var(--cyan)' : 'var(--mag)';
  return (
    <button type="button" onClick={onClick} style={{ ...rsvpStyles.radioCard, ...(checked ? { borderColor: c, background: `oklch(0.14 0.06 ${accent === 'cyan' ? 200 : 340} / 0.3)` } : {}) }}>
      <div style={{ ...rsvpStyles.radioDot, ...(checked ? { background: c, borderColor: c, boxShadow: `0 0 12px ${c}` } : {}) }} />
      <div>
        <div style={{ ...rsvpStyles.radioLbl, color: checked ? c : 'var(--ink)' }}>{label}</div>
        <div style={rsvpStyles.radioSub}>{sub}</div>
      </div>
    </button>);

}
const rsvpStyles = {
  form: { display: 'flex', flexDirection: 'column', gap: 14 },
  fieldLbl: { fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: 1.8, color: 'var(--cyan)', marginBottom: 6 },
  input: { width: '100%', padding: '12px 14px', background: 'oklch(0.08 0.02 285 / 0.6)', border: '1px solid var(--line)', borderRadius: 8, color: 'var(--ink)', fontFamily: 'var(--body)', fontSize: 15, outline: 'none', transition: 'border-color 0.15s' },
  textarea: { resize: 'vertical', minHeight: 70, fontFamily: 'var(--body)' },
  radioRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 },
  radioCard: { display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', background: 'oklch(0.08 0.02 285 / 0.6)', border: '1px solid var(--line)', borderRadius: 8, cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s', fontFamily: 'inherit' },
  radioDot: { width: 14, height: 14, borderRadius: '50%', border: '1.5px solid var(--line)', flexShrink: 0, transition: 'all 0.15s' },
  radioLbl: { fontFamily: 'var(--display)', fontWeight: 700, fontSize: 13, letterSpacing: 1, transition: 'color 0.15s' },
  radioSub: { fontSize: 11, color: 'var(--ink-dim)', marginTop: 2 },
  submit: { marginTop: 8, padding: '16px', background: 'linear-gradient(135deg, var(--mag), var(--cyan))', border: 'none', borderRadius: 8, color: 'oklch(0.05 0.02 285)', fontFamily: 'var(--display)', fontWeight: 700, fontSize: 14, letterSpacing: 2, cursor: 'pointer', transition: 'transform 0.1s, opacity 0.15s' },
  confirm: { textAlign: 'center', padding: '20px 8px' },
  confirmIcon: { display: 'flex', justifyContent: 'center', marginBottom: 16, filter: 'drop-shadow(0 0 16px var(--cyan))' },
  confirmText: { fontSize: 15, lineHeight: 1.6, color: 'var(--ink-dim)', maxWidth: 300, margin: '0 auto 16px' },
  resetBtn: { background: 'transparent', border: '1px solid var(--line)', color: 'var(--cyan)', fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: 1.5, padding: '10px 18px', borderRadius: 6, cursor: 'pointer' }
};

// ───────────────────────── Footer ─────────────────────────
function Footer({ name }) {
  return (
    <footer style={footStyles.wrap}>
      <div style={footStyles.line} />
      <div style={footStyles.text}>
        END OF TRANSMISSION<br />
        <span style={{ color: 'var(--mag)' }}>// {name.toUpperCase()} OUT.</span>
      </div>
    </footer>);

}
const footStyles = {
  wrap: { padding: '32px 24px 48px', textAlign: 'center' },
  line: { width: 40, height: 1, background: 'var(--line)', margin: '0 auto 16px' },
  text: { fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: 2, color: 'var(--ink-dim)', lineHeight: 1.8 }
};

// ───────────────────────── Sound toggle ─────────────────────────
function SoundToggle({ on, onToggle }) {
  return (
    <button className="sound-toggle" onClick={onToggle} style={stStyles.btn} aria-label={on ? 'Mute' : 'Unmute'}>
      {on ?
      <svg viewBox="0 0 16 16" width="16" height="16"><path d="M3 6 L6 6 L9 3 L9 13 L6 10 L3 10 Z M11 5 Q13 8 11 11 M12.5 3.5 Q15.5 8 12.5 12.5" stroke="var(--cyan)" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg> :

      <svg viewBox="0 0 16 16" width="16" height="16"><path d="M3 6 L6 6 L9 3 L9 13 L6 10 L3 10 Z M11 5 L15 11 M15 5 L11 11" stroke="var(--ink-dim)" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
      }
    </button>);

}
const stStyles = {
  btn: { position: 'fixed', top: 16, right: 16, zIndex: 50, width: 36, height: 36, borderRadius: '50%', background: 'oklch(0.10 0.025 285 / 0.7)', border: '1px solid var(--line)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' }
};

// ───────────────────────── Music toggle ─────────────────────────
function MusicToggle({ on, onToggle }) {
  return (
    <button onClick={onToggle} style={mtStyles.btn} aria-label={on ? 'Pause music' : 'Play music'} title={on ? 'Pause theme music' : 'Play theme music'}>
      {on ?
      <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
          <rect x="4" y="3" width="2.5" height="10" fill="var(--mag)" />
          <rect x="9.5" y="3" width="2.5" height="10" fill="var(--mag)" />
        </svg> :
      <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
          <path d="M5 3 L13 8 L5 13 Z" fill="var(--cyan)" />
        </svg>
      }
      <span style={mtStyles.label}>{on ? 'PAUSE MUSIC' : 'PLAY MUSIC'}</span>
    </button>);
}
const mtStyles = {
  btn: { position: 'fixed', top: 16, right: 16, zIndex: 50, height: 36, padding: '0 14px 0 12px', borderRadius: 999, background: 'oklch(0.10 0.025 285 / 0.7)', border: '1px solid var(--line)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8, backdropFilter: 'blur(8px)', color: 'var(--ink)' },
  label: { fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: 1.6, color: 'var(--ink-dim)' }
};

// ───────────────────────── Launch gate ─────────────────────────
function LaunchGate({ onLaunch, name }) {
  const [pressing, setPressing] = useState(false);
  const upper = (name || 'REMI').toUpperCase();
  return (
    <div style={lgStyles.scrim}>
      <div style={lgStyles.card}>
        <div style={lgStyles.tag}>
          <span style={lgStyles.dot} />
          INCOMING TRANSMISSION
        </div>
        <h1 style={{ ...lgStyles.title, fontSize: "36px" }}>CONFIDENTIAL</h1>
        <p style={lgStyles.body}>A classified invitation has been queued for delivery. Tap below to receive.


        </p>
        <button
          onClick={() => {setPressing(true);setTimeout(onLaunch, 220);}}
          style={{ ...lgStyles.btn, transform: pressing ? 'scale(0.96)' : 'scale(1)' }}
          aria-label="Begin transmission">
          <span style={lgStyles.btnGlyph}>▶</span>
          BEGIN TRANSMISSION
        </button>
        <div style={lgStyles.hint}>Audio will play. Use 🔊 button to mute later.</div>
      </div>
    </div>);
}
const lgStyles = {
  scrim: { position: 'fixed', inset: 0, zIndex: 200, background: 'radial-gradient(circle at 50% 30%, oklch(0.12 0.04 290 / 0.85), oklch(0.04 0.015 285 / 0.98))', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, animation: 'remi-fade-in 0.6s ease-out' },
  card: { maxWidth: 380, width: '100%', textAlign: 'center', padding: '28px 24px 24px', background: 'oklch(0.08 0.025 285 / 0.7)', border: '1px solid oklch(0.72 0.26 340 / 0.4)', borderRadius: 18, boxShadow: '0 20px 80px oklch(0.04 0.015 285 / 0.8), 0 0 80px oklch(0.72 0.26 340 / 0.25)' },
  tag: { display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: 2, color: 'var(--cyan)', background: 'oklch(0.10 0.025 285 / 0.6)', border: '1px solid var(--cyan-soft)', borderRadius: 999, padding: '6px 12px', marginBottom: 18 },
  dot: { width: 7, height: 7, borderRadius: '50%', background: 'var(--mag)', boxShadow: '0 0 8px var(--mag)', animation: 'remi-pulse 1.4s infinite' },
  title: { fontFamily: 'var(--display)', fontSize: 'clamp(28px, 6vw, 40px)', fontWeight: 800, lineHeight: 1.1, margin: '0 0 14px', color: 'var(--ink)', letterSpacing: 0.5 },
  body: { fontFamily: 'var(--body)', fontSize: 14, lineHeight: 1.55, color: 'var(--ink-dim)', margin: '0 0 22px', textWrap: 'pretty' },
  btn: { display: 'inline-flex', alignItems: 'center', gap: 10, fontFamily: 'var(--mono)', fontSize: 13, letterSpacing: 2.5, fontWeight: 700, color: 'oklch(0.04 0.015 285)', background: 'linear-gradient(180deg, oklch(0.85 0.18 200), oklch(0.72 0.26 340))', border: 'none', borderRadius: 999, padding: '14px 22px', cursor: 'pointer', boxShadow: '0 8px 30px oklch(0.72 0.26 340 / 0.4), 0 0 0 1px oklch(0.97 0.01 285 / 0.15) inset', transition: 'transform 0.18s ease' },
  btnGlyph: { fontSize: 11, transform: 'translateY(-0.5px)' },
  hint: { fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: 1.5, color: 'var(--ink-dim)', marginTop: 14, opacity: 0.7 }
};

Object.assign(window, { IntroReveal, Hero, Mascot, Countdown, Briefing, Coordinates, BringList, RSVP, Footer, SoundToggle, MusicToggle, LaunchGate, Section });