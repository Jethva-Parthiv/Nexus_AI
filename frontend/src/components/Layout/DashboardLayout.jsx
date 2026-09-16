import React, { useState } from 'react'
import Sidebar from './Sidebar.jsx'
import Topbar from './Topbar.jsx'

export default function DashboardLayout({ title, children }) {
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('nexusai_sidebar_collapsed') === '1')
  const [mobileOpen, setMobileOpen] = useState(false)

  function toggleCollapsed() {
    setCollapsed((c) => {
      const next = !c
      localStorage.setItem('nexusai_sidebar_collapsed', next ? '1' : '0')
      return next
    })
  }

  return (
    <div className={`app-shell${collapsed ? ' app-shell--collapsed' : ''}`}>
      <Sidebar
        collapsed={collapsed}
        onToggleCollapsed={toggleCollapsed}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />
      {mobileOpen && <div className="sidebar-scrim" onClick={() => setMobileOpen(false)} />}
      <div className="app-shell__main">
        <Topbar title={title} onOpenMobileMenu={() => setMobileOpen(true)} />
        <main className="app-shell__content">{children}</main>
      </div>
    </div>
  )
}
