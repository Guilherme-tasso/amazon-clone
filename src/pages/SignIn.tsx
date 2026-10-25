import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { Logo } from '../components/Logo';
import { useTitle } from '../lib/hooks';
import { useStore } from '../store';

export function SignIn() {
  useTitle('Fazer login');
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { signIn } = useStore();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // só aceita caminhos internos para evitar redirecionamentos para outros sites
  const nextParam = params.get('next') ?? '/';
  const next = nextParam.startsWith('/') && !nextParam.startsWith('//') ? nextParam : '/';

  function submit(e: FormEvent) {
    e.preventDefault();
    const found: Record<string, string> = {};
    if (form.name.trim().length < 2) found.name = 'Informe seu nome.';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) found.email = 'Informe um e-mail válido.';
    if (form.password.length < 6) found.password = 'A senha precisa ter pelo menos 6 caracteres.';
    setErrors(found);
    if (Object.keys(found).length) return;
    // login simulado: guardamos só nome e e-mail no navegador; a senha é descartada
    signIn({ name: form.name.trim(), email: form.email.trim() });
    navigate(next, { replace: true });
  }

  const update = (key: keyof typeof form) => (e: ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setErrors((errs) => ({ ...errs, [key]: '' }));
  };

  return (
    <div className="auth">
      <Link to="/" className="auth__logo" aria-label="Página inicial">
        <Logo dark />
      </Link>
      <form className="auth__box" onSubmit={submit} noValidate>
        <h1>Fazer login ou criar conta</h1>
        <label className={`field${errors.name ? ' has-error' : ''}`}>
          <span>Seu nome</span>
          <input value={form.name} onChange={update('name')} autoComplete="name" placeholder="Nome e sobrenome" />
          {errors.name && <small className="field__error">{errors.name}</small>}
        </label>
        <label className={`field${errors.email ? ' has-error' : ''}`}>
          <span>E-mail</span>
          <input type="email" value={form.email} onChange={update('email')} autoComplete="email" />
          {errors.email && <small className="field__error">{errors.email}</small>}
        </label>
        <label className={`field${errors.password ? ' has-error' : ''}`}>
          <span>Senha</span>
          <input
            type="password"
            value={form.password}
            onChange={update('password')}
            autoComplete="new-password"
            placeholder="Pelo menos 6 caracteres"
          />
          {errors.password && <small className="field__error">{errors.password}</small>}
        </label>
        <button type="submit" className="btn btn--yellow btn--block btn--round">
          Continuar
        </button>
        <p className="auth__legal">
          Ao continuar, você concorda com as Condições de Uso e o Aviso de Privacidade deste projeto de demonstração.
        </p>
        <p className="auth__note">
          Login simulado: nenhuma informação é enviada a servidores e a senha não é armazenada.
        </p>
      </form>
      <footer className="auth__footer">
        <Link to="/">Voltar para a loja</Link>
        <span>Projeto de portfólio · não afiliado à Amazon</span>
      </footer>
    </div>
  );
}
