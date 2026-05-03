import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Plus, ImageOff } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatPrice, calculateItemPrice } from '@/utils/calculations';
import { api } from '@/lib/api';
import { toast } from 'sonner';

function isSoda(product) {
  const nome = String(product?.nome || '').toLowerCase();
  const categoria = String(product?.categoria || '').toLowerCase();
  return categoria === 'bebidas' && nome.includes('lata') && !nome.includes('suco');
}

function isPotato(product) {
  return String(product?.categoria || '').toLowerCase() !== 'bebidas';
}

export function ComboCard({ combo }) {
  const { addItem } = useCart();
  const [imgError, setImgError] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isImageZoomOpen, setIsImageZoomOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [selectedPotatoId, setSelectedPotatoId] = useState('');
  const [selectedDrinkId, setSelectedDrinkId] = useState('');
  const [notes, setNotes] = useState('');

  const discountedPrice = calculateItemPrice(combo.valor, combo.desconto);
  const hasDiscount = combo.desconto > 0;

  useEffect(() => {
    api.get('/products')
      .then((response) => setProducts(response.data || []))
      .catch(() => setProducts([]));
  }, []);

  const potatoOptions = useMemo(
    () => products.filter(isPotato).sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR')),
    [products],
  );
  const drinkOptions = useMemo(
    () => products.filter(isSoda).sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR')),
    [products],
  );

  const selectedPotato = potatoOptions.find((product) => product.uuid === selectedPotatoId) || null;
  const selectedDrink = drinkOptions.find((product) => product.uuid === selectedDrinkId) || null;

  const resetCustomization = () => {
    setSelectedPotatoId('');
    setSelectedDrinkId('');
    setNotes('');
  };

  const handleAddToCart = () => {
    if (!selectedPotato || !selectedDrink) {
      toast.error('Selecione a batata e o refrigerante do combo');
      return;
    }

    const selectionSummary = `${selectedPotato.nome} + ${selectedDrink.nome}`;
    const finalNotes = [
      `Combo: ${selectionSummary}`,
      notes.trim(),
    ].filter(Boolean).join(' | ');

    addItem({
      id: combo.uuid,
      type: 'combo',
      name: combo.nome,
      originalPrice: combo.valor,
      discount: combo.desconto || 0,
      foto: combo.foto,
      addons: [],
      notes: finalNotes,
      selectedPotatoId,
      selectedDrinkId,
    });
    toast.success(`${combo.nome} adicionado ao carrinho!`);
    setIsDialogOpen(false);
    resetCustomization();
  };

  return (
    <>
      <Card className="card-hover overflow-hidden flex flex-col h-full">
        <button
          type="button"
          className="relative aspect-[4/3] overflow-hidden bg-muted text-left"
          onClick={() => setIsDialogOpen(true)}
        >
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
          <div className="absolute top-2 left-2 flex flex-wrap gap-1">
            <Badge variant="combo" className="text-[10px]">Combo</Badge>
            {hasDiscount && (
              <Badge variant="promo" className="text-[10px]">-{combo.desconto}%</Badge>
            )}
          </div>
        </button>

        <CardContent className="flex flex-col flex-1 p-3 pb-1">
          <button type="button" className="text-left" onClick={() => setIsDialogOpen(true)}>
            <h3 className="font-semibold text-sm text-card-foreground line-clamp-1">
              {combo.nome}
            </h3>
            {combo.descricao && (
              <p className="text-[11px] text-muted-foreground line-clamp-2 mt-1 leading-relaxed">
                {combo.descricao}
              </p>
            )}
          </button>

          <div className="mt-auto pt-2">
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
          </div>
        </CardContent>

        <CardFooter className="p-3 pt-2">
          <Button
            size="sm"
            className="w-full text-xs"
            onClick={() => setIsDialogOpen(true)}
          >
            <Plus className="h-3.5 w-3.5" />
            Adicionar
          </Button>
        </CardFooter>
      </Card>

      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetCustomization();
        }}
      >
        <DialogContent className="max-h-[90vh] w-[calc(100%-1rem)] max-w-lg overflow-y-auto p-4 sm:w-full sm:p-6">
          <DialogHeader>
            <DialogTitle>{combo.nome}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {combo.foto && !imgError && (
              <button
                type="button"
                className="flex h-48 w-full items-center justify-center overflow-hidden rounded-md bg-muted transition-opacity hover:opacity-95"
                onClick={() => setIsImageZoomOpen(true)}
              >
                <img
                  src={combo.foto}
                  alt={combo.nome}
                  className="max-h-full max-w-full object-contain"
                  onError={() => setImgError(true)}
                />
              </button>
            )}

            {combo.descricao && (
              <p className="text-sm leading-relaxed text-muted-foreground">{combo.descricao}</p>
            )}

            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-sm">Escolha a batata</Label>
                <Select value={selectedPotatoId} onValueChange={setSelectedPotatoId}>
                  <SelectTrigger className="bg-card">
                    <SelectValue placeholder="Selecione a batata" />
                  </SelectTrigger>
                  <SelectContent>
                    {potatoOptions.map((product) => (
                      <SelectItem key={product.uuid} value={product.uuid}>
                        {product.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm">Escolha o refrigerante</Label>
                <Select value={selectedDrinkId} onValueChange={setSelectedDrinkId}>
                  <SelectTrigger className="bg-card">
                    <SelectValue placeholder="Selecione o refrigerante" />
                  </SelectTrigger>
                  <SelectContent>
                    {drinkOptions.map((product) => (
                      <SelectItem key={product.uuid} value={product.uuid}>
                        {product.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor={`combo-notes-${combo.uuid}`} className="text-sm">
                  Observacoes
                </Label>
                <Textarea
                  id={`combo-notes-${combo.uuid}`}
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Ex: sem cebola, caprichar no molho..."
                  rows={4}
                />
              </div>
            </div>

            <div className="rounded-md bg-muted/50 p-3">
              <div className="flex items-center justify-between text-base font-bold">
                <span>Total do combo</span>
                <span>{formatPrice(discountedPrice)}</span>
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

      {combo.foto && !imgError && (
        <Dialog open={isImageZoomOpen} onOpenChange={setIsImageZoomOpen}>
          <DialogContent className="max-h-[95vh] w-[calc(100%-1rem)] max-w-4xl overflow-hidden p-3 sm:p-4">
            <div className="flex max-h-[85vh] items-center justify-center overflow-hidden rounded-md bg-muted">
              <img
                src={combo.foto}
                alt={combo.nome}
                className="max-h-[85vh] max-w-full object-contain"
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
