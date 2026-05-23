import clsx, { type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * cn() — compose Tailwind class strings safely.
 * `clsx` handles conditionals; `tailwind-merge` deduplicates conflicting utilities
 * (e.g. `p-4 p-6` collapses to `p-6`).
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
