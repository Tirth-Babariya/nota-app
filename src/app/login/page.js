'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { loginWithMagicLink, loginWithGoogle } from '@/lib/supabase/actions'
import { Mail, Sparkles, Chrome, AlertCircle, ArrowRight } from 'lucide-react'
import styles from './login.module.css'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSent, setIsSent] = useState(false)
  const [error, setError] = useState(null)

  const handleMagicLink = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    const { error: err } = await loginWithMagicLink(email)
    setIsLoading(false)
    if (err) setError(err.message)
    else setIsSent(true)
  }

  const handleGoogle = async () => {
    const { error: err } = await loginWithGoogle()
    if (err) setError(err.message)
  }

  return (
    <div className={styles.container}>
      {/* Background Orbs */}
      <div className={styles.orb1} />
      <div className={styles.orb2} />
      <div className={styles.texture} />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className={styles.card}
      >
        <div className={styles.header}>
          <motion.h1 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="premium-gradient"
          >
            Nota
          </motion.h1>
          <p>Your notes, synced everywhere.<br/>Sign in once — access from any device.</p>
        </div>

        <div className={styles.body}>
          <AnimatePresence mode="wait">
            {!isSent ? (
              <motion.div 
                key="form"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={styles.magicBlock}
              >
                <div className={styles.magicLabel}>
                  <Sparkles size={14} className={styles.accent} />
                  <span>Magic Link</span>
                  <span className={styles.badge}>Fastest</span>
                </div>
                <p className={styles.desc}>Enter your email — we'll send a one-click sign-in link.</p>
                
                <form onSubmit={handleMagicLink} className={styles.form}>
                  <div className={styles.inputGroup}>
                    <Mail size={16} className={styles.inputIcon} />
                    <input 
                      type="email" 
                      placeholder="your@email.com" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className={styles.input}
                    />
                  </div>
                  <button type="submit" disabled={isLoading} className={styles.button}>
                    {isLoading ? 'Sending...' : 'Send Magic Link'}
                    <ArrowRight size={16} style={{ marginLeft: '8px' }} />
                  </button>
                </form>
              </motion.div>
            ) : (
              <motion.div 
                key="sent"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={styles.sentBlock}
              >
                <div className={styles.sentIcon}>📬</div>
                <h3>Link sent!</h3>
                <p>We emailed a sign-in link to <strong>{email}</strong>. Check your inbox to continue.</p>
                <button 
                  onClick={() => setIsSent(false)} 
                  className={styles.backBtn}
                >
                  ← Use a different email
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={styles.error}
            >
              <AlertCircle size={14} />
              <span>{error}</span>
            </motion.div>
          )}

          <div className={styles.divider}>
            <span>or continue with</span>
          </div>

          <button onClick={handleGoogle} className={styles.googleBtn}>
            <Chrome size={18} />
            Continue with Google
          </button>
        </div>

        <div className={styles.footer}>
          <p>No account needed. <span>No password stored.</span></p>
        </div>
      </motion.div>
    </div>
  )
}
