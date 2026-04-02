import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, PartyPopper, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createEvent } from '@/lib/eventStore';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const CreateEvent = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [hostName, setHostName] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) navigate('/auth');
  }, [user, authLoading, navigate]);

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error('Ingresa el nombre del evento');
      return;
    }
    setCreating(true);
    try {
      const event = await createEvent(name.trim(), date, hostName.trim(), user!.id);
      toast.success('¡Evento creado!');
      navigate(`/dashboard/${event.id}`);
    } catch (err) {
      console.error(err);
      toast.error('Error al crear el evento');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="max-w-md mx-auto px-6 py-8">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Volver</span>
        </button>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-cream border border-gold/20 mb-4">
            <PartyPopper className="w-8 h-8 text-gold" />
          </div>
          <h1 className="font-display text-2xl font-bold">Crear evento</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Configura tu evento en segundos
          </p>
        </div>

        <div className="bg-card rounded-2xl p-6 shadow-lg border border-border space-y-5">
          <div>
            <label className="block text-sm font-medium mb-2">Nombre del evento *</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Boda de Ana y Carlos" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Fecha</label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Tu nombre</label>
            <Input value={hostName} onChange={(e) => setHostName(e.target.value)} placeholder="Nombre del organizador" />
          </div>
          <Button
            onClick={handleCreate}
            disabled={creating}
            className="w-full bg-gradient-gold text-primary-foreground shadow-gold hover:opacity-90 h-12 text-base"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            {creating ? 'Creando...' : 'Crear evento'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateEvent;
