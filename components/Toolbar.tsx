'use client'

import { type Tool } from '@/app/page'

const PALETTE = [
  '#FF6B35', // Cedar orange (default)
  '#FFFFFF', // White
  '#CCCCCC', // Light gray
  '#888888', // Mid gray
  '#444444', // Dark gray
  '#000000', // Black
  '#FF4444', // Red
  '#FF9900', // Amber
  '#FFE033', // Yellow
  '#66CC44', // Green
  '#33AAFF', // Sky blue
  '#3355FF', // Blue
  '#9933FF', // Purple
  '#FF44AA', // Pink
  '#884422', // Brown
  '#44BBAA', // Teal
]

type Props = {
  tool: Tool
  color: string
  voxelCount: number
  gridSize: number
  canUndo: boolean
  canRedo: boolean
  onToolChange: (tool: Tool) => void
  onColorChange: (color: string) => void
  onUndo: () => void
  onRedo: () => void
  onClear: () => void
  onCycleGridSize: () => void
}

export default function Toolbar({
  tool,
  color,
  voxelCount,
  gridSize,
  canUndo,
  canRedo,
  onToolChange,
  onColorChange,
  onUndo,
  onRedo,
  onClear,
  onCycleGridSize,
}: Props) {
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
        fontFamily: 'var(--font-space-grotesk), sans-serif',
      }}
    >
      {/* Left panel — color palette */}
      <div
        style={{
          position: 'absolute',
          left: 16,
          top: '50%',
          transform: 'translateY(-50%)',
          background: '#1A1A1A',
          border: '1px solid #333',
          borderRadius: 8,
          padding: 12,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          pointerEvents: 'auto',
          userSelect: 'none',
        }}
      >
        {/* Section label */}
        <div style={{ color: '#666', fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' }}>
          Color
        </div>

        {/* Preset swatches 4×4 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 28px)', gap: 4 }}>
          {PALETTE.map(hex => (
            <button
              key={hex}
              onClick={() => onColorChange(hex)}
              title={hex}
              style={{
                width: 28,
                height: 28,
                borderRadius: 4,
                background: hex,
                border: color === hex ? '2px solid #FF6B35' : '2px solid transparent',
                cursor: 'pointer',
                padding: 0,
                outline: color === hex ? '1px solid #FF6B35' : 'none',
                outlineOffset: 1,
                boxSizing: 'border-box',
              }}
            />
          ))}
        </div>

        {/* Custom color picker */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ color: '#666', fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' }}>
            Custom
          </div>
          <input
            type="color"
            value={color}
            onChange={e => onColorChange(e.target.value)}
            style={{
              width: 28,
              height: 28,
              border: 'none',
              padding: 0,
              borderRadius: 4,
              cursor: 'pointer',
              background: 'none',
            }}
          />
        </div>
      </div>

      {/* Top bar — tools + undo/redo + count */}
      <div
        style={{
          position: 'absolute',
          top: 16,
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#1A1A1A',
          border: '1px solid #333',
          borderRadius: 8,
          padding: '8px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          pointerEvents: 'auto',
          userSelect: 'none',
        }}
      >
        {/* App name */}
        <span style={{ color: '#FF6B35', fontWeight: 700, fontSize: 13, letterSpacing: 0.5, marginRight: 4 }}>
          VOXEL
        </span>

        <div style={{ width: 1, height: 20, background: '#333' }} />

        {/* Place tool */}
        <button
          onClick={() => onToolChange('place')}
          title="Place (B)"
          style={{
            background: tool === 'place' ? '#FF6B35' : '#2A2A2A',
            color: tool === 'place' ? '#000' : '#999',
            border: 'none',
            borderRadius: 6,
            padding: '5px 12px',
            fontSize: 12,
            fontWeight: 700,
            cursor: 'pointer',
            fontFamily: 'inherit',
            letterSpacing: 0.5,
          }}
        >
          ✏ BUILD
        </button>

        {/* Erase tool */}
        <button
          onClick={() => onToolChange('erase')}
          title="Erase (E)"
          style={{
            background: tool === 'erase' ? '#FF3535' : '#2A2A2A',
            color: tool === 'erase' ? '#fff' : '#999',
            border: 'none',
            borderRadius: 6,
            padding: '5px 12px',
            fontSize: 12,
            fontWeight: 700,
            cursor: 'pointer',
            fontFamily: 'inherit',
            letterSpacing: 0.5,
          }}
        >
          ✕ ERASE
        </button>

        <div style={{ width: 1, height: 20, background: '#333' }} />

        {/* Undo */}
        <button
          onClick={onUndo}
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
          style={{
            background: '#2A2A2A',
            color: canUndo ? '#ccc' : '#444',
            border: 'none',
            borderRadius: 6,
            padding: '5px 10px',
            fontSize: 14,
            cursor: canUndo ? 'pointer' : 'default',
            fontFamily: 'inherit',
          }}
        >
          ↩
        </button>

        {/* Redo */}
        <button
          onClick={onRedo}
          disabled={!canRedo}
          title="Redo (Ctrl+Y)"
          style={{
            background: '#2A2A2A',
            color: canRedo ? '#ccc' : '#444',
            border: 'none',
            borderRadius: 6,
            padding: '5px 10px',
            fontSize: 14,
            cursor: canRedo ? 'pointer' : 'default',
            fontFamily: 'inherit',
          }}
        >
          ↪
        </button>

        <div style={{ width: 1, height: 20, background: '#333' }} />

        {/* Voxel count */}
        <span style={{ color: '#666', fontSize: 12, fontWeight: 600, minWidth: 60 }}>
          {voxelCount} <span style={{ color: '#444' }}>voxels</span>
        </span>

        {/* Clear all */}
        <button
          onClick={() => {
            if (voxelCount > 0 && window.confirm('Clear all voxels?')) onClear()
          }}
          disabled={voxelCount === 0}
          title="Clear all"
          style={{
            background: '#2A2A2A',
            color: voxelCount > 0 ? '#FF3535' : '#666',
            border: 'none',
            borderRadius: 6,
            padding: '5px 10px',
            fontSize: 11,
            fontWeight: 700,
            cursor: voxelCount > 0 ? 'pointer' : 'default',
            fontFamily: 'inherit',
            letterSpacing: 0.5,
          }}
        >
          CLEAR
        </button>

        <div style={{ width: 1, height: 20, background: '#333' }} />

        {/* Grid size cycle */}
        <button
          onClick={onCycleGridSize}
          title="Cycle grid size: 16 → 32 → 64"
          style={{
            background: '#2A2A2A',
            color: '#999',
            border: 'none',
            borderRadius: 6,
            padding: '5px 10px',
            fontSize: 11,
            fontWeight: 700,
            cursor: 'pointer',
            fontFamily: 'inherit',
            letterSpacing: 0.5,
          }}
        >
          GRID {gridSize}×{gridSize}
        </button>
      </div>

      {/* Bottom hint */}
      <div
        style={{
          position: 'absolute',
          bottom: 16,
          left: '50%',
          transform: 'translateX(-50%)',
          color: '#888888',
          fontSize: 11,
          letterSpacing: 0.5,
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
        }}
      >
        Click place · Left-drag orbit · Right-drag pan · Scroll zoom
      </div>
    </div>
  )
}
