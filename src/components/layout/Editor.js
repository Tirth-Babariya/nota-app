'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { 
  Save, 
  Trash2, 
  Pin, 
  Tag, 
  Maximize2,
  MoreHorizontal,
  CloudCheck,
  CloudOff,
  UserPlus,
  Users
} from 'lucide-react'
import ShareModal from '../ui/ShareModal'
import { AnimatePresence } from 'framer-motion'
import styles from './editor.module.css'

export default function Editor({ note, onUpdate, onDelete, onTogglePin, currentUser }) {
  const [content, setContent] = useState(note?.content || '')
  const [title, setTitle] = useState(note?.title || '')
  const [isSaving, setIsSaving] = useState(false)
  const [showShare, setShowShare] = useState(false)
  const timerRef = useRef(null)

  useEffect(() => {
    setContent(note?.content || '')
    setTitle(note?.title || '')
  }, [note?.id])

  const handleUpdate = (updates) => {
    if (timerRef.current) clearTimeout(timerRef.current)
    
    setIsSaving(true)
    timerRef.current = setTimeout(async () => {
      await onUpdate(note.id, updates)
      setIsSaving(false)
    }, 1000)
  }

  if (!note) {
    return (
      <div className={styles.empty}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className={styles.emptyIcon}
        >
          ✦
        </motion.div>
        <h2>Select a note to view</h2>
        <p>Choose a note from the sidebar or create a new one to get started.</p>
      </div>
    )
  }

  return (
    <motion.main 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={styles.editor}
    >
      <header className={styles.header}>
        <div className={styles.meta}>
          <div className={styles.status}>
            {isSaving ? (
              <span className={styles.syncing}>Saving...</span>
            ) : (
              <span className={styles.synced}><Check size={12} /> Synced</span>
            )}
            {note.user_id !== currentUser?.id && (
              <span className={styles.sharedBadge}>
                <Users size={10} /> Shared with you
              </span>
            )}
          </div>
          <div className={styles.actions}>
            {note.user_id === currentUser?.id && (
              <button className={styles.actionBtn} onClick={() => setShowShare(true)} title="Share">
                <UserPlus size={18} />
              </button>
            )}
            <button 
              className={`${styles.actionBtn} ${note.pinned ? styles.pinned : ''}`}
              onClick={() => onTogglePin(note.id)}
            >
              <Pin size={18} />
            </button>
            <button className={styles.actionBtn} onClick={() => onDelete(note.id)}>
              <Trash2 size={18} />
            </button>
          </div>
        </div>

        <input
          type="text"
          className={styles.titleInput}
          placeholder="Note Title"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value)
            handleUpdate({ title: e.target.value })
          }}
        />

        <div className={styles.tagsRow}>
          <Tag size={12} />
          <select 
            value={note.tag || 'none'} 
            onChange={(e) => handleUpdate({ tag: e.target.value })}
            className={styles.tagSelect}
          >
            <option value="none">No Tag</option>
            <option value="work">Work</option>
            <option value="personal">Personal</option>
            <option value="idea">Idea</option>
            <option value="urgent">Urgent</option>
          </select>
          <span className={styles.wordCount}>
            {content.split(/\s+/).filter(Boolean).length} words
          </span>
        </div>
      </header>

      <div className={styles.body}>
        <textarea
          className={styles.textarea}
          placeholder="Start writing..."
          value={content}
          onChange={(e) => {
            setContent(e.target.value)
            handleUpdate({ content: e.target.value })
          }}
        />
      </div>

      <AnimatePresence>
        {showShare && (
          <ShareModal noteId={note.id} onClose={() => setShowShare(false)} />
        )}
      </AnimatePresence>
    </motion.main>
  )
}

function Check({ size }) {
  return <motion.svg 
    width={size} height={size} viewBox="0 0 24 24" fill="none" 
    stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
  >
    <polyline points="20 6 9 17 4 12" />
  </motion.svg>
}
