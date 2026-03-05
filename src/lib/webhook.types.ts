// Webhook type definitions for TypeScript

export type WebhookEvent = 
  | 'user.created'
  | 'user.updated'
  | 'user.deleted'
  | 'vehicle.created'
  | 'vehicle.updated'
  | 'vehicle.deleted'
  | 'garage.created'
  | 'garage.updated'
  | 'garage.deleted'
  | 'maintenance.created'
  | 'maintenance.updated'
  | 'maintenance.completed'
  | 'maintenance.deleted'
  | 'notification.sent';

export type WebhookState = 'active' | 'inactive' | 'failed' | 'disabled';

export interface Webhook {
  id: string;
  workspace_id: string;
  name: string;
  url: string;
  description?: string;
  event_type: WebhookEvent;
  state: WebhookState;
  secret: string;
  headers?: Record<string, string>;
  retry_policy?: {
    max_attempts: number;
    backoff_ms: number;
  };
  failure_count: number;
  last_error?: string;
  last_triggered_at?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface WebhookLog {
  id: string;
  webhook_id: string;
  event_type: WebhookEvent;
  event_data: Record<string, any>;
  request_body: Record<string, any>;
  response_status?: number;
  response_body?: Record<string, any>;
  error_message?: string;
  execution_time_ms?: number;
  attempt_number: number;
  retry_scheduled_at?: string;
  created_at: string;
}

export interface WebhookQueueItem {
  id: string;
  webhook_id: string;
  event_type: WebhookEvent;
  event_data: Record<string, any>;
  attempt_count: number;
  next_retry_at: string;
  max_retries: number;
  status: 'pending' | 'processing' | 'delivered' | 'failed';
  created_at: string;
  updated_at: string;
}

export interface WebhookPayload {
  event: WebhookEvent;
  timestamp: string;
  data: Record<string, any>;
  attempt: number;
  delivery_id: string;
}

export interface WebhookSignature {
  id: string;
  webhook_id: string;
  secret: string;
  rotation_date: string;
  is_current: boolean;
  created_at: string;
}

// Event data types for type safety
export interface UserEventData {
  id: string;
  email: string;
  full_name: string;
  role: string;
  created_at: string;
  updated_at: string;
}

export interface VehicleEventData {
  id: string;
  garage_id: string;
  make: string;
  model: string;
  year: number;
  license_plate: string;
  vin?: string;
  created_at: string;
}

export interface GarageEventData {
  id: string;
  name: string;
  location: string;
  owner_id: string;
  created_at: string;
}

export interface MaintenanceEventData {
  id: string;
  vehicle_id: string;
  type: string;
  description: string;
  status: string;
  scheduled_date: string;
  completion_date?: string;
  cost: number;
  created_at: string;
}

export interface NotificationEventData {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  sent_at: string;
}
