import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, Images } from 'lucide-react';
import { getEventByCode, EventData, getEventById } from '@/lib/eventStore';
import PhotoUploader from '@/components/PhotoUploader';
import PhotoGallery from '@/components/PhotoGallery';

const GuestView = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<EventData | null>(null);
  const [tab, setTab] = useState<'upload' | 'gallery'>('upload');

  useEffect(() => {
    if (code) {
      const e = getEventByCode(code);
      if (e) setEvent(e);
      else navigate('/');
    }
  }, [code, navigate]);

  const refreshEvent = () => {
    if (event) {
      const e = getEventById(event.id);
      if (e) setEvent(e);
    }
  };

  if (!event) return null;

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="max-w-md mx-auto px-6 py-8">
        {/* Header */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Inicio</span>
        </button>

        <div className="text-center mb-6">
          <div className="text-4xl mb-2">🎉</div>
          <h1 className="font-display text-2xl font-bold">{event.name}</h1>
          {event.hostName && (
            <p className="text-sm text-muted-foreground mt-1">
              Organiza: {event.hostName}
            </p>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 justify-center">
          <button
            onClick={() => setTab('upload')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              tab === 'upload'
                ? 'bg-gradient-gold text-primary-foreground shadow-gold'
                : 'bg-card border border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            <Camera className="w-4 h-4" />
            Subir fotos
          </button>
          <button
            onClick={() => { setTab('gallery'); refreshEvent(); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              tab === 'gallery'
                ? 'bg-gradient-gold text-primary-foreground shadow-gold'
                : 'bg-card border border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            <Images className="w-4 h-4" />
            Ver galería ({event.photos.length})
          </button>
        </div>

        {/* Content */}
        {tab === 'upload' && (
          <div className="bg-card rounded-2xl p-6 shadow-lg border border-border">
            <PhotoUploader eventId={event.id} onPhotosUploaded={refreshEvent} />
          </div>
        )}

        {tab === 'gallery' && (
          <PhotoGallery photos={event.photos} />
        )}
      </div>
    </div>
  );
};

export default GuestView;
