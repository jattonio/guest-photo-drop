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
  
  const { data } = supabase.storage
    .from('event-photos')
    .getPublicUrl(fileName);

  return data.publicUrl;
}

export function getPhotoUrl(filePath: string): string {
  // If it's already a full URL, return as-is
  if (filePath.startsWith('http')) return filePath;
  const { data } = supabase.storage.from('event-photos').getPublicUrl(filePath);
  return data.publicUrl;
}
