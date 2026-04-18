import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Plus, ImageOff } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatPrice, calculateItemPrice, calculateAddonsTotal } from '@/utils/calculations';
import { api } from '@/lib/api';
import { toast } from 'sonner';

export function ProductCard({ product, showPromo, showPopular }) {
  const { addItem } = useCart();
  const [imgError, setImgError] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [addons, setAddons] = useState([]);
  const [selectedAddonIds, setSelectedAddonIds] = useState([]);
  const [notes, setNotes] = useState('');

  const discountedPrice = calculateItemPrice(product.preco, product.desconto);
  const hasDiscount = product.desconto > 0;
  const isDrink = product.categoria === 'Bebidas';

  useEffect(() => {
    api.get('/addons')
      .then((response) => setAddons(
        (response.data || []).map((addon) => ({
          ...addon,
          name: addon.name || addon.nome,
          price: addon.price ?? addon.preco ?? 0,
        })),
      ))
      .catch(() => setAddons([]));
  }, []);

  const selectedAddons = useMemo(
    () => addons.filter((addon) => selectedAddonIds.includes(addon.uuid)),
    [addons, selectedAddonIds],
  );
  const finalUnitPrice = discountedPrice + calculateAddonsTotal(selectedAddons);

  const resetCustomization = () => {
    setSelectedAddonIds([]);
    setNotes('');
  };

  const toggleAddon = (addonId) => {
    setSelectedAddonIds((current) =>
      current.includes(addonId) ? current.filter((id) => id !== addonId) : [...current, addonId],
    );
  };

  const handleAddToCart = () => {
    addItem({
      id: product.uuid,
      type: 'product',
      name: product.nome,
      originalPrice: product.preco,
      discount: product.desconto || 0,
      foto: product.foto,
      addons: isDrink ? [] : selectedAddons,
      notes: isDrink ? '' : notes.trim(),
    });
    toast.success(`${product.nome} adicionado ao carrinho!`);
    setIsDialogOpen(false);
    resetCustomization();
  };

  const handleOpenOrAdd = () => {
    if (isDrink) {
      handleAddToCart();
      return;
    }
    setIsDialogOpen(true);
  };

  return (
    <>
      <Card className="card-hover overflow-hidden flex flex-col h-full">
        <button
          type="button"
          className="relative aspect-[4/3] overflow-hidden bg-muted text-left"
          onClick={handleOpenOrAdd}
        >
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
        </button>

        <CardContent className="flex flex-col flex-1 p-3 pb-1">
          <button type="button" className="text-left" onClick={handleOpenOrAdd}>
            <h3 className="font-semibold text-sm text-card-foreground line-clamp-1">
              {product.nome}
            </h3>
            {product.descricao && (
              <p className="text-[11px] text-muted-foreground line-clamp-2 mt-1 leading-relaxed">
                {product.descricao}
              </p>
            )}
          </button>

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
            onClick={handleOpenOrAdd}
          >
            <Plus className="h-3.5 w-3.5" />
            Adicionar
          </Button>
        </CardFooter>
      </Card>

      {!isDrink && (
        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetCustomization();
          }}
        >
          <DialogContent className="max-h-[90vh] w-[calc(100%-1rem)] max-w-lg overflow-y-auto p-4 sm:w-full sm:p-6">
            <DialogHeader>
              <DialogTitle>{product.nome}</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {product.foto && !imgError && (
                <div className="h-48 overflow-hidden rounded-md bg-muted">
                  <img
                    src={product.foto}
                    alt={product.nome}
                    className="h-full w-full object-cover"
                    onError={() => setImgError(true)}
                  />
                </div>
              )}

              {product.descricao && (
                <p className="text-sm leading-relaxed text-muted-foreground">{product.descricao}</p>
              )}

              <Tabs defaultValue="adicionais" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="adicionais">Adicionais</TabsTrigger>
                  <TabsTrigger value="observacoes">Observacoes</TabsTrigger>
                </TabsList>

                <TabsContent value="adicionais" className="space-y-3 pt-3">
                  {addons.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      Nenhum adicional disponivel no momento.
                    </p>
                  )}

                  {addons.map((addon) => (
                    <label
                      key={addon.uuid}
                      className="flex cursor-pointer items-center justify-between rounded-md border border-border p-3"
                    >
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={selectedAddonIds.includes(addon.uuid)}
                          onCheckedChange={() => toggleAddon(addon.uuid)}
                        />
                        <div>
                          <p className="text-sm font-medium text-foreground">{addon.name}</p>
                          <p className="text-xs text-muted-foreground">
                            + {formatPrice(addon.price)}
                          </p>
                        </div>
                      </div>
                    </label>
                  ))}
                </TabsContent>

                <TabsContent value="observacoes" className="space-y-2 pt-3">
                  <Label htmlFor={`notes-${product.uuid}`} className="text-sm">
                    Observacoes do item
                  </Label>
                  <Textarea
                    id={`notes-${product.uuid}`}
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    placeholder="Ex: sem cebola, caprichar no cheddar..."
                    rows={4}
                  />
                </TabsContent>
              </Tabs>

              <div className="rounded-md bg-muted/50 p-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Preco base</span>
                  <span className="font-medium">{formatPrice(discountedPrice)}</span>
                </div>
                <div className="mt-1 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Adicionais</span>
                  <span className="font-medium">{formatPrice(calculateAddonsTotal(selectedAddons))}</span>
                </div>
                <div className="mt-2 flex items-center justify-between text-base font-bold">
                  <span>Total do item</span>
                  <span>{formatPrice(finalUnitPrice)}</span>
                </div>
              </div>

              <DialogFooter className="gap-2 sm:gap-0">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                <Button onClick={handleAddToCart}>
                  <Plus className="h-4 w-4" />
                  Adicionar
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
