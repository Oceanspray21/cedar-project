'use client'

import { useState } from 'react'

type Tab = 'why-me' | 'thought-process'

type Props = {
  open: boolean
  onClose: () => void
}

const PANEL_WIDTH = 420

export default function InfoPanel({ open, onClose }: Props) {
  const [tab, setTab] = useState<Tab>('why-me')

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 9998,
            pointerEvents: 'auto',
            transition: 'opacity 0.2s',
          }}
        />
      )}

      {/* Panel */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: PANEL_WIDTH,
          height: '100vh',
          background: '#1A1A1A',
          borderLeft: '1px solid #333',
          zIndex: 9999,
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.25s ease-out',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: 'var(--font-space-grotesk), sans-serif',
          boxShadow: open ? '-4px 0 24px rgba(0,0,0,0.4)' : 'none',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid #333',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span style={{ color: '#FF6B35', fontWeight: 700, fontSize: 16, letterSpacing: 0.5 }}>
            Info
          </span>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#888',
              fontSize: 20,
              cursor: 'pointer',
              padding: '0 4px',
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>

        {/* Tabs */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid #333',
          }}
        >
          <button
            onClick={() => setTab('why-me')}
            style={{
              flex: 1,
              padding: '12px 16px',
              background: tab === 'why-me' ? '#2A2A2A' : 'transparent',
              border: 'none',
              borderBottom: tab === 'why-me' ? '2px solid #FF6B35' : '2px solid transparent',
              color: tab === 'why-me' ? '#fff' : '#888',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            Why Me
          </button>
          <button
            onClick={() => setTab('thought-process')}
            style={{
              flex: 1,
              padding: '12px 16px',
              background: tab === 'thought-process' ? '#2A2A2A' : 'transparent',
              border: 'none',
              borderBottom: tab === 'thought-process' ? '2px solid #FF6B35' : '2px solid transparent',
              color: tab === 'thought-process' ? '#fff' : '#888',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            Thought Process
          </button>
        </div>

        {/* Content */}
        <div
          style={{
            flex: 1,
            overflow: 'auto',
            padding: '24px 20px',
            color: '#ccc',
            fontSize: 14,
            lineHeight: 1.6,
          }}
        >
          {tab === 'why-me' && <WhyMeContent />}
          {tab === 'thought-process' && <ThoughtProcessContent />}
        </div>
      </div>
    </>
  )
}

function WhyMeContent() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <section>
        <h3 style={{ color: '#FF6B35', fontSize: 14, fontWeight: 700, marginBottom: 12, letterSpacing: 0.5 }}>
          LINGUISTICS + COMPUTER SCIENCE
        </h3>
        <p>
          My dual background in Linguistics and Computer Science makes me a strong fit for Cedar&apos;s work at the intersection of natural language processing and spatial data. I bring both an understanding of how language and meaning work and the technical skills to build systems that process them at scale.
        </p>
      </section>

      <section>
        <h3 style={{ color: '#FF6B35', fontSize: 14, fontWeight: 700, marginBottom: 12, letterSpacing: 0.5 }}>
          WHAT INTERNSHIP MEANS TO ME
        </h3>
        <p>Two things matter most:</p>
        <ul style={{ margin: '8px 0 0 20px', padding: 0 }}>
          <li style={{ marginBottom: 8 }}><strong>Learn</strong> — I&apos;m eager to grow in 3D, spatial systems, real-time interfaces, and NLP. If I am able to work on an NLP project this summer I can learn and ultilize my Linguistics + CS background.</li>
          <li style={{ marginBottom: 8 }}><strong>Create value & impact</strong> — I want to contribute meaningfully, not just observe.</li>
        </ul>
      </section>

      <section>
        <h3 style={{ color: '#FF6B35', fontSize: 14, fontWeight: 700, marginBottom: 12, letterSpacing: 0.5 }}>
          CONCRETE VALUE
        </h3>
        <p>
          To provide some immediate value while researching Cedar, I noticed an issue on the &quot;About&quot; page, the &quot;How it works&quot; link doesn&apos;t navigate correctly. Thus, when you are on the &quot;About&quot; page and you want to switch to the &quot;How it works&quot; page, nothing will happen.
        </p>
        <ul style={{ margin: '8px 0 0 20px', padding: 0 }}>
          <li>Current: <code style={{ background: '#2A2A2A', padding: '2px 6px', borderRadius: 4, fontSize: 12 }}>cedar.build/about#how-it-works</code></li>
          <li>Expected: <code style={{ background: '#2A2A2A', padding: '2px 6px', borderRadius: 4, fontSize: 12 }}>cedar.build/#how-it-works</code></li>
        </ul>
        <p style={{ marginTop: 12 }}>
          As an intern, I&apos;d be excited to help on exactly these kinds of things. Startups like Cedar let you wear multiple hats and see immediate impact, which is what I&apos;m looking for.
        </p>
      </section>
    </div>
  )
}

function ThoughtProcessContent() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <section>
        <h3 style={{ color: '#FF6B35', fontSize: 14, fontWeight: 700, marginBottom: 12, letterSpacing: 0.5 }}>
          WORKFLOW
        </h3>
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          <li style={{ marginBottom: 8 }}><strong>Gemini</strong> — Initial planning with high-level milestones (used UCLA&apos;s unlimited tokens for broad exploration).</li>
          <li style={{ marginBottom: 8 }}><strong>Claude</strong> — Broke milestones into smaller sub-tasks with clear verification criteria.</li>
          <li style={{ marginBottom: 8 }}>For main devleopment loop, I bounced between <strong>Claude and Google&apos;s Antigravity IDE</strong> when one got stuck; later switched to <strong>Cursor.</strong></li>
        </ul>
      </section>

      <section>
        <h3 style={{ color: '#FF6B35', fontSize: 14, fontWeight: 700, marginBottom: 12, letterSpacing: 0.5 }}>
          DESIGN DECISIONS
        </h3>
        <p>
          <strong>Cedar brand colors</strong> — Black and orange palette chosen intentionally to mirror Cedar&apos;s identity and signal familiarity.
        </p>
        <p>
          <strong>Minimalist simplicity</strong> — For grid size, I compared:
        </p>
        <ul style={{ margin: '4px 0 0 20px', padding: 0 }}>
          <li style={{ marginBottom: 4 }}>Button to cycle 16 → 32 → 64</li>
          <li style={{ marginBottom: 4 }}>Text input for exact dimensions</li>
        </ul>
        <p style={{ marginTop: 8 }}>
          Chose the cycle button: when building casually, you rarely need exact dimensions (e.g., &quot;42×37 house&quot;). A rough size is enough. However, if precision matters like for blueprints or construction I might change my implementation. I thought of this as a more fun design game, though it is important to keep in mind that the audience informs the implementation.
        </p>
      </section>

      <section>
        <h3 style={{ color: '#FF6B35', fontSize: 14, fontWeight: 700, marginBottom: 12, letterSpacing: 0.5 }}>
          AI-GENERATED SHAPES: OPTIONS EVALUATED
        </h3>
        <p>For &quot;Chat → Blocks,&quot; I compared three approaches:</p>
        <table style={{ width: '100%', marginTop: 12, borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #333' }}>
              <th style={{ textAlign: 'left', padding: '8px 0', color: '#888' }}>Approach</th>
              <th style={{ textAlign: 'left', padding: '8px 0', color: '#888' }}>Verdict</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid #222' }}>
              <td style={{ padding: '8px 0' }}>Rule-based (keywords → presets)</td>
              <td style={{ padding: '8px 0', color: '#66CC44' }}>Chosen — free, offline, predictable</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #222' }}>
              <td style={{ padding: '8px 0' }}>Ollama (local LLM)</td>
              <td style={{ padding: '8px 0', color: '#888' }}>Ruled out — requires install; poor for hosted demos</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #222' }}>
              <td style={{ padding: '8px 0' }}>Google Gemini API</td>
              <td style={{ padding: '8px 0', color: '#FF6B35' }}>Quota exceeded; pivoted to rule-based</td>
            </tr>
          </tbody>
        </table>
        <p style={{ marginTop: 12 }}>
          Given time constraints, rule-based was the right tradeoff: no API keys, no rate limiting, no extra surface area for security issues.
        </p>
      </section>

    </div>
  )
}
