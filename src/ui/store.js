/** Currency + bag state with localStorage persistence and tiny pub/sub. */
import { findProduct } from '../data/products.js';

const KEY = 'yakuza:v1';
const SYMBOL = { INR: '₹', USD: '$', JPY: '¥' };
const LOCALE = { INR: 'en-IN', USD: 'en-US', JPY: 'ja-JP' };

const load = () => {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || {};
  } catch {
    return {};
  }
};
const saved = load();

export const store = {
  currency: saved.currency && SYMBOL[saved.currency] ? saved.currency : 'INR',
  bag: Array.isArray(saved.bag) ? saved.bag.filter((l) => findProduct(l.id)) : [],
  subs: new Set(),
};

const persist = () => {
  try {
    localStorage.setItem(KEY, JSON.stringify({ currency: store.currency, bag: store.bag }));
  } catch {
    /* private mode — fine */
  }
};
const emit = (type) => store.subs.forEach((fn) => fn(type));

export const subscribe = (fn) => (store.subs.add(fn), () => store.subs.delete(fn));

export function formatPrice(priceObj, currency = store.currency) {
  const v = priceObj[currency];
  return `${SYMBOL[currency]}${new Intl.NumberFormat(LOCALE[currency]).format(v)}`;
}

export function setCurrency(c) {
  if (!SYMBOL[c] || c === store.currency) return;
  store.currency = c;
  persist();
  emit('currency');
  document.querySelectorAll('[data-price]').forEach((el) => {
    const p = findProduct(el.dataset.price);
    if (p) el.textContent = formatPrice(p.price);
  });
}

export const CURRENCIES = Object.keys(SYMBOL).map((code) => ({ code, symbol: SYMBOL[code] }));

export function addToBag(id, size) {
  const line = store.bag.find((l) => l.id === id && l.size === size);
  if (line) line.qty += 1;
  else store.bag.push({ id, size, qty: 1 });
  persist();
  emit('bag');
}

export function setQty(index, qty) {
  if (!store.bag[index]) return;
  if (qty <= 0) store.bag.splice(index, 1);
  else store.bag[index].qty = qty;
  persist();
  emit('bag');
}

export const bagCount = () => store.bag.reduce((n, l) => n + l.qty, 0);
export const bagTotal = () => store.bag.reduce((n, l) => n + findProduct(l.id).price[store.currency] * l.qty, 0);
export const formatAmount = (v) => `${SYMBOL[store.currency]}${new Intl.NumberFormat(LOCALE[store.currency]).format(v)}`;
