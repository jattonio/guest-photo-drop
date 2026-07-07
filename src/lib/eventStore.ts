import { supabase } from '@/integrations/supabase/client';

export interface EventPhoto {
  id: string;
  file_path: string;
  guest_name: string;
  created_at: string;
  event_id: string;
  media_type: 'image' | 'video';
  width: number | null;
  height: number | null;
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

export interface UploadMediaResult {
  filePath: string;
  mediaType: 'image' | 'video';
  width: number | null;
  height: number | null;
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
  return (data || []).map(p => ({ ...p, media_type: p.media_type as 'image' | 'video' }));
}

export async function addPhotoRecord(
  eventId: string,
  filePath: string,
  guestName: string,
  mediaType: 'image' | 'video' = 'image',
  width: number | null = null,
  height: number | null = null,
): Promise<EventPhoto> {
  const { data, error } = await supabase
    .from('event_photos')
    .insert({ event_id: eventId, file_path: filePath, guest_name: guestName, media_type: mediaType, width, height })
    .select()
    .single();

  if (error) throw error;
  return { ...data, media_type: data.media_type as 'image' | 'video' };
}

export function getMediaTypeFromFile(file: File): 'image' | 'video' {
  return file.type.startsWith('video/') ? 'video' : 'image';
}

export function getFileExtension(file: File): string {
  const ext = file.name.split('.').pop()?.toLowerCase();
  if (!ext) {
    if (file.type.startsWith('video/')) return 'mp4';
    return 'jpg';
  }
  return ext;
}

export async function uploadFile(eventId: string, file: File): Promise<string> {
  const ext = getFileExtension(file);
  const fileName = `${eventId}/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage
    .from('event-photos')
    .upload(fileName, file, { contentType: file.type });

  if (error) throw error;

  // Store the relative path (not the full URL) so we can request
  // on-the-fly transformations later.
  return fileName;
}

export function getVideoThumbnailPath(videoPath: string): string {
  // eventId/uuid.mp4 -> eventId/uuid-thumb.jpg
  return videoPath.replace(/\.[^/.]+$/, '-thumb.jpg');
}

export async function getMediaDimensions(file: File): Promise<{ width: number; height: number }> {
  const url = URL.createObjectURL(file);
  try {
    if (file.type.startsWith('video/')) {
      return await new Promise((resolve, reject) => {
        const video = document.createElement('video');
        video.onloadedmetadata = () => {
          resolve({ width: video.videoWidth, height: video.videoHeight });
        };
        video.onerror = () => reject(new Error('No se pudieron leer las dimensiones del video'));
        video.src = url;
        video.load();
      });
    }

    return await new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.naturalWidth, height: img.naturalHeight });
      };
      img.onerror = () => reject(new Error('No se pudieron leer las dimensiones de la imagen'));
      img.src = url;
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function generateVideoThumbnail(file: File): Promise<Blob> {
  const url = URL.createObjectURL(file);
  try {
    const video = document.createElement('video');
    video.src = url;
    video.crossOrigin = 'anonymous';
    video.muted = true;
    video.playsInline = true;
    video.preload = 'auto';

    await new Promise<void>((resolve, reject) => {
      video.onloadedmetadata = () => resolve();
      video.onerror = () => reject(new Error('Error al cargar video para thumbnail'));
      video.load();
    });

    // Seek a bit in to avoid a black first frame.
    video.currentTime = video.duration ? Math.min(0.5, video.duration / 2) : 0.1;

    await new Promise<void>((resolve, reject) => {
      video.onseeked = () => resolve();
      video.onerror = () => reject(new Error('Error al buscar frame del video'));
    });

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('No se pudo crear canvas');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error('No se pudo generar thumbnail'));
      }, 'image/jpeg', 0.85);
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function uploadMedia(eventId: string, file: File): Promise<UploadMediaResult> {
  const mediaType = getMediaTypeFromFile(file);
  let width: number | null = null;
  let height: number | null = null;

  try {
    const dimensions = await getMediaDimensions(file);
    width = dimensions.width;
    height = dimensions.height;
  } catch (err) {
    console.warn('No se pudieron leer las dimensiones del archivo:', err);
  }

  const filePath = await uploadFile(eventId, file);

  if (mediaType === 'video') {
    try {
      const thumbBlob = await generateVideoThumbnail(file);
      const thumbPath = getVideoThumbnailPath(filePath);
      const { error } = await supabase.storage
        .from('event-photos')
        .upload(thumbPath, thumbBlob, { contentType: 'image/jpeg' });
      if (error) throw error;
    } catch (err) {
      console.warn('No se pudo generar el thumbnail del video:', err);
    }
  }

  return { filePath, mediaType, width, height };
}

// Backwards-compatible alias for existing call sites.
export async function uploadPhoto(eventId: string, file: File): Promise<string> {
  return uploadFile(eventId, file);
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

export type PhotoSize = 'thumb' | 'large' | 'original';

// Extracts the object path relative to the bucket from either a full
// public URL (older records) or a path (new records).
function toBucketPath(filePath: string): string {
  const marker = '/object/public/event-photos/';
  const idx = filePath.indexOf(marker);
  if (idx >= 0) return filePath.slice(idx + marker.length);
  return filePath;
}

export function getPhotoUrl(filePath: string, size: PhotoSize = 'original'): string {
  const path = toBucketPath(filePath);
  const bucket = supabase.storage.from('event-photos');

  if (size === 'original') {
    return bucket.getPublicUrl(path).data.publicUrl;
  }

  const transform =
    size === 'thumb'
      ? { width: 600, quality: 70, resize: 'contain' as const }
      : { width: 1600, quality: 85, resize: 'contain' as const };

  return bucket.getPublicUrl(path, { transform }).data.publicUrl;
}

export function getVideoThumbnailUrl(videoPath: string): string {
  const path = toBucketPath(videoPath);
  const thumbPath = getVideoThumbnailPath(path);
  return supabase.storage.from('event-photos').getPublicUrl(thumbPath).data.publicUrl;
}
