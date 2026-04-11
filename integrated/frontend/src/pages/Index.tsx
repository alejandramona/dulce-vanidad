import Header from "@/components/store/Header";
import SearchBar from "@/components/store/SearchBar";
import CategoryFilter from "@/components/store/CategoryFilter";
import ProductCard from "@/components/store/ProductCard";
import WhatsAppButton from "@/components/store/WhatsAppButton";
import Footer from "@/components/store/Footer";
import { useStore } from "@/context/StoreContext";
import banner from "@/assets/DulceVanidadBaner.png";

const Index = () => {
  const { products, loadingProducts, searchQuery, selectedCategory, setSelectedCategory } = useStore();

  const filtered = products.filter((p) => {
    if (!p.active && p.active !== undefined) return false;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "Todo" || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="w-full">
        <img src={banner} alt="Dulce Vanidad Banner" className="w-full object-cover" width={1920} height={640} />
      </div>
      <div className="container mx-auto px-4 py-6 space-y-4">
        <SearchBar />

        {/* Categorías primero */}
        <CategoryFilter />

        {/* Breadcrumb debajo de las categorías */}
        {selectedCategory !== "Todo" && (
          <p className="text-sm text-muted-foreground">
            <span className="hover:text-primary cursor-pointer" onClick={() => setSelectedCategory("Todo")}>Inicio</span>
            {" / "}
            <span className="text-primary font-medium">{selectedCategory}</span>
          </p>
        )}

        {loadingProducts ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-card rounded-2xl overflow-hidden animate-pulse">
                <div className="aspect-square bg-muted" />
                <div className="p-3 space-y-2">
                  <div className="h-3 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                  <div className="h-4 bg-muted rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {!loadingProducts && filtered.length === 0 && (
          <p className="text-center text-muted-foreground py-12">No se encontraron productos</p>
        )}
      </div>
      <WhatsAppButton />
      <Footer />
    </div>
  );
};

export default Index;