'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Hash, LogIn, CheckCircle, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { shareNote } from '@/lib/supabase/actions'
import styles from './share.module.css'

export default function JoinModal({ user, onJoined, onClose }) {
  const [noteId, setNoteId] = useState('')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState(null) // 'success' | 'error'
  const supabase = createClient()

  const handleJoin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setStatus(null)

    // 1. Check if note exists
    const { data: note, error: fetchError } = await supabase
      .from('notes')
      .select('id')
      .eq('id', noteId)
      .single()

    if (fetchError || !note) {
      setStatus('error')
      setLoading(false)
      return
    }

    // 2. Add to shared_notes for this user
    const { error: shareError } = await shareNote(noteId, user.email)
    
    setLoading(false)
    if (shareError) {
      setStatus('error')
    } else {
      setStatus('success')
      setTimeout(() => {
        onJoined(noteId)
        onClose()
      }, 1500)
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={styles.overlay}
      onClick={onClose}
    >
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className={styles.modal}
        onClick={e => e.stopPropagation()}
      >
        <div className={styles.header}>
          <h3>Join Shared Note</h3>
          <button onClick={onClose} className={styles.closeBtn}><X size={18} /></button>
        </div>

        <div className={styles.body}>
          <p className={styles.desc}>Enter a Note ID shared with you to add it to your collection.</p>
          
          <form onSubmit={handleJoin} className={styles.form}>
            <div className={styles.inputGroup}>
              <Hash size={16} className={styles.inputIcon} />
              <input 
                type="text" 
                placeholder="note-id-123..." 
                value={noteId}
                onChange={e => setNoteId(e.target.value)}
                required
                className={styles.input}
              />
            </div>
            <button type="submit" disabled={loading || status === 'success'} className={styles.shareBtn}>
              {loading ? 'Joining...' : status === 'success' ? 'Joined!' : 'Add to Collection'}
            </button>
          </form>

          <AnimatePresence>
            {status === 'success' && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className={styles.success}
              >
                <CheckCircle size={14} />
                <span>Added to your shared notes!</span>
              </motion.div>
            )}
            {status === 'error' && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className={styles.error}
              >
                <AlertCircle size={14} />
                <span>Note not found or already joined.</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  )
}
