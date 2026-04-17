export const STORE_CONFIG = {
  nome: 'Recheiae',
  whatsapp: '5535998160726',
  cidade: 'Itajuba - MG',
  deliveryFee: 10.0,
  deliveryTime: '40 min',
  businessHours: 'Seg a Sex: 18:00 - 23:00\nSab e Dom: 17:00 - 00:00',
};

export function normalizeStoreSettings(settings = {}) {
  return {
    whatsapp: settings.whatsapp || STORE_CONFIG.whatsapp,
    deliveryTime: settings.deliveryTime || settings.delivery_time || STORE_CONFIG.deliveryTime,
    businessHours: settings.businessHours || settings.business_hours || STORE_CONFIG.businessHours,
  };
}

export function formatWhatsAppNumber(value) {
  const digits = String(value || '').replace(/\D/g, '');
  if (!digits) return '';
  if (digits.length === 13) {
    return `+${digits.slice(0, 2)} ${digits.slice(2, 4)} ${digits.slice(4, 9)}-${digits.slice(9)}`;
  }
  if (digits.length === 12) {
    return `+${digits.slice(0, 2)} ${digits.slice(2, 4)} ${digits.slice(4, 8)}-${digits.slice(8)}`;
  }
  return value;
}

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
  return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
