import { THEME } from '../../styles/theme';

export function Input({ label, error, ...props }) {
  return (
    <div className="w-full">
      {label && <label className={THEME.label}>{label}</label>}
      <input className={THEME.input} {...props} />
      {error && <p className="text-red-500 text-[10px] mt-1">{error}</p>}
    </div>
  );
}
