import { X, Copy, Share2 } from "lucide-react";
import { toast } from "sonner";

interface ShareDialogProps {
  open: boolean;
  onClose: () => void;
}

const ShareDialog = ({ open, onClose }: ShareDialogProps) => {
  if (!open) return null;

  const url = window.location.origin;

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    toast.success("¡Enlace copiado!");
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: "Dulce Vanidad", url });
    } else {
      handleCopy();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-foreground/40" onClick={onClose} />
      <div className="relative bg-card rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6 animate-fade-in">
        <button onClick={onClose} className="absolute top-3 right-3 text-muted-foreground">
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-bold text-card-foreground mb-4 flex items-center gap-2">
          <Share2 className="w-5 h-5" /> Compartir
        </h2>
        <div className="flex gap-2">
          <input
            value={url}
            readOnly
            className="flex-1 bg-muted rounded-lg px-3 py-2 text-sm text-foreground"
          />
          <button onClick={handleCopy} className="btn-primary flex items-center gap-1 text-sm">
            <Copy className="w-4 h-4" /> Copiar
          </button>
        </div>
        <button onClick={handleShare} className="w-full mt-3 btn-outline-primary text-sm">
          Compartir enlace
        </button>
      </div>
    </div>
  );
};

export default ShareDialog;
