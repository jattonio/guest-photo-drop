import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, Images } from 'lucide-react';
import { getEventByCode, getEventPhotos, EventData, EventPhoto } from '@/lib/eventStore';
import { supabase } from '@/integrations/supabase/client';
import PhotoUploader from '@/components/PhotoUploader';
import PhotoGallery from '@/components/PhotoGallery';
import LegalLinks from '@/components/LegalLinks';

const GuestView = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<EventData | null>(null);
  const [photos, setPhotos] = useState<EventPhoto[]>([]);
  const [tab, setTab] = useState<'upload' | 'gallery'>('upload');

  useEffect(() => {
    if (!code) return;
    getEventByCode(code).then(e => {
      if (e) {
        setEvent(e);
        getEventPhotos(e.id).then(setPhotos);
      } else {
        navigate('/');
      }
    });
  }, [code, navigate]);

  // Realtime subscription for new photos
  useEffect(() => {
    if (!event) return;

    const channel = supabase
      .channel(`photos-${event.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'event_photos',
          filter: `event_id=eq.${event.id}`,
        },
        (payload) => {
          const newPhoto = payload.new as EventPhoto;
          setPhotos(prev => [newPhoto, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [event]);

  const refreshPhotos = () => {
    if (event) {
      getEventPhotos(event.id).then(setPhotos);
    }
  };

  if (!event) return null;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-md mx-auto px-6 py-8">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Inicio</span>
        </button>

        <div className="text-center mb-6">
          <div className="text-4xl mb-2">🎉</div>
          <h1 className="font-heading text-2xl font-bold">{event.name}</h1>
          {event.host_name && (
            <p className="text-sm text-muted-foreground mt-1">
              Organiza: {event.host_name}
            </p>
          )}
        </div>

        <div className="flex gap-2 mb-6 justify-center">
          <button
            onClick={() => setTab('upload')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              tab === 'upload'
                ? 'bg-brand-primary text-primary-foreground shadow-brand'
                : 'bg-card border border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            <Camera className="w-4 h-4" />
            Subir fotos o videos
          </button>
          <button
            onClick={() => setTab('gallery')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              tab === 'gallery'
                ? 'bg-brand-primary text-primary-foreground shadow-brand'
                : 'bg-card border border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            <Images className="w-4 h-4" />
            Ver galería ({photos.length})
          </button>
        </div>

        {tab === 'upload' && (
          <div className="bg-card rounded-2xl p-6 shadow-lg border border-border">
            <PhotoUploader eventId={event.id} onPhotosUploaded={refreshPhotos} />
          </div>
        )}

        {tab === 'upload' && <LegalLinks className="mt-6" />}
      </div>

      {tab === 'gallery' && (
        <div className="w-full">
          <PhotoGallery photos={photos} />
        </div>
      )}
    </div>
  );
};

export default GuestView;
