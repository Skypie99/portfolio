'use client'

/**
 * AppMockup — pure JSX/SVG/CSS app preview for each of the 5 projects.
 * No external images. No npm packages beyond React.
 *
 * Slug union matches deliverables.json `id` values exactly.
 * Phone frame: AccessMap + MutualMesh.
 * Browser frame: Claude Corp + Prompt Library + Pac-Man Code Trainer.
 */

type AppMockupSlug = 'accessmap' | 'claude-corp' | 'prompt-library' | 'pacman-code-trainer' | 'mutual-mesh'

type AppMockupProps = {
  slug: AppMockupSlug
  className?: string
}

/* ─── Phone Frame ──────────────────────────────────────────────────────── */

function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="relative mx-auto"
      style={{ width: 200, height: 360 }}
    >
      {/* Outer shell */}
      <div
        className="absolute inset-0 rounded-[2.5rem]"
        style={{
          background: '#1C1A17',
          boxShadow: '0 8px 32px rgba(35,36,32,0.18), 0 2px 8px rgba(35,36,32,0.10)',
        }}
      />
      {/* Screen area */}
      <div
        className="absolute overflow-hidden bg-white"
        style={{
          top: 3,
          left: 3,
          right: 3,
          bottom: 3,
          borderRadius: 'calc(2.5rem - 3px)',
        }}
      >
        {/* Status bar */}
        <div
          className="flex items-center justify-between px-4"
          style={{ height: 24, background: '#1C1A17' }}
        >
          <span style={{ fontSize: 9, color: '#FAF9F5', fontFamily: 'monospace', letterSpacing: '0.05em' }}>9:41</span>
          <span style={{ fontSize: 9, color: '#FAF9F5', fontFamily: 'monospace' }}>●●●</span>
        </div>
        {/* Content */}
        <div className="flex flex-col" style={{ height: 'calc(100% - 24px - 16px)' }}>
          {children}
        </div>
        {/* Home indicator */}
        <div className="flex justify-center items-center" style={{ height: 16 }}>
          <div style={{ width: 60, height: 3, borderRadius: 9999, background: '#484A43', opacity: 0.3 }} />
        </div>
      </div>
    </div>
  )
}

/* ─── Browser Frame ────────────────────────────────────────────────────── */

function BrowserFrame({ children, urlText }: { children: React.ReactNode; urlText: string }) {
  return (
    <div
      className="relative mx-auto overflow-hidden rounded-lg"
      style={{
        width: 280,
        height: 200,
        boxShadow: '0 8px 32px rgba(35,36,32,0.14), 0 2px 8px rgba(35,36,32,0.08)',
      }}
    >
      {/* Chrome bar */}
      <div
        className="flex items-center gap-2 px-3"
        style={{ height: 32, background: '#E8E6E0', borderBottom: '1px solid #DCDCD6' }}
      >
        {/* Traffic lights */}
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#FF5F57', display: 'inline-block' }} />
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#FFBD2E', display: 'inline-block' }} />
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#28C840', display: 'inline-block' }} />
        {/* URL bar */}
        <div
          className="flex-1 flex items-center justify-center mx-2 px-2"
          style={{
            height: 18,
            borderRadius: 9999,
            background: '#F0F0EA',
            border: '1px solid #DCDCD6',
          }}
        >
          <span style={{ fontSize: 9, color: '#5C5D54', fontFamily: 'monospace', letterSpacing: '0.02em' }}>
            {urlText}
          </span>
        </div>
      </div>
      {/* Screen */}
      <div style={{ height: 'calc(100% - 32px)', overflow: 'hidden' }}>
        {children}
      </div>
    </div>
  )
}

/* ─── AccessMap Screen ─────────────────────────────────────────────────── */

function AccessMapScreen() {
  return (
    <div className="flex-1 flex flex-col" style={{ background: '#6B9FD4', position: 'relative', overflow: 'hidden' }}>
      {/* Map grid lines */}
      <svg
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.15 }}
        preserveAspectRatio="none"
        viewBox="0 0 200 300"
      >
        {/* Horizontal lines */}
        {[40, 80, 120, 160, 200, 240].map((y) => (
          <line key={`h${y}`} x1="0" y1={y} x2="200" y2={y} stroke="white" strokeWidth="0.8" />
        ))}
        {/* Vertical lines */}
        {[40, 80, 120, 160].map((x) => (
          <line key={`v${x}`} x1={x} y1="0" x2={x} y2="300" stroke="white" strokeWidth="0.8" />
        ))}
      </svg>
      {/* Severity pins */}
      {/* High severity — red */}
      <div style={{ position: 'absolute', top: '25%', left: '30%', transform: 'translate(-50%,-50%)' }}>
        <div style={{ width: 18, height: 18, borderRadius: '50% 50% 50% 0', transform: 'rotate(-45deg)', background: '#E05252', border: '2px solid white', boxShadow: '0 2px 6px rgba(0,0,0,0.2)' }} />
      </div>
      {/* Medium severity — orange */}
      <div style={{ position: 'absolute', top: '45%', left: '60%', transform: 'translate(-50%,-50%)' }}>
        <div style={{ width: 16, height: 16, borderRadius: '50% 50% 50% 0', transform: 'rotate(-45deg)', background: '#E2976E', border: '2px solid white', boxShadow: '0 2px 6px rgba(0,0,0,0.2)' }} />
      </div>
      {/* Low severity — yellow */}
      <div style={{ position: 'absolute', top: '60%', left: '25%', transform: 'translate(-50%,-50%)' }}>
        <div style={{ width: 14, height: 14, borderRadius: '50% 50% 50% 0', transform: 'rotate(-45deg)', background: '#F5C842', border: '2px solid white', boxShadow: '0 2px 6px rgba(0,0,0,0.2)' }} />
      </div>
      {/* Resolved — green */}
      <div style={{ position: 'absolute', top: '35%', left: '75%', transform: 'translate(-50%,-50%)' }}>
        <div style={{ width: 14, height: 14, borderRadius: '50% 50% 50% 0', transform: 'rotate(-45deg)', background: '#52A76F', border: '2px solid white', boxShadow: '0 2px 6px rgba(0,0,0,0.2)' }} />
      </div>
      {/* Another pin */}
      <div style={{ position: 'absolute', top: '70%', left: '55%', transform: 'translate(-50%,-50%)' }}>
        <div style={{ width: 15, height: 15, borderRadius: '50% 50% 50% 0', transform: 'rotate(-45deg)', background: '#E05252', border: '2px solid white', boxShadow: '0 2px 6px rgba(0,0,0,0.2)' }} />
      </div>
      {/* Legend strip */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'rgba(255,255,255,0.92)',
          padding: '6px 10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: '1px solid rgba(220,220,214,0.5)',
        }}
      >
        <span style={{ fontFamily: 'monospace', fontSize: 9, color: '#484A43', letterSpacing: '0.05em' }}>12 flags</span>
        <span style={{ width: 1, height: 10, background: '#DCDCD6' }} />
        <span style={{ fontFamily: 'monospace', fontSize: 9, color: '#52A76F', letterSpacing: '0.05em' }}>3 resolved</span>
        <span style={{ width: 1, height: 10, background: '#DCDCD6' }} />
        <span style={{ fontFamily: 'monospace', fontSize: 9, color: '#484A43', letterSpacing: '0.05em' }}>WCAG AA</span>
      </div>
    </div>
  )
}

/* ─── Claude Corp Screen ───────────────────────────────────────────────── */

function ClaudeCorpScreen() {
  const lines: { agent: string; msg: string; color: string }[] = [
    { agent: '[Morgan]', msg: 'Briefing ready — 3 decisions for Sky', color: '#E2976E' },
    { agent: '[Shamus]', msg: 'Feature shipped ✓', color: '#B35F32' },
    { agent: '[Gary]', msg: '789/789 tests passing', color: '#52A76F' },
    { agent: '[Dani]', msg: 'Design compile: PASS', color: '#E2976E' },
    { agent: '[Alex]', msg: 'WCAG 2.2 AA — all clear', color: '#6B9FD4' },
  ]
  return (
    <div style={{ background: '#1C1A17', width: '100%', height: '100%', padding: '12px', overflow: 'hidden' }}>
      <div style={{ fontFamily: 'monospace', fontSize: 10, lineHeight: 1.6, color: '#FAF9F5' }}>
        {lines.map(({ agent, msg, color }, i) => (
          <div key={i} style={{ marginBottom: 4 }}>
            <span style={{ color }}>{agent} </span>
            <span style={{ color: '#FAF9F5', opacity: 0.85 }}>{msg}</span>
          </div>
        ))}
        <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ color: '#E2976E', fontFamily: 'monospace', fontSize: 10 }}>[Orion]</span>
          <span style={{ color: '#B35F32', fontSize: 12, fontFamily: 'monospace' }}>▋</span>
        </div>
      </div>
    </div>
  )
}

/* ─── Prompt Library Screen ────────────────────────────────────────────── */

function PromptLibraryScreen() {
  const cards = ['Code Review', 'Email Draft', 'Fix Bug']
  return (
    <div style={{ background: '#FAF9F5', width: '100%', height: '100%', padding: '10px', overflow: 'hidden' }}>
      {/* Search bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '0 8px',
          height: 22,
          borderRadius: 9999,
          border: '1px solid #DCDCD6',
          background: '#F0F0EA',
          marginBottom: 8,
        }}
      >
        <span style={{ fontSize: 9, color: '#888879' }}>⌕</span>
        <span style={{ fontSize: 9, color: '#888879', fontFamily: 'monospace' }}>Search prompts…</span>
      </div>
      {/* Prompt cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
        {cards.map((title) => (
          <div
            key={title}
            style={{
              background: '#FCF3ED',
              border: '1px solid #DCDCD6',
              borderRadius: 6,
              padding: '6px 8px',
            }}
          >
            <div style={{ fontFamily: 'monospace', fontSize: 8, color: '#7F4323', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 3 }}>
              Prompt
            </div>
            <div style={{ fontFamily: 'Georgia, serif', fontSize: 10, color: '#232420', lineHeight: 1.3 }}>
              {title}
            </div>
          </div>
        ))}
        {/* Placeholder card */}
        <div
          style={{
            background: '#F0F0EA',
            border: '1px dashed #DCDCD6',
            borderRadius: 6,
            padding: '6px 8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span style={{ fontSize: 16, color: '#B8B8AA' }}>+</span>
        </div>
      </div>
      {/* Footer pill */}
      <div style={{ marginTop: 8, display: 'flex', gap: 4 }}>
        <span style={{ fontFamily: 'monospace', fontSize: 8, color: '#5C5D54', letterSpacing: '0.06em', background: '#F0F0EA', border: '1px solid #DCDCD6', borderRadius: 9999, padding: '2px 6px' }}>50+ prompts</span>
        <span style={{ fontFamily: 'monospace', fontSize: 8, color: '#5C5D54', letterSpacing: '0.06em', background: '#F0F0EA', border: '1px solid #DCDCD6', borderRadius: 9999, padding: '2px 6px' }}>Local only</span>
      </div>
    </div>
  )
}

/* ─── Pac-Man Code Trainer Screen ─────────────────────────────────────── */

function PacManScreen() {
  const cards = [
    { key: '/exit', label: 'Exit session' },
    { key: '/clear', label: 'Clear context' },
    { key: '/status', label: 'Check status' },
  ]
  return (
    <div style={{ background: '#0D0D0D', width: '100%', height: '100%', padding: '10px 8px', overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 8 }}>
      {/* Score row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: 'monospace', fontSize: 8, color: '#F5C842', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Score: 1200</span>
        {/* Lives — three small Pac-Man shapes */}
        <span style={{ display: 'flex', gap: 4 }}>
          {[0, 1, 2].map((i) => (
            <svg key={i} viewBox="0 0 12 12" width={10} height={10}>
              <path d="M6 0 A6 6 0 1 1 6 12 A6 6 0 1 1 6 0 L6 6 Z" fill="#F5C842" />
            </svg>
          ))}
        </span>
      </div>

      {/* Maze strip — dots row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 3, paddingLeft: 2 }}>
        {Array.from({ length: 16 }).map((_, i) => (
          <span
            key={i}
            style={{
              width: i === 4 ? 5 : 3,
              height: i === 4 ? 5 : 3,
              borderRadius: '50%',
              background: i < 5 ? 'transparent' : '#F5C842',
              opacity: i < 5 ? 0 : 0.55,
              flexShrink: 0,
            }}
          />
        ))}
        {/* Pac-Man icon */}
        <svg viewBox="0 0 12 12" width={12} height={12} style={{ flexShrink: 0 }}>
          <path d="M6 0 A6 6 0 1 1 3 10.39 L6 6 Z" fill="#F5C842" />
        </svg>
        {/* Ghost */}
        <svg viewBox="0 0 12 14" width={11} height={13} style={{ flexShrink: 0, marginLeft: 2 }}>
          <path d="M0 14 L0 5 A6 6 0 0 1 12 5 L12 14 L10 12 L8 14 L6 12 L4 14 L2 12 Z" fill="#FF6B9D" />
          <circle cx="4" cy="5.5" r="1.5" fill="white" />
          <circle cx="8" cy="5.5" r="1.5" fill="white" />
          <circle cx="4.5" cy="6" r="0.7" fill="#1A1AFF" />
          <circle cx="8.5" cy="6" r="0.7" fill="#1A1AFF" />
        </svg>
      </div>

      {/* Flashcard */}
      <div
        style={{
          flex: 1,
          background: '#1A1A1A',
          border: '1px solid #2A2A2A',
          borderRadius: 6,
          padding: '8px',
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: 'monospace', fontSize: 7, color: '#F5C842', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Card 12 / 40</span>
          <span style={{ fontFamily: 'monospace', fontSize: 7, color: '#555', letterSpacing: '0.06em' }}>Claude Code</span>
        </div>
        <div
          style={{
            background: '#111',
            borderRadius: 4,
            padding: '6px 8px',
            fontFamily: 'monospace',
            fontSize: 11,
            color: '#F5C842',
            letterSpacing: '0.05em',
            lineHeight: 1.4,
          }}
        >
          /doctor
        </div>
        <div style={{ fontFamily: 'monospace', fontSize: 8, color: '#888', lineHeight: 1.5 }}>
          Check setup health
        </div>
      </div>

      {/* Mini grid of commands */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 4 }}>
        {cards.map(({ key, label }) => (
          <div
            key={key}
            style={{
              background: '#1A1A1A',
              border: '1px solid #2A2A2A',
              borderRadius: 4,
              padding: '4px 5px',
            }}
          >
            <div style={{ fontFamily: 'monospace', fontSize: 7, color: '#F5C842', marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{key}</div>
            <div style={{ fontFamily: 'monospace', fontSize: 6, color: '#555', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── MutualMesh Screen ────────────────────────────────────────────────── */

function MutualMeshScreen() {
  const cx = 100
  const cy = 150
  const nodes: { label: string; x: number; y: number; r: number; fill: string }[] = [
    { label: 'Hub', x: cx, y: cy, r: 20, fill: '#B35F32' },
    { label: 'Food', x: cx, y: cy - 65, r: 13, fill: '#E2976E' },
    { label: 'Housing', x: cx + 60, y: cy - 30, r: 13, fill: '#E2976E' },
    { label: 'Transport', x: cx + 55, y: cy + 45, r: 13, fill: '#E2976E' },
    { label: 'Skills', x: cx - 60, y: cy + 40, r: 13, fill: '#E2976E' },
    { label: 'Care', x: cx - 55, y: cy - 35, r: 11, fill: '#FBCFAC' },
  ]
  return (
    <div style={{ background: '#FAF9F5', width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* App header */}
      <div style={{ padding: '6px 10px', borderBottom: '1px solid #DCDCD6', background: '#FCF3ED' }}>
        <span style={{ fontFamily: 'monospace', fontSize: 9, color: '#7F4323', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Mutual Mesh</span>
      </div>
      <svg viewBox="0 0 200 290" style={{ flex: 1 }} preserveAspectRatio="xMidYMid meet">
        {/* Connection lines */}
        {nodes.slice(1).map((n, i) => (
          <line
            key={i}
            x1={cx} y1={cy}
            x2={n.x} y2={n.y}
            stroke="#DCDCD6"
            strokeWidth="1.5"
          />
        ))}
        {/* Nodes */}
        {nodes.map((n) => (
          <g key={n.label}>
            <circle cx={n.x} cy={n.y} r={n.r} fill={n.fill} opacity={0.9} />
            <text
              x={n.x}
              y={n.y + n.r + 10}
              textAnchor="middle"
              style={{ fontFamily: 'monospace', fontSize: 8, fill: '#484A43' }}
            >
              {n.label}
            </text>
          </g>
        ))}
        {/* Hub label */}
        <text
          x={cx}
          y={cy + 4}
          textAnchor="middle"
          style={{ fontFamily: 'monospace', fontSize: 8, fill: 'white', fontWeight: 600 }}
        >
          Hub
        </text>
      </svg>
    </div>
  )
}

/* ─── Float animation (injected once) ─────────────────────────────────── */
const floatStyles = `
@keyframes mockup-float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-4px); }
}
@media (prefers-reduced-motion: no-preference) {
  .mockup-float { animation: mockup-float 4s ease-in-out infinite; }
}
`

/* ─── AppMockup ────────────────────────────────────────────────────────── */

export function AppMockup({ slug, className }: AppMockupProps) {
  return (
    <>
      <style>{floatStyles}</style>
      <div className={`mockup-float ${className ?? ''}`}>
        {slug === 'accessmap' && (
          <PhoneFrame>
            <AccessMapScreen />
          </PhoneFrame>
        )}
        {slug === 'claude-corp' && (
          <BrowserFrame urlText="claude-corp.vercel.app">
            <ClaudeCorpScreen />
          </BrowserFrame>
        )}
        {slug === 'prompt-library' && (
          <BrowserFrame urlText="Prompt Library">
            <PromptLibraryScreen />
          </BrowserFrame>
        )}
        {slug === 'pacman-code-trainer' && (
          <BrowserFrame urlText="pacman-code-trainer">
            <PacManScreen />
          </BrowserFrame>
        )}
        {slug === 'mutual-mesh' && (
          <PhoneFrame>
            <MutualMeshScreen />
          </PhoneFrame>
        )}
      </div>
    </>
  )
}
