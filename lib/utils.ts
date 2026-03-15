import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, parseISO, isToday, isYesterday, formatDistanceToNow } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format amount as currency string (EUR by default)
 */
export function formatCurrency(amount: number, currency = 'EUR'): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * Format amount compactly (e.g. "1.2k")
 */
export function formatCompactCurrency(amount: number): string {
  if (Math.abs(amount) >= 1000) {
    return `€${(amount / 1000).toFixed(1)}k`
  }
  return formatCurrency(amount)
}

/**
 * Format date for display
 */
export function formatDate(dateStr: string): string {
  const date = parseISO(dateStr)
  if (isToday(date)) return 'Today'
  if (isYesterday(date)) return 'Yesterday'
  return format(date, 'MMM d')
}

/**
 * Format full date
 */
export function formatFullDate(dateStr: string): string {
  return format(parseISO(dateStr), 'MMMM d, yyyy')
}

/**
 * Get current month as YYYY-MM-01
 */
export function getCurrentMonth(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
}

/**
 * Get today as YYYY-MM-DD
 */
export function getToday(): string {
  return format(new Date(), 'yyyy-MM-dd')
}

/**
 * Get yesterday as YYYY-MM-DD
 */
export function getYesterday(): string {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return format(d, 'yyyy-MM-dd')
}

/**
 * Relative time (e.g. "2 hours ago")
 */
export function timeAgo(dateStr: string): string {
  return formatDistanceToNow(parseISO(dateStr), { addSuffix: true })
}

/**
 * Get initials from name
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

/**
 * Clamp a number between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/**
 * Check if a metric value represents debt (negative-ish)
 */
export function isDebtMetric(key: string): boolean {
  return key === 'you_owe'
}

/**
 * Color class based on value (positive=green, negative/debt=red)
 */
export function getValueColor(value: number, inverted = false): string {
  const isPositive = inverted ? value < 0 : value >= 0
  return isPositive ? 'text-emerald-500' : 'text-red-500'
}

