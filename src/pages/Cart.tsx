import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router';
import { Icon } from '../components/Icon';
import { ProductRow } from '../components/ProductRow';
import { Price } from '../components/ui';
import { useCatalog, useTitle } from '../lib/hooks';
import { FREE_SHIPPING_MIN, categoryName, formatBRL } from '../lib/utils';
import { useStore } from '../store';

export function Cart() {
  useTitle('Carrinho de compras');
  const navigate = useNavigate();
  const { cart, cartCount, cartSubtotal, updateQty, removeFromCart, user, recentlyViewed } = useStore();
  const { data: catalog } = useCatalog();

  const suggestions = useMemo(() => {
    if (!catalog) return [];
    const inCart = new Set(cart.map((i) => i.product.id));
    const categories = new Set(cart.map((i) => i.product.category));
    return catalog
      .filter((p) => !inCart.has(p.id) && (categories.size === 0 || categories.has(p.category)))
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 20);
  }, [catalog, cart]);

  const missingForFreeShipping = FREE_SHIPPING_MIN - cartSubtotal;
  const itemsLabel = `${cartCount} ${cartCount === 1 ? 'produto' : 'produtos'}`;
  const checkout = () => navigate(user ? '/checkout' : '/login?next=/checkout');

  if (!cart.length) {
    return (
      <div className="cart-page">
        <div className="panel cart-empty">
          <img src="https://cdn.dummyjson.com/product-images/groceries/apple/thumbnail.webp" alt="" />
          <div>
            <h1>Seu carrinho da Amazon está vazio</h1>
            <Link to="/s?oferta=1">Confira as Ofertas do Dia</Link>
            {!user && (
              <div className="cart-empty__actions">
                <Link to="/login" className="btn btn--yellow">
                  Faça login na sua conta
                </Link>
                <Link to="/login" className="btn btn--white">
                  Cadastre-se agora
                </Link>
              </div>
            )}
          </div>
        </div>
        <ProductRow title="Os mais bem avaliados" products={suggestions} showPrice />
        {recentlyViewed.length > 0 && (
          <ProductRow title="Seus itens vistos recentemente" products={recentlyViewed} showPrice />
        )}
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-layout">
        <section className="panel cart-items">
          <h1>Carrinho de compras</h1>
          <p className="cart-items__price-label">Preço</p>
          {cart.map(({ product, qty }) => (
            <article key={product.id} className="cart-item">
              <Link to={`/dp/${product.id}`} className="cart-item__image">
                <img src={product.thumbnail} alt={product.title} />
              </Link>
              <div className="cart-item__info">
                <Link to={`/dp/${product.id}`} className="cart-item__title">
                  {product.title}
                </Link>
                <span className={product.stock < 10 ? 'cart-item__stock cart-item__stock--low' : 'cart-item__stock'}>
                  {product.stock < 10 ? `Apenas ${product.stock} em estoque` : 'Em estoque'}
                </span>
                <span className="muted">Enviado por Amazon · {categoryName(product.category)}</span>
                <div className="cart-item__actions">
                  <div className="stepper">
                    <button onClick={() => updateQty(product.id, qty - 1)} aria-label={qty === 1 ? 'Remover' : 'Diminuir quantidade'}>
                      <Icon name={qty === 1 ? 'trash' : 'minus'} size={16} />
                    </button>
                    <span aria-live="polite">{qty}</span>
                    <button
                      onClick={() => updateQty(product.id, qty + 1)}
                      disabled={qty >= Math.min(product.stock, 30)}
                      aria-label="Aumentar quantidade"
                    >
                      <Icon name="plus" size={16} />
                    </button>
                  </div>
                  <button className="link-button" onClick={() => removeFromCart(product.id)}>
                    Excluir
                  </button>
                  <Link to={`/s?i=${product.category}`}>Ver mais como este</Link>
                </div>
              </div>
              <div className="cart-item__price">
                <Price usd={product.price * qty} size="sm" />
              </div>
            </article>
          ))}
          <p className="cart-items__subtotal">
            Subtotal ({itemsLabel}): <b>{formatBRL(cartSubtotal)}</b>
          </p>
        </section>

        <aside className="panel cart-summary">
          {missingForFreeShipping > 0 ? (
            <div className="free-shipping">
              <div className="free-shipping__bar">
                <span style={{ width: `${(cartSubtotal / FREE_SHIPPING_MIN) * 100}%` }} />
              </div>
              <p>
                Adicione <b>{formatBRL(missingForFreeShipping)}</b> em produtos para ganhar <b>frete GRÁTIS</b>.
              </p>
            </div>
          ) : (
            <p className="free-shipping free-shipping--ok">
              <Icon name="check" size={18} />
              <span>
                Seu pedido se qualifica para <b>frete GRÁTIS</b>.
              </span>
            </p>
          )}
          <p className="cart-summary__total">
            Subtotal ({itemsLabel}): <b>{formatBRL(cartSubtotal)}</b>
          </p>
          <button className="btn btn--yellow btn--block btn--round" onClick={checkout}>
            Fechar pedido
          </button>
        </aside>
      </div>

      <ProductRow title="Clientes que compraram estes itens também compraram" products={suggestions} showPrice />
    </div>
  );
}
