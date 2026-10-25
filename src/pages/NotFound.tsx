import { Link } from 'react-router';
import { useTitle } from '../lib/hooks';

export function NotFound() {
  useTitle('Página não encontrada');
  return (
    <div className="not-found">
      <p className="not-found__code">404</p>
      <h1>Desculpe, não encontramos esta página.</h1>
      <p>O endereço pode estar errado ou o produto não está mais disponível.</p>
      <Link to="/" className="btn btn--yellow">
        Ir para a página inicial
      </Link>
    </div>
  );
}
