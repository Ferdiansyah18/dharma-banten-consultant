export function Brand({ dark = false, onClick }: { dark?: boolean; onClick?: () => void }) {
  return (
    <button
      className={`brand ${dark ? 'brand-dark' : ''}`}
      onClick={onClick}
      aria-label="Dharma Banten home"
    >
      <span className="brand-monogram">DB</span>
      <span className="brand-words">
        <strong>Dharma Banten</strong>
        <small>Konsultan</small>
      </span>
    </button>
  );
}
