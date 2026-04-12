import { X, Phone, Mail } from "lucide-react";
import logo from "@/assets/log1.png";

interface AboutDialogProps {
  open: boolean;
  onClose: () => void;
}

const AboutDialog = ({ open, onClose }: AboutDialogProps) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-foreground/40" onClick={onClose} />
      <div className="relative bg-card rounded-2xl shadow-2xl w-full max-w-sm mx-4 max-h-[85vh] overflow-y-auto animate-fade-in">
        <button onClick={onClose} className="absolute top-3 right-3 text-muted-foreground hover:text-foreground">
          <X className="w-5 h-5" />
        </button>
        <div className="p-6">
          <h2 className="text-lg font-bold text-card-foreground mb-4">Quiénes somos</h2>
          <div className="flex flex-col items-center mb-6">
            <img src={logo} alt="Dulce Vanidad" className="w-20 h-20 rounded-full mb-2" width={80} height={80} />
            <h3 className="text-xl font-bold text-card-foreground">Dulce Vanidad</h3>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-card-foreground mb-2">Contacto</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-primary" />
                  <span>+57 3192172733</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-primary" />
                  <span>alejandramona501@gmail.com</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-card-foreground mb-2">Formas de pago ofrecidas</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>💳 Transferencia bancaria</li>
                <li>💵 Efectivo</li>
                <li>🔗 Enlace de pago</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-card-foreground mb-2">Métodos de entrega</h4>
              <p className="text-sm text-muted-foreground">📦 Entrega a domicilio</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutDialog;
