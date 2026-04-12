import { MessageCircle } from "lucide-react";
import { useStore } from "@/context/StoreContext";

const WhatsAppButton = () => {
  const { whatsappNumber } = useStore();
  return (
    <a
     href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Hola, quiero información sobre tus productos")}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 bg-whatsapp text-whatsapp-foreground rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
    >
      <MessageCircle className="w-7 h-7" />
    </a>
  );
};

export default WhatsAppButton;
