'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  Plus, 
  Settings, 
  LogOut, 
  Pin, 
  Tag, 
  Clock, 
  Inbox,
  MoreVertical,
  Check,
  Loader2,
  Users
} from 'lucide-react'
import { signOut } from '@/lib/supabase/actions'
import ThemeToggle from '../ui/ThemeToggle'
import styles from './sidebar.module.css'

export default function Sidebar({ 
  user, 
  notes, 
  activeId, 
  onSelect, 
  onCreate, 
  filter, 
  setFilter,
  searchQuery,
  setSearchQuery
}) {
  const [isSignOutLoading, setIsSignOutLoading] = useState(false)

  const handleSignOut = async () => {
    setIsSignOutLoading(true)
    await signOut()
  }

  const filteredNotes = notes.filter(n => {
    if (filter === 'pinned' && !n.pinned) return false
    if (filter === 'shared' && n.user_id === user.id) return false
    if (searchQuery && !n.title.toLowerCase().includes(searchQuery.toLowerCase()) && !n.content.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  }).sort((a, b) => (b.pinned - a.pinned) || (new Date(b.updated_at) - new Date(a.updated_at)))

  return (
    <aside className={styles.sidebar}>
      <header className={styles.header}>
        <div className={styles.row}>
          <div className={styles.logo}>
            <div className={styles.dot} />
            <span>Nota</span>
          </div>
          <div className={styles.headerActions}>
            <ThemeToggle />
            <button className={styles.iconBtn} onClick={onCreate} title="New Note">
              <Plus size={18} />
            </button>
          </div>
        </div>

        <div className={styles.userPill}>
          <div className={styles.avatar}>
            {user?.user_metadata?.avatar_url ? (
              <img src={user.user_metadata.avatar_url} alt="" />
            ) : (
              (user?.user_metadata?.full_name || user?.email || '?').charAt(0).toUpperCase()
            )}
          </div>
          <div className={styles.userInfo}>
            <span className={styles.userName}>{user?.user_metadata?.full_name || user?.email?.split('@')[0]}</span>
          </div>
          <button className={styles.logoutBtn} onClick={handleSignOut} disabled={isSignOutLoading}>
            {isSignOutLoading ? <Loader2 size={14} className="spin" /> : <LogOut size={14} />}
          </button>
        </div>
      </header>

      <div className={styles.search}>
        <Search size={16} className={styles.searchIcon} />
        <input 
          type="text" 
          placeholder="Search notes..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      <nav className={styles.nav}>
        <button 
          className={`${styles.navItem} ${filter === 'all' ? styles.active : ''}`}
          onClick={() => setFilter('all')}
        >
          <Inbox size={16} />
          <span>All Notes</span>
          <span className={styles.count}>{notes.length}</span>
        </button>
        <button 
          className={`${styles.navItem} ${filter === 'pinned' ? styles.active : ''}`}
          onClick={() => setFilter('pinned')}
        >
          <Pin size={16} />
          <span>Pinned</span>
          <span className={styles.count}>{notes.filter(n => n.pinned).length}</span>
        </button>
        <button 
          className={`${styles.navItem} ${filter === 'shared' ? styles.active : ''}`}
          onClick={() => setFilter('shared')}
        >
          <Users size={16} />
          <span>Shared</span>
          <span className={styles.count}>{notes.filter(n => n.user_id !== user.id).length}</span>
        </button>
      </nav>

      <div className={styles.list}>
        <div className={styles.sectionLabel}>Recent</div>
        <AnimatePresence mode="popLayout">
          {filteredNotes.map(note => (
            <motion.div
              key={note.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className={`${styles.card} ${activeId === note.id ? styles.cardActive : ''}`}
              onClick={() => onSelect(note.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className={styles.cardHeader}>
                <span className={styles.cardTitle}>{note.title || 'Untitled'}</span>
                <div className={styles.cardStickyIcons}>
                  {note.user_id !== user.id && <Users size={10} className={styles.sharedIcon} />}
                  {note.pinned && <Pin size={10} className={styles.pinIcon} />}
                </div>
              </div>
              <p className={styles.cardPreview}>
                {note.content?.replace(/\n/g, ' ').slice(0, 60) || 'No content yet...'}
              </p>
              <div className={styles.cardMeta}>
                <Clock size={10} />
                <span>{new Date(note.updated_at).toLocaleDateString()}</span>
                {note.tag && note.tag !== 'none' && (
                  <span className={styles.tagBadge}>{note.tag}</span>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </aside>
  )
}
