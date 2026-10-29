import type { PageId } from '@/types';

export function generateReferenceNumber(prefix: string): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const random = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${y}${m}${d}-${random}`;
}

export const PUBLIC_NAV: { id: PageId; label: string }[] = [
  { id: 'home', label: 'Home' },
  { id: 'announcements', label: 'Announcements' },
  { id: 'services', label: 'Services' },
  { id: 'officials', label: 'Officials' },
  { id: 'about', label: 'About' },
];

export const RESIDENT_NAV: { id: PageId; label: string }[] = [
  { id: 'service-request', label: 'Request Service' },
  { id: 'blotter', label: 'File Blotter' },
  { id: 'track', label: 'Track Requests' },
];

export const ADMIN_NAV: { id: PageId; label: string }[] = [
  { id: 'admin-dashboard', label: 'Dashboard' },
  { id: 'admin-announcements', label: 'Announcements' },
  { id: 'admin-requests', label: 'Service Requests' },
  { id: 'admin-blotter', label: 'Blotter Reports' },
  { id: 'admin-officials', label: 'Officials' },
  { id: 'admin-services', label: 'Services' },
];

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffHours < 1) return 'Just now';
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30)
    return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
  return formatDate(dateStr);
}

export const CATEGORY_COLORS: Record<string, string> = {
  General: 'bg-neutral-100 text-neutral-700 border-neutral-200',
  Health: 'bg-success-100 text-success-700 border-success-500/20',
  Safety: 'bg-error-100 text-error-700 border-error-500/20',
  Events: 'bg-secondary-100 text-secondary-700 border-secondary-300/30',
  Infrastructure: 'bg-accent-100 text-accent-700 border-accent-300/30',
};

export const REQUEST_STATUS_COLORS: Record<string, string> = {
  Pending: 'bg-warning-100 text-warning-700 border-warning-500/20',
  Processing: 'bg-accent-100 text-accent-700 border-accent-300/30',
  'Ready for Pickup': 'bg-success-100 text-success-700 border-success-500/20',
  Completed: 'bg-neutral-100 text-neutral-600 border-neutral-200',
  Rejected: 'bg-error-100 text-error-700 border-error-500/20',
};

export const BLOTTER_STATUS_COLORS: Record<string, string> = {
  Filed: 'bg-accent-100 text-accent-700 border-accent-300/30',
  'Under Investigation': 'bg-warning-100 text-warning-700 border-warning-500/20',
  Resolved: 'bg-success-100 text-success-700 border-success-500/20',
  Dismissed: 'bg-error-100 text-error-700 border-error-500/20',
};

export const REQUEST_STATUSES = [
  'Pending',
  'Processing',
  'Ready for Pickup',
  'Completed',
  'Rejected',
];

export const BLOTTER_STATUSES = ['Filed', 'Under Investigation', 'Resolved', 'Dismissed'];

export const INCIDENT_TYPES = [
  'Noise Complaint',
  'Property Dispute',
  'Theft',
  'Physical Altercation',
  'Vandalism',
  'Trespassing',
  'Nuisance',
  'Domestic Disturbance',
  'Animal Complaint',
  'Other',
];
