import { useCallback, useEffect, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router';
import { CartToast } from './CartToast';
import { Footer } from './Footer';
import { Header } from './Header';
import { Icon } from './Icon';
import { Logo } from './Logo';
import { SideMenu } from './SideMenu';

export function Layout() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  useEffect(() => {
    setMenuOpen(false);
    window.scrollTo(0, 0);
  }, [location.pathname, location.search]);

  return (
    <>
      <Header onOpenMenu={() => setMenuOpen(true)} />
      <SideMenu open={menuOpen} onClose={closeMenu} />
      <main className="main">
        <Outlet />
      </main>
      <Footer />
      <CartToast />
    </>
  );
}

/** Cabeçalho reduzido usado no checkout, como na Amazon. */
export function CheckoutLayout() {
  return (
    <>
      <header className="checkout-header">
        <Link to="/" aria-label="Página inicial">
          <Logo dark />
        </Link>
        <h1>Finalizar compra</h1>
        <Icon name="lock" size={22} />
      </header>
      <main className="main main--checkout">
        <Outlet />
      </main>
    </>
  );
}
