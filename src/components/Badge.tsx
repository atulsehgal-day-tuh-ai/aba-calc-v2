interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warn' | 'danger' | 'info' | 'purple' | 'teal' | 'muted';
  className?: string;
}

const variantStyles: Record<string, string> = {
  success: 'bg-success-soft text-success',
  warn: 'bg-warn-soft text-warn',
  danger: 'bg-danger-soft text-danger',
  info: 'bg-clinic-soft text-clinic',
  purple: 'bg-purple-soft text-purple',
  teal: 'bg-teal-soft text-teal',
  muted: 'bg-border text-muted',
};

export function Badge({ children, variant = 'muted', className = '' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variantStyles[variant]} ${className}`}>
      {children}
    </span>
  );
}
