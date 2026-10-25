import { useRef } from 'react';
import { Link } from 'react-router';
import type { CatalogProduct } from '../lib/api';
import { Icon } from './Icon';
import { Price } from './ui';

interface Props {
  title: string;
  products: CatalogProduct[];
  moreLink?: string;
  showPrice?: boolean;
}

/** Faixa horizontal de produtos com rolagem, como as da home da Amazon. */
export function ProductRow({ title, products, moreLink, showPrice = false }: Props) {
  const track = useRef<HTMLDivElement>(null);
  const scroll = (dir: 1 | -1) =>
    track.current?.scrollBy({ left: dir * track.current.clientWidth * 0.85, behavior: 'smooth' });

  if (!products.length) return null;

  return (
    <section className="product-row">
      <div className="product-row__head">
        <h2>{title}</h2>
        {moreLink && <Link to={moreLink}>Ver mais</Link>}
      </div>
      <div className="product-row__viewport">
        <button className="product-row__arrow product-row__arrow--left" onClick={() => scroll(-1)} aria-label="Anterior">
          <Icon name="chevronLeft" size={32} />
        </button>
        <div className="product-row__track" ref={track}>
          {products.map((p) => (
            <Link key={p.id} to={`/dp/${p.id}`} className="product-row__item" title={p.title}>
              <img src={p.thumbnail} alt={p.title} loading="lazy" />
              {showPrice && (
                <span className="product-row__info">
                  {p.discountPercentage >= 1 && (
                    <span className="product-row__deal">
                      <span className="badge badge--deal">{Math.round(p.discountPercentage)}% off</span>
                      <span className="product-row__deal-label">Oferta</span>
                    </span>
                  )}
                  <Price usd={p.price} size="sm" />
                  <span className="product-row__name">{p.title}</span>
                </span>
              )}
            </Link>
          ))}
        </div>
        <button className="product-row__arrow product-row__arrow--right" onClick={() => scroll(1)} aria-label="Próximo">
          <Icon name="chevronRight" size={32} />
        </button>
      </div>
    </section>
  );
}
