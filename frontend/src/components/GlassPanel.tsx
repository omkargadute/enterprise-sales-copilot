import type { ReactNode } from 'react';

interface GlassPanelProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'strong' | 'subtle';
  animate?: boolean;
  delay?: number;
}

const variantClass = {
  default: 'glass',
  strong: 'glass-strong',
  subtle: 'glass-subtle',
} as const;

export function GlassPanel({
  children,
  className = '',
  variant = 'default',
  animate = false,
  delay = 0,
}: GlassPanelProps) {
  return (
    <div
      className={`rounded-xl overflow-hidden ${variantClass[variant]} ${
        animate ? 'animate-panel-enter' : ''
      } ${className}`}
      style={animate ? { animationDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}

interface PanelHeaderProps {
  title: string;
  subtitle?: string;
  badge?: ReactNode;
  action?: ReactNode;
}

export function PanelHeader({ title, subtitle, badge, action }: PanelHeaderProps) {
  return (
    <div className="px-4 sm:px-5 py-3.5 border-b border-border flex items-center justify-between shrink-0 gap-3">
      <div className="min-w-0">
        <h2 className="text-sm font-semibold text-text-primary tracking-tight">{title}</h2>
        {subtitle && (
          <p className="text-xs text-text-muted mt-0.5 truncate">{subtitle}</p>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {badge}
        {action}
      </div>
    </div>
  );
}
