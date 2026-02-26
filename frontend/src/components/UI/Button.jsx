import { THEME } from '../../styles/theme';

export function Button({ variant = 'primary', children, ...props }) {
  const className = THEME.button[variant] || THEME.button.primary;
  return (
    <button className={className} {...props}>
      {children}
    </button>
  );
}
