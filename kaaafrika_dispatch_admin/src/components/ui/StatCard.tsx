import { type LucideIcon } from 'lucide-react';
import { clsx } from 'clsx';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  trend?: number; // percent change, positive or negative
  loading?: boolean;
  className?: string;
}

export function StatCard({
  label,
  value,
  icon: Icon,
  iconColor = 'text-brand-500',
  iconBg = 'bg-brand-50',
  trend,
  loading = false,
  className,
}: StatCardProps) {
  if (loading) {
    return (
      <div className={clsx('card p-5 animate-pulse', className)}>
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <div className="h-3 w-24 bg-slate-200 rounded" />
            <div className="h-7 w-16 bg-slate-200 rounded" />
          </div>
          <div className="w-10 h-10 bg-slate-200 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={clsx(
        'card p-5 cursor-default hover:shadow-card-hover transition-shadow duration-200 animate-fade-in',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1 flex-1">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</p>
          <p className="text-2xl font-bold text-slate-800 tabular-nums">{value}</p>
          {trend !== undefined && (
            <p
              className={clsx(
                'text-xs font-medium flex items-center gap-1',
                trend >= 0 ? 'text-emerald-600' : 'text-red-500'
              )}
            >
              <span>{trend >= 0 ? '↑' : '↓'}</span>
              <span>{Math.abs(trend)}% vs last period</span>
            </p>
          )}
        </div>
        <div className={clsx('p-2.5 rounded-xl', iconBg)}>
          <Icon className={clsx('w-5 h-5', iconColor)} />
        </div>
      </div>
    </div>
  );
}
