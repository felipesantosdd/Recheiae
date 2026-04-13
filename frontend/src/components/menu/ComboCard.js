import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, ImageOff } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatPrice, calculateItemPrice } from '@/utils/calculations';
import { toast } from 'sonner';
import { useState } from 'react';

export function ComboCard({ combo }) {
  const { addItem } = useCart();
  const [imgError, setImgError] = useState(false);
  const discountedPrice = calculateItemPrice(combo.valor, combo.desconto);
  const hasDiscount = combo.desconto > 0;

  const handleAddToCart = () => {
    addItem({
      id: combo.uuid,
      type: 'combo',
      name: combo.nome,
      originalPrice: combo.valor,
      discount: combo.desconto || 0,
      foto: combo.foto,
    });
    toast.success(`${combo.nome} adicionado ao carrinho!`);
  };

  return (
    <Card className="card-hover overflow-hidden flex flex-row h-full">
      <div className="relative w-28 sm:w-36 shrink-0 overflow-hidden bg-muted">
        {!imgError && combo.foto ? (
          <img
            src={combo.foto}
            alt={combo.nome}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageOff className="h-8 w-8 text-muted-foreground/40" />
          </div>
        )}
        <Badge variant="combo" className="absolute top-2 left-2 text-[10px]">
          Combo
        </Badge>
        {hasDiscount && (
          <Badge variant="promo" className="absolute top-2 right-2 text-[10px]">
            -{combo.desconto}%
          </Badge>
        )}
      </div>
      <CardContent className="flex flex-col flex-1 p-3">
        <h3 className="font-semibold text-sm text-card-foreground line-clamp-1">
          {combo.nome}
        </h3>
        {combo.descricao && (
          <p className="text-[11px] text-muted-foreground line-clamp-2 mt-1 leading-relaxed">
            {combo.descricao}
          </p>
        )}
        <div className="mt-auto pt-3 flex items-center justify-between gap-2">
          <div className="flex items-baseline gap-1.5">
            {hasDiscount && (
              <span className="text-[11px] text-muted-foreground price-original">
                {formatPrice(combo.valor)}
              </span>
            )}
            <span className="text-base font-bold text-foreground">
              {formatPrice(discountedPrice)}
            </span>
          </div>
          <Button size="sm" onClick={handleAddToCart} className="shrink-0 text-xs">
            <Plus className="h-3.5 w-3.5" />
            Adicionar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
