export function formatCurrency(amount: number): string {
  if (!Number.isFinite(amount)) {
    return 'INR 0';
  }

  const rounded = Math.round(amount);
  return `INR ${rounded.toLocaleString('en-IN')}`;
}

export function formatDate(value: string | Date): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Invalid date';
  }

  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}
