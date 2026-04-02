import { useState, useCallback, useEffect, useRef } from 'react';
import { EventPhoto, getPhotoUrl } from '@/lib/eventStore';
import { X, Download, ChevronLeft, ChevronRight } from 'lucide-react';

interface PhotoGalleryProps {
  photos: EventPhoto[];
}

const PhotoGallery = ({ photos }: PhotoGalleryProps) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const touchStartX = useRef<number | null>(null);

  const selectedPhoto = selectedIndex !== null ? photos[selectedIndex] : null;

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

  if (photos.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">📸</div>
        <p className="text-muted-foreground text-lg">Aún no hay fotos</p>
        <p className="text-muted-foreground text-sm mt-1">¡Sé el primero en compartir un momento!</p>
      </div>
    );
  }

  return (
    <>
      <div className="columns-2 sm:columns-3 gap-2 space-y-2">
        {photos.map((photo, index) => (
          <div
            key={photo.id}
            className="break-inside-avoid cursor-pointer group"
            onClick={() => setSelectedIndex(index)}
          >
            <div className="relative rounded-lg overflow-hidden">
              <img
                src={getPhotoUrl(photo.file_path)}
                alt={`Foto de ${photo.guest_name}`}
                className="w-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-foreground/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-xs text-background font-medium truncate">{photo.guest_name}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

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
            <img
              src={getPhotoUrl(selectedPhoto.file_path)}
              alt=""
              className="max-w-full max-h-[85vh] object-contain rounded-lg"
            />
            <div className="mt-3 text-center">
              <p className="text-background/90 text-sm">{selectedPhoto.guest_name}</p>
              <p className="text-background/50 text-xs mt-0.5">{selectedIndex + 1} / {photos.length}</p>
              <a
                href={getPhotoUrl(selectedPhoto.file_path)}
                download={`foto-${selectedPhoto.id}.jpg`}
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
