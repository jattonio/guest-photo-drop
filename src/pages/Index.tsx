import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, PartyPopper, QrCode, ArrowRight, LogIn, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getEventByCode } from '@/lib/eventStore';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { BRAND_NAME } from '@/lib/brand';
import heroImage from '@/assets/hero-party.jpg';

const Index = () => {
  const navigate = useNavigate();
  const { user, signOut, loading } = useAuth();
  const [code, setCode] = useState('');
  const [joining, setJoining] = useState(false);

  const handleJoinEvent = async () => {
    if (!code.trim()) {
      toast.error('Ingresa el código del evento');
      return;
    }
    setJoining(true);
    try {
      const event = await getEventByCode(code.trim());
      if (event) {
        navigate(`/event/${event.code}`);
      } else {
        toast.error('Código no encontrado. Verifica e intenta de nuevo.');
      }
    } catch {
      toast.error('Error al buscar el evento');
    } finally {
      setJoining(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success('Sesión cerrada');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Auth bar */}
      {!loading && (
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
          {user ? (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate('/my-events')}
                className="bg-background/80 backdrop-blur border-brand-primary/30"
              >
                <User className="w-4 h-4 mr-1" /> Mis eventos
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleSignOut}
                className="bg-background/80 backdrop-blur"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate('/auth')}
              className="bg-background/80 backdrop-blur border-brand-primary/30"
            >
              <LogIn className="w-4 h-4 mr-1" /> Iniciar sesión
            </Button>
          )}
        </div>
      )}

      <div className="relative h-[60vh] min-h-[400px] overflow-hidden">
        <img src={heroImage} alt="Fiesta elegante" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/30 via-foreground/20 to-background" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
          <div className="animate-float mb-4">
            <Camera className="w-12 h-12 text-brand-primary" />
          </div>
          <h1 className="font-heading text-4xl md:text-6xl font-bold text-background mb-3 drop-shadow-lg">{BRAND_NAME}</h1>
          <p className="text-background/90 text-lg md:text-xl max-w-md drop-shadow">
            Captura cada momento de tu evento. Todos los recuerdos, en un solo lugar.
          </p>
        </div>
      </div>

      <div className="max-w-md mx-auto px-6 -mt-12 relative z-10 space-y-6 pb-12">
        <div className="bg-card rounded-2xl p-6 shadow-lg border border-border">
          <div className="flex items-center gap-2 mb-4">
            <QrCode className="w-5 h-5 text-brand-primary" />
            <h2 className="font-heading text-lg font-semibold">Unirse a un evento</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Ingresa el código que está en tu mesa para comenzar a subir fotos
          </p>
          <div className="flex gap-2">
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Ej: ABC123"
              maxLength={6}
              className="uppercase tracking-widest text-center font-mono text-lg"
              onKeyDown={(e) => e.key === 'Enter' && handleJoinEvent()}
            />
            <Button
              onClick={handleJoinEvent}
              disabled={joining}
              className="bg-brand-primary text-primary-foreground shadow-brand hover:bg-brand-dark px-6"
            >
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="bg-card rounded-2xl p-6 shadow-lg border border-border">
          <div className="flex items-center gap-2 mb-4">
            <PartyPopper className="w-5 h-5 text-brand-primary" />
            <h2 className="font-heading text-lg font-semibold">Crear un evento</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            ¿Organizas una fiesta o evento? Crea tu espacio para que tus invitados compartan fotos
          </p>
          <Button
            onClick={() => user ? navigate('/create') : navigate('/auth')}
            variant="outline"
            className="w-full border-brand-primary/30 text-foreground hover:bg-brand-soft hover:border-brand-primary"
          >
            {user ? 'Crear evento' : 'Inicia sesión para crear'}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-4 pt-4">
          {[
            { icon: '📱', label: 'Fácil de usar' },
            { icon: '⚡', label: 'Rápido' },
            { icon: '🎉', label: 'Gratis' },
          ].map((f) => (
            <div key={f.label} className="text-center">
              <div className="text-2xl mb-1">{f.icon}</div>
              <p className="text-xs text-muted-foreground">{f.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;
