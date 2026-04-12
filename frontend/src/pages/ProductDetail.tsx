import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Minus, Plus, ShoppingBag, MessageCircle, ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";
import Header from "@/components/store/Header";
import WhatsAppButton from "@/components/store/WhatsAppButton";
import ProductCard from "@/components/store/ProductCard";
import { useStore } from "@/context/StoreContext";
import { formatPrice } from "@/lib/utils";

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { products, addToCart, whatsappNumber } = useStore();
  const product = products.find((p) => p.id === id);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Header showBack />
        <div className="container mx-auto px-4 py-12 text-center">
          <p className="text-muted-foreground">Producto no encontrado</p>
          <Link to="/" className="text-primary font-medium mt-4 inline-block">Volver a la tienda</Link>
        </div>
      </div>
    );
  }

  const related = products.filter((p) => p.id !== product.id && p.category === product.category).slice(0, 5);
  const hasMultipleImages = product.images.length > 1;

  const prevImage = () => setSelectedImage((i) => (i - 1 + product.images.length) % product.images.length);
  const nextImage = () => setSelectedImage((i) => (i + 1) % product.images.length);

  const handleWhatsApp = () => {
    const msg = `Hola, me interesa el producto: ${product.name} - ${formatPrice(product.price)} (x${quantity})`;
    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header showBack />
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {/* Image Section */}
          <div>
            <div className="relative bg-card rounded-2xl overflow-hidden aspect-square">
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
                width={600}
                height={600}
              />
              {/* Navigation arrows */}
              {hasMultipleImages && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-foreground/30 hover:bg-foreground/50 text-background rounded-full w-8 h-8 flex items-center justify-center transition"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-foreground/30 hover:bg-foreground/50 text-background rounded-full w-8 h-8 flex items-center justify-center transition"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
              {/* Fullscreen icon */}
              <button className="absolute bottom-3 right-3 bg-foreground/30 hover:bg-foreground/50 text-background rounded-full w-8 h-8 flex items-center justify-center transition">
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
            {/* Thumbnails */}
            {hasMultipleImages && (
              <div className="flex gap-2 mt-3">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition ${i === selectedImage ? "border-primary" : "border-border"}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" width={64} height={64} loading="lazy" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info Section */}
          <div>
            {/* Product name - visible on all screens */}
            <h1 className="text-xl md:text-2xl font-bold text-foreground mb-4">{product.name}</h1>

            {/* Desktop: Category grid then price */}
            <div className="hidden md:block">
              <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                <div><span className="text-muted-foreground">Categoría</span><br /><span className="font-medium text-primary">{product.category}</span></div>
                <div><span className="text-muted-foreground">Unidad</span><br /><span className="font-medium text-foreground">{product.unit}</span></div>
                <div><span className="text-muted-foreground">Condición</span><br /><span className="font-medium text-foreground">{product.condition}</span></div>
              </div>

              <p className="text-3xl font-bold text-foreground mb-4">{formatPrice(product.price)}</p>

              {!product.soldOut && (
                <>
                  <div className="flex items-center gap-4 mb-2">
                    <div className="flex items-center border rounded-full">
                      <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-foreground">
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center font-medium">{quantity}</span>
                      <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-foreground">
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <button
                      onClick={() => addToCart(product, quantity)}
                      className="btn-primary flex items-center gap-2"
                    >
                      <ShoppingBag className="w-4 h-4" /> AÑADIR AL PEDIDO
                    </button>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">Disponible: {product.stock}</p>

                  <button onClick={handleWhatsApp} className="w-full btn-whatsapp flex items-center justify-center gap-2 mb-6">
                    <MessageCircle className="w-5 h-5" /> PEDIR POR WHATSAPP
                  </button>
                </>
              )}
              {product.soldOut && (
                <div className="bg-muted text-muted-foreground rounded-full py-3 text-center font-semibold mb-6">AGOTADO</div>
              )}

              <div className="border-t pt-4">
                <h3 className="font-bold text-foreground mb-2">Descripción</h3>
                <p className="text-muted-foreground text-sm whitespace-pre-line">{product.description}</p>
              </div>
            </div>

            {/* Mobile: Price + Qty on same row, full-width buttons, table info */}
            <div className="md:hidden">
              <div className="flex items-center justify-between mb-3">
                <p className="text-2xl font-bold text-foreground">{formatPrice(product.price)}</p>
                {!product.soldOut && (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center border rounded-full">
                      <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-9 h-9 flex items-center justify-center text-muted-foreground hover:text-foreground">
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-6 text-center font-medium text-sm">{quantity}</span>
                      <button onClick={() => setQuantity(quantity + 1)} className="w-9 h-9 flex items-center justify-center text-muted-foreground hover:text-foreground">
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <span className="text-xs text-muted-foreground">Disponible: {product.stock}</span>
                  </div>
                )}
              </div>

              {!product.soldOut && (
                <>
                  <button
                    onClick={() => addToCart(product, quantity)}
                    className="w-full btn-primary flex items-center justify-center gap-2 mb-2"
                  >
                    <ShoppingBag className="w-4 h-4" /> AÑADIR AL PEDIDO
                  </button>
                  <button onClick={handleWhatsApp} className="w-full btn-whatsapp flex items-center justify-center gap-2 mb-4">
                    <MessageCircle className="w-5 h-5" /> PEDIR POR WHATSAPP
                  </button>
                </>
              )}
              {product.soldOut && (
                <div className="bg-muted text-muted-foreground rounded-full py-3 text-center font-semibold mb-4">AGOTADO</div>
              )}

              {/* Table-style info */}
              <div className="border-t border-b divide-y text-sm mb-4">
                <div className="flex justify-between py-2.5">
                  <span className="text-muted-foreground">Categoría</span>
                  <span className="font-medium text-primary">{product.category}</span>
                </div>
                <div className="flex justify-between py-2.5">
                  <span className="text-muted-foreground">Unidad</span>
                  <span className="font-medium text-foreground">{product.unit}</span>
                </div>
                <div className="flex justify-between py-2.5">
                  <span className="text-muted-foreground">Condición</span>
                  <span className="font-medium text-foreground">{product.condition}</span>
                </div>
              </div>

              <div className="mb-4">
                <h3 className="font-bold text-foreground mb-2">Descripción</h3>
                <p className="text-muted-foreground text-sm whitespace-pre-line">{product.description}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Related products */}
        {related.length > 0 && (
          <div className="mt-10">
            <h3 className="text-lg font-bold text-foreground mb-4">También le puede gustar</h3>
            {/* Desktop: grid */}
            <div className="hidden sm:grid sm:grid-cols-3 md:grid-cols-5 gap-4">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
            {/* Mobile: horizontal scroll */}
            <div className="sm:hidden flex gap-3 overflow-x-auto pb-4 -mx-4 px-4 snap-x">
              {related.map((p) => (
                <div key={p.id} className="min-w-[45%] snap-start">
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <WhatsAppButton />
    </div>
  );
};

export default ProductDetail;
