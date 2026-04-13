import { Button } from '@/components/ui/button';
import { Minus, Plus, Trash2, ImageOff } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatPrice, calculateItemPrice } from '@/utils/calculations';
import { useState } from 'react';

export function CartItem({ item }) {
  const { updateQuantity, removeItem } = useCart();
  const [imgError, setImgError] = useState(false);
  const unitPrice = calculateItemPrice(item.originalPrice, item.discount);
  const lineTotal = unitPrice * item.quantity;

  return (
    <div className="flex gap-3 py-3">
      <div className="h-16 w-16 rounded-md overflow-hidden bg-muted shrink-0">
        {!imgError && item.foto ? (
          <img
            src={item.foto}
            alt={item.name}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageOff className="h-4 w-4 text-muted-foreground/40" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-foreground truncate">{item.name}</h4>
        <p className="text-sm font-bold text-primary mt-0.5">{formatPrice(lineTotal)}</p>
        <div className="flex items-center gap-2 mt-2">
          <div className="flex items-center border border-border rounded-md">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-none"
              onClick={() => updateQuantity(item.id, item.type, item.quantity - 1)}
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="w-8 text-center text-sm font-medium text-foreground">{item.quantity}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-none"
              onClick={() => updateQuantity(item.id, item.type, item.quantity + 1)}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => removeItem(item.id, item.type)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
