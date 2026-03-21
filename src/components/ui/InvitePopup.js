'use client'

import { motion } from 'framer-motion'
import { Bell, Users, Check, X, ArrowRight } from 'lucide-react'
import styles from './invite.module.css'

export default function InvitePopup({ invite, onAccept, onReject }) {
  if (!invite) return null

  return (
    <motion.div 
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={styles.popup}
    >
      <div className={styles.icon}>
        <Bell size={20} />
      </div>
      <div className={styles.content}>
        <div className={styles.header}>
          <Users size={14} className={styles.metaIcon} />
          <span>New Invitation</span>
        </div>
        <p className={styles.text}>
           Someone invited you to collaborate on a note.
        </p>
        <div className={styles.actions}>
          <button onClick={() => onReject(invite.id)} className={styles.rejectBtn}>
            <X size={16} /> Ignore
          </button>
          <button onClick={() => onAccept(invite)} className={styles.acceptBtn}>
            Accept <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </motion.div>
  )
}
