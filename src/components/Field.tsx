import type { ReactNode, InputHTMLAttributes, SelectHTMLAttributes } from 'react';

interface FieldProps {
  label: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}

export function Field({ label, hint, children, className = '' }: FieldProps) {
  return (
    <label className={`block ${className}`}>
      <span className="text-xs font-medium text-text-secondary uppercase tracking-[0.5px] mb-1.5 block">{label}</span>
      {children}
      {hint && <span className="text-xs text-text-secondary mt-1 block">{hint}</span>}
    </label>
  );
}

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
}

export function InputField({ label, hint, className, ...props }: InputFieldProps) {
  return (
    <Field label={label} hint={hint}>
      <input
        className={`w-full bg-card border-[1.5px] border-border-input rounded-lg px-3 py-2.5 text-sm text-body
          placeholder:text-placeholder
          focus:border-border-focus focus:outline-none focus:shadow-[0_0_0_3px_rgba(11,111,164,0.15)]
          transition-all duration-200 ${className ?? ''}`}
        {...props}
      />
    </Field>
  );
}

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  hint?: string;
  options: { value: string; label: string }[];
}

export function SelectField({ label, hint, options, className, ...props }: SelectFieldProps) {
  return (
    <Field label={label} hint={hint}>
      <select
        className={`w-full bg-card border-[1.5px] border-border-input rounded-lg px-3 py-2.5 text-sm text-body
          placeholder:text-placeholder
          focus:border-border-focus focus:outline-none focus:shadow-[0_0_0_3px_rgba(11,111,164,0.15)]
          transition-all duration-200 ${className ?? ''}`}
        {...props}
      >
        <option value="">Select…</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </Field>
  );
}
