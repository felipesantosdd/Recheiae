export const STORE_CONFIG = {
  nome: 'Recheiae',
  whatsapp: '5535998160726',
  cidade: 'Itajuba - MG',
  deliveryFee: 10.0,
  deliveryTime: '40 min',
  businessHours: 'Seg a Sex: 18:00 - 23:00\nSab e Dom: 17:00 - 00:00',
  promotionProductUuid: 'prod-001',
  promotionPrice: 24.90,
  promotionActive: true,
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
    promotionProductUuid:
      settings.promotionProductUuid
      || settings.promotion_product_uuid
      || STORE_CONFIG.promotionProductUuid,
    promotionPrice:
      settings.promotionPrice
      ?? settings.promotion_price
      ?? STORE_CONFIG.promotionPrice,
    promotionActive:
      typeof settings.promotionActive === 'boolean'
        ? settings.promotionActive
        : typeof settings.promotion_active === 'boolean'
          ? settings.promotion_active
          : typeof settings.promotion_active === 'number'
            ? Boolean(settings.promotion_active)
            : STORE_CONFIG.promotionActive,
  };
}

const DAY_NAME_TO_INDEX = {
  dom: 0,
  domingo: 0,
  seg: 1,
  segunda: 1,
  'segunda feira': 1,
  ter: 2,
  terca: 2,
  'terca feira': 2,
  qua: 3,
  quarta: 3,
  'quarta feira': 3,
  qui: 4,
  quinta: 4,
  'quinta feira': 4,
  sex: 5,
  sexta: 5,
  'sexta feira': 5,
  sab: 6,
  sabado: 6,
};

function normalizeScheduleText(value = '') {
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\./g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function dayTokenToIndex(token) {
  return DAY_NAME_TO_INDEX[normalizeScheduleText(token)] ?? null;
}

function parseTimeToMinutes(value) {
  const match = String(value || '').match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;
  return (hours * 60) + minutes;
}

function expandDayExpression(dayExpression) {
  const normalized = normalizeScheduleText(dayExpression);
  if (!normalized) return [];

  if (normalized.includes(' a ')) {
    const [startToken, endToken] = normalized.split(' a ');
    const startIndex = dayTokenToIndex(startToken);
    const endIndex = dayTokenToIndex(endToken);
    if (startIndex == null || endIndex == null) return [];

    const days = [];
    let cursor = startIndex;
    for (let guard = 0; guard < 7; guard += 1) {
      days.push(cursor);
      if (cursor === endIndex) break;
      cursor = (cursor + 1) % 7;
    }
    return days;
  }

  if (normalized.includes(' e ')) {
    return normalized
      .split(' e ')
      .map(dayTokenToIndex)
      .filter((value) => value != null);
  }

  const singleDay = dayTokenToIndex(normalized);
  return singleDay == null ? [] : [singleDay];
}

export function parseBusinessHours(businessHours = '') {
  return String(businessHours || '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const separatorIndex = line.indexOf(':');
      if (separatorIndex < 0) return null;
      const dayPart = line.slice(0, separatorIndex);

      const timeMatch = line.match(/(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/);
      if (!timeMatch) return null;

      const startMinutes = parseTimeToMinutes(timeMatch[1]);
      const endMinutes = parseTimeToMinutes(timeMatch[2]);
      const days = expandDayExpression(dayPart);

      if (startMinutes == null || endMinutes == null || days.length === 0) {
        return null;
      }

      return {
        label: line,
        days,
        startMinutes,
        endMinutes,
        wrapsNextDay: endMinutes <= startMinutes,
      };
    })
    .filter(Boolean);
}

export function getBusinessHoursStatus(businessHours = '', now = new Date()) {
  const rules = parseBusinessHours(businessHours);
  if (rules.length === 0) {
    return {
      isConfigured: false,
      isOpen: true,
      currentRule: null,
    };
  }

  const currentDay = now.getDay();
  const currentMinutes = (now.getHours() * 60) + now.getMinutes();
  const previousDay = (currentDay + 6) % 7;

  const currentRule = rules.find((rule) => {
    if (rule.days.includes(currentDay)) {
      if (!rule.wrapsNextDay) {
        return currentMinutes >= rule.startMinutes && currentMinutes <= rule.endMinutes;
      }
      return currentMinutes >= rule.startMinutes;
    }

    if (rule.wrapsNextDay && rule.days.includes(previousDay)) {
      return currentMinutes <= rule.endMinutes;
    }

    return false;
  }) || null;

  return {
    isConfigured: true,
    isOpen: Boolean(currentRule),
    currentRule,
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
  const basePrice = item.basePriceOverride ?? calculateItemPrice(item.originalPrice, item.discount);
  return basePrice + calculateAddonsTotal(item.addons);
}

export function calculateSubtotal(items) {
  return items.reduce((sum, item) => sum + calculateCartItemUnitPrice(item) * item.quantity, 0);
}

export function calculateTotalDiscount(items) {
  return items.reduce((sum, item) => {
    const effectiveUnitPrice = item.basePriceOverride ?? calculateItemPrice(item.originalPrice, item.discount);
    const discountAmount = Math.max(0, (Number(item.originalPrice) || 0) - effectiveUnitPrice);
    return sum + (discountAmount * item.quantity);
  }, 0);
}

export function calculateDeliveryFee(bairro = '') {
  return getNeighborhoodDeliveryRule(bairro)?.fee ?? STORE_CONFIG.deliveryFee;
}

export function getPaymentFeeDetails(paymentMethod = '') {
  const normalized = normalizeText(paymentMethod);
  if (normalized.includes('CREDITO') || normalized.includes('DEBITO')) {
    return {
      amount: 4,
      label: 'TAXA ENTREGA/MAQUININHA',
      description: 'Pagamentos no crédito e débito têm taxa adicional de entrega e maquininha.',
    };
  }
  if (normalized.includes('DINHEIRO')) {
    return {
      amount: 2,
      label: 'TAXA ENTREGA',
      description: 'Pagamentos em dinheiro têm taxa adicional de entrega.',
    };
  }
  return {
    amount: 0,
    label: 'TAXA',
    description: '',
  };
}

export function calculatePaymentFee(paymentMethod = '') {
  return getPaymentFeeDetails(paymentMethod).amount;
}

export function calculateTotal(items, deliveryFee = STORE_CONFIG.deliveryFee, paymentFee = 0) {
  const subtotal = calculateSubtotal(items);
  const discount = calculateTotalDiscount(items);
  return Math.max(0, subtotal - discount + deliveryFee + paymentFee);
}

export function formatPrice(value) {
  if (value == null || Number.isNaN(Number(value))) {
    return (0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }
  return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
