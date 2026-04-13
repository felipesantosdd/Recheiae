import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/context/CartContext";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { Toaster } from "@/components/ui/sonner";
import MenuPage from "@/pages/MenuPage";
import CheckoutPage from "@/pages/CheckoutPage";
import AdminPage from "@/pages/AdminPage";

const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';

function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <div className="min-h-screen flex flex-col bg-background">
          <Header />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<MenuPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              {IS_DEVELOPMENT && (
                <Route path="/admin" element={<AdminPage />} />
              )}
            </Routes>
          </main>
          <Footer />
          <CartDrawer />
          <Toaster position="top-center" richColors />
        </div>
      </CartProvider>
    </BrowserRouter>
  );
}

export default App;
