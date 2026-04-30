// Admin types
export interface Admin {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string | null;
  permissions: string[];
  profile_picture: string | null;
  is_active: boolean;
  created_at: string;
}

// User types
export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  suspended_at: string | null;
  suspension_reason: string | null;
  suspended_by: number | null;
  created_at: string;
  updated_at: string;
}

// Dispatcher types
export type DispatcherStatus = 'ONLINE' | 'OFFLINE';
export type OnboardingStatus = 'pending_documents' | 'approved';
export type DocumentStatus = 'pending' | 'approved' | 'rejected';
export type DocumentReviewAction = 'approved' | 'rejected';

export interface Dispatcher {
  id: number;
  user_id: number;
  name: string;
  image_url: string | null;
  phone_number: string;
  country_code: string;
  state: string;
  city: string;
  status: DispatcherStatus;
  vehicle_id: number | null;
  vehicle_make: string;
  vehicle_model: string;
  vehicle_year: string;
  vehicle_color: string;
  license_plate: string;
  location_latitude: number | null;
  location_longitude: number | null;
  preferred_radius_km: number;
  onboarding_status: OnboardingStatus;
  documents_status: DocumentReview[];
  is_approved: boolean;
  approved_at: string | null;
  approved_by: number | null;
  metadata: DispatcherMetadata | null;
  created_at: string;
  updated_at: string;
  user: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    is_online?: boolean;
    updated_at?: string;
  } | null;
}

export interface DispatcherDetail extends Dispatcher {
  deliveries_count: number;
  documents: DocumentReview[];
  vehicle_documents: DocumentReview[];
}

export interface DispatcherMetadata {
  suspension_reason?: string;
  suspended_at?: string;
  suspended_by?: number;
  reversed_by?: number;
}

export interface DocumentReview {
  id: number;
  dispatcher_id: number;
  document_type: string;
  file_url: string;
  status: DocumentStatus;
  rejection_reason: string | null;
  reviewed_at: string | null;
  reviewed_by: number | null;
  metadata: unknown | null;
  created_at: string;
  updated_at: string;
}

export interface DispatcherStats {
  total: number;
  online: number;
  approved: number;
  pending_approval: number;
  suspended: number;
}

export interface DispatcherLocation {
  id: number;
  name: string;
  phone_number: string;
  location_latitude: number;
  location_longitude: number;
  status: DispatcherStatus;
}

// Delivery types
export type DeliveryStatus =
  | 'pending'
  | 'assigned'
  | 'accepted'
  | 'picked_up'
  | 'delivering'
  | 'delivered'
  | 'cancelled';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type PayoutStatus = 'pending' | 'paid' | 'failed';

export interface Delivery {
  id: number;
  tracking_code: string;
  user_id: number;
  dispatcher_id: number | null;
  status: DeliveryStatus;
  payment_status: PaymentStatus;
  payment_method: 'cash' | 'wallet' | 'card' | null;
  currency: string;
  base_fare: number;
  total_amount: number;
  payout_amount: number;
  payout_status: PayoutStatus;
  pickup_address: string;
  pickup_contact_name: string;
  pickup_contact_phone: string;
  dropoff_address: string;
  dropoff_contact_name: string;
  dropoff_contact_phone: string;
  assigned_at: string | null;
  accepted_at: string | null;
  picked_up_at: string | null;
  delivered_at: string | null;
  paid_at: string | null;
  created_at: string;
  user: {
    id: number;
    first_name: string;
    last_name: string;
  };
  dispatcher: {
    id: number;
    name: string;
  } | null;
}

export interface DeliveryDetail extends Delivery {
  package_description: string;
  package_value: number;
  weight: number;
  pickup_latitude: number;
  pickup_longitude: number;
  pickup_notes: string;
  dropoff_latitude: number;
  dropoff_longitude: number;
  otp_required: boolean;
  tracking_steps: TrackingStep[];
  issues: DeliveryIssue[];
  metadata?: {
    fare_overrides?: Array<{
      before: Record<string, number>;
      after: Record<string, number>;
      admin_id: number;
      reason: string;
      timestamp: string;
    }>;
    refunds?: Array<{
      amount: number;
      reason: string;
      admin_id: number;
      timestamp: string;
    }>;
    force_complete?: {
      admin_id: number;
      reason: string;
      timestamp: string;
    };
  };
}

export interface DeliveryOtp {
  id: number;
  delivery_id: number;
  code: string;
  is_used: boolean;
  created_at: string;
}

export interface TrackingStep {
  id: number;
  delivery_id: number;
  step: string;
  description: string;
  created_at: string;
}

export interface DeliveryIssue {
  id: number;
  delivery_id: number;
  reported_by: number;
  type: string;
  description: string;
  status: 'open' | 'resolved';
  resolution_notes: string | null;
  resolved_at: string | null;
  resolved_by: number | null;
  created_at: string;
}

export interface DeliveryStats {
  status_counts: Record<string, number>;
  total_revenue: number;
  total_payout: number;
  daily_volumes: { date: string; count: number }[];
  period: {
    name: string;
    from: string;
    to: string;
  };
}

export interface DeliveryCategory {
  id: number;
  name: string;
  description: string | null;
  surcharge: number;
  max_weight_kg: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DeliveryVehicle {
  id: number;
  code: string;
  type: string;
  vehicle: string;
  description: string | null;
  max_weight_kg: number;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Wallet types
export interface WalletTransaction {
  id: number;
  wallet_id: number;
  transaction_type: 'credit' | 'debit';
  amount: string;
  description: string;
  reference: string;
  status: string;
  user_id: number;
  created_at: string;
  metadata?: {
    reversed_by?: number;
    reason?: string;
  };
  wallet?: {
    user?: {
      first_name: string;
      last_name: string;
      phone_number: string;
    };
  };
}

export interface Wallet {
  balance: string;
  bonus_balance: string;
  transactions: PaginatedResponse<WalletTransaction>;
}

// Settings & Pricing
export interface PricingSetting {
  key: string;
  value: string;
  type: string;
}

// Activity Logs
export interface ActivityLog {
  id: number;
  log_name: string;
  description: string;
  subject_type: string;
  subject_id: number;
  causer_type: string;
  causer_id: number;
  properties: {
    reason?: string;
    before?: Record<string, any>;
    after?: Record<string, any>;
    [key: string]: any;
  };
  event: string;
  created_at: string;
  causer: {
    id: number;
    name: string;
    email: string;
  } | null;
  subject: {
    id: number;
    [key: string]: any;
  } | null;
}

// Pagination
export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
  first_page_url: string;
  last_page_url: string;
  next_page_url: string | null;
  prev_page_url: string | null;
  path: string;
}

// API Response envelope
export interface ApiResponse<T> {
  status: boolean;
  message: string;
  data: T;
  errors?: Record<string, string[]>;
}

// Dashboard
export interface DashboardSummary {
  dispatches: { total: number; completed: number; pending: number; cancelled: number; revenue: number };
  dispatchers: { total: number; active: number; new: number };
  charts: {
    dispatches_by_day: { date: string; count: number }[];
  };
  period: { from: string; to: string };
}

// Filter params
export interface DispatcherFilters {
  search?: string;
  status?: DispatcherStatus;
  is_approved?: '0' | '1';
  onboarding_status?: string;
  from?: string;
  to?: string;
  per_page?: number;
  page?: number;
}

export interface DeliveryFilters {
  search?: string;
  status?: DeliveryStatus;
  payment_status?: PaymentStatus;
  from?: string;
  to?: string;
  per_page?: number;
  page?: number;
}

export interface ActivityLogFilters {
  log_name?: string;
  causer_id?: number;
  causer_type?: string;
  subject_type?: string;
  subject_id?: number;
  event?: string;
  from?: string;
  to?: string;
  per_page?: number;
  page?: number;
}

