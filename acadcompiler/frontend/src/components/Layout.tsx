import React from 'react'
import { IconMortarboard, IconCompile, IconHistory, IconBatch, IconCompare, IconCite } from './icons'
import { useAppStore } from '../store/useAppStore'
import type { Tab } from '../types'

const NAV_ITEMS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'compiler', label: 'Compiler',  icon: <IconCompile size={18}/> },
  { id: 'history',  label: 'History',   icon: <IconHistory size={18}/> },
  { id: 'batch',    label: 'Batch',     icon: <IconBatch size={18}/> },
  { id: 'compare',  label: 'Compare',   icon: <IconCompare size={18}/> },
  { id: 'cite',     label: 'Cite',      icon: <IconCite size={18}/> },
]

export function Layout({ children }: { children: React.ReactNode }) {
  const { activeTab, setActiveTab } = useAppStore()

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside style={{
        width: 'var(--nav-w)', flexShrink: 0, position: 'fixed', top: 0, left: 0,
        height: '100vh', background: 'var(--c-surface)', borderRight: '1px solid var(--c-border)',
        display: 'flex', flexDirection: 'column', zIndex: 100,
      }}>
        {/* Logo */}
        <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid var(--c-border-soft)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ color: 'var(--c-primary)' }}>
              <IconMortarboard size={28}/>
            </span>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--c-text)', lineHeight: 1.2 }}>AcadCompiler</div>
              <div style={{ fontSize: 10, color: 'var(--c-text-muted)', marginTop: 1 }}>Academic style compiler</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ padding: '8px 8px', flex: 1 }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--c-text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', padding: '8px 12px 4px' }}>Tools</div>
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              className={`nav-item${activeTab === item.id ? ' active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--c-border-soft)' }}>
          <span style={{ fontSize: 11, color: 'var(--c-text-muted)', background: 'var(--c-surface-2)', padding: '3px 8px', borderRadius: 4, border: '1px solid var(--c-border)' }}>v0.1.0</span>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ marginLeft: 'var(--nav-w)', flex: 1, minHeight: '100vh' }}>
        {children}
      </main>
    </div>
  )
}
