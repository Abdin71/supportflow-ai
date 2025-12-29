/**
 * AI Status Badge Component
 * Displays visual indicator for AI processing status
 */

import { Badge } from '@/components/ui/badge';
import { Sparkles, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AIStatusBadgeProps {
  status: 'pending' | 'processing' | 'completed' | 'failed';
  confidence?: number;
  showConfidence?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function AIStatusBadge({ 
  status, 
  confidence, 
  showConfidence = false,
  size = 'md' 
}: AIStatusBadgeProps) {
  const statusConfig = {
    pending: { 
      label: 'AI Pending', 
      icon: Sparkles,
      className: 'bg-gray-100 text-gray-700 border-gray-200',
    },
    processing: { 
      label: 'AI Processing', 
      icon: Loader2,
      className: 'bg-blue-100 text-blue-700 border-blue-200',
      animated: true,
    },
    completed: { 
      label: 'AI Analyzed', 
      icon: CheckCircle2,
      className: 'bg-green-100 text-green-700 border-green-200',
    },
    failed: { 
      label: 'AI Failed', 
      icon: XCircle,
      className: 'bg-red-100 text-red-700 border-red-200',
    },
  };
  
  const config = statusConfig[status] || statusConfig.pending;
  const Icon = config.icon;
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5',
  };

  return (
    <Badge 
      variant="outline"
      className={cn(
        config.className,
        sizeClasses[size],
        'flex items-center gap-1.5 font-medium'
      )}
    >
      <Icon 
        className={cn(
          size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4',
          config.animated && 'animate-spin'
        )} 
      />
      <span>{config.label}</span>
      {showConfidence && confidence && status === 'completed' && (
        <span className="text-xs opacity-75">
          ({Math.round(confidence * 100)}%)
        </span>
      )}
    </Badge>
  );
}
