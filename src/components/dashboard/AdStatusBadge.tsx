import type { AnnouncementStatus } from '@/types';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type StatusConfig = {
  label: string;
  variant: 'default' | 'secondary';
};

const STATUS_CONFIG: Record<AnnouncementStatus, StatusConfig> = {
  active: {
    label: 'AKTYWNE',
    variant: 'default',
  },
  resolved: {
    label: 'ZNALEZIONE',
    variant: 'secondary',
  },
};

interface AdStatusBadgeProps {
  status: AnnouncementStatus;
  className?: string;
}

export function AdStatusBadge({ status, className }: AdStatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.active;

  return (
    <Badge
      variant={config.variant}
      className={cn('text-xs font-semibold uppercase tracking-wide', className)}
    >
      {config.label}
    </Badge>
  );
}


