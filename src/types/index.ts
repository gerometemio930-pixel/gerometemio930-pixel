export type UserRole = 'admin' | 'resident';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  phone: string | null;
  address: string | null;
  created_at: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  category: string;
  is_pinned: boolean;
  published_at: string;
  created_at: string;
  created_by: string | null;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  requirements: string;
  fee: string;
  processing_time: string;
  icon: string;
  created_at: string;
}

export interface Official {
  id: string;
  name: string;
  position: string;
  committee: string | null;
  term: string | null;
  display_order: number;
  created_at: string;
}

export interface ServiceRequest {
  id: string;
  user_id: string;
  full_name: string;
  email: string | null;
  phone: string;
  address: string;
  service_type: string;
  details: string;
  status: string;
  reference_number: string;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface BlotterReport {
  id: string;
  user_id: string;
  complainant_name: string;
  complainant_address: string;
  complainant_phone: string;
  incident_type: string;
  incident_date: string;
  incident_location: string;
  persons_involved: string | null;
  description: string;
  status: string;
  reference_number: string;
  admin_notes: string | null;
  created_at: string;
}

export type PageId =
  | 'home'
  | 'announcements'
  | 'services'
  | 'officials'
  | 'service-request'
  | 'blotter'
  | 'track'
  | 'about'
  | 'login'
  | 'signup'
  | 'admin-dashboard'
  | 'admin-announcements'
  | 'admin-requests'
  | 'admin-blotter'
  | 'admin-officials'
  | 'admin-services';

export type AppView = 'public' | 'auth' | 'admin';
