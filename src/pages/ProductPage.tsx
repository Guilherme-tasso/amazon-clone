import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { Icon } from '../components/Icon';
import { ProductRow } from '../components/ProductRow';
import { Price, Spinner, Stars } from '../components/ui';
import { api } from '../lib/api';
import { useAsync, useCatalog, useTitle } from '../lib/hooks';
import {
  FREE_SHIPPING_MIN,
  SHIPPING_FEE,
  categoryName,
  deliveryDate,
  firstName,
  formatBRL,
  formatDate,
  formatPrice,
  installments,
  listPrice,
  ratingCount,
  toBRL,
} from '../lib/utils';
import { useStore } from '../store';
import { NotFound } from './NotFound';

/** Distribuição de estrelas plausível a partir da média (a API não fornece esse dado). */
function ratingDistribution(rating: number) {
  const weights = [5, 4, 3, 2, 1].map((star) => Math.exp(-Math.abs(star - rating) * 1.4));
  const total = weights.reduce((a, b) => a + b, 0);
  return weights.map((w) => Math.round((w / total) * 100));
}

export function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, addToCart, addRecentlyViewed } = useStore();
  const { data: product, loading, error } = useAsync(() => api.product(Number(id)), [id]);
  const { data: catalog } = useCatalog();
  const [imageIndex, setImageIndex] = useState(0);
  const [qty, setQty] = useState(1);

  useTitle(product?.title ?? '');

  useEffect(() => {
    setImageIndex(0);
    setQty(1);
    if (product) addRecentlyViewed(product);
  }, [product, addRecentlyViewed]);

  const related = useMemo(
    () => (catalog && product ? catalog.filter((p) => p.category === product.category && p.id !== product.id) : []),
    [catalog, product],
  );

  if (loading) {
    return (
      <div className="page-center">
        <Spinner />
      </div>
    );
  }
  if (error || !product) return <NotFound />;

  const images = product.images.length ? product.images : [product.thumbnail];
  const hasDiscount = product.discountPercentage >= 1;
  const plan = installments(product.price);
  const freeShipping = toBRL(product.price) >= FREE_SHIPPING_MIN;
  const reviewsTotal = ratingCount(product.id);
  const distribution = ratingDistribution(product.rating);
  const maxQty = Math.min(product.stock, 30);
  const bullets = product.description.split(/(?<=\.)\s+/).filter(Boolean);

  function buyNow() {
    addToCart(product!, qty);
    navigate(user ? '/checkout' : '/login?next=/checkout');
  }

  return (
    <div className="product-page">
      <nav className="breadcrumb" aria-label="Navegação estrutural">
        <Link to="/">Início</Link>
        <Icon name="chevronRight" size={12} />
        <Link to={`/s?i=${product.category}`}>{categoryName(product.category)}</Link>
        {product.brand && (
          <>
            <Icon name="chevronRight" size={12} />
            <Link to={`/s?k=${encodeURIComponent(product.brand)}`}>{product.brand}</Link>
          </>
        )}
      </nav>

      <div className="pdp">
        <div className="gallery">
          <div className="gallery__thumbs">
            {images.map((src, i) => (
              <button
                key={src}
                className={i === imageIndex ? 'is-active' : undefined}
                onMouseEnter={() => setImageIndex(i)}
                onClick={() => setImageIndex(i)}
                aria-label={`Imagem ${i + 1}`}
              >
                <img src={src} alt="" />
              </button>
            ))}
          </div>
          <div className="gallery__main">
            <img src={images[imageIndex]} alt={product.title} />
          </div>
        </div>

        <div className="pdp__info">
          {product.brand && (
            <Link to={`/s?k=${encodeURIComponent(product.brand)}`} className="pdp__brand">
              Visite a loja {product.brand}
            </Link>
          )}
          <h1>{product.title}</h1>
          <a href="#avaliacoes" className="pdp__rating">
            <Stars rating={product.rating} />
            <span>{reviewsTotal.toLocaleString('pt-BR')} avaliações de clientes</span>
          </a>
          {product.rating >= 4.8 && <span className="badge badge--bestseller">Mais vendido</span>}
          <hr />

          {hasDiscount && <span className="badge badge--deal">Oferta Relâmpago</span>}
          <div className="pdp__price">
            {hasDiscount && <span className="pdp__discount">-{Math.round(product.discountPercentage)}%</span>}
            <Price usd={product.price} size="lg" />
          </div>
          {hasDiscount && (
            <p className="pdp__list-price">
              De: <s>{formatPrice(listPrice(product))}</s>
            </p>
          )}
          <p className="pdp__installments">
            {plan.n > 1 ? `Em até ${plan.n}x de ${formatBRL(plan.value)} sem juros` : 'Pagamento à vista no Pix ou boleto'}
          </p>
          <hr />

          <table className="pdp__specs">
            <tbody>
              {product.brand && (
                <tr>
                  <th>Marca</th>
                  <td>{product.brand}</td>
                </tr>
              )}
              <tr>
                <th>Departamento</th>
                <td>{categoryName(product.category)}</td>
              </tr>
              <tr>
                <th>Dimensões</th>
                <td>
                  {product.dimensions.width} x {product.dimensions.height} x {product.dimensions.depth} cm
                </td>
              </tr>
              <tr>
                <th>Peso</th>
                <td>{product.weight} kg</td>
              </tr>
              <tr>
                <th>Código</th>
                <td>{product.sku}</td>
              </tr>
            </tbody>
          </table>
          <hr />

          <h2>Sobre este item</h2>
          <ul className="pdp__bullets">
            {bullets.map((b) => (
              <li key={b}>{b}</li>
            ))}
            <li>Garantia: {product.warrantyInformation}.</li>
            <li>Envio: {product.shippingInformation}.</li>
          </ul>
        </div>

        <aside className="buybox">
          <Price usd={product.price} size="lg" />
          <p className="buybox__delivery">
            {freeShipping ? (
              <>
                Entrega <b>GRÁTIS</b>: <b>{deliveryDate(3)}</b>
              </>
            ) : (
              <>
                Entrega por {formatBRL(SHIPPING_FEE)}: <b>{deliveryDate(5)}</b>
              </>
            )}
          </p>
          <p className="buybox__fast">
            Ou entrega mais rápida <b>{deliveryDate(1)}</b>.
          </p>
          <p className="buybox__location">
            <Icon name="pin" size={16} /> {user ? `Enviar para ${firstName(user.name)} - Brasil` : 'Enviar para Brasil'}
          </p>
          {product.stock > 0 ? (
            <p className={product.stock < 10 ? 'buybox__stock buybox__stock--low' : 'buybox__stock'}>
              {product.stock < 10 ? `Apenas ${product.stock} em estoque` : 'Em estoque'}
            </p>
          ) : (
            <p className="buybox__stock buybox__stock--low">Indisponível</p>
          )}
          <label className="buybox__qty">
            Quantidade:
            <select value={qty} onChange={(e) => setQty(Number(e.target.value))} disabled={!maxQty}>
              {Array.from({ length: Math.max(maxQty, 1) }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
          <button className="btn btn--yellow btn--block btn--round" onClick={() => addToCart(product, qty)} disabled={!maxQty}>
            Adicionar ao carrinho
          </button>
          <button className="btn btn--orange btn--block btn--round" onClick={buyNow} disabled={!maxQty}>
            Comprar agora
          </button>
          <dl className="buybox__seller">
            <dt>Enviado por</dt>
            <dd>Amazon.com.br</dd>
            <dt>Vendido por</dt>
            <dd>{product.brand ?? 'Amazon.com.br'}</dd>
            <dt>Devolução</dt>
            <dd>{product.returnPolicy}</dd>
          </dl>
          <p className="buybox__secure">
            <Icon name="lock" size={14} /> Transação segura
          </p>
        </aside>
      </div>

      <ProductRow title="Produtos relacionados a este item" products={related} showPrice />

      <section className="reviews" id="avaliacoes">
        <div className="reviews__summary">
          <h2>Avaliações de clientes</h2>
          <div className="reviews__average">
            <Stars rating={product.rating} showValue={false} />
            <span>{product.rating.toFixed(1).replace('.', ',')} de 5</span>
          </div>
          <p className="muted">{reviewsTotal.toLocaleString('pt-BR')} classificações globais</p>
          <ul className="reviews__bars">
            {distribution.map((pct, i) => (
              <li key={i}>
                <span>{5 - i} estrelas</span>
                <span className="reviews__bar">
                  <span style={{ width: `${pct}%` }} />
                </span>
                <span>{pct}%</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="reviews__list">
          <h3>Principais avaliações do Brasil</h3>
          {product.reviews.map((review, i) => (
            <article key={i} className="review">
              <p className="review__author">
                <span className="review__avatar">
                  <Icon name="user" size={18} />
                </span>
                {review.reviewerName}
              </p>
              <Stars rating={review.rating} showValue={false} />
              <p className="muted">Avaliado no Brasil em {formatDate(review.date)}</p>
              <p className="review__verified">Compra verificada</p>
              <p>{review.comment}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
