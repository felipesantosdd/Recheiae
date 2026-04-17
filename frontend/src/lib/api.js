import axios from 'axios';
import catalogSnapshot from '@/data/catalogSnapshot.json';

const backendBaseUrl =
  process.env.REACT_APP_BACKEND_URL?.replace(/\/$/, '') || 'http://localhost:8000';

export const API_BASE_URL = `${backendBaseUrl}/api`;

export const IS_STATIC_MODE =
  process.env.NODE_ENV === 'production' &&
  process.env.REACT_APP_FORCE_LIVE_API !== 'true';

function cloneData(value) {
  return JSON.parse(JSON.stringify(value));
}

function getStaticPayload(pathname) {
  switch (pathname) {
    case '/products':
      return catalogSnapshot.activeProducts;
    case '/products/all':
      return catalogSnapshot.products;
    case '/combos':
      return catalogSnapshot.activeCombos;
    case '/combos/all':
      return catalogSnapshot.combos;
    case '/categories':
      return catalogSnapshot.categories;
    case '/payment-methods':
      return catalogSnapshot.activePaymentMethods;
    case '/payment-methods/all':
      return catalogSnapshot.paymentMethods;
    case '/addons':
      return catalogSnapshot.activeAddons || [];
    case '/addons/all':
      return catalogSnapshot.addons || [];
    default:
      throw new Error(`Rota estatica nao suportada: ${pathname}`);
  }
}

function createStaticApi() {
  return {
    async get(pathname) {
      return { data: cloneData(getStaticPayload(pathname)) };
    },
    async post() {
      throw new Error('Mutacoes da API nao estao disponiveis em producao estatica.');
    },
    async put() {
      throw new Error('Mutacoes da API nao estao disponiveis em producao estatica.');
    },
    async delete() {
      throw new Error('Mutacoes da API nao estao disponiveis em producao estatica.');
    },
  };
}

export const api = IS_STATIC_MODE
  ? createStaticApi()
  : axios.create({
      baseURL: API_BASE_URL,
    });
