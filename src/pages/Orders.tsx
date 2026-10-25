import { Link, useSearchParams } from 'react-router';
import { Icon } from '../components/Icon';
import { useTitle } from '../lib/hooks';
import { formatBRL, formatDate } from '../lib/utils';
import { useStore, type Order } from '../store';

const PAYMENT_LABELS = { pix: 'Pix', boleto: 'Boleto bancário', cartao: 'Cartão de crédito' };

function arrival(order: Order) {
  const date = new Date(order.date);
  date.setDate(date.getDate() + (order.shipping ? 5 : 3));
  const delivered = date < new Date();
  const label = date.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
  return delivered ? `Entregue em ${label}` : `Chegará ${label}`;
}

export function Orders() {
  useTitle('Seus pedidos');
  const [params] = useSearchParams();
  const { orders, user, addToCart } = useStore();
  const justPlaced = orders.find((o) => o.id === params.get('novo'));

  return (
    <div className="orders-page">
      <nav className="breadcrumb">
        <Link to="/">Sua conta</Link>
        <Icon name="chevronRight" size={12} />
        <span className="breadcrumb__current">Seus pedidos</span>
      </nav>
      <h1>Seus pedidos</h1>

      {justPlaced && (
        <div className="alert alert--success" role="status">
          <Icon name="check" size={24} />
          <div>
            <h2>Pedido realizado, obrigado!</h2>
            <p>
              A confirmação seria enviada para <b>{user?.email}</b>. Pedido nº <b>{justPlaced.id}</b> —{' '}
              {arrival(justPlaced).toLowerCase()}.
            </p>
          </div>
        </div>
      )}

      {orders.length === 0 ? (
        <div className="panel orders-empty">
          <p>Você ainda não fez nenhum pedido.</p>
          <Link to="/" className="btn btn--yellow">
            Começar a comprar
          </Link>
        </div>
      ) : (
        <p className="muted">
          <b>{orders.length} {orders.length === 1 ? 'pedido realizado' : 'pedidos realizados'}</b>
        </p>
      )}

      {orders.map((order) => (
        <article key={order.id} className="order">
          <header className="order__head">
            <div>
              <small>Pedido realizado</small>
              <span>{formatDate(order.date)}</span>
            </div>
            <div>
              <small>Total</small>
              <span>{formatBRL(order.subtotal + order.shipping)}</span>
            </div>
            <div className="order__ship-to">
              <small>Enviar para</small>
              <span title={`${order.address.street}, ${order.address.number} — ${order.address.city}/${order.address.state}`}>
                {order.address.name}
              </span>
            </div>
            <div className="order__id">
              <small>Pedido nº {order.id}</small>
              <span>{PAYMENT_LABELS[order.payment]}</span>
            </div>
          </header>
          <div className="order__body">
            <h3>{arrival(order)}</h3>
            {order.items.map(({ product, qty }) => (
              <div key={product.id} className="order__item">
                <img src={product.thumbnail} alt="" />
                <div>
                  <Link to={`/dp/${product.id}`}>{product.title}</Link>
                  <small className="muted">Quantidade: {qty}</small>
                  <div className="order__actions">
                    <button className="btn btn--yellow btn--sm" onClick={() => addToCart(product)}>
                      Comprar novamente
                    </button>
                    <Link to={`/dp/${product.id}`} className="btn btn--white btn--sm">
                      Ver item
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </article>
      ))}
    </div>
  );
}
