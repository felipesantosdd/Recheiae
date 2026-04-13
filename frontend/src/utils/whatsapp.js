import { STORE_CONFIG } from './calculations';

function formatBRL(value) {
  return value.toFixed(2).replace('.', ',');
}

export function generateOrderNumber() {
  const current = parseInt(localStorage.getItem('recheiae-order-counter') || '0', 10);
  const next = current + 1;
  localStorage.setItem('recheiae-order-counter', String(next));
  return next;
}

export function generateGoogleMapsLink(endereco, bairro) {
  const query = `${endereco}, ${bairro}, ${STORE_CONFIG.cidade}`;
  return `https://maps.google.com/?q=${encodeURIComponent(query)}`;
}

export function generateWhatsAppMessage({ orderNumber, customer, items, subtotal, deliveryFee, totalDiscount, pixDiscount, total }) {
  const now = new Date();
  const dateStr = now.toLocaleDateString('pt-BR');
  const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const mapsLink = generateGoogleMapsLink(customer.endereco, customer.bairro);

  let msg = `#### NOVO PEDIDO ####\n\n`;
  msg += `#\ufe0f\u20e3 N\u00ba pedido: ${orderNumber}\n`;
  msg += `feito em ${dateStr} ${timeStr}\n\n`;
  msg += `\ud83d\udc64 ${customer.nome}\n`;
  msg += `\ud83d\udcde ${customer.telefone}\n\n`;
  msg += `\ud83d\udef5 Endere\u00e7o de entrega\n`;
  msg += `${customer.endereco}\n`;
  msg += `Bairro: ${customer.bairro}\n`;
  if (customer.complemento) {
    msg += `(${customer.complemento})\n`;
  }
  msg += `\nLink do endere\u00e7o:\n${mapsLink}\n\n`;
  msg += `------- ITENS DO PEDIDO -------\n\n`;

  items.forEach(item => {
    const unitPrice = item.originalPrice;
    const lineTotal = unitPrice * item.quantity;
    msg += `*${item.quantity} x ${item.name}*\n`;
    msg += `\ud83d\udcb5 ${item.quantity} x R$ ${formatBRL(unitPrice)} = R$ ${formatBRL(lineTotal)}\n\n`;
  });

  msg += `-------------------------------\n\n`;
  msg += `SUBTOTAL: R$ ${formatBRL(subtotal)}\n`;
  msg += `FRETE: R$ ${formatBRL(deliveryFee)}\n`;
  if (totalDiscount > 0) {
    msg += `DESCONTOS: R$ ${formatBRL(totalDiscount)}\n`;
  }
  if (pixDiscount > 0) {
    msg += `DESCONTO PIX: -R$ ${formatBRL(pixDiscount)}\n`;
  }
  msg += `*VALOR FINAL: R$ ${formatBRL(total)}*\n\n`;
  msg += `PAGAMENTO\n`;
  msg += `*${customer.formaPagamento}*: R$ ${formatBRL(total)}\n\n`;
  if (customer.observacoes) {
    msg += `\ud83d\udcdd Observa\u00e7\u00f5es: ${customer.observacoes}\n\n`;
  }
  msg += `\ud83d\udd50 Prazo para entrega: ${STORE_CONFIG.deliveryTime}`;

  return msg;
}

export function generateWhatsAppLink(message) {
  return `https://wa.me/${STORE_CONFIG.whatsapp}?text=${encodeURIComponent(message)}`;
}
