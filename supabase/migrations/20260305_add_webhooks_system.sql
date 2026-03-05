-- Create enum for webhook events
CREATE TYPE webhook_event AS ENUM (
  'user.created',
  'user.updated',
  'user.deleted',
  'vehicle.created',
  'vehicle.updated',
  'vehicle.deleted',
  'garage.created',
  'garage.updated',
  'garage.deleted',
  'maintenance.created',
  'maintenance.updated',
  'maintenance.completed',
  'maintenance.deleted',
  'notification.sent'
);

-- Create enum for webhook states
CREATE TYPE webhook_state AS ENUM (
  'active',
  'inactive',
  'failed',
  'disabled'
);

-- Webhooks table - stores webhook endpoint configurations
CREATE TABLE webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL DEFAULT auth.uid(),
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  description TEXT,
  event_type webhook_event NOT NULL,
  state webhook_state NOT NULL DEFAULT 'active',
  secret TEXT NOT NULL, -- Used for HMAC-SHA256 signature verification
  headers JSONB DEFAULT '{}'::jsonb, -- Custom headers to send
  retry_policy JSONB DEFAULT '{"max_attempts": 3, "backoff_ms": 1000}'::jsonb,
  failure_count INTEGER DEFAULT 0,
  last_error TEXT,
  last_triggered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  CONSTRAINT valid_url CHECK (url ~ '^https?://'),
  UNIQUE(workspace_id, url, event_type)
);

-- Webhook events log table - audit trail of webhook executions
CREATE TABLE webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_id UUID NOT NULL REFERENCES webhooks(id) ON DELETE CASCADE,
  event_type webhook_event NOT NULL,
  event_data JSONB NOT NULL,
  request_body JSONB NOT NULL,
  response_status INTEGER,
  response_body JSONB,
  error_message TEXT,
  execution_time_ms INTEGER,
  attempt_number INTEGER NOT NULL DEFAULT 1,
  retry_scheduled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_attempt CHECK (attempt_number > 0)
);

-- Webhook deliveries queue table - ensures guaranteed delivery
CREATE TABLE webhook_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_id UUID NOT NULL REFERENCES webhooks(id) ON DELETE CASCADE,
  event_type webhook_event NOT NULL,
  event_data JSONB NOT NULL,
  attempt_count INTEGER DEFAULT 0,
  next_retry_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  max_retries INTEGER DEFAULT 3,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_status CHECK (status IN ('pending', 'processing', 'delivered', 'failed'))
);

-- Webhook signature secrets for verification
CREATE TABLE webhook_signatures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_id UUID NOT NULL REFERENCES webhooks(id) ON DELETE CASCADE,
  secret TEXT NOT NULL UNIQUE,
  rotation_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_current BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_webhooks_workspace_id ON webhooks(workspace_id);
CREATE INDEX idx_webhooks_event_type ON webhooks(event_type);
CREATE INDEX idx_webhooks_state ON webhooks(state);
CREATE INDEX idx_webhook_logs_webhook_id ON webhook_logs(webhook_id);
CREATE INDEX idx_webhook_logs_created_at ON webhook_logs(created_at);
CREATE INDEX idx_webhook_logs_event_type ON webhook_logs(event_type);
CREATE INDEX idx_webhook_queue_status ON webhook_queue(status);
CREATE INDEX idx_webhook_queue_next_retry ON webhook_queue(next_retry_at);
CREATE INDEX idx_webhook_signatures_webhook_id ON webhook_signatures(webhook_id);
CREATE INDEX idx_webhook_signatures_current ON webhook_signatures(webhook_id, is_current);

-- Enable RLS (Row Level Security)
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_signatures ENABLE ROW LEVEL SECURITY;

-- RLS Policies for webhooks
CREATE POLICY "Webhooks: Users see their own workspace" ON webhooks
  FOR SELECT USING (workspace_id = auth.uid() OR auth.uid() IN (
    SELECT user_id FROM profiles WHERE role = 'admin'
  ));

CREATE POLICY "Webhooks: Admins can create webhooks" ON webhooks
  FOR INSERT WITH CHECK (auth.uid() IN (
    SELECT user_id FROM profiles WHERE role = 'admin'
  ));

CREATE POLICY "Webhooks: Admins can update webhooks" ON webhooks
  FOR UPDATE USING (workspace_id = auth.uid() OR auth.uid() IN (
    SELECT user_id FROM profiles WHERE role = 'admin'
  ));

CREATE POLICY "Webhooks: Admins can delete webhooks" ON webhooks
  FOR DELETE USING (workspace_id = auth.uid() OR auth.uid() IN (
    SELECT user_id FROM profiles WHERE role = 'admin'
  ));

-- RLS Policies for webhook logs (read-only for users)
CREATE POLICY "Webhook logs: Users see their own workspace logs" ON webhook_logs
  FOR SELECT USING (webhook_id IN (
    SELECT id FROM webhooks WHERE workspace_id = auth.uid()
  ));

-- Create function to update webhook updated_at timestamp
CREATE OR REPLACE FUNCTION update_webhook_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for webhook timestamp
CREATE TRIGGER webhook_timestamp_trigger
BEFORE UPDATE ON webhooks
FOR EACH ROW
EXECUTE FUNCTION update_webhook_timestamp();

-- Create function to update webhook_queue timestamp
CREATE OR REPLACE FUNCTION update_webhook_queue_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for webhook_queue timestamp
CREATE TRIGGER webhook_queue_timestamp_trigger
BEFORE UPDATE ON webhook_queue
FOR EACH ROW
EXECUTE FUNCTION update_webhook_queue_timestamp();

-- Create function to increment webhook failure count
CREATE OR REPLACE FUNCTION increment_webhook_failures()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.response_status >= 400 THEN
    UPDATE webhooks 
    SET 
      failure_count = failure_count + 1,
      last_error = NEW.error_message,
      state = CASE 
        WHEN failure_count >= 10 THEN 'disabled'::webhook_state
        WHEN failure_count >= 5 THEN 'failed'::webhook_state
        ELSE state
      END
    WHERE id = NEW.webhook_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for webhook failure tracking
CREATE TRIGGER webhook_failure_tracking_trigger
AFTER INSERT ON webhook_logs
FOR EACH ROW
EXECUTE FUNCTION increment_webhook_failures();
