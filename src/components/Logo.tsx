export function Logo({ dark = false }: { dark?: boolean }) {
  return (
    <span className={`logo${dark ? ' logo--dark' : ''}`} aria-label="amazon.com.br">
      <span className="logo__word">amazon</span>
      <span className="logo__tld">.com.br</span>
      <svg className="logo__smile" viewBox="0 0 100 22" aria-hidden="true">
        <path d="M3 4 Q48 24 90 7" fill="none" stroke="#ff9900" strokeWidth="5" strokeLinecap="round" />
        <path d="M80 3.5 L92 6 L87 16" fill="none" stroke="#ff9900" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}
