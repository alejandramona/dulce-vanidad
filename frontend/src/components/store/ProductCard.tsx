import { useState } from "react";
import { ShoppingBag, Check, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useStore } from "@/context/StoreContext";
import { formatPrice } from "@/lib/utils";

interface ProductCardProps {
  product: import("@/context/StoreContext").Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { cart, addToCart } = useStore();
  const isInCart = cart.some((item) => item.product.id === product.id);
  const [imgIndex, setImgIndex] = useState(0);
  const hasMultiple = product.images.length > 1;

  return (
    <div className={`product-card flex flex-col ${product.soldOut ? "opacity-60" : ""}`}>
      {/* Imagen con fondo blanco y padding — igual a la referencia */}
      <div className="relative">
        <Link to={`/producto/${product.id}`} className="block">
          <div className="aspect-square overflow-hidden bg-white flex items-center justify-center p-3">
            <img
              src={product.images[imgIndex]}
              alt={product.name}
              className="w-full h-full object-contain hover:scale-105 transition-transform duration-300"
              loading="lazy"
              width={300}
              height={300}
            />
          </div>
        </Link>

        {hasMultiple && (
          <>
            <button
              onClick={(e) => { e.preventDefault(); setImgIndex((i) => (i - 1 + product.images.length) % product.images.length); }}
              className="absolute left-1 top-1/2 -translate-y-1/2 bg-foreground/40 text-background rounded-full w-6 h-6 flex items-center justify-center hover:bg-foreground/60 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => { e.preventDefault(); setImgIndex((i) => (i + 1) % product.images.length); }}
              className="absolute right-1 top-1/2 -translate-y-1/2 bg-foreground/40 text-background rounded-full w-6 h-6 flex items-center justify-center hover:bg-foreground/60 transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
              {product.images.map((_, i) => (
                <span
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full ${i === imgIndex ? "bg-primary" : "bg-foreground/30"}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <div className="p-3 sm:p-4 flex flex-col flex-1">
        <Link to={`/producto/${product.id}`}>
          <h3 className="text-xs sm:text-sm font-semibold text-card-foreground line-clamp-2 min-h-[2.2rem] hover:text-primary transition">
            {product.name}
          </h3>
        </Link>
        <p className="text-lg sm:text-xl font-bold text-card-foreground mt-1 sm:mt-2">{formatPrice(product.price)}</p>
        <div className="mt-auto pt-2 flex flex-col gap-1.5">
          {product.soldOut ? (
            <div className="bg-muted text-muted-foreground rounded-full py-2 text-center text-xs sm:text-sm font-semibold">
              AGOTADO
            </div>
          ) : isInCart ? (
            <button className="bg-green-500 text-white rounded-full py-2 flex items-center justify-center gap-1.5 text-xs sm:text-sm font-semibold">
              <Check className="w-3.5 h-3.5" /> AÑADIDO
            </button>
          ) : (
            <button
              onClick={() => addToCart(product)}
              className="btn-primary flex items-center justify-center gap-1.5 text-xs sm:text-sm py-2"
            >
              <ShoppingBag className="w-3.5 h-3.5" /> AÑADIR
            </button>
          )}
          <Link
            to={`/producto/${product.id}`}
            className="text-center text-xs sm:text-sm text-primary font-medium hover:underline"
          >
            MÁS INFORMACIÓN
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;