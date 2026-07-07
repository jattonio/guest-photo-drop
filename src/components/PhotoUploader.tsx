import { useState, useRef, useCallback } from 'react';
import { Camera, ImagePlus, X, Upload, Check, Film } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { uploadMedia, addPhotoRecord, getMediaTypeFromFile } from '@/lib/eventStore';
import { toast } from 'sonner';

interface PhotoUploaderProps {
  eventId: string;
  onPhotosUploaded?: () => void;
}

interface FilePreview {
  file: File;
  previewUrl: string;
  mediaType: 'image' | 'video';
}

const PhotoUploader = ({ eventId, onPhotosUploaded }: PhotoUploaderProps) => {
  const [guestName, setGuestName] = useState(() => localStorage.getItem('guest_name') || '');
  const [previews, setPreviews] = useState<FilePreview[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentPercent, setCurrentPercent] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files) return;
    const newPreviews: FilePreview[] = [];
    Array.from(files).forEach(file => {
      if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) return;
      newPreviews.push({ file, previewUrl: URL.createObjectURL(file), mediaType: getMediaTypeFromFile(file) });
    });
    setPreviews(prev => [...prev, ...newPreviews]);
    setUploaded(false);
  }, []);

  const removePreview = (index: number) => {
    setPreviews(prev => {
      const removed = prev[index];
      URL.revokeObjectURL(removed.previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleUpload = async () => {
    if (previews.length === 0) {
      toast.error('Selecciona al menos una foto o video');
      return;
    }

    setUploading(true);
    setCurrentIndex(0);
    setCurrentPercent(0);
    const name = guestName.trim() || 'Invitado anónimo';
    const total = previews.length;

    try {
      for (let i = 0; i < previews.length; i++) {
        const { file } = previews[i];
        setCurrentIndex(i + 1);
        setCurrentPercent(0);
        const { filePath, mediaType, width, height } = await uploadMedia(
          eventId,
          file,
          (pct) => setCurrentPercent(pct),
        );
        await addPhotoRecord(eventId, filePath, name, mediaType, width, height);
      }

      setUploaded(true);
      toast.success(`¡${total} archivo${total > 1 ? 's' : ''} subido${total > 1 ? 's' : ''}!`);
      onPhotosUploaded?.();

      setTimeout(() => {
        previews.forEach(p => URL.revokeObjectURL(p.previewUrl));
        setPreviews([]);
        setUploaded(false);
        setCurrentIndex(0);
        setCurrentPercent(0);
      }, 1200);
    } catch (err) {
      console.error('Upload error:', err);
      toast.error('Error al subir los archivos. Intenta de nuevo.');
      setCurrentIndex(0);
      setCurrentPercent(0);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
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

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => cameraInputRef.current?.click()}
          className="flex flex-col items-center gap-2 p-6 rounded-xl border-2 border-dashed border-gold/30 bg-cream/50 hover:border-gold hover:bg-cream transition-all active:scale-95"
        >
          <Camera className="w-8 h-8 text-gold" />
          <span className="text-sm font-medium text-foreground">Tomar foto o video</span>
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
        accept="image/*,video/*"
        capture="environment"
        className="hidden"
        onChange={(e) => { handleFiles(e.target.files); e.target.value = ''; }}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        className="hidden"
        onChange={(e) => { handleFiles(e.target.files); e.target.value = ''; }}
      />

      {previews.length > 0 && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {previews.length} archivo{previews.length > 1 ? 's' : ''} seleccionado{previews.length > 1 ? 's' : ''}
          </p>
          <div className="grid grid-cols-3 gap-2">
            {previews.map((p, i) => (
              <div key={i} className="relative aspect-square rounded-lg overflow-hidden group">
                {p.mediaType === 'video' ? (
                  <video src={p.previewUrl} className="w-full h-full object-cover" preload="metadata" playsInline muted />
                ) : (
                  <img src={p.previewUrl} alt="" className="w-full h-full object-cover" />
                )}
                {p.mediaType === 'video' && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <Film className="w-6 h-6 text-white drop-shadow-md" />
                  </div>
                )}
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
            className="relative overflow-hidden w-full bg-gradient-gold text-primary-foreground shadow-gold hover:opacity-90 h-12 text-base"
          >
            {uploaded ? (
              <>
                <Check className="w-5 h-5 mr-2" />
                ¡Listo!
              </>
            ) : uploading ? (
              <>
                <span>
                  Subiendo {currentIndex}/{previews.length} · {currentPercent}%
                </span>
                <span
                  className="absolute left-0 bottom-0 h-1 bg-primary-foreground/80 transition-all duration-200"
                  style={{ width: `${currentPercent}%` }}
                />
              </>
            ) : (
              <>
                <Upload className="w-5 h-5 mr-2" />
                Subir archivos
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default PhotoUploader;
