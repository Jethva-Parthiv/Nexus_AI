import React from 'react'
import { NavLink } from 'react-router-dom'
import {
  DashboardIcon,
  ProvidersIcon,
  TerminalIcon,
  AuditIcon,
  NetworkIcon,
  SettingsIcon,
  ChevronDownIcon,
  XIcon,
  ZapIcon,
} from '../Icons.jsx'

const NAV_ITEMS = [
  { to: '/', label: 'Overview', icon: DashboardIcon, end: true },
  { to: '/providers', label: 'Providers & Keys', icon: ProvidersIcon },
  { to: '/playground', label: 'AI Playground', icon: TerminalIcon },
  { to: '/audit', label: 'Request Log', icon: AuditIcon },
  { to: '/topology', label: 'System Topology', icon: NetworkIcon },
  { to: '/settings', label: 'Settings', icon: SettingsIcon },
]

export default function Sidebar({ collapsed, onToggleCollapsed, mobileOpen, onCloseMobile }) {
  return (
    <aside className={`sidebar${collapsed ? ' sidebar--collapsed' : ''}${mobileOpen ? ' sidebar--mobile-open' : ''}`}>
      <div className="sidebar__brand">
        <NavLink to="/" className="sidebar__brand-link" onClick={onCloseMobile}>
          <div className="sidebar__logo-icon">
            <ZapIcon size={20} />
          </div>
          {!collapsed && (
            <div className="sidebar__brand-text">
              Nexus<span>AI</span>
              <span className="sidebar__brand-badge">SaaS</span>
            </div>
          )}
        </NavLink>
        <button className="sidebar__mobile-close" onClick={onCloseMobile} aria-label="Close navigation menu">
          <XIcon size={20} />
        </button>
      </div>

      {!collapsed && <div className="sidebar__nav-section-title">Navigation</div>}

      <nav className="sidebar__nav">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onCloseMobile}
              title={collapsed ? item.label : undefined}
              className={({ isActive }) =>
                'sidebar__link' + (isActive ? ' sidebar__link--active' : '')
              }
            >
              <Icon size={18} className="sidebar__link-icon" />
              {!collapsed && <span className="sidebar__link-text">{item.label}</span>}
              {!collapsed && item.to === '/playground' && (
                <span className="sidebar__link-badge">Interactive</span>
              )}
            </NavLink>
          )
        })}
      </nav>

      {!collapsed && (
        <div className="sidebar__footer">
          <div className="sidebar__status-card">
            <div className="status-dot" />
            <div>
              <div className="sidebar__status-title">Smart Fallback Active</div>
              <div className="sidebar__status-subtitle">Zero downtime routing</div>
            </div>
          </div>

          <button
            className="sidebar__collapse-btn"
            onClick={onToggleCollapsed}
            aria-label="Collapse sidebar"
          >
            <ChevronDownIcon
              size={15}
              style={{ transform: 'rotate(90deg)' }}
            />
            <span>Collapse Menu</span>
          </button>
        </div>
      )}

      {collapsed && (
        <div style={{ padding: '16px 8px', marginTop: 'auto' }}>
          <button
            className="sidebar__collapse-btn"
            onClick={onToggleCollapsed}
            aria-label="Expand sidebar"
            title="Expand menu"
          >
            <ChevronDownIcon
              size={15}
              style={{ transform: 'rotate(-90deg)' }}
            />
          </button>
        </div>
      )}
    </aside>
  )
}
