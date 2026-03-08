'use client'

import { useState } from 'react'
import { PRESET_IDS, PRESETS } from '@/lib/voxelPresets'

const SHAPES_PER_PAGE = 2

type Props = {
  selectedPreset: string | null
  onPresetSelect: (presetId: string) => void
  collapsed?: boolean
  onToggleCollapse?: () => void
}

const PRESET_LABELS: Record<string, string> = {
  house: 'House',
  pyramid: 'Pyramid',
  tower: 'Tower',
  stairs: 'Stairs',
  tree: 'Tree',
  wall: 'Wall',
  platform: 'Platform',
  bridge: 'Bridge',
  line: 'Line',
  pillar: 'Pillar',
}

/** Dominant color for preset preview swatch */
function getPresetPreviewColors(presetId: string): string[] {
  const voxels = PRESETS[presetId]
  if (!voxels?.length) return ['#888']
  const seen = new Set<string>()
  const out: string[] = []
  for (const v of voxels) {
    if (!seen.has(v.color) && out.length < 3) {
      seen.add(v.color)
      out.push(v.color)
    }
  }
  return out.length ? out : [voxels[0].color]
}

export default function GeneratePanel({ selectedPreset, onPresetSelect, collapsed, onToggleCollapse }: Props) {
  const [page, setPage] = useState(0)
  const totalPages = Math.ceil(PRESET_IDS.length / SHAPES_PER_PAGE)
  const startIdx = page * SHAPES_PER_PAGE
  const visibleIds = PRESET_IDS.slice(startIdx, startIdx + SHAPES_PER_PAGE)

  const handlePreset = (presetId: string) => {
    onPresetSelect(presetId)
  }

  if (collapsed) {
    return (
      <button
        onClick={onToggleCollapse}
        title="Show shapes"
        style={{
          position: 'absolute',
          right: 0,
          top: '50%',
          transform: 'translateY(-50%)',
          writingMode: 'vertical-rl',
          textOrientation: 'mixed',
          padding: '12px 8px',
          background: '#1A1A1A',
          border: '1px solid #333',
          borderRight: 'none',
          borderTopLeftRadius: 8,
          borderBottomLeftRadius: 8,
          color: '#FF6B35',
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: 1,
          cursor: 'pointer',
          fontFamily: 'var(--font-space-grotesk), sans-serif',
          zIndex: 10,
        }}
      >
        SHAPES ◀
      </button>
    )
  }

  return (
    <div
      style={{
        position: 'absolute',
        right: 16,
        top: '50%',
        transform: 'translateY(-50%)',
        background: '#1A1A1A',
        border: '1px solid #333',
        borderRadius: 8,
        padding: 12,
        width: 180,
        pointerEvents: 'auto',
        fontFamily: 'var(--font-space-grotesk), sans-serif',
        zIndex: 10,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 10,
        }}
      >
        <span style={{ color: '#FF6B35', fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' }}>
          Shapes
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {totalPages > 1 && (
            <>
              <button
                onClick={() => setPage(p => (p > 0 ? p - 1 : totalPages - 1))}
                title="Previous page"
                style={{
                  background: '#2A2A2A',
                  border: 'none',
                  borderRadius: 4,
                  color: '#999',
                  width: 24,
                  height: 24,
                  fontSize: 12,
                  cursor: 'pointer',
                }}
              >
                ▲
              </button>
              <button
                onClick={() => setPage(p => (p < totalPages - 1 ? p + 1 : 0))}
                title="Next page"
                style={{
                  background: '#2A2A2A',
                  border: 'none',
                  borderRadius: 4,
                  color: '#999',
                  width: 24,
                  height: 24,
                  fontSize: 12,
                  cursor: 'pointer',
                }}
              >
                ▼
              </button>
            </>
          )}
          {totalPages > 1 && onToggleCollapse && (
            <div style={{ width: 1, height: 16, background: '#444', marginLeft: 4 }} />
          )}
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              title="Hide shapes"
              style={{
                background: '#2A2A2A',
                border: 'none',
                borderRadius: 4,
                color: '#666',
                width: 24,
                height: 24,
                fontSize: 10,
                cursor: 'pointer',
                marginLeft: totalPages > 1 ? 4 : 0,
              }}
            >
              ▶
            </button>
          )}
        </div>
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 6,
        }}
      >
        {visibleIds.map(presetId => {
          const colors = getPresetPreviewColors(presetId)
          return (
            <button
              key={presetId}
              onClick={() => handlePreset(presetId)}
              title={selectedPreset === presetId ? 'Click again to deselect' : `Place ${PRESET_LABELS[presetId]} - click in scene to place`}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
                padding: 8,
                background: selectedPreset === presetId ? '#3A2A1A' : '#2A2A2A',
                border: selectedPreset === presetId ? '2px solid #FF6B35' : '2px solid #333',
                borderRadius: 6,
                color: '#ccc',
                fontSize: 10,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => {
                if (selectedPreset !== presetId) e.currentTarget.style.background = '#333'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = selectedPreset === presetId ? '#3A2A1A' : '#2A2A2A'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  gap: 2,
                  height: 20,
                  alignItems: 'center',
                }}
              >
                {colors.map((c, i) => (
                  <div
                    key={i}
                    style={{
                      width: colors.length > 1 ? 14 : 24,
                      height: 20,
                      borderRadius: 3,
                      background: c,
                    }}
                  />
                ))}
              </div>
              {PRESET_LABELS[presetId]}
            </button>
          )
        })}
      </div>
      <div style={{ marginTop: 10, color: '#555', fontSize: 9 }}>
        {selectedPreset ? 'Click in scene to place. Click shape again to cancel.' : 'Select shape, then click in scene.'}
        {totalPages > 1 && ` · ${page + 1}/${totalPages}`}
      </div>
    </div>
  )
}
