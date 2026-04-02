import { useState } from 'react';
import { EventPhoto, getPhotoUrl } from '@/lib/eventStore';
import { X, Download } from 'lucide-react';

interface PhotoGalleryProps {
  photos: EventPhoto[];
}

const PhotoGallery = ({ photos }: PhotoGalleryProps) => {
  const [selectedPhoto, setSelectedPhoto] = useState<EventPhoto | null>(null);

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
        {photos.map((photo) => (
          <div
            key={photo.id}
            className="break-inside-avoid cursor-pointer group"
            onClick={() => setSelectedPhoto(photo)}
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

      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 bg-foreground/90 flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <button
            className="absolute top-4 right-4 w-10 h-10 bg-background/20 rounded-full flex items-center justify-center"
            onClick={() => setSelectedPhoto(null)}
          >
            <X className="w-6 h-6 text-background" />
          </button>
          <div className="max-w-full max-h-full" onClick={(e) => e.stopPropagation()}>
            <img
              src={getPhotoUrl(selectedPhoto.file_path)}
              alt=""
              className="max-w-full max-h-[85vh] object-contain rounded-lg"
            />
            <div className="mt-3 text-center">
              <p className="text-background/90 text-sm">{selectedPhoto.guest_name}</p>
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
