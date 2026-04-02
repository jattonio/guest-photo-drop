import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Calendar, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import type { EventData } from '@/lib/eventStore';

const MyEvents = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/auth');
      return;
    }
    supabase
      .from('events')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setEvents(data || []);
        setLoading(false);
      });
  }, [user, authLoading, navigate]);

  if (authLoading || loading) return null;

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="max-w-md mx-auto px-6 py-8">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Inicio</span>
        </button>

        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display text-2xl font-bold">Mis eventos</h1>
          <Button
            onClick={() => navigate('/create')}
            size="sm"
            className="bg-gradient-gold text-primary-foreground shadow-gold hover:opacity-90"
          >
            <Plus className="w-4 h-4 mr-1" /> Nuevo
          </Button>
        </div>

        {events.length === 0 ? (
          <div className="bg-card rounded-2xl p-8 shadow-lg border border-border text-center">
            <div className="text-4xl mb-3">🎉</div>
            <p className="text-muted-foreground mb-4">Aún no has creado ningún evento</p>
            <Button
              onClick={() => navigate('/create')}
              className="bg-gradient-gold text-primary-foreground shadow-gold hover:opacity-90"
            >
              Crear mi primer evento
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {events.map((event) => (
              <button
                key={event.id}
                onClick={() => navigate(`/dashboard/${event.id}`)}
                className="w-full bg-card rounded-2xl p-4 shadow border border-border text-left hover:border-gold/40 transition-colors"
              >
                <h3 className="font-display font-semibold">{event.name}</h3>
                {event.date && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(event.date).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </div>
                )}
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                  <ImageIcon className="w-3 h-3" />
                  Código: <span className="font-mono">{event.code}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyEvents;
