import { useRef, useState, type FormEvent, type InputHTMLAttributes } from 'react';
import { Link, Navigate, useNavigate } from 'react-router';
import { Icon } from '../components/Icon';
import { Price } from '../components/ui';
import { usePersistentState, useTitle } from '../lib/hooks';
import { deliveryDate, formatBRL } from '../lib/utils';
import { useStore, type Address, type PaymentMethod } from '../store';

const EMPTY_ADDRESS: Address = {
  name: '',
  phone: '',
  cep: '',
  street: '',
  number: '',
  complement: '',
  district: '',
  city: '',
  state: '',
};

const PAYMENT_OPTIONS: { value: PaymentMethod; label: string; detail: string }[] = [
  { value: 'pix', label: 'Pix', detail: 'Aprovação imediata. O código é gerado após a finalização.' },
  { value: 'cartao', label: 'Cartão de crédito', detail: 'Em até 10x sem juros.' },
  { value: 'boleto', label: 'Boleto bancário', detail: 'Compensação em até 3 dias úteis.' },
];

const digits = (value: string) => value.replace(/\D/g, '');
const maskCep = (value: string) => digits(value).slice(0, 8).replace(/^(\d{5})(\d)/, '$1-$2');
const maskPhone = (value: string) =>
  digits(value)
    .slice(0, 11)
    .replace(/^(\d{2})(\d)/, '($1) $2')
    .replace(/(\d)(\d{4})$/, '$1-$2');

type Errors = Partial<Record<keyof Address, string>>;

function validate(a: Address): Errors {
  const errors: Errors = {};
  if (a.name.trim().split(/\s+/).length < 2) errors.name = 'Informe nome e sobrenome.';
  if (digits(a.phone).length < 10) errors.phone = 'Informe um telefone com DDD.';
  if (digits(a.cep).length !== 8) errors.cep = 'Informe um CEP válido.';
  if (!a.street.trim()) errors.street = 'Informe o endereço.';
  if (!a.number.trim()) errors.number = 'Informe o número.';
  if (!a.district.trim()) errors.district = 'Informe o bairro.';
  if (!a.city.trim()) errors.city = 'Informe a cidade.';
  if (!/^[A-Za-z]{2}$/.test(a.state.trim())) errors.state = 'UF com 2 letras.';
  return errors;
}

export function Checkout() {
  useTitle('Finalizar compra');
  const navigate = useNavigate();
  const { user, cart, cartCount, cartSubtotal, shippingFee, placeOrder } = useStore();
  const [address, setAddress] = usePersistentState<Address>('amz:address', { ...EMPTY_ADDRESS, name: user?.name ?? '' });
  const [payment, setPayment] = useState<PaymentMethod>('pix');
  const [installments, setInstallments] = useState(1);
  const [errors, setErrors] = useState<Errors>({});
  const [cepStatus, setCepStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const placed = useRef(false);

  if (!user) return <Navigate to="/login?next=/checkout" replace />;
  if (!cart.length && !placed.current) return <Navigate to="/carrinho" replace />;

  const total = cartSubtotal + shippingFee;
  const maxInstallments = Math.min(10, Math.max(1, Math.floor(total / 20)));

  function setField(field: keyof Address, value: string) {
    setAddress((a) => ({ ...a, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
  }

  // preenche o endereço automaticamente pela API pública ViaCEP
  async function lookupCep(value: string) {
    const cep = digits(value);
    if (cep.length !== 8) return;
    setCepStatus('loading');
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await res.json();
      if (data.erro) throw new Error('CEP não encontrado');
      setAddress((a) => ({
        ...a,
        street: data.logradouro || a.street,
        district: data.bairro || a.district,
        city: data.localidade || a.city,
        state: data.uf || a.state,
      }));
      setErrors((e) => ({ ...e, cep: undefined, street: undefined, district: undefined, city: undefined, state: undefined }));
      setCepStatus('idle');
    } catch {
      setCepStatus('error');
    }
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    const found = validate(address);
    setErrors(found);
    if (Object.keys(found).length) {
      document.querySelector('.checkout__section')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    placed.current = true;
    const order = placeOrder({ ...address, state: address.state.toUpperCase() }, payment);
    navigate(`/pedidos?novo=${order.id}`, { replace: true });
  }

  const field = (name: keyof Address, label: string, props: InputHTMLAttributes<HTMLInputElement> = {}) => (
    <label className={`field field--${name}${errors[name] ? ' has-error' : ''}`}>
      <span>{label}</span>
      <input
        value={address[name]}
        onChange={(e) => setField(name, e.target.value)}
        aria-invalid={!!errors[name]}
        {...props}
      />
      {errors[name] && <small className="field__error">{errors[name]}</small>}
    </label>
  );

  return (
    <form className="checkout" onSubmit={submit} noValidate>
      <div className="checkout__steps">
        <section className="checkout__section">
          <h2>
            <span>1</span> Endereço de entrega
          </h2>
          <div className="checkout__grid">
            {field('name', 'Nome completo', { autoComplete: 'name' })}
            {field('phone', 'Telefone', {
              autoComplete: 'tel',
              inputMode: 'tel',
              placeholder: '(11) 91234-5678',
              onChange: (e) => setField('phone', maskPhone(e.target.value)),
            })}
            <label className={`field field--cep${errors.cep ? ' has-error' : ''}`}>
              <span>CEP</span>
              <input
                value={address.cep}
                inputMode="numeric"
                autoComplete="postal-code"
                placeholder="00000-000"
                aria-invalid={!!errors.cep}
                onChange={(e) => {
                  const cep = maskCep(e.target.value);
                  setField('cep', cep);
                  lookupCep(cep);
                }}
              />
              {cepStatus === 'loading' && <small className="muted">Buscando endereço...</small>}
              {cepStatus === 'error' && <small className="field__error">CEP não encontrado. Preencha manualmente.</small>}
              {errors.cep && <small className="field__error">{errors.cep}</small>}
              <a href="https://buscacepinter.correios.com.br/" target="_blank" rel="noreferrer">
                Não sei meu CEP
              </a>
            </label>
            {field('street', 'Endereço', { autoComplete: 'address-line1', placeholder: 'Rua, avenida...' })}
            {field('number', 'Número')}
            {field('complement', 'Complemento (opcional)', { placeholder: 'Apto, bloco...' })}
            {field('district', 'Bairro')}
            {field('city', 'Cidade', { autoComplete: 'address-level2' })}
            {field('state', 'Estado (UF)', { maxLength: 2, autoComplete: 'address-level1' })}
          </div>
        </section>

        <section className="checkout__section">
          <h2>
            <span>2</span> Forma de pagamento
          </h2>
          <div className="payment-options">
            {PAYMENT_OPTIONS.map((option) => (
              <label key={option.value} className={`payment-option${payment === option.value ? ' is-selected' : ''}`}>
                <input
                  type="radio"
                  name="payment"
                  value={option.value}
                  checked={payment === option.value}
                  onChange={() => setPayment(option.value)}
                />
                <span>
                  <strong>{option.label}</strong>
                  <small>{option.detail}</small>
                  {option.value === 'cartao' && payment === 'cartao' && (
                    <select value={installments} onChange={(e) => setInstallments(Number(e.target.value))}>
                      {Array.from({ length: maxInstallments }, (_, i) => i + 1).map((n) => (
                        <option key={n} value={n}>
                          {n}x de {formatBRL(total / n)} sem juros
                        </option>
                      ))}
                    </select>
                  )}
                </span>
              </label>
            ))}
          </div>
          <p className="checkout__note">
            <Icon name="lock" size={14} /> Pagamento simulado: nenhum dado bancário é solicitado ou enviado.
          </p>
        </section>

        <section className="checkout__section">
          <h2>
            <span>3</span> Revise os itens e a entrega
          </h2>
          <p className="checkout__delivery">
            <Icon name="truck" size={18} /> Chegará {shippingFee ? deliveryDate(5) : deliveryDate(3)}
          </p>
          <ul className="checkout__items">
            {cart.map(({ product, qty }) => (
              <li key={product.id}>
                <img src={product.thumbnail} alt="" />
                <div>
                  <Link to={`/dp/${product.id}`}>{product.title}</Link>
                  <Price usd={product.price} size="sm" />
                  <small>Quantidade: {qty}</small>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <aside className="checkout__summary panel">
        <button type="submit" className="btn btn--yellow btn--block btn--round">
          Finalizar pedido
        </button>
        <p className="muted checkout__terms">
          Ao finalizar seu pedido, você concorda com as Condições de Uso e Venda deste projeto de demonstração.
        </p>
        <h3>Resumo do pedido</h3>
        <dl>
          <dt>Itens ({cartCount}):</dt>
          <dd>{formatBRL(cartSubtotal)}</dd>
          <dt>Frete e manuseio:</dt>
          <dd>{shippingFee ? formatBRL(shippingFee) : 'GRÁTIS'}</dd>
          <dt className="checkout__total">Total do pedido:</dt>
          <dd className="checkout__total">{formatBRL(total)}</dd>
        </dl>
        {payment === 'cartao' && installments > 1 && (
          <p className="muted">
            {installments}x de {formatBRL(total / installments)} sem juros
          </p>
        )}
      </aside>
    </form>
  );
}
