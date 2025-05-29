import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getStatusColor(status: 'normal' | 'low' | 'high'): string {
  switch (status) {
    case 'low':
      return 'text-red-600 bg-red-50';
    case 'high':
      return 'text-orange-600 bg-orange-50';
    default:
      return 'text-green-600 bg-green-50';
  }
}

export function getStatusText(status: 'normal' | 'low' | 'high'): string {
  switch (status) {
    case 'low':
      return '⚠️ 少ない';
    case 'high':
      return '⚠️ 過剰';
    default:
      return '✅ 正常';
  }
}
