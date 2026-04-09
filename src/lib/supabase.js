import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function getParticipants() {
  const { data, error } = await supabase
    .from('participants')
    .select(`id, name, picks ( golfer_name )`)
    .order('name')
  if (error) throw error
  return data
}

export async function addParticipant(name) {
  const { data, error } = await supabase
    .from('participants')
    .insert([{ name }])
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateParticipant(id, name) {
  const { error } = await supabase
    .from('participants')
    .update({ name })
    .eq('id', id)
  if (error) throw error
}

export async function deleteParticipant(id) {
  const { error } = await supabase
    .from('participants')
    .delete()
    .eq('id', id)
  if (error) throw error
}

export async function setPicks(participantId, golferNames) {
  await supabase.from('picks').delete().eq('participant_id', participantId)
  if (golferNames.length === 0) return
  const picks = golferNames
    .filter(n => n.trim())
    .map(golfer_name => ({ participant_id: participantId, golfer_name: golfer_name.trim() }))
  const { error } = await supabase.from('picks').insert(picks)
  if (error) throw error
}
