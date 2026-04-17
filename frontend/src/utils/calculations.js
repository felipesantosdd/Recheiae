export const STORE_CONFIG = {
  nome: 'Recheiaê',
  whatsapp: '5535998160726',
  cidade: 'Itajubá - MG',
  deliveryFee: 10.00,
  deliveryTime: '40 min',
};

export function calculateItemPrice(originalPrice, discount = 0) {
  return originalPrice * (1 - discount / 100);
}

export function calculateAddonsTotal(addons = []) {
  return addons.reduce((sum, addon) => sum + (addon.price ?? addon.preco ?? 0), 0);
}

export function calculateCartItemUnitPrice(item) {
  return calculateItemPrice(item.originalPrice, item.discount) + calculateAddonsTotal(item.addons);
}

export function calculateSubtotal(items) {
  return items.reduce((sum, item) => sum + calculateCartItemUnitPrice(item) * item.quantity, 0);
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

export function calculateTotal(items) {
  const subtotal = calculateSubtotal(items);
  const discount = calculateTotalDiscount(items);
  const delivery = calculateDeliveryFee();
  return Math.max(0, subtotal - discount + delivery);
}

export function formatPrice(value) {
  if (value == null || Number.isNaN(Number(value))) {
    return (0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
