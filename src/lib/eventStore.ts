import { supabase } from '@/integrations/supabase/client';

export interface EventPhoto {
  id: string;
  file_path: string;
  guest_name: string;
  created_at: string;
  event_id: string;
}

export interface EventData {
  id: string;
  name: string;
  date: string;
  host_name: string;
  code: string;
  user_id: string | null;
  created_at: string;
}

export function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export async function createEvent(name: string, date: string, hostName: string, userId: string): Promise<EventData> {
  const code = generateCode();
  const { data, error } = await supabase
    .from('events')
    .insert({ name, date, host_name: hostName, code, user_id: userId })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getEventByCode(code: string): Promise<EventData | null> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .ilike('code', code)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getEventById(id: string): Promise<EventData | null> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getEventPhotos(eventId: string): Promise<EventPhoto[]> {
  const { data, error } = await supabase
    .from('event_photos')
    .select('*')
    .eq('event_id', eventId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function addPhotoRecord(eventId: string, filePath: string, guestName: string): Promise<EventPhoto> {
  const { data, error } = await supabase
    .from('event_photos')
    .insert({ event_id: eventId, file_path: filePath, guest_name: guestName })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function uploadPhoto(eventId: string, file: File): Promise<string> {
  const ext = file.name.split('.').pop() || 'jpg';
  const fileName = `${eventId}/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage
    .from('event-photos')
    .upload(fileName, file, { contentType: file.type });

  if (error) throw error;

  // Store the relative path (not the full URL) so we can request
  // on-the-fly transformations later.
  return fileName;
}

export interface PhotoReaction {
  id: string;
  photo_id: string;
  emoji: string;
  guest_id: string;
  created_at: string;
}

export async function getPhotoReactions(photoIds: string[]): Promise<Record<string, PhotoReaction[]>> {
  if (photoIds.length === 0) return {};
  const { data, error } = await supabase
    .from('photo_reactions')
    .select('*')
    .in('photo_id', photoIds);
  if (error) throw error;
  const map: Record<string, PhotoReaction[]> = {};
  for (const r of data || []) {
    if (!map[r.photo_id]) map[r.photo_id] = [];
    map[r.photo_id].push(r);
  }
  return map;
}

export async function toggleReaction(photoId: string, emoji: string, guestId: string): Promise<void> {
  // Check existing
  const { data: existing } = await supabase
    .from('photo_reactions')
    .select('id, emoji')
    .eq('photo_id', photoId)
    .eq('guest_id', guestId)
    .maybeSingle();

  if (existing) {
    if (existing.emoji === emoji) {
      // Remove reaction
      await supabase.from('photo_reactions').delete().eq('id', existing.id);
    } else {
      // Change emoji
      await supabase.from('photo_reactions').update({ emoji }).eq('id', existing.id);
    }
  } else {
    await supabase.from('photo_reactions').insert({ photo_id: photoId, emoji, guest_id: guestId });
  }
}

export function getGuestId(): string {
  let id = localStorage.getItem('guest_id');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('guest_id', id);
  }
  return id;
}

export function getPhotoUrl(filePath: string): string {
  // If it's already a full URL, return as-is
  if (filePath.startsWith('http')) return filePath;
  const { data } = supabase.storage.from('event-photos').getPublicUrl(filePath);
  return data.publicUrl;
}
