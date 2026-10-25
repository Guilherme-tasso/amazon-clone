import { priceParts } from '../lib/utils';

export function Stars({ rating, count, showValue = true }: { rating: number; count?: number; showValue?: boolean }) {
  return (
    <span className="stars" title={`${rating.toFixed(1).replace('.', ',')} de 5 estrelas`}>
      {showValue && <span className="stars__value">{rating.toFixed(1).replace('.', ',')}</span>}
      <span className="stars__track" aria-hidden="true">
        ★★★★★
        <span className="stars__fill" style={{ width: `${(rating / 5) * 100}%` }}>
          ★★★★★
        </span>
      </span>
      {count !== undefined && <span className="stars__count">({count.toLocaleString('pt-BR')})</span>}
    </span>
  );
}

export function Price({ usd, size = 'md' }: { usd: number; size?: 'sm' | 'md' | 'lg' }) {
  const { whole, cents } = priceParts(usd);
  return (
    <span className={`price price--${size}`} aria-label={`R$ ${whole},${cents}`}>
      <span className="price__symbol">R$</span>
      <span className="price__whole">{whole}</span>
      <span className="price__cents">{cents}</span>
    </span>
  );
}

export function Spinner() {
  return <div className="spinner" role="status" aria-label="Carregando" />;
}

export function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="error-state">
      <h2>Ops! Não conseguimos carregar os produtos.</h2>
      <p>Verifique sua conexão com a internet e tente novamente.</p>
      <button className="btn btn--yellow" onClick={onRetry}>
        Tentar novamente
      </button>
    </div>
  );
}

export function SkeletonGrid({ count = 8 }: { count?: number }) {
  return (
    <div className="results__grid">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="skeleton skeleton--card" />
      ))}
    </div>
  );
}
