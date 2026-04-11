import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { StoreProvider } from "@/context/StoreContext";
import Index from "./pages/Index.tsx";
import ProductDetail from "./pages/ProductDetail.tsx";
import Checkout from "./pages/Checkout.tsx";
import OrderConfirmation from "./pages/OrderConfirmation.tsx";
import Admin from "./pages/Admin.tsx";
import NotFound from "./pages/NotFound.tsx";
import AdminOrders from "./pages/AdminOrders.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <StoreProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/producto/:id" element={<ProductDetail />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/confirmacion" element={<OrderConfirmation />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin-pedidos" element={<AdminOrders />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </StoreProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
