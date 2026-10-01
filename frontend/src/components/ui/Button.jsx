/** @param {{children: import('react').ReactNode, variant?: 'primary'|'secondary'|'ghost'|'danger', type?: 'button'|'submit', disabled?: boolean, onClick?: () => void, ariaLabel?: string}} props */
export default function Button({
  children,
  variant = "secondary",
  type = "button",
  disabled = false,
  onClick,
  ariaLabel,
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      aria-label={ariaLabel}
      className={`button button-${variant}`}
    >
      {children}
    </button>
  );
}
