import { clsx } from 'clsx';

type BadgeVariant =
  | 'green'
  | 'red'
  | 'yellow'
  | 'blue'
  | 'slate'
  | 'orange'
  | 'emerald'
  | 'purple';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  dot?: boolean;
  className?: string;
}

const variantMap: Record<BadgeVariant, string> = {
  green:   'bg-emerald-50 text-emerald-700 border-emerald-200',
  emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  red:     'bg-red-50 text-red-700 border-red-200',
  yellow:  'bg-amber-50 text-amber-700 border-amber-200',
  blue:    'bg-blue-50 text-blue-700 border-blue-200',
  slate:   'bg-slate-100 text-slate-600 border-slate-200',
  orange:  'bg-orange-50 text-orange-700 border-orange-200',
  purple:  'bg-purple-50 text-purple-700 border-purple-200',
};

const dotMap: Record<BadgeVariant, string> = {
  green:   'bg-emerald-500',
  emerald: 'bg-emerald-500',
  red:     'bg-red-500',
  yellow:  'bg-amber-500',
  blue:    'bg-blue-500',
  slate:   'bg-slate-400',
  orange:  'bg-orange-500',
  purple:  'bg-purple-500',
};

export function Badge({ label, variant = 'slate', dot = false, className }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border',
        variantMap[variant],
        className
      )}
    >
      {dot && (
        <span className={clsx('w-1.5 h-1.5 rounded-full', dotMap[variant])} />
      )}
      {label}
    </span>
  );
}

// Helper: map delivery status → badge variant
export function deliveryStatusBadge(status: string) {
  const map: Record<string, { label: string; variant: BadgeVariant }> = {
    pending:    { label: 'Pending',    variant: 'yellow' },
    assigned:   { label: 'Assigned',   variant: 'blue'   },
    accepted:   { label: 'Accepted',   variant: 'blue'   },
    picked_up:  { label: 'Picked Up',  variant: 'orange' },
    delivering: { label: 'Delivering', variant: 'purple' },
    delivered:  { label: 'Delivered',  variant: 'green'  },
    cancelled:  { label: 'Cancelled',  variant: 'red'    },
  };
  return map[status] ?? { label: status, variant: 'slate' as BadgeVariant };
}

export function paymentStatusBadge(status: string) {
  const map: Record<string, { label: string; variant: BadgeVariant }> = {
    paid:    { label: 'Paid',    variant: 'green'  },
    pending: { label: 'Pending', variant: 'yellow' },
    failed:  { label: 'Failed',  variant: 'red'    },
  };
  return map[status] ?? { label: status, variant: 'slate' as BadgeVariant };
}

export function dispatcherStatusBadge(isApproved: boolean, onboardingStatus: string) {
  if (isApproved && onboardingStatus === 'approved') {
    return { label: 'Active', variant: 'green' as BadgeVariant };
  }
  if (!isApproved && onboardingStatus === 'approved') {
    return { label: 'Suspended', variant: 'red' as BadgeVariant };
  }
  return { label: 'Pending', variant: 'yellow' as BadgeVariant };
}
