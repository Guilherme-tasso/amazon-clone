import { Link } from 'react-router';
import type { CatalogProduct } from '../lib/api';
import {
  FREE_SHIPPING_MIN,
  deliveryDate,
  formatBRL,
  formatPrice,
  installments,
  isDeal,
  listPrice,
  ratingCount,
  toBRL,
} from '../lib/utils';
import { useStore } from '../store';
import { Price, Stars } from './ui';

export function ProductCard({ product }: { product: CatalogProduct }) {
  const { addToCart } = useStore();
  const freeShipping = toBRL(product.price) >= FREE_SHIPPING_MIN;
  const plan = installments(product.price);
  const url = `/dp/${product.id}`;

  return (
    <article className="product-card">
      <Link to={url} className="product-card__image">
        <img src={product.thumbnail} alt={product.title} loading="lazy" />
      </Link>
      <div className="product-card__body">
        {product.rating >= 4.8 ? (
          <span className="badge badge--bestseller">Mais vendido</span>
        ) : (
          isDeal(product) && <span className="badge badge--deal">Oferta</span>
        )}
        <Link to={url} className="product-card__title">
          {product.title}
        </Link>
        {product.brand && <span className="product-card__brand">por {product.brand}</span>}
        <Stars rating={product.rating} count={ratingCount(product.id)} />
        <div className="product-card__price">
          <Price usd={product.price} />
          {product.discountPercentage >= 5 && (
            <span className="product-card__list-price">
              De: <s>{formatPrice(listPrice(product))}</s>
            </span>
          )}
        </div>
        {plan.n > 1 && (
          <span className="product-card__meta">
            Em até {plan.n}x de {formatBRL(plan.value)} sem juros
          </span>
        )}
        <span className="product-card__meta">
          {freeShipping ? (
            <>
              Entrega <b>GRÁTIS</b> {deliveryDate(3)}
            </>
          ) : (
            <>Entrega {deliveryDate(5)}</>
          )}
        </span>
        {product.stock < 10 && (
          <span className="product-card__stock">Apenas {product.stock} em estoque</span>
        )}
        <button className="btn btn--yellow btn--sm" onClick={() => addToCart(product)} disabled={product.stock === 0}>
          Adicionar ao carrinho
        </button>
      </div>
    </article>
  );
}
