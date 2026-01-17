/**
 * Composant Card - ImmoLomé
 * Carte réutilisable
 */

import clsx from 'clsx';

export default function Card({
  children,
  className = '',
  hover = false,
  padding = true,
  ...props
}) {
  return (
    <div
      className={clsx(
        'bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden',
        hover && 'transition-all duration-300 hover:shadow-lg hover:border-gray-200 hover:-translate-y-1 cursor-pointer',
        padding && 'p-6',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * Card Header
 */
export function CardHeader({ children, className = '', action }) {
  return (
    <div className={clsx('flex items-center justify-between mb-4', className)}>
      <div>{children}</div>
      {action && <div>{action}</div>}
    </div>
  );
}

/**
 * Card Title
 */
export function CardTitle({ children, className = '' }) {
  return (
    <h3 className={clsx('text-lg font-semibold text-gray-900', className)}>
      {children}
    </h3>
  );
}

/**
 * Card Description
 */
export function CardDescription({ children, className = '' }) {
  return (
    <p className={clsx('text-sm text-gray-500 mt-1', className)}>
      {children}
    </p>
  );
}

/**
 * Card Content
 */
export function CardContent({ children, className = '' }) {
  return <div className={className}>{children}</div>;
}

/**
 * Card Footer
 */
export function CardFooter({ children, className = '' }) {
  return (
    <div className={clsx('mt-4 pt-4 border-t border-gray-100', className)}>
      {children}
    </div>
  );
}

/**
 * Stats Card
 */
export function StatsCard({ title, value, icon: Icon, trend, trendUp, className = '' }) {
  return (
    <Card className={className}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {trend && (
            <p className={clsx(
              'text-sm mt-1',
              trendUp ? 'text-green-600' : 'text-red-600'
            )}>
              {trendUp ? '↑' : '↓'} {trend}
            </p>
          )}
        </div>
        {Icon && (
          <div className="p-3 bg-primary-50 rounded-xl">
            <Icon className="w-6 h-6 text-primary-600" />
          </div>
        )}
      </div>
    </Card>
  );
}
