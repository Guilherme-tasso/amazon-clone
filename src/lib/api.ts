// Dados de produtos vêm da DummyJSON (https://dummyjson.com), uma API pública de testes.
const BASE_URL = 'https://dummyjson.com';

export interface Review {
  rating: number;
  comment: string;
  date: string;
  reviewerName: string;
}

/** Versão "leve" do produto usada em listas, busca e carrinho. */
export interface CatalogProduct {
  id: number;
  title: string;
  price: number; // em USD na API; convertido para BRL na exibição
  discountPercentage: number;
  rating: number;
  stock: number;
  brand?: string;
  category: string;
  thumbnail: string;
  tags: string[];
}

export interface Product extends CatalogProduct {
  description: string;
  images: string[];
  reviews: Review[];
  sku: string;
  weight: number;
  dimensions: { width: number; height: number; depth: number };
  warrantyInformation: string;
  shippingInformation: string;
  availabilityStatus: string;
  returnPolicy: string;
}

const CATALOG_FIELDS = 'title,price,discountPercentage,rating,stock,brand,category,thumbnail,tags';

const cache = new Map<string, Promise<unknown>>();

function get<T>(path: string): Promise<T> {
  let request = cache.get(path);
  if (!request) {
    request = fetch(BASE_URL + path).then((res) => {
      if (!res.ok) throw new Error(`Erro ${res.status} ao buscar ${path}`);
      return res.json();
    });
    // não guarda falhas no cache, para que "tentar novamente" funcione
    request.catch(() => cache.delete(path));
    cache.set(path, request);
  }
  return request as Promise<T>;
}

export const api = {
  /** Catálogo completo (194 produtos) com só os campos necessários para listagens. */
  catalog: () =>
    get<{ products: CatalogProduct[] }>(`/products?limit=0&select=${CATALOG_FIELDS}`).then((r) => r.products),
  product: (id: number) => get<Product>(`/products/${id}`),
};

export function toCatalogProduct(p: CatalogProduct): CatalogProduct {
  const { id, title, price, discountPercentage, rating, stock, brand, category, thumbnail, tags } = p;
  return { id, title, price, discountPercentage, rating, stock, brand, category, thumbnail, tags };
}
