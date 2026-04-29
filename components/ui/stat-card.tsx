import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DivideIcon as LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface StatCardProps {
  title: ReactNode;
  value: string | number;
  icon: typeof LucideIcon;
  description?: ReactNode;
  valueSuffix?: string;
  accentClassName?: string; // e.g. 'bg-blue-100 text-blue-600'
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  description,
  valueSuffix,
  accentClassName,
  trend,
  className,
}: StatCardProps) {
  return (
    <Card className={cn('rounded-2xl shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={cn('h-8 w-8 rounded-full grid place-items-center bg-muted/60', accentClassName)}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {value}
          {valueSuffix && <span className="text-sm text-muted-foreground ml-1">{valueSuffix}</span>}
        </div>
        {(description || trend) && (
          <div className="flex items-center pt-1">
            {trend && (
              <span
                className={cn(
                  'text-xs font-medium',
                  trend.isPositive ? 'text-green-600' : 'text-red-600'
                )}
              >
                {trend.isPositive ? '+' : ''}{trend.value}%
              </span>
            )}
            {description && (
              <p className="text-xs text-muted-foreground ml-1">
                {description}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}