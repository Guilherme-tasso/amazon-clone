import type { CatalogProduct } from './api';
import { categoryName, normalize } from './utils';

// Os produtos da API estão em inglês; estes sinônimos permitem buscar em português.
const SYNONYMS: Record<string, string[]> = {
  celular: ['phone', 'iphone', 'smartphone'],
  smartphone: ['phone'],
  notebook: ['laptop', 'macbook'],
  computador: ['laptop', 'macbook'],
  tenis: ['shoe', 'sneaker', 'nike', 'puma'],
  sapato: ['shoe'],
  calcado: ['shoe', 'heel', 'sandal'],
  relogio: ['watch'],
  oculos: ['sunglasses', 'glasses'],
  bolsa: ['bag', 'handbag'],
  vestido: ['dress'],
  camisa: ['shirt'],
  camiseta: ['shirt', 't-shirt'],
  blusa: ['top', 'blouse'],
  perfume: ['fragrance', 'eau', 'parfum'],
  cadeira: ['chair'],
  mesa: ['table'],
  sofa: ['sofa'],
  cama: ['bed'],
  faca: ['knife'],
  panela: ['pan', 'pot'],
  bola: ['ball'],
  fone: ['earphone', 'headphone', 'airpods', 'earbuds'],
  capinha: ['case'],
  capa: ['case', 'cover'],
  carregador: ['charger'],
  moto: ['motorcycle'],
  carro: ['car', 'vehicle'],
  maquiagem: ['mascara', 'lipstick', 'eyeshadow', 'powder', 'nail'],
  batom: ['lipstick'],
  colar: ['necklace'],
  brinco: ['earring'],
  anel: ['ring'],
  creme: ['cream', 'lotion'],
  carne: ['beef', 'chicken', 'meat'],
  fruta: ['apple', 'kiwi', 'strawberry', 'lemon'],
};

function variants(term: string) {
  const extra = SYNONYMS[term] ?? SYNONYMS[term.replace(/e?s$/, '')] ?? [];
  return [term, ...extra];
}

/** Filtra por departamento e termo de busca, ordenando por relevância (título > marca > categoria/tags). */
export function searchProducts(products: CatalogProduct[], query: string, category = '') {
  const inCategory = category ? products.filter((p) => p.category === category) : products;
  const terms = normalize(query).split(/\s+/).filter(Boolean);
  if (!terms.length) return inCategory;

  const scored: { product: CatalogProduct; score: number }[] = [];
  for (const product of inCategory) {
    const title = normalize(product.title);
    const brand = normalize(product.brand ?? '');
    const department = normalize(categoryName(product.category));
    const meta = normalize([product.category, department, ...product.tags].join(' '));
    let score = 0;
    let matchesAll = true;
    for (const term of terms) {
      const words = variants(term);
      // "celular" deve trazer celulares antes de acessórios para celular
      if (department.startsWith(term)) score += 1;
      if (words.some((w) => title.includes(w))) score += 3;
      else if (words.some((w) => brand.includes(w))) score += 2;
      else if (words.some((w) => meta.includes(w))) score += 1;
      else {
        matchesAll = false;
        break;
      }
    }
    if (matchesAll) scored.push({ product, score });
  }
  return scored.sort((a, b) => b.score - a.score).map((s) => s.product);
}
