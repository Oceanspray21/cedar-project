'use client'

import { useState, useEffect } from 'react'

// 5x5 block font - each letter is [row][col], 1 = block
const BLOCK_FONT: Record<string, number[][]> = {
  W: [[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,1,0,1,1],[1,0,1,0,1]],
  E: [[1,1,1,1,1],[1,0,0,0,0],[1,1,1,1,0],[1,0,0,0,0],[1,1,1,1,1]],
  L: [[1,0,0,0,0],[1,0,0,0,0],[1,0,0,0,0],[1,0,0,0,0],[1,1,1,1,1]],
  C: [[0,1,1,1,0],[1,0,0,0,1],[1,0,0,0,0],[1,0,0,0,1],[0,1,1,1,0]],
  O: [[0,1,1,1,0],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[0,1,1,1,0]],
  M: [[1,0,0,0,1],[1,1,0,1,1],[1,0,1,0,1],[1,0,0,0,1],[1,0,0,0,1]],
  T: [[1,1,1,1,1],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0]],
  D: [[1,1,1,1,0],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,1,1,1,0]],
  A: [[0,0,1,0,0],[0,1,0,1,0],[1,0,0,0,1],[1,1,1,1,1],[1,0,0,0,1]],
  R: [[1,1,1,1,0],[1,0,0,0,1],[1,1,1,1,0],[1,0,1,0,0],[1,0,0,1,1]],
  ' ': [],
}

const PHRASE = 'WELCOME TO CEDAR'
const LETTER_DELAY_MS = 35
const DROP_DURATION_MS = 280

function getBlocksForPhrase(): { letterIndex: number; row: number; col: number }[] {
  const blocks: { letterIndex: number; row: number; col: number }[] = []
  for (let li = 0; li < PHRASE.length; li++) {
    const char = PHRASE[li]
    const grid = BLOCK_FONT[char] ?? BLOCK_FONT[' ']
    for (let r = 0; r < grid.length; r++) {
      for (let c = 0; c < grid[r].length; c++) {
        if (grid[r][c]) {
          blocks.push({ letterIndex: li, row: r, col: c })
        }
      }
    }
  }
  return blocks
}

const ALL_BLOCKS = getBlocksForPhrase()
const TOTAL_LETTERS = PHRASE.length

export default function WelcomeOverlay() {
  const [phase, setPhase] = useState<'dropping' | 'visible' | 'poof' | 'gone'>('dropping')

  useEffect(() => {
    const totalDropTime = TOTAL_LETTERS * LETTER_DELAY_MS + DROP_DURATION_MS
    const dropDone = setTimeout(() => setPhase('visible'), totalDropTime)
    return () => clearTimeout(dropDone)
  }, [])

  useEffect(() => {
    if (phase !== 'visible') return
    const poofStart = setTimeout(() => setPhase('poof'), 800)
    return () => clearTimeout(poofStart)
  }, [phase])

  useEffect(() => {
    if (phase !== 'poof') return
    const unmount = setTimeout(() => setPhase('gone'), 350)
    return () => clearTimeout(unmount)
  }, [phase])

  if (phase === 'gone') return null

  // Compute position for each block (letters side by side)
  let letterX = 0
  const letterOffsets: number[] = []
  for (let li = 0; li < PHRASE.length; li++) {
    letterOffsets.push(letterX)
    const grid = BLOCK_FONT[PHRASE[li]] ?? BLOCK_FONT[' ']
    letterX += grid.length ? 6 : 3
  }
  const blockSize = 6
  const gridWidth = letterX * blockSize
  const gridHeight = 5 * blockSize

  return (
    <div
      className="welcome-overlay"
      style={{
        position: 'fixed',
        top: 110,
        left: 0,
        right: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        pointerEvents: 'none',
      }}
    >
      <style>{`
        @keyframes blockDrop {
          from { transform: translateY(-150%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes poof {
          to { transform: scale(1.5); opacity: 0; }
        }
        .welcome-letter-grid {
          position: relative;
        }
        .welcome-block {
          width: 6px;
          height: 6px;
          background: #FF6B35;
          position: absolute;
          animation: blockDrop ${DROP_DURATION_MS}ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          box-shadow: 0 0 0 1px rgba(255,255,255,0.15);
        }
        .welcome-content.poof .welcome-block {
          animation: poof 0.35s ease-out forwards;
        }
      `}</style>
      <div className={`welcome-content ${phase === 'poof' ? 'poof' : ''}`}>
        <div className="welcome-letter-grid" style={{ width: gridWidth, height: gridHeight }}>
          {ALL_BLOCKS.map((b, i) => {
            const baseX = letterOffsets[b.letterIndex] * blockSize
            const left = baseX + b.col * blockSize
            const top = b.row * blockSize
            const delay = b.letterIndex * LETTER_DELAY_MS
            return (
              <div
                key={i}
                className="welcome-block"
                style={{
                  left,
                  top,
                  animationDelay: `${delay}ms`,
                  background: (b.row + b.col) % 3 === 0 ? '#FF6B35' : '#E55A2B',
                }}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}
