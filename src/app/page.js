'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import Sidebar from '@/components/layout/Sidebar'
import Editor from '@/components/layout/Editor'
import InvitePopup from '@/components/ui/InvitePopup'
import { acceptInvite, rejectInvite } from '@/lib/supabase/actions'
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
  const [activeInvite, setActiveInvite] = useState(null)
  const [notification, setNotification] = useState(null)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (user) await fetchNotes(user.id, user.email)
      setLoading(false)
    }
    getUser()

    // Real-time Notes
    const notesChannel = supabase
      .channel('notes-dm')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notes' },
        (payload) => handleRealtimeUpdate(payload)
      )
      .subscribe()

    // Real-time Shared Notes (Invitations)
    const sharedChannel = supabase
      .channel('shared-notes-dm')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'shared_notes' },
        (payload) => handleSharedUpdate(payload)
      )
      .subscribe()

    return () => {
      supabase.removeChannel(notesChannel)
      supabase.removeChannel(sharedChannel)
    }
  }, [])

  const fetchNotes = async (userId, email) => {
    // 1. Fetch own notes (include who I shared them with)
    const { data: own, error: error1 } = await supabase
      .from('notes')
      .select('*, shared_notes(shared_with_email)')
      .eq('user_id', userId)
    
    // 2. Fetch shared notes (received from others)
    const { data: shared, error: error2 } = await supabase
      .from('notes')
      .select('*, shared_notes!inner(shared_with_email)')
      .eq('shared_notes.shared_with_email', email)
    
    if (!error1 && !error2) {
      const all = [...(own || []), ...(shared || [])]
      const unique = Array.from(new Map(all.map(n => [n.id, n])).values())
        .sort((a,b) => (b.updated_at || 0) - (a.updated_at || 0))
      setNotes(unique)
    }
  }

  const handleRealtimeUpdate = (payload) => {
    const { eventType, new: newRecord, old: oldRecord } = payload
    
    setNotes(prev => {
      let next = [...prev]
      if (eventType === 'INSERT') {
        next.unshift(newRecord)
      } else if (eventType === 'UPDATE') {
        next = next.map(n => n.id === newRecord.id ? { ...n, ...newRecord } : n)
      } else if (eventType === 'DELETE') {
        next = next.filter(n => n.id !== oldRecord.id)
      }
      
      // Safety dedupe
      return Array.from(new Map(next.map(n => [n.id, n])).values())
        .sort((a,b) => (b.updated_at || 0) - (a.updated_at || 0))
    })
  }

  const handleSharedUpdate = async (payload) => {
    const { eventType, new: newRecord } = payload
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // 1. Incoming Invite
    if (eventType === 'INSERT' && newRecord.shared_with_email === user.email && newRecord.status === 'pending') {
      setActiveInvite(newRecord)
    }

    // 2. Feedback for Sender
    if (eventType === 'UPDATE' && newRecord.status === 'accepted') {
       // Fetch the note to see if I own it
       const { data: note } = await supabase.from('notes').select('user_id, title').eq('id', newRecord.note_id).single()
       if (note && note.user_id === user.id) {
         setNotification({ type: 'success', message: `Invite for "${note.title || 'Untitled'}" accepted!` })
         setTimeout(() => setNotification(null), 5000)
       }
       // If I am the recipient, fetch notes to see the new accepted note
       if (newRecord.shared_with_email === user.email) {
         fetchNotes(user.id, user.email)
       }
    }
  }

  const onAcceptInvite = async (invite) => {
    const { error } = await acceptInvite(invite.id)
    if (!error) {
      setActiveInvite(null)
      setActiveId(invite.note_id)
      // fetchNotes will be triggered by handleSharedUpdate (feedback loop)
    }
  }

  const onRejectInvite = async (id) => {
    const { error } = await rejectInvite(id)
    if (!error) setActiveInvite(null)
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

    // Optimistic Update
    setNotes(prev => [newNote, ...prev])
    setActiveId(newNote.id)

    const { error } = await supabase.from('notes').insert([newNote])
    if (error) {
      // Rollback on error
      setNotes(prev => prev.filter(n => n.id !== newNote.id))
      alert('Error creating note: ' + error.message)
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

      <AnimatePresence>
        {activeInvite && (
          <InvitePopup 
            invite={activeInvite} 
            onAccept={onAcceptInvite} 
            onReject={onRejectInvite} 
          />
        )}
        {notification && (
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            className={styles.notification}
          >
            {notification.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
