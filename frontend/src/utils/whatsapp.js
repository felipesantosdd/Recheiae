import { STORE_CONFIG, normalizeStoreSettings, getPaymentFeeDetails } from './calculations';

function formatBRL(value) {
  return value.toFixed(2).replace('.', ',');
}

function formatAddonName(addon) {
  return addon.name || addon.nome || 'Adicional';
}

export function generateOrderNumber() {
  const current = parseInt(localStorage.getItem('recheiae-order-counter') || '0', 10);
  const next = current + 1;
  localStorage.setItem('recheiae-order-counter', String(next));
  return next;
}

export function generateGoogleMapsLink(endereco, numero, bairro) {
  const query = `${endereco}, ${numero}, ${bairro}, ${STORE_CONFIG.cidade}`;
  return `https://maps.google.com/?q=${encodeURIComponent(query)}`;
}

export function generateWhatsAppMessage({
  customer,
  items,
  subtotal,
  deliveryFee,
  paymentFee = 0,
  totalDiscount,
  manualDiscount = 0,
  giftItems = [],
  total,
  scheduledOrder = null,
}) {
  const paymentFeeDetails = getPaymentFeeDetails(customer.formaPagamento);
  const now = new Date();
  const dateStr = now.toLocaleDateString('pt-BR');
  const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  let msg = `${scheduledOrder ? 'PEDIDO AGENDADO' : 'NOVO PEDIDO'}\n`;
  msg += `${dateStr} as ${timeStr}\n\n`;
  if (scheduledOrder) {
    msg += `Agendado: loja abre em ${scheduledOrder.opensAtLabel}\n\n`;
  }
  msg += `Cliente: ${customer.nome}\n`;
  msg += `Telefone: ${customer.telefone}\n\n`;
  msg += `Entrega:\n`;
  msg += `${customer.endereco}, ${customer.numero} - ${customer.bairro}\n`;
  if (customer.complemento) {
    msg += `Compl.: ${customer.complemento}\n`;
  }
  msg += `\n`;
  msg += `Itens:\n`;

  items.forEach(item => {
    const basePrice = item.basePriceOverride ?? (item.originalPrice * (1 - (item.discount || 0) / 100));
    const addonsTotal = (item.addons || []).reduce((sum, addon) => sum + (addon.price ?? addon.preco ?? 0), 0);
    const unitPrice = basePrice + addonsTotal;
    const lineTotal = unitPrice * item.quantity;
    msg += `*${item.quantity} x ${item.name}*\n`;
    if (item.addons?.length) {
      item.addons.forEach((addon) => {
        msg += `- ${formatAddonName(addon)} (+R$ ${formatBRL(addon.price ?? addon.preco ?? 0)})\n`;
      });
    }
    if (item.notes) {
      msg += `Obs.: ${item.notes}\n`;
    }
    msg += `R$ ${formatBRL(lineTotal)}\n\n`;
  });

  msg += `Resumo:\n`;
  msg += `Subtotal: R$ ${formatBRL(subtotal)}\n`;
  msg += `Frete: R$ ${formatBRL(deliveryFee)}\n`;
  if (paymentFee > 0) {
    msg += `${paymentFeeDetails.label}: R$ ${formatBRL(paymentFee)}\n`;
  }
  if (manualDiscount > 0) {
    msg += `Desconto manual: R$ ${formatBRL(manualDiscount)}\n`;
  }
  if (totalDiscount > 0) {
    msg += `Descontos: R$ ${formatBRL(totalDiscount)}\n`;
  }
  msg += `*Total: R$ ${formatBRL(total)}*\n\n`;

  if (giftItems.length > 0) {
    msg += `Brindes:\n`;
    giftItems.forEach((gift) => {
      msg += `- ${gift.quantity}x ${gift.name}\n`;
    });
    msg += `\n`;
  }

  msg += `Pagamento: ${customer.formaPagamento}`;
  if (customer.observacoes) {
    msg += `\nObs. geral: ${customer.observacoes}`;
  }

  return msg;
}

export function generateWhatsAppLink(message, settings) {
  const storeSettings = normalizeStoreSettings(settings);
  return `https://wa.me/${storeSettings.whatsapp}?text=${encodeURIComponent(message)}`;
}
