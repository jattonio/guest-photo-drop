import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { ArrowLeft, Copy, Download, Images, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getEventById, getEventPhotos, EventData, EventPhoto } from '@/lib/eventStore';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import PhotoGallery from '@/components/PhotoGallery';
import { toast } from 'sonner';

const EventDashboard = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [event, setEvent] = useState<EventData | null>(null);
  const [photos, setPhotos] = useState<EventPhoto[]>([]);
  const [tab, setTab] = useState<'qr' | 'gallery'>('qr');

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/auth');
      return;
    }
    if (!id) return;
    getEventById(id).then(e => {
      if (e && (e as any).user_id === user.id) {
        setEvent(e);
        getEventPhotos(e.id).then(setPhotos);
      } else {
        navigate('/my-events');
      }
    });
  }, [id, navigate, user, authLoading]);

  // Realtime
  useEffect(() => {
    if (!event) return;
    const channel = supabase
      .channel(`dashboard-photos-${event.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'event_photos',
        filter: `event_id=eq.${event.id}`,
      }, (payload) => {
        setPhotos(prev => [payload.new as EventPhoto, ...prev]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [event]);

  if (!event) return null;

  const eventUrl = `${window.location.origin}/event/${event.code}`;

  const copyCode = () => {
    navigator.clipboard.writeText(event.code);
    toast.success('Código copiado');
  };

  const copyLink = () => {
    navigator.clipboard.writeText(eventUrl);
    toast.success('Enlace copiado');
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="max-w-2xl mx-auto px-6 py-8">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Inicio</span>
        </button>

        <div className="mb-6">
          <h1 className="font-display text-2xl font-bold">{event.name}</h1>
          {event.date && (
            <p className="text-sm text-muted-foreground mt-1">
              {new Date(event.date).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          )}
        </div>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setTab('qr')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              tab === 'qr'
                ? 'bg-gradient-gold text-primary-foreground shadow-gold'
                : 'bg-card border border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            <QrCode className="w-4 h-4" />
            Código QR
          </button>
          <button
            onClick={() => setTab('gallery')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              tab === 'gallery'
                ? 'bg-gradient-gold text-primary-foreground shadow-gold'
                : 'bg-card border border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            <Images className="w-4 h-4" />
            Galería ({photos.length})
          </button>
        </div>

        {tab === 'qr' && (
          <div className="bg-card rounded-2xl p-8 shadow-lg border border-border text-center space-y-6">
            <p className="text-muted-foreground text-sm">
              Imprime este QR y colócalo en las mesas de tus invitados
            </p>
            <div className="inline-block p-6 bg-background rounded-2xl border border-border">
              <QRCodeSVG value={eventUrl} size={200} level="H" fgColor="hsl(30, 10%, 15%)" bgColor="transparent" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-2">Código del evento</p>
              <div className="flex items-center justify-center gap-2">
                <span className="font-mono text-2xl font-bold tracking-[0.3em] text-foreground">{event.code}</span>
                <button onClick={copyCode} className="text-gold hover:text-gold-dark"><Copy className="w-4 h-4" /></button>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={copyLink} className="flex-1 border-gold/30 hover:bg-cream">
                <Copy className="w-4 h-4 mr-2" />Copiar enlace
              </Button>
              <Button variant="outline" onClick={() => window.print()} className="flex-1 border-gold/30 hover:bg-cream">
                <Download className="w-4 h-4 mr-2" />Imprimir QR
              </Button>
            </div>
          </div>
        )}

        {tab === 'gallery' && <PhotoGallery photos={photos} />}
      </div>
    </div>
  );
};

export default EventDashboard;
