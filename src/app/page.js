'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import Sidebar from '@/components/layout/Sidebar'
import Editor from '@/components/layout/Editor'
import { motion, AnimatePresence } from 'framer-motion'
import styles from './page.module.css'

export default function App() {
  const supabase = createClient()
  const [user, setUser] = useState(null)
  const [notes, setNotes] = useState([])
  const [activeId, setActiveId] = useState(null)
  const [filter, setFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (user) await fetchNotes(user.id, user.email)
      setLoading(false)
    }
    getUser()

    // Real-time subscription
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notes' },
        (payload) => {
          handleRealtimeUpdate(payload)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const fetchNotes = async (userId, email) => {
    // 1. Fetch own notes
    const { data: own, error: error1 } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
    
    // 2. Fetch shared notes (using join)
    const { data: shared, error: error2 } = await supabase
      .from('notes')
      .select('*, shared_notes!inner(shared_with_email)')
      .eq('shared_notes.shared_with_email', email)
    
    if (!error1 && !error2) {
      const all = [...(own || []), ...(shared || [])]
      // Deduplicate by ID
      const unique = Array.from(new Map(all.map(n => [n.id, n])).values())
        .sort((a,b) => b.updated_at - a.updated_at)
      setNotes(unique)
    }
  }

  const handleRealtimeUpdate = (payload) => {
    const { eventType, new: newRecord, old: oldRecord } = payload
    
    setNotes(prev => {
      if (eventType === 'INSERT') {
        const exists = prev.some(n => n.id === newRecord.id)
        if (exists) return prev
        return [newRecord, ...prev]
      }
      if (eventType === 'UPDATE') {
        return prev.map(n => n.id === newRecord.id ? { ...n, ...newRecord } : n)
      }
      if (eventType === 'DELETE') return prev.filter(n => n.id !== oldRecord.id)
      return prev
    })
  }

  const createNote = async () => {
    const newNote = {
      id: Math.random().toString(36).substring(2, 15),
      user_id: user.id,
      title: '',
      content: '',
      tag: 'none',
      pinned: false,
      created_at: new Date().getTime(),
      updated_at: new Date().getTime()
    }

    const { error } = await supabase.from('notes').insert([newNote])
    if (!error) {
      setActiveId(newNote.id)
    }
  }

  const updateNote = async (id, updates) => {
    const ts = new Date().getTime()
    const { error } = await supabase
      .from('notes')
      .update({ ...updates, updated_at: ts })
      .eq('id', id)
    
    if (!error) {
      setNotes(prev => prev.map(n => n.id === id ? { ...n, ...updates, updated_at: ts } : n))
    }
  }

  const deleteNote = async (id) => {
    if (!confirm('Are you sure you want to delete this note?')) return
    const { error } = await supabase.from('notes').delete().eq('id', id)
    if (!error) {
      if (activeId === id) setActiveId(null)
    }
  }

  const togglePin = async (id) => {
    const note = notes.find(n => n.id === id)
    if (!note) return
    await updateNote(id, { pinned: !note.pinned })
  }

  const activeNote = notes.find(n => n.id === activeId)

  if (loading) {
    return (
      <div className={styles.loading}>
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          className={styles.spinner}
        />
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <Sidebar 
        user={user}
        notes={notes}
        activeId={activeId}
        onSelect={setActiveId}
        onCreate={createNote}
        filter={filter}
        setFilter={setFilter}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
      <Editor 
        note={activeNote}
        onUpdate={updateNote}
        onDelete={deleteNote}
        onTogglePin={togglePin}
        currentUser={user}
      />
    </div>
  )
}
