import { cn } from '@/lib/utils';

interface LiveBadgeProps {
  className?: string;
}

const LiveBadge = ({ className }: LiveBadgeProps) => (
  <span
    className={cn(
      'inline-flex items-center gap-1.5 rounded-full bg-energy-coralDeep px-2.5 py-1 text-xs font-semibold uppercase leading-none tracking-wider text-white',
      className,
    )}
  >
    <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-white motion-safe:animate-pulse" />
    EN VIVO
  </span>
);

export default LiveBadge;
