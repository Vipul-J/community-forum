import { formatDistance } from 'date-fns';

export function formatDistanceToNow(date: Date | string): string {
  const parsedDate = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(parsedDate.getTime())) {
    console.error("Invalid date:", date);
    return "Invalid date"; 
  }

  return formatDistance(parsedDate, new Date(), { addSuffix: true });
}