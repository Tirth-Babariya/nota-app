'use client'

import { motion } from 'framer-motion'
import { Sun, Moon } from 'lucide-react'
import { useTheme } from '../layout/ThemeProvider'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={toggleTheme}
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '10px',
        color: 'var(--text)',
        padding: '8px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <motion.div
        initial={false}
        animate={{ y: theme === 'dark' ? 0 : 40 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      >
        <Moon size={18} />
      </motion.div>
      <motion.div
        initial={false}
        animate={{ y: theme === 'light' ? 0 : -40 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        style={{ position: 'absolute' }}
      >
        <Sun size={18} />
      </motion.div>
    </motion.button>
  )
}
