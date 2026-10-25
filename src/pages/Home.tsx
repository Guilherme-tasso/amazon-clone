import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { Icon } from '../components/Icon';
import { ProductRow } from '../components/ProductRow';
import { ErrorState } from '../components/ui';
import type { CatalogProduct } from '../lib/api';
import { useCatalog, useTitle } from '../lib/hooks';
import { firstName, isDeal } from '../lib/utils';
import { useStore } from '../store';

const SLIDES = [
  {
    title: 'Semana da Tecnologia',
    text: 'Celulares, notebooks e tablets com até 20% OFF',
    cta: 'Ver ofertas',
    to: '/s?i=smartphones',
    theme: 'tech',
    categories: ['smartphones', 'laptops', 'tablets'],
  },
  {
    title: 'Sua casa do seu jeito',
    text: 'Móveis e decoração com entrega rápida para todo o Brasil',
    cta: 'Explorar',
    to: '/s?i=furniture',
    theme: 'home',
    categories: ['furniture', 'home-decoration', 'kitchen-accessories'],
  },
  {
    title: 'Beleza que encanta',
    text: 'Perfumes, maquiagem e skincare das melhores marcas',
    cta: 'Descobrir',
    to: '/s?i=fragrances',
    theme: 'beauty',
    categories: ['fragrances', 'skin-care', 'beauty'],
  },
  {
    title: 'Bora treinar?',
    text: 'Acessórios esportivos e calçados para todos os estilos',
    cta: 'Comprar agora',
    to: '/s?i=sports-accessories',
    theme: 'sport',
    categories: ['sports-accessories', 'mens-shoes', 'womens-shoes'],
  },
];

const CARDS = [
  { title: 'Celulares e acessórios', categories: ['smartphones', 'mobile-accessories'], to: '/s?i=smartphones' },
  { title: 'Renove sua casa', categories: ['furniture', 'home-decoration'], to: '/s?i=home-decoration' },
  { title: 'Beleza e perfumaria', categories: ['fragrances', 'beauty', 'skin-care'], to: '/s?i=beauty' },
  { title: 'Moda feminina', categories: ['womens-dresses', 'womens-bags', 'womens-shoes', 'womens-jewellery'], to: '/s?i=womens-dresses' },
  { title: 'Moda masculina', categories: ['mens-shirts', 'mens-shoes', 'mens-watches', 'sunglasses'], to: '/s?i=mens-shirts' },
  { title: 'Utilidades para cozinha', categories: ['kitchen-accessories'], to: '/s?i=kitchen-accessories', single: true },
  { title: 'Supermercado em casa', categories: ['groceries'], to: '/s?i=groceries' },
];

const byRating = (a: CatalogProduct, b: CatalogProduct) => b.rating - a.rating;

/** Escolhe produtos bem avaliados alternando entre as categorias. */
function pickProducts(catalog: CatalogProduct[], categories: string[], count: number) {
  const pools = categories.map((c) => catalog.filter((p) => p.category === c).sort(byRating));
  const picked: CatalogProduct[] = [];
  for (let round = 0; picked.length < count && pools.some((p) => p.length > round); round++) {
    for (const pool of pools) {
      if (pool[round] && picked.length < count) picked.push(pool[round]);
    }
  }
  return picked;
}

const shortTitle = (title: string) => title.split(' ').slice(0, 3).join(' ');

function Hero({ catalog }: { catalog?: CatalogProduct[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const go = (step: number) => setIndex((i) => (i + step + SLIDES.length) % SLIDES.length);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % SLIDES.length), 6000);
    return () => clearInterval(timer);
  }, [paused]);

  return (
    <section className="hero" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      {SLIDES.map((slide, i) => (
        <div key={slide.title} className={`hero__slide hero__slide--${slide.theme}${i === index ? ' is-active' : ''}`} aria-hidden={i !== index}>
          <div className="hero__content">
            <div className="hero__text">
              <h1>{slide.title}</h1>
              <p>{slide.text}</p>
              <Link to={slide.to} className="btn btn--yellow" tabIndex={i === index ? 0 : -1}>
                {slide.cta}
              </Link>
            </div>
            <div className="hero__products">
              {catalog &&
                pickProducts(catalog, slide.categories, 3).map((p) => (
                  <Link key={p.id} to={`/dp/${p.id}`} className="hero__product" tabIndex={i === index ? 0 : -1}>
                    <img src={p.thumbnail} alt={p.title} />
                  </Link>
                ))}
            </div>
          </div>
        </div>
      ))}
      <button className="hero__arrow hero__arrow--left" onClick={() => go(-1)} aria-label="Banner anterior">
        <Icon name="chevronLeft" size={40} />
      </button>
      <button className="hero__arrow hero__arrow--right" onClick={() => go(1)} aria-label="Próximo banner">
        <Icon name="chevronRight" size={40} />
      </button>
      <div className="hero__dots">
        {SLIDES.map((s, i) => (
          <button key={s.title} className={i === index ? 'is-active' : undefined} onClick={() => setIndex(i)} aria-label={`Banner ${i + 1}`} />
        ))}
      </div>
    </section>
  );
}

function CategoryCard({ title, products, to, single }: { title: string; products: CatalogProduct[]; to: string; single?: boolean }) {
  return (
    <div className="home-card">
      <h2>{title}</h2>
      {single ? (
        <Link to={to} className="home-card__single">
          <img src={products[0]?.thumbnail} alt={products[0]?.title} loading="lazy" />
        </Link>
      ) : (
        <div className="home-card__grid">
          {products.map((p) => (
            <Link key={p.id} to={`/dp/${p.id}`} className="home-card__tile">
              <span className="home-card__img">
                <img src={p.thumbnail} alt={p.title} loading="lazy" />
              </span>
              <span>{shortTitle(p.title)}</span>
            </Link>
          ))}
        </div>
      )}
      <Link to={to} className="home-card__more">
        Ver mais
      </Link>
    </div>
  );
}

function SignInCard({ deal }: { deal?: CatalogProduct }) {
  return (
    <div className="home-card home-card--signin">
      <h2>Faça login para ter a melhor experiência</h2>
      <Link to="/login" className="btn btn--yellow btn--block">
        Fazer login com segurança
      </Link>
      {deal && (
        <Link to={`/dp/${deal.id}`} className="home-card__deal">
          <img src={deal.thumbnail} alt={deal.title} loading="lazy" />
          <span>
            <span className="badge badge--deal">{Math.round(deal.discountPercentage)}% off</span> Oferta do dia
          </span>
        </Link>
      )}
    </div>
  );
}

export function Home() {
  useTitle('');
  const { data: catalog, error, retry } = useCatalog();
  const { user, recentlyViewed } = useStore();

  const sections = useMemo(() => {
    if (!catalog) return null;
    const deals = catalog.filter(isDeal).sort((a, b) => b.discountPercentage - a.discountPercentage);
    return {
      deals,
      topRated: [...catalog].sort(byRating).slice(0, 20),
      tech: pickProducts(catalog, ['laptops', 'tablets', 'smartphones', 'mobile-accessories'], 20),
      style: pickProducts(catalog, ['womens-watches', 'mens-watches', 'sunglasses', 'womens-jewellery'], 20),
      cards: CARDS.map((card) => ({ ...card, products: pickProducts(catalog, card.categories, card.single ? 1 : 4) })),
    };
  }, [catalog]);

  return (
    <div className="home">
      <Hero catalog={catalog} />
      <div className="home__content">
        {error && <ErrorState onRetry={retry} />}
        {!sections && !error && (
          <div className="home__cards">
            {Array.from({ length: 8 }, (_, i) => (
              <div key={i} className="home-card skeleton" />
            ))}
          </div>
        )}
        {sections && (
          <>
            <div className="home__cards">
              {sections.cards.slice(0, 3).map((card) => (
                <CategoryCard key={card.title} {...card} />
              ))}
              {user ? (
                <CategoryCard
                  title={`Recomendados para ${firstName(user.name)}`}
                  products={sections.topRated.slice(4, 8)}
                  to="/s?sort=rating"
                />
              ) : (
                <SignInCard deal={sections.deals[0]} />
              )}
              {sections.cards.slice(3).map((card) => (
                <CategoryCard key={card.title} {...card} />
              ))}
            </div>
            <ProductRow title="Ofertas do Dia" products={sections.deals.slice(0, 20)} moreLink="/s?oferta=1" showPrice />
            <ProductRow title="Mais vendidos em Eletrônicos" products={sections.tech} moreLink="/s?i=laptops" />
            {recentlyViewed.length > 0 && (
              <ProductRow title="Inspirado no seu histórico de navegação" products={recentlyViewed} showPrice />
            )}
            <ProductRow title="Relógios, óculos e acessórios" products={sections.style} moreLink="/s?i=womens-watches" />
            <ProductRow title="Os mais bem avaliados pelos clientes" products={sections.topRated} moreLink="/s?sort=rating" />
          </>
        )}
      </div>
    </div>
  );
}
