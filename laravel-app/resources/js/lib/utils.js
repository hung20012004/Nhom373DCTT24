import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}
export function formatDate(dateString, includeTime = false) {
    if (!dateString) return '';

    const date = new Date(dateString);

    const options = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    };

    if (includeTime) {
      options.hour = '2-digit';
      options.minute = '2-digit';
    }

    return date.toLocaleDateString('vi-VN', options);
  }
