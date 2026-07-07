import { useState, useCallback, useEffect, useRef } from 'react';
import { EventPhoto, PhotoReaction, getPhotoUrl, getVideoThumbnailUrl, getPhotoReactions, toggleReaction, getGuestId } from '@/lib/eventStore';
import { supabase } from '@/integrations/supabase/client';
import { X, Download, ChevronLeft, ChevronRight, Play } from 'lucide-react';

interface PhotoGalleryProps {
  photos: EventPhoto[];
}

const REACTION_EMOJIS = ['❤️', '😍', '🔥', '😂', '👏'];
const PAGE_SIZE = 30;

const PhotoGallery = ({ photos }: PhotoGalleryProps) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [reactions, setReactions] = useState<Record<string, PhotoReaction[]>>({});
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const touchStartX = useRef<number | null>(null);
  const guestId = useRef(getGuestId());

  const selectedPhoto = selectedIndex !== null ? photos[selectedIndex] : null;
  const visiblePhotos = photos.slice(0, visibleCount);

  // Load reactions
  useEffect(() => {
    if (photos.length === 0) return;
    const ids = photos.map(p => p.id);
    getPhotoReactions(ids).then(setReactions);
  }, [photos]);

  // Realtime reactions
  useEffect(() => {
    if (photos.length === 0) return;
    const channel = supabase
      .channel('photo-reactions')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'photo_reactions' }, () => {
        const ids = photos.map(p => p.id);
        getPhotoReactions(ids).then(setReactions);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [photos]);

  const handleReaction = async (photoId: string, emoji: string) => {
    await toggleReaction(photoId, emoji, guestId.current);
    const ids = photos.map(p => p.id);
    getPhotoReactions(ids).then(setReactions);
  };

  const getReactionSummary = (photoId: string) => {
    const list = reactions[photoId] || [];
    const counts: Record<string, number> = {};
    for (const r of list) {
      counts[r.emoji] = (counts[r.emoji] || 0) + 1;
    }
    return counts;
  };

  const getMyReaction = (photoId: string) => {
    const list = reactions[photoId] || [];
    return list.find(r => r.guest_id === guestId.current)?.emoji || null;
  };

  const goNext = useCallback(() => {
    setSelectedIndex(prev => (prev !== null && prev < photos.length - 1 ? prev + 1 : prev));
  }, [photos.length]);

  const goPrev = useCallback(() => {
    setSelectedIndex(prev => (prev !== null && prev > 0 ? prev - 1 : prev));
  }, []);

  useEffect(() => {
    if (selectedIndex === null) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goNext();
      else if (e.key === 'ArrowLeft') goPrev();
      else if (e.key === 'Escape') setSelectedIndex(null);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [selectedIndex, goNext, goPrev]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(diff) > 50) {
      if (diff < 0) goNext();
      else goPrev();
    }
    touchStartX.current = null;
  };

  const VideoTile = ({ photo }: { photo: EventPhoto }) => {
    const [thumbError, setThumbError] = useState(false);
    const width = photo.width ?? undefined;
    const height = photo.height ?? undefined;

    if (thumbError) {
      return (
        <>
          <div
            className="w-full bg-foreground/10 flex items-center justify-center"
            style={{ aspectRatio: width && height ? `${width}/${height}` : '3/4' }}
          >
            <Play className="w-10 h-10 text-foreground/50" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-10 h-10 rounded-full bg-foreground/50 backdrop-blur-sm flex items-center justify-center">
              <Play className="w-5 h-5 text-background fill-background" />
            </div>
          </div>
        </>
      );
    }

    return (
      <>
        <img
          src={getVideoThumbnailUrl(photo.file_path)}
          alt={`Video de ${photo.guest_name}`}
          width={width}
          height={height}
          className="w-full h-auto block group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
          decoding="async"
          onError={() => setThumbError(true)}
        />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-10 h-10 rounded-full bg-foreground/50 backdrop-blur-sm flex items-center justify-center">
            <Play className="w-5 h-5 text-background fill-background" />
          </div>
        </div>
      </>
    );
  };

  const renderTile = (photo: EventPhoto) => {
    const isVideo = photo.media_type === 'video';
    const width = photo.width ?? undefined;
    const height = photo.height ?? undefined;

    if (isVideo) {
      return <VideoTile photo={photo} />;
    }

    return (
      <img
        src={getPhotoUrl(photo.file_path, 'thumb')}
        alt={`Foto de ${photo.guest_name}`}
        width={width}
        height={height}
        className="w-full h-auto block group-hover:scale-105 transition-transform duration-300"
        loading="lazy"
        decoding="async"
      />
    );
  };

  if (photos.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">📸</div>
        <p className="text-muted-foreground text-lg">Aún no hay fotos ni videos</p>
        <p className="text-muted-foreground text-sm mt-1">¡Sé el primero en compartir un momento!</p>
      </div>
    );
  }

  return (
    <>
      <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 gap-2 space-y-2">
        {visiblePhotos.map((photo, index) => {
          const summary = getReactionSummary(photo.id);
          const totalReactions = Object.values(summary).reduce((a, b) => a + b, 0);
          return (
            <div
              key={photo.id}
              className="break-inside-avoid cursor-pointer group"
              onClick={() => setSelectedIndex(index)}
            >
              <div className="relative rounded-lg overflow-hidden">
                {renderTile(photo)}
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-foreground/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-xs text-background font-medium truncate">{photo.guest_name}</p>
                </div>
                {totalReactions > 0 && (
                  <div className="absolute top-1.5 right-1.5 flex items-center gap-0.5 bg-foreground/60 backdrop-blur-sm rounded-full px-1.5 py-0.5">
                    {Object.entries(summary).slice(0, 3).map(([emoji, count]) => (
                      <span key={emoji} className="text-xs">{emoji}{count > 1 ? <span className="text-background text-[10px]">{count}</span> : null}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {visibleCount < photos.length && (
        <div className="mt-6 flex justify-center">
          <button
            onClick={() => setVisibleCount(c => Math.min(c + PAGE_SIZE, photos.length))}
            className="px-6 py-2.5 rounded-full bg-card border border-gold/30 text-sm font-medium text-foreground hover:bg-cream transition-all"
          >
            Cargar {Math.min(PAGE_SIZE, photos.length - visibleCount)} más ({visibleCount} de {photos.length})
          </button>
        </div>
      )}

      {selectedPhoto && selectedIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-foreground/90 flex items-center justify-center p-4"
          onClick={() => setSelectedIndex(null)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <button
            className="absolute top-4 right-4 w-10 h-10 bg-background/20 rounded-full flex items-center justify-center z-10"
            onClick={() => setSelectedIndex(null)}
          >
            <X className="w-6 h-6 text-background" />
          </button>

          {selectedIndex > 0 && (
            <button
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-background/20 rounded-full flex items-center justify-center z-10"
              onClick={(e) => { e.stopPropagation(); goPrev(); }}
            >
              <ChevronLeft className="w-6 h-6 text-background" />
            </button>
          )}

          {selectedIndex < photos.length - 1 && (
            <button
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-background/20 rounded-full flex items-center justify-center z-10"
              onClick={(e) => { e.stopPropagation(); goNext(); }}
            >
              <ChevronRight className="w-6 h-6 text-background" />
            </button>
          )}

          <div className="max-w-full max-h-full" onClick={(e) => e.stopPropagation()}>
            {selectedPhoto.media_type === 'video' ? (
              <LightboxVideo photo={selectedPhoto} />
            ) : (
              <img
                src={getPhotoUrl(selectedPhoto.file_path, 'large')}
                alt=""
                className="max-w-full max-h-[85vh] object-contain rounded-lg"
              />
            )}
            {/* Reactions bar */}
            <div className="mt-3 flex justify-center gap-1">
              {REACTION_EMOJIS.map(emoji => {
                const isActive = getMyReaction(selectedPhoto.id) === emoji;
                const count = (reactions[selectedPhoto.id] || []).filter(r => r.emoji === emoji).length;
                return (
                  <button
                    key={emoji}
                    onClick={() => handleReaction(selectedPhoto.id, emoji)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm transition-all ${
                      isActive
                        ? 'bg-primary/30 ring-2 ring-primary scale-110'
                        : 'bg-background/15 hover:bg-background/25'
                    }`}
                  >
                    <span>{emoji}</span>
                    {count > 0 && <span className="text-background text-xs">{count}</span>}
                  </button>
                );
              })}
            </div>
            <div className="mt-2 text-center">
              <p className="text-background/90 text-sm">{selectedPhoto.guest_name}</p>
              <p className="text-background/50 text-xs mt-0.5">{selectedIndex + 1} / {photos.length}</p>
              <a
                href={getPhotoUrl(selectedPhoto.file_path, 'original')}
                download={selectedPhoto.file_path.split('/').pop() || `archivo-${selectedPhoto.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-gold text-sm mt-1 hover:underline"
              >
                <Download className="w-4 h-4" />
                Descargar
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PhotoGallery;
