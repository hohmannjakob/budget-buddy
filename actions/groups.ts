'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createGroup(name: string, description?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: group, error } = await supabase
    .from('groups')
    .insert({ name, description: description || null, created_by: user.id })
    .select()
    .single()

  if (error) return { error: error.message }

  // Creator becomes member
  await supabase.from('group_members').insert({
    group_id: group.id,
    user_id: user.id,
  })

  revalidatePath('/groups')
  return { success: true, groupId: group.id }
}

export async function inviteMemberByEmail(groupId: string, email: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // Find user by email
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, name')
    .eq('id', (
      await supabase
        .from('auth.users')
        .select('id')
        .eq('email', email)
        .single()
    ).data?.id ?? '')
    .single()

  if (profileError || !profile) return { error: 'User not found' }

  const { error } = await supabase.from('group_members').insert({
    group_id: groupId,
    user_id: profile.id,
  })

  if (error) return { error: error.message }

  revalidatePath('/groups')
  return { success: true }
}

export async function getUserGroups() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('groups')
    .select(`
      *,
      members:group_members(
        *,
        profile:profiles(*)
      )
    `)
    .in('id', (
      await supabase
        .from('group_members')
        .select('group_id')
        .eq('user_id', user.id)
    ).data?.map((m) => m.group_id) ?? [])
    .order('created_at', { ascending: false })

  return data ?? []
}

export async function getGroupById(groupId: string) {
  const supabase = await createClient()

  const { data } = await supabase
    .from('groups')
    .select(`
      *,
      members:group_members(
        *,
        profile:profiles(*)
      )
    `)
    .eq('id', groupId)
    .single()

  return data
}

export async function leaveGroup(groupId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('group_members')
    .delete()
    .eq('group_id', groupId)
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/groups')
  return { success: true }
}
