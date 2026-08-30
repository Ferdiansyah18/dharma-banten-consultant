export function Brand({
  dark = false,
  onClick,
  showText = true,
}: {
  dark?: boolean;
  onClick?: () => void;
  showText?: boolean;
}) {
  return (
    <button
      type="button"
      className={`brand ${dark ? 'brand-dark' : ''}`}
      onClick={onClick}
      aria-label="Dharma Banten home"
    >
      <img
        src="/images/logo_dharma_banten_consultant.svg"
        alt="Logo Dharma Banten"
        className="brand-logo-img"
        width="36"
        height="36"
      />
      {showText && (
        <span className="brand-words">
          <strong>Dharma Banten</strong>
          <small>Konsultan</small>
        </span>
      )}
    </button>
  );
}

