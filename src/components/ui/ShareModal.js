'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Mail, Send, CheckCircle, AlertCircle } from 'lucide-react'
import { shareNote } from '@/lib/supabase/actions'
import styles from './share.module.css'

export default function ShareModal({ noteId, onClose }) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState(null) // 'success' | 'error'

  const handleShare = async (e) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await shareNote(noteId, email)
    setLoading(false)
    if (error) {
      setStatus('error')
    } else {
      setStatus('success')
      setTimeout(onClose, 2000)
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
          <h3>Share Note</h3>
          <button onClick={onClose} className={styles.closeBtn}><X size={18} /></button>
        </div>

        <div className={styles.body}>
          <p className={styles.desc}>Invite someone to edit this note with you. They must have a Nota account.</p>
          
          <form onSubmit={handleShare} className={styles.form}>
            <div className={styles.inputGroup}>
              <Mail size={16} className={styles.inputIcon} />
              <input 
                type="email" 
                placeholder="friend@email.com" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className={styles.input}
              />
            </div>
            <button type="submit" disabled={loading || status === 'success'} className={styles.shareBtn}>
              {loading ? 'Inviting...' : status === 'success' ? 'Link Sent!' : 'Invite to Edit'}
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
                <span>Successfully shared with {email}</span>
              </motion.div>
            )}
            {status === 'error' && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className={styles.error}
              >
                <AlertCircle size={14} />
                <span>Error sharing. Make sure the table exists.</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  )
}
