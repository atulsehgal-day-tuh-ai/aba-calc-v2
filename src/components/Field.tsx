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
      <span className="text-sm font-medium text-muted mb-1 block">{label}</span>
      {children}
      {hint && <span className="text-xs text-dim mt-1 block">{hint}</span>}
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
        className={`w-full bg-bg border border-border rounded-lg px-3 py-2 text-text placeholder:text-dim
          focus:border-border-focus focus:outline-none focus:ring-1 focus:ring-border-focus transition ${className ?? ''}`}
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
        className={`w-full bg-bg border border-border rounded-lg px-3 py-2 text-text
          focus:border-border-focus focus:outline-none focus:ring-1 focus:ring-border-focus transition ${className ?? ''}`}
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
