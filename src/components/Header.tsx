import { useEffect, useMemo, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { useCatalog } from '../lib/hooks';
import { searchProducts } from '../lib/search';
import { ALL_CATEGORIES, categoryName, firstName } from '../lib/utils';
import { useStore } from '../store';
import { Icon } from './Icon';
import { Logo } from './Logo';

const NAV_LINKS = [
  { label: 'Ofertas do Dia', to: '/s?oferta=1' },
  { label: 'Mais Vendidos', to: '/s?sort=rating' },
  { label: 'Celulares', to: '/s?i=smartphones' },
  { label: 'Notebooks', to: '/s?i=laptops' },
  { label: 'Beleza', to: '/s?i=beauty' },
  { label: 'Perfumes', to: '/s?i=fragrances' },
  { label: 'Casa', to: '/s?i=home-decoration' },
  { label: 'Móveis', to: '/s?i=furniture' },
  { label: 'Cozinha', to: '/s?i=kitchen-accessories' },
  { label: 'Esportes', to: '/s?i=sports-accessories' },
  { label: 'Moda', to: '/s?i=womens-dresses' },
  { label: 'Supermercado', to: '/s?i=groceries' },
];

function BrazilFlag() {
  return (
    <svg width="20" height="14" viewBox="0 0 20 14" aria-hidden="true">
      <rect width="20" height="14" fill="#009c3b" />
      <path d="M10 1.6 18.4 7 10 12.4 1.6 7z" fill="#ffdf00" />
      <circle cx="10" cy="7" r="3" fill="#002776" />
    </svg>
  );
}

export function Header({ onOpenMenu }: { onOpenMenu: () => void }) {
  const { cartCount, user, signOut } = useStore();
  const { data: catalog } = useCatalog();
  const navigate = useNavigate();
  const location = useLocation();
  const input = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);

  // mantém a caixa de busca sincronizada com a URL da página de resultados
  useEffect(() => {
    if (location.pathname !== '/s') return;
    const params = new URLSearchParams(location.search);
    setQuery(params.get('k') ?? '');
    setCategory(params.get('i') ?? '');
  }, [location.pathname, location.search]);

  const suggestions = useMemo(
    () => (catalog && query.trim().length >= 2 ? searchProducts(catalog, query, category).slice(0, 8) : []),
    [catalog, query, category],
  );
  const showSuggestions = open && suggestions.length > 0;

  function close() {
    setOpen(false);
    setActive(-1);
    input.current?.blur();
  }

  function submit(e?: FormEvent) {
    e?.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set('k', query.trim());
    if (category) params.set('i', category);
    navigate(`/s?${params}`);
    close();
  }

  function openProduct(id: number) {
    navigate(`/dp/${id}`);
    close();
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Escape') return close();
    if (!showSuggestions) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => (i + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
    } else if (e.key === 'Enter' && active >= 0) {
      e.preventDefault();
      openProduct(suggestions[active].id);
    }
  }

  return (
    <header className="header">
      <div className="header__main">
        <button className="header__burger nav-hover" onClick={onOpenMenu} aria-label="Abrir menu">
          <Icon name="menu" size={26} />
        </button>

        <Link to="/" className="header__logo nav-hover" aria-label="Página inicial">
          <Logo />
        </Link>

        <Link to={user ? '/pedidos' : '/login'} className="header__location nav-hover">
          <Icon name="pin" size={18} />
          <span className="header__stack">
            <small>{user ? `Enviar para ${firstName(user.name)}` : 'Olá'}</small>
            <strong>{user ? 'Brasil' : 'Selecione o endereço'}</strong>
          </span>
        </Link>

        <form className={`search${showSuggestions ? ' search--open' : ''}`} onSubmit={submit} role="search">
          <label className="search__category">
            <span>{category ? categoryName(category) : 'Todos'}</span>
            <Icon name="chevronDown" size={12} />
            <select value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Departamento">
              <option value="">Todos os departamentos</option>
              {ALL_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {categoryName(c)}
                </option>
              ))}
            </select>
          </label>
          <input
            ref={input}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
              setActive(-1);
            }}
            onFocus={() => setOpen(true)}
            onBlur={() => setOpen(false)}
            onKeyDown={onKeyDown}
            placeholder="Pesquisa Amazon.com.br"
            aria-label="Pesquisar"
            autoComplete="off"
          />
          <button type="submit" className="search__button" aria-label="Pesquisar">
            <Icon name="search" size={22} />
          </button>
          {showSuggestions && (
            <ul className="search__suggestions" role="listbox">
              {suggestions.map((p, i) => (
                <li
                  key={p.id}
                  role="option"
                  aria-selected={i === active}
                  className={i === active ? 'is-active' : undefined}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    openProduct(p.id);
                  }}
                  onMouseEnter={() => setActive(i)}
                >
                  <Icon name="search" size={14} />
                  <span>{p.title}</span>
                  <small>em {categoryName(p.category)}</small>
                </li>
              ))}
            </ul>
          )}
        </form>

        <div className="header__lang nav-hover" title="Idioma: Português">
          <BrazilFlag /> <strong>PT</strong>
        </div>

        <div className="header__account nav-hover">
          <Link to={user ? '/pedidos' : '/login'} className="header__stack">
            <small>Olá, {user ? firstName(user.name) : 'faça seu login'}</small>
            <strong>
              Contas e Listas <Icon name="chevronDown" size={12} />
            </strong>
          </Link>
          <div className="account-menu">
            {user ? (
              <>
                <p>
                  Conectado como <b>{user.email}</b>
                </p>
                <Link to="/pedidos">Seus pedidos</Link>
                <Link to="/carrinho">Seu carrinho</Link>
                <button className="link-button" onClick={signOut}>
                  Sair da conta
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn--yellow btn--block">
                  Faça seu login
                </Link>
                <p>
                  Cliente novo? <Link to="/login">Comece aqui.</Link>
                </p>
              </>
            )}
          </div>
        </div>

        <Link to="/pedidos" className="header__orders nav-hover header__stack">
          <small>Devoluções</small>
          <strong>e Pedidos</strong>
        </Link>

        <Link to="/carrinho" className="header__cart nav-hover" aria-label={`Carrinho com ${cartCount} itens`}>
          <span className="header__cart-icon">
            <Icon name="cart" size={36} />
            <span className="header__cart-count">{cartCount > 99 ? '99+' : cartCount}</span>
          </span>
          <strong>Carrinho</strong>
        </Link>
      </div>

      <nav className="header__nav" aria-label="Departamentos">
        <button className="nav-hover header__all" onClick={onOpenMenu}>
          <Icon name="menu" size={20} /> Todos
        </button>
        {NAV_LINKS.map((l) => (
          <Link key={l.to} to={l.to} className="nav-hover">
            {l.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
