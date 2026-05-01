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
function IntroReveal({ name, onDone }) {
  const [phase, setPhase] = useState(0);
  const [hide, setHide] = useState(false);
  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 500);
    const t2 = setTimeout(() => setPhase(2), 1300);
    const t3 = setTimeout(() => setPhase(3), 2200);
    const t4 = setTimeout(() => setHide(true), 3200);
    const t5 = setTimeout(() => onDone && onDone(), 3700);
    return () => [t1, t2, t3, t4, t5].forEach(clearTimeout);
  }, []);
  return (
    <div className="intro-reveal" style={{ ...introStyles.wrap, opacity: hide ? 0 : 1, pointerEvents: hide ? 'none' : 'auto' }}>
      <div style={{ ...introStyles.scan, opacity: phase >= 1 ? 1 : 0 }} />
      <div style={{ ...introStyles.line, opacity: phase >= 0 ? 1 : 0 }}>
        <span style={introStyles.dotLive} />
        INCOMING TRANSMISSION
      </div>
      <div style={{ ...introStyles.line2, opacity: phase >= 1 ? 1 : 0 }}>
        SOURCE: SECTOR 09 · CMDR. {(name || '').toUpperCase()}
      </div>
      <div style={{ ...introStyles.title, opacity: phase >= 2 ? 1 : 0, transform: phase >= 2 ? 'translateY(0)' : 'translateY(8px)' }}>
        DECRYPTING…
      </div>
      <div style={{ ...introStyles.bar, opacity: phase >= 2 ? 1 : 0 }}>
        <div style={{ ...introStyles.barFill, width: phase >= 3 ? '100%' : '0%' }} />
      </div>
    </div>);

}
const introStyles = {
  wrap: { position: 'fixed', inset: 0, zIndex: 100, background: 'oklch(0.05 0.02 285)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 18, fontFamily: 'JetBrains Mono, monospace', padding: 24, transition: 'opacity 0.5s' },
  scan: { position: 'absolute', inset: 0, background: 'repeating-linear-gradient(0deg, transparent 0, transparent 3px, oklch(0.7 0.26 340 / 0.04) 3px, oklch(0.7 0.26 340 / 0.04) 4px)', pointerEvents: 'none', transition: 'opacity 0.4s' },
  line: { fontSize: 11, letterSpacing: 2, color: 'oklch(0.72 0.26 340)', transition: 'opacity 0.4s', display: 'flex', alignItems: 'center', gap: 8, position: 'relative' },
  dotLive: { display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: 'oklch(0.72 0.26 340)', boxShadow: '0 0 12px oklch(0.72 0.26 340)', animation: 'remi-pulse 1s infinite' },
  line2: { fontSize: 10, letterSpacing: 1.5, color: 'oklch(0.82 0.16 200)', transition: 'opacity 0.4s', position: 'relative' },
  title: { fontFamily: 'Orbitron, sans-serif', fontWeight: 900, fontSize: 28, letterSpacing: 4, color: 'oklch(0.97 0.01 285)', transition: 'opacity 0.5s, transform 0.5s', marginTop: 12, position: 'relative' },
  bar: { width: 220, height: 3, background: 'oklch(0.2 0.04 290)', borderRadius: 2, overflow: 'hidden', transition: 'opacity 0.4s', position: 'relative' },
  barFill: { height: '100%', background: 'linear-gradient(90deg, oklch(0.72 0.26 340), oklch(0.82 0.16 200))', transition: 'width 0.9s ease-out' }
};

// ───────────────────────── Mascot ─────────────────────────
function Mascot({ kind }) {
  const c1 = 'oklch(0.72 0.26 340)',c2 = 'oklch(0.82 0.16 200)';
  const wrapStyle = { filter: 'drop-shadow(0 0 24px oklch(0.72 0.26 340 / 0.5))', marginBottom: 8 };
  if (kind === 'photo') return (
    <div style={{ position: 'relative', width: 200, height: 200, margin: '0 auto 8px' }}>
      <div style={{ position: 'absolute', inset: -10, borderRadius: '50%', background: 'radial-gradient(circle, oklch(0.72 0.26 340 / 0.45), transparent 70%)', filter: 'blur(12px)' }} />
      <img src="remi-mascot.png" alt="Commander Remi" style={{ position: 'relative', width: '100%', height: '100%', objectFit: 'contain', filter: 'drop-shadow(0 6px 24px oklch(0.05 0.02 285 / 0.6))' }} />
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
      <Mascot kind={mascot} />
      <h1 style={heroStyles.h1}>
        <span style={heroStyles.kicker}>YOU ARE HEREBY SUMMONED BY</span>
        Master
        <span style={heroStyles.nameWrap}>
          <span style={heroStyles.name}>{name}</span>
        </span>
      </h1>
      <p style={heroStyles.sub}>
        Age <span style={heroStyles.chip}>9</span> standard cycles.<br />
        A galactic sleepover has been authorised.
      </p>
      <div style={heroStyles.coords}>
        <span>LAT 51.5074°N</span><span style={{ opacity: 0.4 }}>·</span>
        <span>LON 0.1278°W</span><span style={{ opacity: 0.4 }}>·</span>
        <span>SECTOR 09</span>
      </div>
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
    <section style={secStyles.wrap}>
      <div style={{ ...secStyles.label, color: c }}>
        <span style={{ ...secStyles.labelDot, background: c, boxShadow: `0 0 8px ${c}` }} />
        {label}
      </div>
      {title && <h2 style={secStyles.h2}>{title}</h2>}
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
        I'm turning <strong style={{ color: 'var(--ink)' }}>NINE</strong> and I want you on my crew for a sleepover. There will be pizza, glow-in-the-dark stuff, a movie, and a midnight mission I can't tell you about yet because it's classified.
      </p>
      <div style={brfStyles.grid}>
        <Stat k="DATE" v={dateLabel} />
        <Stat k="ARRIVE" v={`${startTime} — Sat`} />
        <Stat k="DEPART" v={`${endTime} — Sun`} />
        <Stat k="DURATION" v="ONE NIGHT" />
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
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 },
  stat: { padding: '12px 14px', background: 'oklch(0.08 0.02 285 / 0.6)', border: '1px solid var(--line)', borderRadius: 8 },
  statK: { fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: 1.8, color: 'var(--cyan)', marginBottom: 4 },
  statV: { fontFamily: 'var(--display)', fontSize: 14, fontWeight: 500, color: 'var(--ink)', letterSpacing: 0.5 }
};

// ───────────────────────── Coordinates / Map ─────────────────────────
function Coordinates({ address, date, startTime, endTime }) {
  const enc = encodeURIComponent(address);
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${enc}`;
  const calUrl = makeCalUrl({ address, date, startTime, endTime });
  return (
    <Section label="COORDINATES" title="Rendezvous point">
      <div style={coordStyles.card}>
        <div style={coordStyles.mapMock} aria-hidden="true">
          <svg viewBox="0 0 280 140" width="100%" height="100%" preserveAspectRatio="none">
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="oklch(0.25 0.05 290)" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="280" height="140" fill="oklch(0.10 0.04 290)" />
            <rect width="280" height="140" fill="url(#grid)" />
            <path d="M 0 90 Q 80 60 140 80 T 280 70" stroke="oklch(0.82 0.16 200 / 0.4)" strokeWidth="1.5" fill="none" strokeDasharray="2 4" />
            <path d="M 30 30 L 250 30 L 250 110 L 30 110 Z" stroke="oklch(0.82 0.16 200 / 0.3)" strokeWidth="1" fill="none" />
            <circle cx="140" cy="70" r="20" fill="none" stroke="oklch(0.72 0.26 340)" strokeWidth="1" opacity="0.6">
              <animate attributeName="r" from="6" to="28" dur="2s" repeatCount="indefinite" />
              <animate attributeName="opacity" from="0.8" to="0" dur="2s" repeatCount="indefinite" />
            </circle>
            <circle cx="140" cy="70" r="6" fill="oklch(0.72 0.26 340)" />
            <circle cx="140" cy="70" r="2" fill="oklch(0.97 0.01 285)" />
          </svg>
        </div>
        <div style={coordStyles.addr}>
          <div style={coordStyles.addrLabel}>TARGET ADDRESS</div>
          <div style={coordStyles.addrText}>{address}</div>
        </div>
        <div style={coordStyles.btnRow}>
          <a href={mapUrl} target="_blank" rel="noopener" style={coordStyles.btn} onClick={() => window.playBlip(880, 0.1)}>
            OPEN MAP →
          </a>
          <a href={calUrl} download="remi-sleepover.ics" style={{ ...coordStyles.btn, ...coordStyles.btnAlt }} onClick={() => window.playBlip(660, 0.1)}>
            ADD TO CALENDAR
          </a>
        </div>
      </div>
    </Section>);

}
function makeCalUrl({ address, date, startTime, endTime }) {
  const dt = (d, t) => `${d.replace(/-/g, '')}T${t.replace(':', '')}00`;
  const start = dt(date, startTime);
  const nextDay = (() => {const x = new Date(date + 'T00:00:00');x.setDate(x.getDate() + 1);return x.toISOString().slice(0, 10).replace(/-/g, '');})();
  const end = `${nextDay}T${endTime.replace(':', '')}00`;
  const ics = `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nSUMMARY:Remi's Galactic Sleepover\nDTSTART:${start}\nDTEND:${end}\nLOCATION:${address}\nDESCRIPTION:Mission briefing on arrival.\nEND:VEVENT\nEND:VCALENDAR`;
  return 'data:text/calendar;charset=utf-8,' + encodeURIComponent(ics);
}
const coordStyles = {
  card: { background: 'oklch(0.08 0.02 285 / 0.6)', border: '1px solid var(--line)', borderRadius: 12, overflow: 'hidden' },
  mapMock: { aspectRatio: '2 / 1', width: '100%', borderBottom: '1px solid var(--line)' },
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
  { id: 'bear', label: 'Soft toy or comfort item', sub: 'co-pilot' },
  { id: 'brush', label: 'Toothbrush + toothpaste', sub: 'dental defence' },
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
    `STATUS: ${status}`,
  ];
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
          {phone && <a href={`sms:${phone}${/iPad|iPhone|iPod/.test(navigator.userAgent) ? '&' : '?'}body=${encodeURIComponent(buildSmsBody({ name, form }))}`} style={{...rsvpStyles.resetBtn, display: 'inline-block', textDecoration: 'none', marginRight: 8, color: 'var(--mag)', borderColor: 'var(--mag)'}}>Re-open SMS</a>}
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
        <Field label="MESSAGE FOR THE COMMANDER (OPTIONAL)">
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

Object.assign(window, { IntroReveal, Hero, Mascot, Countdown, Briefing, Coordinates, BringList, RSVP, Footer, SoundToggle, Section });