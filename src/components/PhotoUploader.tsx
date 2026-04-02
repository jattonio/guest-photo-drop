import { useState, useRef, useCallback } from 'react';
import { Camera, ImagePlus, X, Upload, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { addPhotosToEvent, EventPhoto } from '@/lib/eventStore';
import { toast } from 'sonner';

interface PhotoUploaderProps {
  eventId: string;
  onPhotosUploaded?: () => void;
}

const PhotoUploader = ({ eventId, onPhotosUploaded }: PhotoUploaderProps) => {
  const [guestName, setGuestName] = useState('');
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files) return;
    const newPreviews: string[] = [];
    Array.from(files).forEach(file => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          newPreviews.push(e.target.result as string);
          if (newPreviews.length === files.length) {
            setPreviews(prev => [...prev, ...newPreviews]);
          }
        }
      };
      reader.readAsDataURL(file);
    });
  }, []);

  const removePreview = (index: number) => {
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (previews.length === 0) {
      toast.error('Selecciona al menos una foto');
      return;
    }

    setUploading(true);
    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const photos: EventPhoto[] = previews.map(dataUrl => ({
      id: crypto.randomUUID(),
      dataUrl,
      guestName: guestName || 'Invitado anónimo',
      timestamp: Date.now(),
    }));

    addPhotosToEvent(eventId, photos);
    setUploading(false);
    setUploaded(true);
    toast.success(`¡${photos.length} foto${photos.length > 1 ? 's' : ''} subida${photos.length > 1 ? 's' : ''}!`);
    onPhotosUploaded?.();

    setTimeout(() => {
      setPreviews([]);
      setUploaded(false);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Guest name */}
      <div>
        <label className="block text-sm font-medium text-muted-foreground mb-2">
          Tu nombre (opcional)
        </label>
        <Input
          value={guestName}
          onChange={(e) => setGuestName(e.target.value)}
          placeholder="¿Cómo te llamas?"
          className="bg-card border-border"
        />
      </div>

      {/* Upload buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => cameraInputRef.current?.click()}
          className="flex flex-col items-center gap-2 p-6 rounded-xl border-2 border-dashed border-gold/30 bg-cream/50 hover:border-gold hover:bg-cream transition-all active:scale-95"
        >
          <Camera className="w-8 h-8 text-gold" />
          <span className="text-sm font-medium text-foreground">Tomar foto</span>
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex flex-col items-center gap-2 p-6 rounded-xl border-2 border-dashed border-gold/30 bg-cream/50 hover:border-gold hover:bg-cream transition-all active:scale-95"
        >
          <ImagePlus className="w-8 h-8 text-gold" />
          <span className="text-sm font-medium text-foreground">Galería</span>
        </button>
      </div>

      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {/* Previews */}
      {previews.length > 0 && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {previews.length} foto{previews.length > 1 ? 's' : ''} seleccionada{previews.length > 1 ? 's' : ''}
          </p>
          <div className="grid grid-cols-3 gap-2">
            {previews.map((src, i) => (
              <div key={i} className="relative aspect-square rounded-lg overflow-hidden group">
                <img src={src} alt="" className="w-full h-full object-cover" />
                <button
                  onClick={() => removePreview(i)}
                  className="absolute top-1 right-1 w-6 h-6 bg-foreground/70 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4 text-background" />
                </button>
              </div>
            ))}
          </div>

          <Button
            onClick={handleUpload}
            disabled={uploading || uploaded}
            className="w-full bg-gradient-gold text-primary-foreground shadow-gold hover:opacity-90 h-12 text-base"
          >
            {uploaded ? (
              <>
                <Check className="w-5 h-5 mr-2" />
                ¡Listo!
              </>
            ) : uploading ? (
              <span className="animate-pulse">Subiendo...</span>
            ) : (
              <>
                <Upload className="w-5 h-5 mr-2" />
                Subir fotos
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default PhotoUploader;
