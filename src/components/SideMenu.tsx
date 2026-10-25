import { useEffect } from 'react';
import { Link } from 'react-router';
import { CATEGORY_GROUPS, categoryName, firstName } from '../lib/utils';
import { useStore } from '../store';
import { Icon } from './Icon';

export function SideMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user, signOut } = useStore();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  return (
    <div className={`side-menu${open ? ' is-open' : ''}`} aria-hidden={!open} inert={!open}>
      <div className="side-menu__backdrop" onClick={onClose} />
      <button className="side-menu__close" onClick={onClose} aria-label="Fechar menu">
        <Icon name="x" size={30} />
      </button>
      <aside className="side-menu__panel" aria-label="Menu principal">
        <Link to={user ? '/pedidos' : '/login'} className="side-menu__head">
          <Icon name="user" size={26} /> Olá, {user ? firstName(user.name) : 'faça seu login'}
        </Link>
        <div className="side-menu__body">
          <section>
            <h3>Destaques</h3>
            <Link to="/s?oferta=1">Ofertas do Dia</Link>
            <Link to="/s?sort=rating">Mais bem avaliados</Link>
          </section>
          {CATEGORY_GROUPS.map((group) => (
            <section key={group.title}>
              <h3>{group.title}</h3>
              {group.items.map((slug) => (
                <Link key={slug} to={`/s?i=${slug}`}>
                  {categoryName(slug)}
                  <Icon name="chevronRight" size={18} />
                </Link>
              ))}
            </section>
          ))}
          <section>
            <h3>Ajuda e configurações</h3>
            <Link to="/pedidos">Seus pedidos</Link>
            <Link to="/carrinho">Carrinho</Link>
            {user ? (
              <button className="side-menu__link" onClick={signOut}>
                Sair
              </button>
            ) : (
              <Link to="/login">Fazer login</Link>
            )}
          </section>
        </div>
      </aside>
    </div>
  );
}
