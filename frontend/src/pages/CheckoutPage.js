import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import {
  calculateSubtotal, calculateTotalDiscount, calculateDeliveryFee,
  calculateTotal, calculatePixDiscount, formatPrice, calculateItemPrice
} from '@/utils/calculations';
import { api } from '@/lib/api';
import { generateWhatsAppMessage, generateWhatsAppLink, generateOrderNumber } from '@/utils/whatsapp';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MessageCircle, ShoppingBag, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, clearCart } = useCart();
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loadingPM, setLoadingPM] = useState(true);
  const [formData, setFormData] = useState({
    nome: '',
    telefone: '',
    endereco: '',
    bairro: '',
    complemento: '',
    formaPagamento: '',
    observacoes: '',
  });

  useEffect(() => {
    api.get('/payment-methods')
      .then(res => setPaymentMethods(res.data))
      .catch(() => {
        setPaymentMethods([
          { uuid: 'fb-1', nome: 'Pix', ativo: true },
          { uuid: 'fb-2', nome: 'Cartão de crédito', ativo: true },
          { uuid: 'fb-3', nome: 'Cartão de débito', ativo: true },
          { uuid: 'fb-4', nome: 'Dinheiro', ativo: true },
        ]);
      })
      .finally(() => setLoadingPM(false));
  }, []);

  const subtotal = calculateSubtotal(items);
  const totalDiscount = calculateTotalDiscount(items);
  const deliveryFee = calculateDeliveryFee();
  const pixDiscount = calculatePixDiscount(formData.formaPagamento);
  const total = calculateTotal(items, formData.formaPagamento);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!formData.nome || !formData.telefone || !formData.endereco || !formData.bairro || !formData.formaPagamento) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }
    if (items.length === 0) {
      toast.error('Seu carrinho está vazio');
      return;
    }
    const orderNumber = generateOrderNumber();
    const message = generateWhatsAppMessage({
      orderNumber,
      customer: formData,
      items,
      subtotal,
      deliveryFee,
      totalDiscount,
      pixDiscount,
      total,
    });
    const whatsappLink = generateWhatsAppLink(message);
    window.open(whatsappLink, '_blank');
    toast.success(`Pedido #${orderNumber} enviado!`);
    clearCart();
    navigate('/');
  };

  if (items.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center">
        <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
          <ShoppingBag className="h-8 w-8 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">Seu carrinho está vazio</h2>
        <p className="text-muted-foreground mb-6 text-sm">Adicione itens ao carrinho para fazer seu pedido</p>
        <Button onClick={() => navigate('/')}>
          <ArrowLeft className="h-4 w-4" />
          Voltar ao Cardápio
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 pb-28 md:pb-8">
      <Button variant="ghost" onClick={() => navigate('/')} className="mb-4">
        <ArrowLeft className="h-4 w-4" />
        Voltar ao Cardápio
      </Button>

      <h1 className="text-2xl font-bold text-foreground mb-6">Finalizar Pedido</h1>

      <div className="grid md:grid-cols-[1fr_360px] gap-6">
        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Seus Dados</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="nome" className="text-sm">Nome *</Label>
                <Input id="nome" value={formData.nome} onChange={e => handleChange('nome', e.target.value)} placeholder="Seu nome completo" className="bg-card" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="telefone" className="text-sm">Telefone *</Label>
                <Input id="telefone" value={formData.telefone} onChange={e => handleChange('telefone', e.target.value)} placeholder="(XX) XXXXX-XXXX" className="bg-card" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Endereço de Entrega</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="endereco" className="text-sm">Endereço *</Label>
                <Input id="endereco" value={formData.endereco} onChange={e => handleChange('endereco', e.target.value)} placeholder="Rua e número" className="bg-card" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="bairro" className="text-sm">Bairro *</Label>
                  <Input id="bairro" value={formData.bairro} onChange={e => handleChange('bairro', e.target.value)} placeholder="Bairro" className="bg-card" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="complemento" className="text-sm">Complemento</Label>
                  <Input id="complemento" value={formData.complemento} onChange={e => handleChange('complemento', e.target.value)} placeholder="Apto, ref..." className="bg-card" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Pagamento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-sm">Forma de Pagamento *</Label>
                {loadingPM ? (
                  <div className="flex items-center gap-2 py-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" /> Carregando...
                  </div>
                ) : (
                  <Select value={formData.formaPagamento} onValueChange={v => handleChange('formaPagamento', v)}>
                    <SelectTrigger className="bg-card">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentMethods.map(method => (
                        <SelectItem key={method.uuid} value={method.nome}>
                          {method.nome}
                          {method.nome.toLowerCase() === 'pix' && ' (desconto R$ 10,00)'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {pixDiscount > 0 && (
                  <Badge variant="success" className="text-xs mt-1">
                    Desconto Pix de {formatPrice(pixDiscount)} aplicado!
                  </Badge>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="observacoes" className="text-sm">Observações</Label>
                <Textarea id="observacoes" value={formData.observacoes} onChange={e => handleChange('observacoes', e.target.value)} placeholder="Troco para quanto? Algum detalhe sobre o pedido?" rows={3} className="bg-card" />
              </div>
            </CardContent>
          </Card>

          <Button type="submit" size="lg" className="w-full md:hidden">
            <MessageCircle className="h-4 w-4" />
            Enviar Pedido pelo WhatsApp
          </Button>
        </form>

        {/* Order Summary */}
        <div>
          <Card className="sticky top-20">
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Resumo do Pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {items.map(item => {
                const unitPrice = calculateItemPrice(item.originalPrice, item.discount);
                return (
                  <div key={`${item.type}-${item.id}`} className="flex justify-between text-sm gap-2">
                    <span className="text-muted-foreground truncate">{item.quantity}x {item.name}</span>
                    <span className="font-medium text-foreground shrink-0">{formatPrice(unitPrice * item.quantity)}</span>
                  </div>
                );
              })}

              <Separator />

              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">SUBTOTAL</span>
                <span className="text-foreground">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">FRETE</span>
                <span className="text-foreground">{formatPrice(deliveryFee)}</span>
              </div>
              {totalDiscount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-success">DESCONTOS</span>
                  <span className="text-success">-{formatPrice(totalDiscount)}</span>
                </div>
              )}
              {pixDiscount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-pix-badge font-medium">DESCONTO PIX</span>
                  <span className="text-pix-badge font-medium">-{formatPrice(pixDiscount)}</span>
                </div>
              )}

              <Separator />

              <div className="flex justify-between font-bold text-lg">
                <span className="text-foreground">VALOR FINAL</span>
                <span className="text-foreground">{formatPrice(total)}</span>
              </div>

              <Button size="lg" className="w-full hidden md:flex mt-2" onClick={handleSubmit}>
                <MessageCircle className="h-4 w-4" />
                Enviar pelo WhatsApp
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
