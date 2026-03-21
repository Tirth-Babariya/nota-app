'use client'

import { createClient } from '@/lib/supabase/client'

export async function loginWithMagicLink(email) {
  const supabase = createClient()
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  })
  return { error }
}

export async function shareNote(noteId, email, permission = 'edit') {
  const supabase = createClient()
  const { error } = await supabase.from('shared_notes').insert([
    { note_id: noteId, shared_with_email: email, permission }
  ])
  return { error }
}

export async function loginWithGoogle() {
  const supabase = createClient()
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  })
  return { error }
}

export async function signOut() {
  const supabase = createClient()
  const { error } = await supabase.auth.signOut()
  if (!error) {
    // Clear any local storage theme if needed, but usually kept
    window.location.href = '/login'
  }
}
