import { supabase } from './supabase';
import type { WebhookEvent, WebhookPayload, Webhook, WebhookLog } from './webhook.types';

/**
 * Webhook Service
 * Handles webhook delivery, retries, logging, and signature verification
 */

// Helper function to generate HMAC-SHA256 in browser
async function generateHMACSignature(payload: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(payload);
  
  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', key, messageData);
  const hashArray = Array.from(new Uint8Array(signature));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Generate random string for webhook secret
function generateSecret(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

class WebhookService {
  /**
   * Generate HMAC-SHA256 signature for webhook payload
   * Used for verifying webhook authenticity on the receiving end
   */
  static async generateSignature(payload: string, secret: string): Promise<string> {
    return generateHMACSignature(payload, secret);
  }

  /**
   * Verify webhook signature from incoming request
   */
  static async verifySignature(
    payload: string,
    signature: string,
    secret: string
  ): Promise<boolean> {
    const expectedSignature = await generateHMACSignature(payload, secret);
    // Timing-safe comparison
    return signature === expectedSignature;
  }

  /**
   * Trigger a webhook event
   * Queues the event for delivery with retry logic
   */
  static async triggerWebhook(
    event: WebhookEvent,
    eventData: Record<string, any>,
    workspaceId: string
  ): Promise<void> {
    try {
      // Find all active webhooks for this event
      const { data: webhooks, error: fetchError } = await supabase
        .from('webhooks')
        .select('*')
        .eq('workspace_id', workspaceId)
        .eq('event_type', event)
        .eq('state', 'active');

      if (fetchError) {
        console.error('Error fetching webhooks:', fetchError);
        return;
      }

      if (!webhooks || webhooks.length === 0) {
        return; // No webhooks configured for this event
      }

      // Queue webhook deliveries
      for (const webhook of webhooks) {
        await this.queueWebhookDelivery(webhook, event, eventData);
      }
    } catch (error) {
      console.error('Error triggering webhook:', error);
    }
  }

  /**
   * Queue a webhook for delivery
   */
  private static async queueWebhookDelivery(
    webhook: Webhook,
    event: WebhookEvent,
    eventData: Record<string, any>
  ): Promise<void> {
    const { error } = await supabase
      .from('webhook_queue')
      .insert({
        webhook_id: webhook.id,
        event_type: event,
        event_data: eventData,
        status: 'pending',
        next_retry_at: new Date().toISOString(),
        max_retries: webhook.retry_policy?.max_attempts || 3,
      });

    if (error) {
      console.error('Error queuing webhook:', error);
    }
  }

  /**
   * Process webhook queue (should be called by a background job)
   * Sends pending webhooks and handles retries
   */
  static async processWebhookQueue(): Promise<void> {
    try {
      // Get pending webhooks ready for delivery
      const { data: queueItems, error: fetchError } = await supabase
        .from('webhook_queue')
        .select(
          `
          *,
          webhooks:webhook_id (
            id,
            url,
            secret,
            headers,
            retry_policy
          )
        `
        )
        .eq('status', 'pending')
        .lte('next_retry_at', new Date().toISOString())
        .limit(10);

      if (fetchError) {
        console.error('Error fetching webhook queue:', fetchError);
        return;
      }

      if (!queueItems || queueItems.length === 0) {
        return;
      }

      // Process each queued webhook
      for (const item of queueItems) {
        await this.deliverWebhook(item);
      }
    } catch (error) {
      console.error('Error processing webhook queue:', error);
    }
  }

  /**
   * Deliver a webhook to its endpoint
   */
  private static async deliverWebhook(queueItem: any): Promise<void> {
    const startTime = Date.now();
    const webhook = queueItem.webhooks as Webhook;

    try {
      // Mark as processing
      await supabase
        .from('webhook_queue')
        .update({ status: 'processing' })
        .eq('id', queueItem.id);

      // Create webhook payload
      const payload: WebhookPayload = {
        event: queueItem.event_type,
        timestamp: new Date().toISOString(),
        data: queueItem.event_data,
        attempt: queueItem.attempt_count + 1,
        delivery_id: queueItem.id,
      };

      const payloadString = JSON.stringify(payload);
      const signature = await this.generateSignature(payloadString, webhook.secret);

      // Prepare request headers
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'User-Agent': 'Car4ge-Webhook/1.0',
        'X-Webhook-Event': queueItem.event_type,
        'X-Webhook-Delivery': queueItem.id,
        'X-Webhook-Signature': `sha256=${signature}`,
        'X-Webhook-Attempt': String(queueItem.attempt_count + 1),
        ...webhook.headers,
      };

      // Send webhook
      const response = await fetch(webhook.url, {
        method: 'POST',
        headers,
        body: payloadString,
        timeout: 10000,
      });

      const executionTime = Date.now() - startTime;
      const responseBody = await response.text().then(text => {
        try {
          return JSON.parse(text);
        } catch {
          return { raw: text };
        }
      });

      // Log the webhook delivery
      await this.logWebhookDelivery({
        webhook_id: webhook.id,
        event_type: queueItem.event_type,
        event_data: queueItem.event_data,
        request_body: payload,
        response_status: response.status,
        response_body: responseBody,
        execution_time_ms: executionTime,
        attempt_number: queueItem.attempt_count + 1,
      });

      if (response.ok) {
        // Success - mark as delivered
        await supabase
          .from('webhook_queue')
          .update({ status: 'delivered' })
          .eq('id', queueItem.id);

        // Update webhook last_triggered_at
        await supabase
          .from('webhooks')
          .update({
            last_triggered_at: new Date().toISOString(),
            failure_count: 0, // Reset failure count on success
          })
          .eq('id', webhook.id);
      } else {
        // Failed - schedule retry or mark as failed
        await this.handleWebhookFailure(queueItem, webhook, null);
      }
    } catch (error) {
      const executionTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);

      // Log the error
      await this.logWebhookDelivery({
        webhook_id: webhook.id,
        event_type: queueItem.event_type,
        event_data: queueItem.event_data,
        request_body: {
          event: queueItem.event_type,
          timestamp: new Date().toISOString(),
          data: queueItem.event_data,
        },
        error_message: errorMessage,
        execution_time_ms: executionTime,
        attempt_number: queueItem.attempt_count + 1,
      });

      // Handle failure
      await this.handleWebhookFailure(queueItem, webhook, errorMessage);
    }
  }

  /**
   * Handle webhook delivery failure with retry logic
   */
  private static async handleWebhookFailure(
    queueItem: any,
    webhook: Webhook,
    errorMessage: string | null
  ): Promise<void> {
    const maxRetries = queueItem.max_retries;
    const nextAttempt = queueItem.attempt_count + 1;

    if (nextAttempt < maxRetries) {
      // Schedule retry with exponential backoff
      const backoffMs = (webhook.retry_policy?.backoff_ms || 1000) * Math.pow(2, queueItem.attempt_count);
      const nextRetryAt = new Date(Date.now() + backoffMs).toISOString();

      await supabase
        .from('webhook_queue')
        .update({
          status: 'pending',
          attempt_count: nextAttempt,
          next_retry_at: nextRetryAt,
          updated_at: new Date().toISOString(),
        })
        .eq('id', queueItem.id);

      // Schedule retry notification
      await supabase
        .from('webhook_logs')
        .insert({
          webhook_id: webhook.id,
          event_type: queueItem.event_type,
          event_data: queueItem.event_data,
          request_body: {},
          error_message: errorMessage || 'Retry scheduled',
          attempt_number: nextAttempt,
          retry_scheduled_at: nextRetryAt,
        });
    } else {
      // Max retries exceeded - mark as failed
      await supabase
        .from('webhook_queue')
        .update({
          status: 'failed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', queueItem.id);

      // Update webhook state to failed
      await supabase
        .from('webhooks')
        .update({
          state: 'failed',
          last_error: errorMessage || 'Max retries exceeded',
          failure_count: Math.min(webhook.failure_count + 1, 10),
        })
        .eq('id', webhook.id);
    }
  }

  /**
   * Log webhook delivery details
   */
  private static async logWebhookDelivery(log: Omit<WebhookLog, 'id' | 'created_at'>): Promise<void> {
    const { error } = await supabase
      .from('webhook_logs')
      .insert([log]);

    if (error) {
      console.error('Error logging webhook delivery:', error);
    }
  }

  /**
   * Get webhook delivery logs
   */
  static async getWebhookLogs(
    webhookId: string,
    limit: number = 50,
    offset: number = 0
  ) {
    return supabase
      .from('webhook_logs')
      .select('*', { count: 'exact' })
      .eq('webhook_id', webhookId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
  }

  /**
   * Get webhook statistics
   */
  static async getWebhookStats(webhookId: string) {
    const [{ data: logs, error }] = await Promise.all([
      supabase
        .from('webhook_logs')
        .select('response_status, execution_time_ms')
        .eq('webhook_id', webhookId),
    ]);

    if (error) {
      console.error('Error fetching webhook stats:', error);
      return null;
    }

    if (!logs || logs.length === 0) {
      return {
        total_deliveries: 0,
        success_count: 0,
        failure_count: 0,
        success_rate: 0,
        avg_execution_time: 0,
        last_delivery: null,
      };
    }

    const successCount = logs.filter(log => (log.response_status || 500) < 400).length;
    const failureCount = logs.length - successCount;
    const totalTime = logs.reduce((sum, log) => sum + (log.execution_time_ms || 0), 0);

    return {
      total_deliveries: logs.length,
      success_count: successCount,
      failure_count: failureCount,
      success_rate: (successCount / logs.length) * 100,
      avg_execution_time: totalTime / logs.length,
      last_delivery: logs[0]?.created_at,
    };
  }

  /**
   * Rotate webhook secret
   */
  static async rotateWebhookSecret(webhookId: string): Promise<string | null> {
    const newSecret = generateSecret();

    const { error: updateError } = await supabase
      .from('webhooks')
      .update({ secret: newSecret })
      .eq('id', webhookId);

    if (updateError) {
      console.error('Error rotating webhook secret:', updateError);
      return null;
    }

    // Archive old secret
    await supabase
      .from('webhook_signatures')
      .update({ is_current: false })
      .eq('webhook_id', webhookId)
      .eq('is_current', true);

    // Store new secret
    await supabase
      .from('webhook_signatures')
      .insert({
        webhook_id: webhookId,
        secret: newSecret,
        is_current: true,
      });

    return newSecret;
  }

  /**
   * Test webhook delivery (sends a test payload)
   */
  static async testWebhook(webhookId: string): Promise<{ success: boolean; message: string }> {
    try {
      const { data: webhook, error: fetchError } = await supabase
        .from('webhooks')
        .select('*')
        .eq('id', webhookId)
        .single();

      if (fetchError || !webhook) {
        return { success: false, message: 'Webhook not found' };
      }

      const testPayload: WebhookPayload = {
        event: webhook.event_type,
        timestamp: new Date().toISOString(),
        data: {
          test: true,
          message: 'This is a test payload',
        },
        attempt: 1,
        delivery_id: `test-${Date.now()}`,
      };

      const payloadString = JSON.stringify(testPayload);
      const signature = await this.generateSignature(payloadString, webhook.secret);

      const response = await fetch(webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Car4ge-Webhook/1.0',
          'X-Webhook-Event': webhook.event_type,
          'X-Webhook-Signature': `sha256=${signature}`,
          'X-Webhook-Test': 'true',
          ...webhook.headers,
        },
        body: payloadString,
        timeout: 10000,
      });

      if (response.ok) {
        return {
          success: true,
          message: `Test successful (${response.status})`,
        };
      } else {
        return {
          success: false,
          message: `Test failed (${response.status})`,
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

export default WebhookService;
