export const STORE_CONFIG = {
  nome: 'Recheiae',
  whatsapp: '5535998160726',
  cidade: 'Itajuba - MG',
  deliveryFee: 10.0,
  deliveryTime: '40 min',
  businessHours: 'Seg a Sex: 18:00 - 23:00\nSab e Dom: 17:00 - 00:00',
};

const DELIVERY_FEE_ENTRIES = [
  { name: 'Acude', fee: 9.0 },
  { name: 'Anhumas (Ate o Coro)', fee: 7.0 },
  { name: 'Anhumas (Igreja)', fee: 20.0 },
  { name: 'Anhumas (KM2)', fee: 9.0 },
  { name: 'Anhumas (Sta Cruz)', fee: 8.0, aliases: ['Anhumas (Santa Cruz)'] },
  { name: 'Anhumas (Ze M.)', fee: 12.0 },
  { name: 'Ano Bom', fee: 25.0 },
  { name: 'Avenida', fee: 7.0 },
  { name: 'Bahamas', fee: 8.0 },
  { name: 'Barbosa', fee: 8.0 },
  { name: 'Bela Vista', fee: 7.0 },
  { name: 'Berta', fee: 40.0 },
  { name: 'Boa Vista', fee: 7.0 },
  { name: 'BPS', fee: 7.0 },
  { name: 'Brazopolis', fee: 50.0 },
  { name: 'Cabelauto', fee: 12.0 },
  { name: 'Canaa', fee: 10.0 },
  { name: 'Canta Galo', fee: 16.0 },
  { name: 'Cantina', fee: 7.0 },
  { name: 'Capituba', fee: 12.0 },
  { name: 'Centro', fee: 7.0 },
  { name: 'Colina Verde', fee: 10.0 },
  { name: 'Costa', fee: 7.0 },
  { name: 'Cruzeiro', fee: 7.0 },
  { name: 'Delfim Moreira', fee: 50.0 },
  { name: 'Dist. Industrial', fee: 8.0, aliases: ['Distrito Industrial'] },
  { name: 'Eldorado', fee: 7.0 },
  { name: 'Estiva', fee: 7.0 },
  { name: 'Geriva', fee: 25.0 },
  { name: 'Ilheus', fee: 15.0 },
  { name: 'Imbel', fee: 8.0 },
  { name: 'Jarrinha', fee: 10.0 },
  { name: 'Jd. Alterosa', fee: 10.0, aliases: ['Jardim Alterosa'] },
  { name: 'Jd. America', fee: 7.0, aliases: ['Jardim America'] },
  { name: 'Jd. Bernadete', fee: 7.0, aliases: ['Jardim Bernadete'] },
  { name: 'Jd. das Colinas', fee: 9.0, aliases: ['Jardim das Colinas'] },
  { name: 'Jd. Europa', fee: 8.0, aliases: ['Jardim Europa'] },
  { name: 'Jd. Lisboa', fee: 7.0, aliases: ['Jardim Lisboa'] },
  { name: 'Jd. das Palmeiras', fee: 8.0, aliases: ['Jd. das Palmeira', 'Jardim das Palmeiras', 'Jardim das Palmeira'] },
  { name: 'Jd. Portugal', fee: 8.0, aliases: ['Jardim Portugal'] },
  { name: 'Juru', fee: 17.0 },
  { name: 'Maria da Fe', fee: 50.0 },
  { name: 'Mato Dentro', fee: 15.0 },
  { name: 'Medicina', fee: 7.0 },
  { name: 'Moquem', fee: 10.0 },
  { name: 'Morro Chic', fee: 7.0 },
  { name: 'Morro Grande', fee: 8.0 },
  { name: 'Nacoes', fee: 10.0 },
  { name: 'News Boate', fee: 13.0 },
  { name: 'Novo Horizonte', fee: 9.0 },
  { name: 'Nsr. da Agonia', fee: 8.0, aliases: ['Nossa Senhora da Agonia'] },
  { name: 'Nsr. de Fatima', fee: 7.0, aliases: ['Nossa Senhora de Fatima'] },
  { name: 'Nsr. de Lourdes', fee: 7.0, aliases: ['Nossa Senhora de Lourdes'] },
  { name: 'Oriente', fee: 7.0 },
  { name: 'Pedra Mamona', fee: 15.0 },
  { name: 'Pedra Preta', fee: 20.0 },
  { name: 'Pedralva', fee: 60.0 },
  { name: 'Pinheirinho', fee: 8.0 },
  { name: 'Piedade', fee: 10.0 },
  { name: 'Pirangucu', fee: 25.0 },
  { name: 'Piranguinho', fee: 25.0 },
  { name: 'Ponte Sto Antonio', fee: 25.0, aliases: ['Ponte Santo Antonio'] },
  { name: 'Porto Seguro', fee: 9.0 },
  { name: 'Porto Velho', fee: 7.0 },
  { name: 'Pouso Alegre', fee: 110.0 },
  { name: 'Prefeitura-Lago', fee: 9.0, aliases: ['Prefeitura Lago'] },
  { name: 'Presidio', fee: 15.0 },
  { name: 'Reboredon', fee: 9.0, aliases: ['Reboredao'] },
  { name: 'Sta. Rita do Sapucai', fee: 80.0, aliases: ['Santa Rita do Sapucai'] },
  { name: 'Santos Dumont', fee: 8.0 },
  { name: 'Sao Jose do Alegre', fee: 45.0 },
  { name: 'Sao Judas Tadeu', fee: 7.0 },
  { name: 'Sao Sebastiao', fee: 7.0 },
  { name: 'Sao Vicente', fee: 7.0 },
  { name: 'Sta. Terezinha', fee: 7.0, aliases: ['Santa Terezinha'] },
  { name: 'Sta. Rita de Cassia', fee: 7.0, aliases: ['Santa Rita de Cassia'] },
  { name: 'Sta. Rosa', fee: 9.0, aliases: ['Santa Rosa'] },
  { name: 'Sta. Helena', fee: 7.0, aliases: ['Santa Helena'] },
  { name: 'Sta. Luzia', fee: 7.0, aliases: ['Santa Luzia'] },
  { name: 'Sta. Antonio', fee: 7.0, aliases: ['Santa Antonio', 'Santo Antonio'] },
  { name: 'Varginha', fee: 7.0 },
  { name: 'Vila Betel', fee: 10.0 },
  { name: 'Vila Isabel', fee: 8.0 },
  { name: 'Vila Parana', fee: 10.0 },
  { name: 'Vila Poddis', fee: 7.0 },
  { name: 'Vila Rubens', fee: 7.0 },
  { name: 'Vista Verde', fee: 8.0 },
  { name: 'Wenceslau Braz', fee: 45.0 },
];

function normalizeText(value = '') {
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/\bJD\b/g, 'JARDIM')
    .replace(/\bSTA\b/g, 'SANTA')
    .replace(/\bSTO\b/g, 'SANTO')
    .replace(/\bNSR\b/g, 'NOSSA SENHORA')
    .replace(/\bDIST\b/g, 'DISTRITO')
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const DELIVERY_FEE_MAP = new Map();

DELIVERY_FEE_ENTRIES.forEach((entry) => {
  const aliases = [entry.name, ...(entry.aliases || [])];
  aliases.forEach((alias) => {
    DELIVERY_FEE_MAP.set(normalizeText(alias), {
      fee: entry.fee,
      name: entry.name,
    });
  });
});

export const DELIVERY_NEIGHBORHOODS = DELIVERY_FEE_ENTRIES
  .map((entry) => ({
    label: entry.name,
    value: entry.name,
    fee: entry.fee,
  }))
  .sort((a, b) => a.label.localeCompare(b.label, 'pt-BR'));

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

export function getNeighborhoodDeliveryRule(bairro = '') {
  if (!bairro) return null;
  return DELIVERY_FEE_MAP.get(normalizeText(bairro)) || null;
}

export function resolveNeighborhoodName(bairro = '') {
  return getNeighborhoodDeliveryRule(bairro)?.name || bairro;
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

export function calculateDeliveryFee(bairro = '') {
  return getNeighborhoodDeliveryRule(bairro)?.fee ?? STORE_CONFIG.deliveryFee;
}

export function calculateTotal(items, deliveryFee = STORE_CONFIG.deliveryFee) {
  const subtotal = calculateSubtotal(items);
  const discount = calculateTotalDiscount(items);
  return Math.max(0, subtotal - discount + deliveryFee);
}

export function formatPrice(value) {
  if (value == null || Number.isNaN(Number(value))) {
    return (0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }
  return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
