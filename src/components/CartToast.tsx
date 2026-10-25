import { useEffect } from 'react';
import { Link } from 'react-router';
import { formatBRL } from '../lib/utils';
import { useStore } from '../store';
import { Icon } from './Icon';

/** Aviso flutuante exibido depois de adicionar um item ao carrinho. */
export function CartToast() {
  const { toast, dismissToast, cartSubtotal, cartCount } = useStore();

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(dismissToast, 4500);
    return () => clearTimeout(timer);
  }, [toast, dismissToast]);

  if (!toast) return null;

  return (
    <div className="cart-toast" role="status" key={toast.key}>
      <img src={toast.product.thumbnail} alt="" />
      <div className="cart-toast__text">
        <p className="cart-toast__ok">
          <Icon name="check" size={18} /> Adicionado ao carrinho
        </p>
        <p>
          Subtotal ({cartCount} {cartCount === 1 ? 'item' : 'itens'}): <b>{formatBRL(cartSubtotal)}</b>
        </p>
      </div>
      <Link to="/carrinho" className="btn btn--yellow btn--sm" onClick={dismissToast}>
        Ir para o carrinho
      </Link>
      <button className="cart-toast__close" onClick={dismissToast} aria-label="Fechar aviso">
        <Icon name="x" size={16} />
      </button>
    </div>
  );
}
