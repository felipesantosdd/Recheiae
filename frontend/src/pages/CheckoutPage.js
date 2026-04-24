import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import {
  calculateSubtotal,
  calculateTotalDiscount,
  calculateDeliveryFee,
  getPaymentFeeDetails,
  calculatePaymentFee,
  calculateTotal,
  DELIVERY_NEIGHBORHOODS,
  getNeighborhoodDeliveryRule,
  resolveNeighborhoodName,
  formatPrice,
  calculateCartItemUnitPrice,
  getBusinessHoursStatus,
  getNextOpeningInfo,
  formatScheduleDateTime,
  normalizeStoreSettings,
  parseDeliveryMinutes,
} from '@/utils/calculations';
import { api } from '@/lib/api';
import {
  generateWhatsAppMessage,
  generateWhatsAppLink,
  generateOrderNumber,
} from '@/utils/whatsapp';
import { useStoreSettings } from '@/context/StoreSettingsContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Check, ChevronsUpDown, MessageCircle, ShoppingBag, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

function formatCep(value) {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, clearCart } = useCart();
  const { settings } = useStoreSettings();
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loadingPM, setLoadingPM] = useState(true);
  const [loadingCep, setLoadingCep] = useState(false);
  const [bairroOpen, setBairroOpen] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    telefone: '',
    cep: '',
    endereco: '',
    numero: '',
    bairro: '',
    complemento: '',
    formaPagamento: '',
    observacoes: '',
  });

  useEffect(() => {
    api.get('/payment-methods')
      .then((res) => setPaymentMethods(res.data))
      .catch(() => {
        setPaymentMethods([
          { uuid: 'fb-1', nome: 'Pix', ativo: true },
          { uuid: 'fb-2', nome: 'Pagamento na entrega Crédito', ativo: true },
          { uuid: 'fb-3', nome: 'Pagamento na entrega Débito', ativo: true },
          { uuid: 'fb-4', nome: 'Dinheiro', ativo: true },
        ]);
      })
      .finally(() => setLoadingPM(false));
  }, []);

  const subtotal = calculateSubtotal(items);
  const totalDiscount = calculateTotalDiscount(items);
  const deliveryRule = getNeighborhoodDeliveryRule(formData.bairro);
  const deliveryFee = calculateDeliveryFee(formData.bairro);
  const paymentFeeDetails = getPaymentFeeDetails(formData.formaPagamento);
  const paymentFee = calculatePaymentFee(formData.formaPagamento);
  const total = calculateTotal(items, deliveryFee, paymentFee);
  const normalizedStoreSettings = normalizeStoreSettings(settings);
  const businessHoursStatus = getBusinessHoursStatus(normalizedStoreSettings.businessHours);
  const scheduledOpeningInfo = getNextOpeningInfo(
    normalizedStoreSettings.businessHours,
    new Date(),
    parseDeliveryMinutes(normalizedStoreSettings.deliveryTime),
  );
  const scheduledOrder = !businessHoursStatus.isOpen && scheduledOpeningInfo
    ? {
        opensAtLabel: formatScheduleDateTime(scheduledOpeningInfo.opensAt),
        deliveryAtLabel: formatScheduleDateTime(scheduledOpeningInfo.deliveryAt),
        deliveryMinutes: scheduledOpeningInfo.deliveryMinutes,
      }
    : null;

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const lookupCep = async (cepValue = formData.cep) => {
    const digits = cepValue.replace(/\D/g, '');

    if (digits.length !== 8) {
      toast.error('Digite um CEP valido com 8 numeros');
      return;
    }

    try {
      setLoadingCep(true);
      const response = await fetch(`https://viacep.com.br/ws/${digits}/json/`);

      if (!response.ok) {
        throw new Error('cep_lookup_failed');
      }

      const data = await response.json();

      if (data.erro) {
        toast.error('CEP nao encontrado');
        return;
      }

      setFormData((prev) => ({
        ...prev,
        cep: formatCep(digits),
        endereco: data.logradouro || prev.endereco,
        bairro: data.bairro ? resolveNeighborhoodName(data.bairro) : prev.bairro,
        complemento: prev.complemento || data.complemento || '',
      }));

      toast.success('Endereco encontrado pelo CEP');
    } catch (error) {
      toast.error('Nao foi possivel buscar o CEP agora');
    } finally {
      setLoadingCep(false);
    }
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();

    if (
      !formData.nome ||
      !formData.telefone ||
      !formData.endereco ||
      !formData.numero ||
      !formData.bairro ||
      !formData.formaPagamento
    ) {
      toast.error('Preencha todos os campos obrigatorios');
      return;
    }

    if (items.length === 0) {
      toast.error('Seu carrinho esta vazio');
      return;
    }

    const orderNumber = generateOrderNumber();
    const message = generateWhatsAppMessage({
      orderNumber,
      customer: formData,
      items,
      subtotal,
      deliveryFee,
      paymentFee,
      totalDiscount,
      total,
      settings,
      scheduledOrder,
    });
    const whatsappLink = generateWhatsAppLink(message, settings);

    window.open(whatsappLink, '_blank');
    toast.success(
      scheduledOrder
        ? `Pedido #${orderNumber} agendado para ${scheduledOrder.deliveryAtLabel}!`
        : `Pedido #${orderNumber} enviado!`,
    );
    clearCart();
    navigate('/');
  };

  if (items.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center">
        <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
          <ShoppingBag className="h-8 w-8 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">Seu carrinho esta vazio</h2>
        <p className="text-muted-foreground mb-6 text-sm">
          Adicione itens ao carrinho para fazer seu pedido
        </p>
        <Button onClick={() => navigate('/')}>
          <ArrowLeft className="h-4 w-4" />
          Voltar ao Cardapio
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 pb-28 md:pb-8">
      <Button variant="ghost" onClick={() => navigate('/')} className="mb-4">
        <ArrowLeft className="h-4 w-4" />
        Voltar ao Cardapio
      </Button>

      <h1 className="text-2xl font-bold text-foreground mb-6">Finalizar Pedido</h1>

      {!businessHoursStatus.isOpen && (
        <Card className="mb-6 border-primary/30 bg-primary/5">
          <CardContent className="p-4">
            <p className="text-sm font-semibold text-foreground">Loja fechada: pedido sera agendado</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Voce pode enviar o pedido agora. Ele ficara agendado para quando abrirmos
              {scheduledOrder ? `, com entrega prevista para ${scheduledOrder.deliveryAtLabel}.` : '.'}
            </p>
            <p className="mt-1 whitespace-pre-line text-sm text-muted-foreground">
              {normalizedStoreSettings.businessHours}
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-[1fr_360px] gap-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Seus Dados</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="nome" className="text-sm">Nome *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => handleChange('nome', e.target.value)}
                  placeholder="Seu nome completo"
                  className="bg-card"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="telefone" className="text-sm">Telefone *</Label>
                <Input
                  id="telefone"
                  value={formData.telefone}
                  onChange={(e) => handleChange('telefone', e.target.value)}
                  placeholder="(XX) XXXXX-XXXX"
                  className="bg-card"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Endereco de Entrega</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="cep" className="text-sm">CEP</Label>
                <div className="flex gap-2">
                  <Input
                    id="cep"
                    value={formData.cep}
                    onChange={(e) => handleChange('cep', formatCep(e.target.value))}
                    onBlur={() => {
                      if (formData.cep.replace(/\D/g, '').length === 8) {
                        lookupCep(formData.cep);
                      }
                    }}
                    placeholder="00000-000"
                    className="bg-card"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => lookupCep(formData.cep)}
                    disabled={loadingCep}
                    className="shrink-0"
                  >
                    {loadingCep ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Buscar CEP'}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Ao informar o CEP, rua e bairro podem ser preenchidos automaticamente.
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="endereco" className="text-sm">Endereco *</Label>
                <Input
                  id="endereco"
                  value={formData.endereco}
                  onChange={(e) => handleChange('endereco', e.target.value)}
                  placeholder="Rua, avenida..."
                  className="bg-card"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="numero" className="text-sm">Numero *</Label>
                  <Input
                    id="numero"
                    value={formData.numero}
                    onChange={(e) => handleChange('numero', e.target.value)}
                    placeholder="Ex: 123"
                    className="bg-card"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="bairro" className="text-sm">Bairro *</Label>
                  <Popover open={bairroOpen} onOpenChange={setBairroOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        id="bairro"
                        type="button"
                        variant="outline"
                        role="combobox"
                        aria-expanded={bairroOpen}
                        className="w-full justify-between bg-card font-normal"
                      >
                        <span className="truncate">
                          {formData.bairro || 'Selecione o bairro'}
                        </span>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Digite para buscar o bairro..." />
                        <CommandList>
                          <CommandEmpty>Nenhum bairro encontrado.</CommandEmpty>
                          <CommandGroup>
                            {DELIVERY_NEIGHBORHOODS.map((bairro) => (
                              <CommandItem
                                key={bairro.value}
                                value={`${bairro.label} ${bairro.fee}`}
                                onSelect={() => {
                                  handleChange('bairro', bairro.value);
                                  setBairroOpen(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    'mr-2 h-4 w-4',
                                    formData.bairro === bairro.value ? 'opacity-100' : 'opacity-0',
                                  )}
                                />
                                <span className="flex-1">{bairro.label}</span>
                                <span className="text-xs text-muted-foreground">
                                  {formatPrice(bairro.fee)}
                                </span>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <p className="text-xs text-muted-foreground">
                    {deliveryRule
                      ? `Frete para ${deliveryRule.name}: ${formatPrice(deliveryFee)}`
                      : `Frete padrao aplicado: ${formatPrice(deliveryFee)}`}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="complemento" className="text-sm">Complemento</Label>
                  <Input
                    id="complemento"
                    value={formData.complemento}
                    onChange={(e) => handleChange('complemento', e.target.value)}
                    placeholder="Apto, ref..."
                    className="bg-card"
                  />
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
                  <Select
                    value={formData.formaPagamento}
                    onValueChange={(value) => handleChange('formaPagamento', value)}
                  >
                    <SelectTrigger className="bg-card">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentMethods.map((method) => (
                        <SelectItem key={method.uuid} value={method.nome}>
                          {method.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
              {paymentFee > 0 && (
                <p className="text-xs text-muted-foreground">
                  {paymentFeeDetails.description} Valor aplicado: {formatPrice(paymentFee)}.
                </p>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="observacoes" className="text-sm">Observacoes</Label>
                <Textarea
                  id="observacoes"
                  value={formData.observacoes}
                  onChange={(e) => handleChange('observacoes', e.target.value)}
                  placeholder="Troco para quanto? Algum detalhe sobre o pedido?"
                  rows={3}
                  className="bg-card"
                />
              </div>
            </CardContent>
          </Card>

          <Button type="submit" size="lg" className="w-full md:hidden">
            <MessageCircle className="h-4 w-4" />
            {businessHoursStatus.isOpen ? 'Enviar Pedido pelo WhatsApp' : 'Agendar Pedido pelo WhatsApp'}
          </Button>
        </form>

        <div>
          <Card className="sticky top-20">
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Resumo do Pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {items.map((item) => {
                const unitPrice = calculateCartItemUnitPrice(item);

                return (
                  <div
                    key={item.signature || `${item.type}-${item.id}`}
                    className="flex justify-between text-sm gap-2"
                  >
                    <div className="min-w-0">
                      <span className="text-muted-foreground truncate block">
                        {item.quantity}x {item.name}
                      </span>
                      {item.addons?.length > 0 && (
                        <span className="text-[11px] text-muted-foreground block">
                          + {item.addons.map((addon) => addon.name).join(', ')}
                        </span>
                      )}
                      {item.notes && (
                        <span className="text-[11px] text-muted-foreground block truncate">
                          Obs.: {item.notes}
                        </span>
                      )}
                    </div>
                    <span className="font-medium text-foreground shrink-0">
                      {formatPrice(unitPrice * item.quantity)}
                    </span>
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
              {paymentFee > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{paymentFeeDetails.label}</span>
                  <span className="text-foreground">{formatPrice(paymentFee)}</span>
                </div>
              )}
              {totalDiscount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-success">DESCONTOS</span>
                  <span className="text-success">-{formatPrice(totalDiscount)}</span>
                </div>
              )}

              <Separator />

              <div className="flex justify-between font-bold text-lg">
                <span className="text-foreground">VALOR FINAL</span>
                <span className="text-foreground">{formatPrice(total)}</span>
              </div>

              <Button size="lg" className="w-full hidden md:flex mt-2" onClick={handleSubmit}>
                <MessageCircle className="h-4 w-4" />
                {businessHoursStatus.isOpen ? 'Enviar pelo WhatsApp' : 'Agendar pelo WhatsApp'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
