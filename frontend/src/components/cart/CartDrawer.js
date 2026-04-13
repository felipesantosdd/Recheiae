import { useNavigate } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import { calculateSubtotal, calculateTotalDiscount, calculateDeliveryFee, calculateTotal, formatPrice } from '@/utils/calculations';
import { CartItem } from '@/components/cart/CartItem';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { ShoppingBag, ArrowRight, Trash2 } from 'lucide-react';

export function CartDrawer() {
  const navigate = useNavigate();
  const { items, isOpen, openCart, closeCart, itemCount, clearCart } = useCart();
  const subtotal = calculateSubtotal(items);
  const totalDiscount = calculateTotalDiscount(items);
  const deliveryFee = calculateDeliveryFee();
  const total = calculateTotal(items);

  const goToCheckout = () => {
    closeCart();
    navigate('/checkout');
  };

  return (
    <>
      {/* Mobile bottom bar */}
      {itemCount > 0 && !isOpen && (
        <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden safe-area-inset">
          <button
            onClick={openCart}
            className="w-full bg-primary p-4 flex items-center justify-between shadow-[0_-4px_20px_rgba(0,0,0,0.1)]"
          >
            <span className="flex items-center gap-2 text-primary-foreground">
              <ShoppingBag className="h-5 w-5" />
              <span className="font-semibold text-sm">
                Ver Sacola ({itemCount} {itemCount === 1 ? 'item' : 'itens'})
              </span>
            </span>
            <span className="font-bold text-primary-foreground text-sm">
              {formatPrice(total)}
            </span>
          </button>
        </div>
      )}

      {/* Cart Sheet */}
      <Sheet open={isOpen} onOpenChange={(open) => open ? openCart() : closeCart()}>
        <SheetContent side="right" className="w-full sm:max-w-md flex flex-col p-0">
          <SheetHeader className="px-6 pt-6 pb-3">
            <SheetTitle className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              Sua Sacola
            </SheetTitle>
            <SheetDescription>
              {itemCount} {itemCount === 1 ? 'item' : 'itens'} no carrinho
            </SheetDescription>
          </SheetHeader>

          {items.length === 0 ? (
            <div className="flex-1 flex items-center justify-center flex-col px-6">
              <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-4">
                <ShoppingBag className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground font-medium">Sacola vazia</p>
              <p className="text-sm text-muted-foreground/70 mt-1">Adicione itens do cardápio</p>
            </div>
          ) : (
            <>
              <ScrollArea className="flex-1 px-6">
                <div className="divide-y divide-border">
                  {items.map(item => (
                    <CartItem key={`${item.type}-${item.id}`} item={item} />
                  ))}
                </div>
              </ScrollArea>

              <div className="border-t border-border px-6 py-4 space-y-2.5 bg-card">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium text-foreground">{formatPrice(subtotal)}</span>
                </div>
                {totalDiscount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-success">Descontos</span>
                    <span className="font-medium text-success">-{formatPrice(totalDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Frete</span>
                  <span className="font-medium text-foreground">{formatPrice(deliveryFee)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span className="text-foreground">Total</span>
                  <span className="text-foreground">{formatPrice(total)}</span>
                </div>
                <div className="flex gap-2 pt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={clearCart}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Limpar
                  </Button>
                  <Button
                    className="flex-1"
                    size="lg"
                    onClick={goToCheckout}
                  >
                    Checkout
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
