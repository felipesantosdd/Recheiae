export const STORE_CONFIG = {
  nome: 'Recheiaê',
  whatsapp: '553592147338',
  cidade: 'Itajubá - MG',
  deliveryFee: 10.00,
  deliveryTime: '40 min',
  pixDiscount: 10.00,
};

export function calculateItemPrice(originalPrice, discount = 0) {
  return originalPrice * (1 - discount / 100);
}

export function calculateSubtotal(items) {
  return items.reduce((sum, item) => sum + item.originalPrice * item.quantity, 0);
}

export function calculateTotalDiscount(items) {
  return items.reduce((sum, item) => {
    const discountAmount = item.originalPrice * ((item.discount || 0) / 100);
    return sum + discountAmount * item.quantity;
  }, 0);
}

export function calculateDeliveryFee() {
  return STORE_CONFIG.deliveryFee;
}

export function calculatePixDiscount(formaPagamento) {
  if (!formaPagamento) return 0;
  return formaPagamento.toLowerCase() === 'pix' ? STORE_CONFIG.pixDiscount : 0;
}

export function calculateTotal(items, formaPagamento = '') {
  const subtotal = calculateSubtotal(items);
  const discount = calculateTotalDiscount(items);
  const delivery = calculateDeliveryFee();
  const pixDisc = calculatePixDiscount(formaPagamento);
  return Math.max(0, subtotal - discount - pixDisc + delivery);
}

export function formatPrice(value) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
