import { useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, ArrowLeft, Menu, X, Settings } from "lucide-react";
import { useStore } from "@/context/StoreContext";
import CartDrawer from "./CartDrawer";
import AboutDialog from "./AboutDialog";
import ShareDialog from "./ShareDialog";
import logo from "@/assets/log1.png";

interface HeaderProps {
  showBack?: boolean;
}

const Header = ({ showBack = false }: HeaderProps) => {
  const { cartCount } = useStore();
  const [cartOpen, setCartOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header className="bg-primary sticky top-0 z-50 shadow-md">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {showBack && (
              <Link to="/" className="text-primary-foreground">
                <ArrowLeft className="w-6 h-6" />
              </Link>
            )}
            <Link to="/" className="flex items-center gap-2">
              <img src={logo} alt="Dulce Vanidad" className="w-10 h-10 rounded-full bg-card" width={40} height={40} />
              <span className="text-primary-foreground font-bold text-lg">Dulce Vanidad</span>
            </Link>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Desktop buttons */}
            <Link
              to="/"
              className="text-primary-foreground border border-primary-foreground/50 rounded-full px-4 py-1.5 text-sm font-medium hover:bg-primary-foreground/10 transition hidden sm:block"
            >
              Inicio
            </Link>
            <button
              onClick={() => setAboutOpen(true)}
              className="text-primary-foreground border border-primary-foreground/50 rounded-full px-4 py-1.5 text-sm font-medium hover:bg-primary-foreground/10 transition hidden sm:block"
            >
              Quiénes somos
            </button>
            <button
              onClick={() => setShareOpen(true)}
              className="text-primary-foreground border border-primary-foreground/50 rounded-full px-4 py-1.5 text-sm font-medium hover:bg-primary-foreground/10 transition hidden sm:block"
            >
              Compartir
            </button>
            <Link
              to="/admin"
              className="text-primary-foreground/70 hover:text-primary-foreground p-2 transition hidden sm:flex"
              title="Administrar"
            >
              <Settings className="w-5 h-5" />
            </Link>
            {/* Cart */}
            <button
              onClick={() => setCartOpen(true)}
              className="relative text-primary-foreground p-2"
            >
              <ShoppingBag className="w-6 h-6" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-success text-success-foreground text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
            {/* Mobile hamburger */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-primary-foreground p-2 sm:hidden"
            >
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
        {/* Mobile menu dropdown */}
        {menuOpen && (
          <div className="sm:hidden bg-primary border-t border-primary-foreground/20 animate-fade-in">
            <div className="container mx-auto px-4 py-3 flex flex-col gap-1">
              <Link
                to="/"
                onClick={() => setMenuOpen(false)}
                className="text-primary-foreground text-left py-2.5 px-3 rounded-lg hover:bg-primary-foreground/10 transition text-sm font-medium"
              >
                Inicio
              </Link>
              <button
                onClick={() => { setAboutOpen(true); setMenuOpen(false); }}
                className="text-primary-foreground text-left py-2.5 px-3 rounded-lg hover:bg-primary-foreground/10 transition text-sm font-medium"
              >
                Quiénes somos
              </button>
              <button
                onClick={() => { setShareOpen(true); setMenuOpen(false); }}
                className="text-primary-foreground text-left py-2.5 px-3 rounded-lg hover:bg-primary-foreground/10 transition text-sm font-medium"
              >
                Compartir
              </button>
              <Link
                to="/admin"
                onClick={() => setMenuOpen(false)}
                className="text-primary-foreground/70 text-left py-2.5 px-3 rounded-lg hover:bg-primary-foreground/10 transition text-sm font-medium flex items-center gap-2"
              >
                <Settings className="w-4 h-4" /> Administrar
              </Link>
            </div>
          </div>
        )}
      </header>
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      <AboutDialog open={aboutOpen} onClose={() => setAboutOpen(false)} />
      <ShareDialog open={shareOpen} onClose={() => setShareOpen(false)} />
    </>
  );
};

export default Header;
