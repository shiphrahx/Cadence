'use client'

import { useState } from 'react'

interface ReviewSectionProps {
  title: string
  icon?: React.ReactNode
  signalCount: number
  criticalCount?: number
  warningCount?: number
  infoCount?: number
  badgeLabel?: string
  badgeVariant?: 'crit' | 'warn' | 'info' | 'ok'
  isReviewed: boolean
  onMarkReviewed: (reviewed: boolean) => void
  showCheckbox?: boolean
  nonInteractiveHeader?: boolean
  defaultExpanded?: boolean
  children: React.ReactNode
  emptyMessage?: string
}

const BADGE_STYLES: Record<string, { background: string; color: string }> = {
  crit: { background: '#1a0a0a', color: '#f87171' },
  warn: { background: '#1e0d00', color: '#f97316' },
  info: { background: '#0a1e28', color: '#60a5fa' },
  ok:   { background: '#0a1e0a', color: '#00f058' },
}

export function ReviewSection({
  title,
  icon,
  signalCount,
  criticalCount = 0,
  warningCount = 0,
  infoCount = 0,
  badgeLabel,
  badgeVariant,
  isReviewed,
  onMarkReviewed,
  showCheckbox = true,
  nonInteractiveHeader = false,
  defaultExpanded = true,
  children,
  emptyMessage,
}: ReviewSectionProps) {
  const [expanded, setExpanded] = useState(defaultExpanded)

  const chevronStyle: React.CSSProperties = {
    color: 'var(--text-3)',
    flexShrink: 0,
    transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)',
    transition: 'transform 0.2s',
    opacity: nonInteractiveHeader ? 0 : 1,
  }

  return (
    <div
      style={{
        background: 'var(--surf)',
        border: `1px solid ${isReviewed ? '#1a3a25' : 'var(--border-1)'}`,
        borderRadius: '8px',
        overflow: 'hidden',
        transition: 'border-color 0.2s',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '12px 16px',
          cursor: nonInteractiveHeader ? 'default' : 'pointer',
          userSelect: 'none',
        }}
        onClick={() => { if (!nonInteractiveHeader) setExpanded(e => !e) }}
        onMouseEnter={e => { if (!nonInteractiveHeader) (e.currentTarget as HTMLElement).style.background = 'var(--surf-2)' }}
        onMouseLeave={e => { if (!nonInteractiveHeader) (e.currentTarget as HTMLElement).style.background = '' }}
      >
        {/* Chevron SVG */}
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={chevronStyle}>
          <path d="M4 2l4 4-4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>

        {/* Section icon */}
        <span style={{ opacity: 0.6, flexShrink: 0, display: 'flex', alignItems: 'center' }}>
          {icon}
        </span>

        {/* Title */}
        <span style={{ flex: 1, fontSize: '13px', fontWeight: 500, color: 'var(--text-1)' }}>
          {title}
        </span>

        {/* Badges */}
        {!isReviewed && (
          <span style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            {criticalCount > 0 && (
              <span style={{
                fontSize: '10px', fontFamily: 'var(--font-mono)',
                padding: '1px 6px', borderRadius: '8px',
                background: '#1a0a0a', color: '#f87171',
              }}>
                {criticalCount} critical
              </span>
            )}
            {warningCount > 0 && (
              <span style={{
                fontSize: '10px', fontFamily: 'var(--font-mono)',
                padding: '1px 6px', borderRadius: '8px',
                background: '#1e0d00', color: '#f97316',
              }}>
                {warningCount} {warningCount === 1 ? 'warning' : 'warnings'}
              </span>
            )}
            {infoCount > 0 && !criticalCount && !warningCount && (
              <span style={{
                fontSize: '10px', fontFamily: 'var(--font-mono)',
                padding: '1px 6px', borderRadius: '8px',
                background: '#0a1e28', color: '#60a5fa',
              }}>
                {infoCount} info
              </span>
            )}
            {badgeLabel && badgeVariant && (
              <span style={{
                fontSize: '10px', fontFamily: 'var(--font-mono)',
                padding: '1px 6px', borderRadius: '8px',
                ...BADGE_STYLES[badgeVariant],
              }}>
                {badgeLabel}
              </span>
            )}
          </span>
        )}

        {isReviewed && (
          <span style={{ fontSize: '11px', color: '#00f058', fontFamily: 'var(--font-mono)' }}>
            ✓ Reviewed
          </span>
        )}

        {/* Checkbox */}
        {showCheckbox && (
          <div
            onClick={e => { e.stopPropagation(); onMarkReviewed(!isReviewed) }}
            style={{
              width: '18px', height: '18px', borderRadius: '4px',
              border: `1.5px solid ${isReviewed ? '#00f058' : 'var(--border-3)'}`,
              background: isReviewed ? '#00f058' : 'transparent',
              cursor: 'pointer', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
            title={isReviewed ? 'Unmark as reviewed' : 'Mark as reviewed'}
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ opacity: isReviewed ? 1 : 0 }}>
              <path d="M2 5l2.5 2.5L8 3" stroke="#0a1a0a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        )}
      </div>

      {/* Body */}
      {expanded && (
        <div style={{
          borderTop: '1px solid var(--border-1)',
          padding: signalCount === 0 && !children ? '14px 16px' : '0',
        }}>
          {signalCount === 0 && !children ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#00f058', fontSize: '12px' }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.2" />
                <path d="M4.5 7l2 2 3-4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {emptyMessage ?? 'All clear'}
            </div>
          ) : (
            children
          )}
        </div>
      )}
    </div>
  )
}
