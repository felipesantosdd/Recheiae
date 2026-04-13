import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, ImageOff } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatPrice, calculateItemPrice } from '@/utils/calculations';
import { toast } from 'sonner';
import { useState } from 'react';

export function ProductCard({ product, showPromo, showPopular }) {
  const { addItem } = useCart();
  const [imgError, setImgError] = useState(false);
  const discountedPrice = calculateItemPrice(product.preco, product.desconto);
  const hasDiscount = product.desconto > 0;

  const handleAddToCart = () => {
    addItem({
      id: product.uuid,
      type: 'product',
      name: product.nome,
      originalPrice: product.preco,
      discount: product.desconto || 0,
      foto: product.foto,
    });
    toast.success(`${product.nome} adicionado ao carrinho!`);
  };

  return (
    <Card className="card-hover overflow-hidden flex flex-col h-full">
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {!imgError && product.foto ? (
          <img
            src={product.foto}
            alt={product.nome}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageOff className="h-8 w-8 text-muted-foreground/40" />
          </div>
        )}
        <div className="absolute top-2 left-2 flex flex-wrap gap-1">
          {showPromo && hasDiscount && (
            <Badge variant="promo" className="text-[10px]">-{product.desconto}%</Badge>
          )}
          {showPopular && (
            <Badge variant="popular" className="text-[10px]">Mais Pedido</Badge>
          )}
        </div>
      </div>
      <CardContent className="flex flex-col flex-1 p-3 pb-1">
        <h3 className="font-semibold text-sm text-card-foreground line-clamp-1">
          {product.nome}
        </h3>
        {product.descricao && (
          <p className="text-[11px] text-muted-foreground line-clamp-2 mt-1 leading-relaxed">
            {product.descricao}
          </p>
        )}
        <div className="mt-auto pt-2">
          <div className="flex items-baseline gap-1.5">
            {hasDiscount && (
              <span className="text-[11px] text-muted-foreground price-original">
                {formatPrice(product.preco)}
              </span>
            )}
            <span className="text-base font-bold text-foreground">
              {formatPrice(discountedPrice)}
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-3 pt-2">
        <Button
          variant="default"
          size="sm"
          className="w-full text-xs"
          onClick={handleAddToCart}
        >
          <Plus className="h-3.5 w-3.5" />
          Adicionar
        </Button>
      </CardFooter>
    </Card>
  );
}
