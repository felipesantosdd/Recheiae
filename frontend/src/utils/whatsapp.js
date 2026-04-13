import { STORE_CONFIG } from './calculations';

function formatBRL(value) {
  return value.toFixed(2).replace('.', ',');
}

export function generateOrderNumber() {
  const current = parseInt(localStorage.getItem('sabor-order-counter') || '0', 10);
  const next = current + 1;
  localStorage.setItem('sabor-order-counter', String(next));
  return next;
}

export function generateGoogleMapsLink(endereco, bairro) {
  const query = `${endereco}, ${bairro}, ${STORE_CONFIG.cidade}`;
  return `https://maps.google.com/?q=${encodeURIComponent(query)}`;
}

export function generateWhatsAppMessage({ orderNumber, customer, items, subtotal, deliveryFee, totalDiscount, total }) {
  const now = new Date();
  const dateStr = now.toLocaleDateString('pt-BR');
  const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const mapsLink = generateGoogleMapsLink(customer.endereco, customer.bairro);

  let msg = `#### NOVO PEDIDO ####\n\n`;
  msg += `#️⃣ Nº pedido: ${orderNumber}\n`;
  msg += `feito em ${dateStr} ${timeStr}\n\n`;
  msg += `👤 ${customer.nome}\n`;
  msg += `📞 ${customer.telefone}\n\n`;
  msg += `🛵 Endereço de entrega\n`;
  msg += `${customer.endereco}\n`;
  msg += `Bairro: ${customer.bairro}\n`;
  if (customer.complemento) {
    msg += `(${customer.complemento})\n`;
  }
  msg += `\nLink do endereço:\n${mapsLink}\n\n`;
  msg += `------- ITENS DO PEDIDO -------\n\n`;

  items.forEach(item => {
    const unitPrice = item.originalPrice;
    const lineTotal = unitPrice * item.quantity;
    msg += `*${item.quantity} x ${item.name}*\n`;
    msg += `💵 ${item.quantity} x R$ ${formatBRL(unitPrice)} = R$ ${formatBRL(lineTotal)}\n\n`;
  });

  msg += `-------------------------------\n\n`;
  msg += `SUBTOTAL: R$ ${formatBRL(subtotal)}\n`;
  msg += `FRETE: R$ ${formatBRL(deliveryFee)}\n`;
  msg += `DESCONTOS: R$ ${formatBRL(totalDiscount)}\n`;
  msg += `*VALOR FINAL: R$ ${formatBRL(total)}*\n\n`;
  msg += `PAGAMENTO\n`;
  msg += `*${customer.formaPagamento}*: R$ ${formatBRL(total)}\n\n`;
  if (customer.observacoes) {
    msg += `📝 Observações: ${customer.observacoes}\n\n`;
  }
  msg += `🕐 Prazo para entrega: ${STORE_CONFIG.deliveryTime}`;

  return msg;
}

export function generateWhatsAppLink(phone, message) {
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
