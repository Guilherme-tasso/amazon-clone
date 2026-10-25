import { Link } from 'react-router';
import { Logo } from './Logo';

const COLUMNS = [
  {
    title: 'Conheça-nos',
    links: [
      ['Informações corporativas', '/'],
      ['Carreiras', '/'],
      ['Comunicados à imprensa', '/'],
      ['Comunidade', '/'],
      ['Acessibilidade', '/'],
    ],
  },
  {
    title: 'Ganhe dinheiro conosco',
    links: [
      ['Venda na Amazon', '/'],
      ['Seja um associado', '/'],
      ['Anuncie seus produtos', '/'],
      ['Hospede um Amazon Hub', '/'],
    ],
  },
  {
    title: 'Pagamento',
    links: [
      ['Cartões de crédito', '/'],
      ['Pix', '/'],
      ['Boleto bancário', '/'],
      ['Parcelamento sem juros', '/'],
    ],
  },
  {
    title: 'Deixe-nos ajudar você',
    links: [
      ['Sua conta', '/pedidos'],
      ['Frete e prazo de entrega', '/'],
      ['Devoluções e reembolsos', '/pedidos'],
      ['Gerencie seu carrinho', '/carrinho'],
      ['Ajuda', '/'],
    ],
  },
];

export function Footer() {
  return (
    <footer className="footer">
      <button className="footer__top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
        Voltar ao início
      </button>
      <div className="footer__columns">
        {COLUMNS.map((col) => (
          <div key={col.title}>
            <h3>{col.title}</h3>
            <ul>
              {col.links.map(([label, to]) => (
                <li key={label}>
                  <Link to={to}>{label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="footer__brand">
        <Link to="/" aria-label="Página inicial">
          <Logo />
        </Link>
        <span className="footer__pill">Português</span>
        <span className="footer__pill">R$ BRL – Real</span>
        <span className="footer__pill">Brasil</span>
      </div>
      <div className="footer__bottom">
        <p>
          Projeto de portfólio sem fins comerciais, feito com React + TypeScript. Não é afiliado à Amazon.com, Inc.
          Dados e imagens de produtos fornecidos pela API pública <a href="https://dummyjson.com">DummyJSON</a>.
        </p>
        <p>Pedidos, pagamentos e login são apenas simulações — nenhum dado sai do seu navegador.</p>
      </div>
    </footer>
  );
}
