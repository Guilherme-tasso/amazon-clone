/** Cotação fixa usada para exibir os preços da API (em dólar) em reais. */
export const USD_TO_BRL = 5.4;
/** Pedidos acima deste valor (em R$) têm frete grátis. */
export const FREE_SHIPPING_MIN = 99;
export const SHIPPING_FEE = 14.9;
/** Desconto mínimo para um produto aparecer como "Oferta". */
export const DEAL_MIN_DISCOUNT = 12;

export const toBRL = (usd: number) => Math.round(usd * USD_TO_BRL * 100) / 100;

const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
export const formatBRL = (value: number) => currency.format(value);
export const formatPrice = (usd: number) => formatBRL(toBRL(usd));

export function priceParts(usd: number) {
  const cents = Math.round(usd * USD_TO_BRL * 100);
  return {
    whole: Math.floor(cents / 100).toLocaleString('pt-BR'),
    cents: String(cents % 100).padStart(2, '0'),
  };
}

export const listPrice = (p: { price: number; discountPercentage: number }) =>
  p.price / (1 - p.discountPercentage / 100);

export const isDeal = (p: { discountPercentage: number }) => p.discountPercentage >= DEAL_MIN_DISCOUNT;

/** Parcelamento sem juros com parcela mínima de R$ 20, em até 10x. */
export function installments(usd: number) {
  const total = toBRL(usd);
  const n = Math.min(10, Math.max(1, Math.floor(total / 20)));
  return { n, value: total / n };
}

/** A API devolve só 3 avaliações por produto; geramos um total plausível e estável a partir do id. */
export const ratingCount = (id: number) => ((id * 7919 + 13) % 4800) + 27;

export function deliveryDate(daysAhead: number) {
  const date = new Date();
  date.setDate(date.getDate() + daysAhead);
  return date.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
}

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });

export const normalize = (text: string) =>
  text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export const firstName = (name: string) => name.trim().split(/\s+/)[0];

const CATEGORY_NAMES: Record<string, string> = {
  beauty: 'Beleza',
  fragrances: 'Perfumes',
  furniture: 'Móveis',
  groceries: 'Alimentos e Bebidas',
  'home-decoration': 'Decoração',
  'kitchen-accessories': 'Cozinha',
  laptops: 'Notebooks',
  'mens-shirts': 'Camisas Masculinas',
  'mens-shoes': 'Calçados Masculinos',
  'mens-watches': 'Relógios Masculinos',
  'mobile-accessories': 'Acessórios para Celular',
  motorcycle: 'Motos',
  'skin-care': 'Cuidados com a Pele',
  smartphones: 'Celulares',
  'sports-accessories': 'Esportes',
  sunglasses: 'Óculos de Sol',
  tablets: 'Tablets',
  tops: 'Blusas',
  vehicle: 'Veículos',
  'womens-bags': 'Bolsas',
  'womens-dresses': 'Vestidos',
  'womens-jewellery': 'Joias',
  'womens-shoes': 'Calçados Femininos',
  'womens-watches': 'Relógios Femininos',
};

export const categoryName = (slug: string) => CATEGORY_NAMES[slug] ?? slug;

export const CATEGORY_GROUPS = [
  { title: 'Tecnologia', items: ['smartphones', 'laptops', 'tablets', 'mobile-accessories'] },
  { title: 'Casa e Cozinha', items: ['furniture', 'home-decoration', 'kitchen-accessories', 'groceries'] },
  { title: 'Beleza e Perfumaria', items: ['beauty', 'fragrances', 'skin-care'] },
  {
    title: 'Moda Feminina',
    items: ['womens-dresses', 'tops', 'womens-shoes', 'womens-bags', 'womens-jewellery', 'womens-watches'],
  },
  { title: 'Moda Masculina', items: ['mens-shirts', 'mens-shoes', 'mens-watches', 'sunglasses'] },
  { title: 'Esportes e Veículos', items: ['sports-accessories', 'motorcycle', 'vehicle'] },
];

export const ALL_CATEGORIES = CATEGORY_GROUPS.flatMap((g) => g.items).sort((a, b) =>
  categoryName(a).localeCompare(categoryName(b), 'pt-BR'),
);
