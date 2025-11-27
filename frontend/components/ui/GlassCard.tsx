import { cn } from '@/lib/utils';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
}

export function GlassCard({ children, className }: GlassCardProps) {
  return (
    <div className={cn(
      'bg-white/10 backdrop-blur-md border border-white/20 rounded-lg shadow-xl',
      className
    )}>
      {children}
    </div>
  );
}