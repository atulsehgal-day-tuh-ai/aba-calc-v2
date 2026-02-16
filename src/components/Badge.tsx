import type { ReactNode } from 'react';

interface BadgeProps {
  variant?: 'success' | 'danger' | 'warn' | 'info' | 'purple' | 'default';
  children: ReactNode;
}

const styles: Record<string, string> = {
  success: 'bg-success-light text-success',
  danger:  'bg-critical-light text-critical',
  warn:    'bg-warning-light text-warning',
  info:    'bg-info-light text-info',
  purple:  'bg-[#F3E8FF] text-[#7C3AED]',
  default: 'bg-[#F0F4F8] text-text-secondary',
};

export function Badge({ variant = 'default', children }: BadgeProps) {
  return (
    <span className={`badge-pill ${styles[variant] || styles.default}`}>
      {children}
    </span>
  );
}
