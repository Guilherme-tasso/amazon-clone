import { useMemo, useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router';
import { Icon } from '../components/Icon';
import { ProductCard } from '../components/ProductCard';
import { ErrorState, SkeletonGrid, Stars } from '../components/ui';
import type { CatalogProduct } from '../lib/api';
import { useCatalog, useTitle } from '../lib/hooks';
import { searchProducts } from '../lib/search';
import { categoryName, isDeal, toBRL } from '../lib/utils';

const PRICE_RANGES = [
  { label: 'Até R$ 100', max: 100 },
  { label: 'R$ 100 a R$ 250', min: 100, max: 250 },
  { label: 'R$ 250 a R$ 500', min: 250, max: 500 },
  { label: 'R$ 500 a R$ 1.000', min: 500, max: 1000 },
  { label: 'R$ 1.000 a R$ 5.000', min: 1000, max: 5000 },
  { label: 'Acima de R$ 5.000', min: 5000 },
];

const SORTS: Record<string, { label: string; compare?: (a: CatalogProduct, b: CatalogProduct) => number }> = {
  relevance: { label: 'Destaques' },
  'price-asc': { label: 'Preço: menor para maior', compare: (a, b) => a.price - b.price },
  'price-desc': { label: 'Preço: maior para menor', compare: (a, b) => b.price - a.price },
  rating: { label: 'Média de avaliações', compare: (a, b) => b.rating - a.rating },
  discount: { label: 'Maiores descontos', compare: (a, b) => b.discountPercentage - a.discountPercentage },
};

const PAGE_SIZE = 24;
const BRANDS_COLLAPSED = 8;

function countBy(items: CatalogProduct[], key: (p: CatalogProduct) => string | undefined) {
  const counts = new Map<string, number>();
  for (const item of items) {
    const value = key(item);
    if (value) counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return [...counts].sort((a, b) => b[1] - a[1]);
}

const numberParam = (value: string | null) => (value === null || value === '' ? undefined : Number(value));

export function Search() {
  const [params, setParams] = useSearchParams();
  const query = params.get('k') ?? '';
  const category = params.get('i') ?? '';
  const sort = SORTS[params.get('sort') ?? ''] ? params.get('sort')! : 'relevance';
  const minRating = Number(params.get('rating')) || 0;
  const minPrice = numberParam(params.get('min'));
  const maxPrice = numberParam(params.get('max'));
  const brands = params.getAll('brand');
  const onlyDeals = params.get('oferta') === '1';
  const page = Math.max(1, Number(params.get('page')) || 1);

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [showAllBrands, setShowAllBrands] = useState(false);
  const [priceInput, setPriceInput] = useState({ min: '', max: '' });

  const heading = query ? `"${query}"` : category ? categoryName(category) : onlyDeals ? 'Ofertas do Dia' : 'Todos os produtos';
  useTitle(query ? `Resultados para ${query}` : heading);

  const { data: catalog, loading, error, retry } = useCatalog();

  // resultados da busca antes dos filtros da barra lateral (usados para montar os filtros)
  const matches = useMemo(() => (catalog ? searchProducts(catalog, query, category) : []), [catalog, query, category]);
  const categoryFacets = useMemo(
    () => (catalog && !category ? countBy(searchProducts(catalog, query), (p) => p.category) : []),
    [catalog, query, category],
  );
  const brandFacets = useMemo(() => countBy(matches, (p) => p.brand), [matches]);

  const results = useMemo(() => {
    const filtered = matches.filter((p) => {
      const brl = toBRL(p.price);
      return (
        p.rating >= minRating &&
        (minPrice === undefined || brl >= minPrice) &&
        (maxPrice === undefined || brl <= maxPrice) &&
        (!brands.length || (p.brand && brands.includes(p.brand))) &&
        (!onlyDeals || isDeal(p))
      );
    });
    const compare = SORTS[sort].compare ?? (query ? undefined : SORTS.rating.compare);
    return compare ? [...filtered].sort(compare) : filtered;
  }, [matches, minRating, minPrice, maxPrice, brands.join('|'), onlyDeals, sort, query]);

  const pageCount = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pageItems = results.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const hasFilters = minRating > 0 || minPrice !== undefined || maxPrice !== undefined || brands.length > 0 || onlyDeals;

  function update(changes: Record<string, string | string[] | null>) {
    const next = new URLSearchParams(params);
    for (const [key, value] of Object.entries(changes)) {
      next.delete(key);
      if (Array.isArray(value)) value.forEach((v) => next.append(key, v));
      else if (value) next.set(key, value);
    }
    if (!('page' in changes)) next.delete('page');
    setParams(next);
  }

  function toggleBrand(brand: string) {
    update({ brand: brands.includes(brand) ? brands.filter((b) => b !== brand) : [...brands, brand] });
  }

  function applyCustomPrice(e: FormEvent) {
    e.preventDefault();
    update({ min: priceInput.min || null, max: priceInput.max || null });
  }

  const visibleBrands = showAllBrands ? brandFacets : brandFacets.slice(0, BRANDS_COLLAPSED);

  return (
    <div className="search-page">
      <div className="results-bar">
        <p>
          {loading ? (
            'Buscando...'
          ) : results.length ? (
            <>
              {(currentPage - 1) * PAGE_SIZE + 1}-{Math.min(currentPage * PAGE_SIZE, results.length)} de{' '}
              {results.length} resultados para <strong className="results-bar__term">{heading}</strong>
            </>
          ) : (
            <>
              Nenhum resultado para <strong className="results-bar__term">{heading}</strong>
            </>
          )}
        </p>
        <div className="results-bar__actions">
          <button className="btn btn--white btn--sm results-bar__filters" onClick={() => setFiltersOpen((o) => !o)}>
            <Icon name="filter" size={14} /> Filtros
          </button>
          <label className="sort-select">
            Classificar por:
            <select value={sort} onChange={(e) => update({ sort: e.target.value === 'relevance' ? null : e.target.value })}>
              {Object.entries(SORTS).map(([value, { label }]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="search-page__body">
        <aside className={`filters${filtersOpen ? ' is-open' : ''}`}>
          {hasFilters && (
            <button
              className="link-button filters__clear"
              onClick={() => update({ rating: null, min: null, max: null, brand: null, oferta: null })}
            >
              <Icon name="x" size={14} /> Limpar filtros
            </button>
          )}

          <section>
            <h3>Departamento</h3>
            {category ? (
              <>
                <button className="filters__option" onClick={() => update({ i: null })}>
                  <Icon name="chevronLeft" size={14} /> Todos os departamentos
                </button>
                <span className="filters__option is-selected">{categoryName(category)}</span>
              </>
            ) : (
              categoryFacets.map(([slug, count]) => (
                <button key={slug} className="filters__option" onClick={() => update({ i: slug })}>
                  {categoryName(slug)} <small>({count})</small>
                </button>
              ))
            )}
          </section>

          <section>
            <h3>Avaliação dos clientes</h3>
            {[4, 3, 2, 1].map((stars) => (
              <button
                key={stars}
                className={`filters__option${minRating === stars ? ' is-selected' : ''}`}
                onClick={() => update({ rating: minRating === stars ? null : String(stars) })}
                aria-pressed={minRating === stars}
              >
                <Stars rating={stars} showValue={false} /> e acima
              </button>
            ))}
          </section>

          <section>
            <h3>Preço</h3>
            {PRICE_RANGES.map((range) => {
              const selected = minPrice === range.min && maxPrice === range.max;
              return (
                <button
                  key={range.label}
                  className={`filters__option${selected ? ' is-selected' : ''}`}
                  onClick={() =>
                    update(
                      selected
                        ? { min: null, max: null }
                        : { min: range.min?.toString() ?? null, max: range.max?.toString() ?? null },
                    )
                  }
                  aria-pressed={selected}
                >
                  {range.label}
                </button>
              );
            })}
            <form className="filters__price" onSubmit={applyCustomPrice}>
              <input
                type="number"
                min="0"
                placeholder="R$ Mín"
                value={priceInput.min}
                onChange={(e) => setPriceInput((v) => ({ ...v, min: e.target.value }))}
                aria-label="Preço mínimo"
              />
              <input
                type="number"
                min="0"
                placeholder="R$ Máx"
                value={priceInput.max}
                onChange={(e) => setPriceInput((v) => ({ ...v, max: e.target.value }))}
                aria-label="Preço máximo"
              />
              <button className="btn btn--white btn--sm">Ir</button>
            </form>
          </section>

          <section>
            <h3>Ofertas e descontos</h3>
            <label className="filters__check">
              <input type="checkbox" checked={onlyDeals} onChange={() => update({ oferta: onlyDeals ? null : '1' })} />
              Somente ofertas
            </label>
          </section>

          {brandFacets.length > 0 && (
            <section>
              <h3>Marcas</h3>
              {visibleBrands.map(([brand]) => (
                <label key={brand} className="filters__check">
                  <input type="checkbox" checked={brands.includes(brand)} onChange={() => toggleBrand(brand)} />
                  {brand}
                </label>
              ))}
              {brandFacets.length > BRANDS_COLLAPSED && (
                <button className="link-button" onClick={() => setShowAllBrands((s) => !s)}>
                  <Icon name="chevronDown" size={14} /> {showAllBrands ? 'Ver menos' : 'Ver mais'}
                </button>
              )}
            </section>
          )}
        </aside>

        <section className="results">
          {error && <ErrorState onRetry={retry} />}
          {loading && <SkeletonGrid />}
          {!loading && !error && results.length === 0 && (
            <div className="results__empty">
              <h2>Nenhum resultado para {heading}.</h2>
              <p>Tente verificar a ortografia, usar termos mais genéricos ou remover alguns filtros.</p>
              {hasFilters ? (
                <button
                  className="btn btn--yellow"
                  onClick={() => update({ rating: null, min: null, max: null, brand: null, oferta: null })}
                >
                  Limpar filtros
                </button>
              ) : (
                <Link to="/" className="btn btn--yellow">
                  Voltar à página inicial
                </Link>
              )}
            </div>
          )}
          {pageItems.length > 0 && (
            <>
              <h2 className="results__title">Resultados</h2>
              <p className="results__hint">Confira cada página de produto para outras opções de compra.</p>
              <div className="results__grid">
                {pageItems.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </>
          )}
          {pageCount > 1 && (
            <nav className="pagination" aria-label="Paginação">
              <button disabled={currentPage === 1} onClick={() => update({ page: String(currentPage - 1) })}>
                <Icon name="chevronLeft" size={14} /> Anterior
              </button>
              {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  className={n === currentPage ? 'is-current' : undefined}
                  onClick={() => update({ page: String(n) })}
                  aria-current={n === currentPage ? 'page' : undefined}
                >
                  {n}
                </button>
              ))}
              <button disabled={currentPage === pageCount} onClick={() => update({ page: String(currentPage + 1) })}>
                Próximo <Icon name="chevronRight" size={14} />
              </button>
            </nav>
          )}
        </section>
      </div>
    </div>
  );
}
