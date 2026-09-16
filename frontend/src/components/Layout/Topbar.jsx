import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { MenuIcon, LogOutIcon, BellIcon, ShieldCheckIcon } from '../Icons.jsx'

export default function Topbar({ title, onOpenMobileMenu }) {
  const { username, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  const userInitial = (username || 'U').charAt(0).toUpperCase()

  return (
    <header className="topbar">
      <div className="topbar__left">
        <button className="topbar__menu-btn" onClick={onOpenMobileMenu} aria-label="Open mobile menu">
          <MenuIcon size={20} />
        </button>
        <div className="topbar__title-group">
          <span className="topbar__breadcrumb">
            <span>NexusAI Platform</span> / <span>Console</span>
          </span>
          <h1 className="topbar__title">{title}</h1>
        </div>
      </div>

      <div className="topbar__right">
        <div className="topbar__badge-pill" title="Gateway Fallback Engine Active">
          <ShieldCheckIcon size={14} />
          <span>Gateway Active</span>
        </div>

        <button
          className="icon-btn"
          aria-label="Notifications"
          title="No unread alerts"
          style={{ position: 'relative' }}
        >
          <BellIcon size={17} />
          <span
            style={{
              position: 'absolute',
              top: '5px',
              right: '5px',
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              background: 'var(--accent)',
            }}
          />
        </button>

        <div className="topbar__user">
          <div className="topbar__avatar" title={username}>
            {userInitial}
          </div>
          <div className="topbar__user-info">
            <span className="topbar__username">{username || 'Admin User'}</span>
            <span className="topbar__user-role">Organization Admin</span>
          </div>
          <button className="topbar__logout-btn" onClick={handleLogout} title="Sign out of console">
            <LogOutIcon size={14} />
            <span>Sign out</span>
          </button>
        </div>
      </div>
    </header>
  )
}
