# Webhooks - Implementation & API Reference

## 🏗️ Architecture

```
Event Triggered (user creates vehicle)
    ↓
WebhookService.triggerWebhook() called
    ↓
Query webhooks table for matching event type
    ↓
Queue each webhook for delivery
    ↓
Background job processor: processWebhookQueue()
    ↓
HTTP POST to endpoint with signature
    ↓
Log response (success/failure)
    ↓
On failure: Schedule retry with exponential backoff
    ↓
On max retries exceeded: Disable webhook
```

---

## 📦 Core Components

### 1. Database Schema (`webhook.types.ts`)

**Tables:**
- `webhooks` - Webhook endpoint configurations
- `webhook_logs` - Audit trail of all deliveries
- `webhook_queue` - Guaranteed delivery queue
- `webhook_signatures` - Secret rotation history

**Enums:**
- `webhook_event` - 14 supported event types
- `webhook_state` - active | inactive | failed | disabled

---

### 2. WebhookService (`webhookService.ts`)

**Core Methods:**

```typescript
// Trigger webhook for an event
static async triggerWebhook(
  event: WebhookEvent,
  eventData: Record<string, any>,
  workspaceId: string
): Promise<void>

// Process delivery queue (background job)
static async processWebhookQueue(): Promise<void>

// Test webhook delivery
static async testWebhook(webhookId: string): Promise<{success, message}>

// Rotate webhook secret  
static async rotateWebhookSecret(webhookId: string): Promise<string|null>

// Get delivery logs
static async getWebhookLogs(
  webhookId: string,
  limit: number = 50,
  offset: number = 0
)

// Get delivery statistics
static async getWebhookStats(webhookId: string)

// Verify signature
static verifySignature(
  payload: string,
  signature: string,
  secret: string
): boolean
```

---

### 3. WebhookManagement Component

React component in `src/pages/WebhookManagement.tsx`.

**Features:**
- Create/edit/delete webhooks
- Configure event types and retry policies
- Test webhook delivery
- View delivery logs
- Rotate secrets
- Handle failures with visual indicators

---

## 🔌 Integration Points

### Triggering Webhooks in Components

Example: Creating a new vehicle

```typescript
// In your vehicle creation handler
import WebhookService from '../lib/webhookService';
import { useAuth } from '../contexts/AuthContext';

const { user } = useAuth();

// After vehicle is created in database:
await WebhookService.triggerWebhook(
  'vehicle.created',
  {
    id: newVehicle.id,
    garage_id: newVehicle.garage_id,
    make: newVehicle.make,
    model: newVehicle.model,
    year: newVehicle.year,
    license_plate: newVehicle.license_plate,
    vin: newVehicle.vin,
    created_at: new Date().toISOString()
  },
  user?.id || ''
);
```

### Where to Add Webhook Triggers

1. **User Events**
   - `Auth.onAuthStateChange()` → `user.created`, `user.updated`
   - `/account-management` → `user.deleted`

2. **Vehicle Events**
   - `/vehicles` form submission → `vehicle.created`
   - Vehicle edit handler → `vehicle.updated`
   - Delete handler → `vehicle.deleted`

3. **Maintenance Events**
   - `/maintenance` form → `maintenance.created`
   - Status update → `maintenance.updated`, `maintenance.completed`
   - Delete → `maintenance.deleted`

4. **Garage Events**
   - `/garages` form → `garage.created`, `garage.updated`
   - Delete handler → `garage.deleted`

5. **Notifications**
   - Notification system → `notification.sent`

---

## 📡 Delivery Flow Details

### Success Path (200-299 Status)
```
Queue item created
    ↓ (next_retry_at = NOW)
Process webhook
    ↓
HTTP POST succeeds (200)
    ↓
Log delivery with response
    ↓
Update webhook: last_triggered_at = NOW, failure_count = 0
    ↓
Mark queue item as 'delivered'
```

### Failure Path (400+ or Network Error)
```
Queue item created
    ↓
Process webhook
    ↓
HTTP POST fails or timeout
    ↓
Log delivery with error_message
    ↓
Check: attempt_count < max_attempts?
    ├─ YES: schedule retry with exponential backoff
    │        next_retry_at = NOW + (backoff_ms * 2^attempt_count)
    │        status = 'pending', attempt_count++
    │
    └─ NO:  mark as 'failed'
            update webhook: state = 'failed', failure_count++
            if failure_count >= 10: state = 'disabled'
```

---

## 🔐 Signature Verification

### Implementation in Your Server

**Node.js (Express):**
```typescript
import crypto from 'crypto';

const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

app.post('/webhook', (req, res) => {
  // Get signature from header
  const signature = req.headers['x-webhook-signature'];
  
  // Get raw body as string
  const bodyString = JSON.stringify(req.body);
  
  // Verify
  const hmac = crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(bodyString)
    .digest('hex');
    
  if (signature !== `sha256=${hmac}`) {
    return res.status(401).json({ error: 'Invalid signature' });
  }
  
  // Valid! Process webhook
  const event = req.body.event;
  const data = req.body.data;
  
  // Handle based on event type
  switch(event) {
    case 'vehicle.created':
      // Sync vehicle to your system
      break;
    case 'maintenance.completed':
      // Update analytics
      break;
  }
  
  res.json({ success: true });
});
```

**Python (Flask):**
```python
import hmac
import hashlib

WEBHOOK_SECRET = os.getenv('WEBHOOK_SECRET')

@app.route('/webhook', methods=['POST'])
def webhook():
    signature = request.headers.get('X-Webhook-Signature')
    body = request.get_data()
    
    hmac_result = hmac.new(
        WEBHOOK_SECRET.encode(),
        body,
        hashlib.sha256
    ).hexdigest()
    
    if signature != f'sha256={hmac_result}':
        return {'error': 'Invalid signature'}, 401
    
    data = request.json
    # Process webhook...
    return {'success': True}, 200
```

---

## 🗄️ Database Operations

### Insert Webhook
```sql
INSERT INTO webhooks (
  workspace_id, name, url, event_type, secret, 
  state, retry_policy, created_by
) VALUES (
  $1, $2, $3, $4, $5, 'active',
  '{"max_attempts": 3, "backoff_ms": 1000}'::jsonb,
  $6
);
```

### Queue Webhook
```sql
INSERT INTO webhook_queue (
  webhook_id, event_type, event_data, status
) VALUES (
  $1, $2, $3::jsonb, 'pending'
);
```

### Log Delivery
```sql
INSERT INTO webhook_logs (
  webhook_id, event_type, event_data, request_body,
  response_status, execution_time_ms, attempt_number
) VALUES (
  $1, $2, $3::jsonb, $4::jsonb, $5, $6, $7
);
```

### Get Pending Webhooks
```sql
SELECT q.*, w.url, w.secret, w.headers, w.retry_policy
FROM webhook_queue q
JOIN webhooks w ON q.webhook_id = w.id
WHERE q.status = 'pending' 
  AND q.next_retry_at <= NOW()
ORDER BY q.next_retry_at ASC
LIMIT 10;
```

---

## ⚙️ Configuration

### Environment Variables
```bash
# .env
VITE_WEBHOOK_TIMEOUT=10000  # milliseconds
VITE_WEBHOOK_BATCH_SIZE=10  # processing batch size
```

### Webhook Processing Schedule

Recommended setup with a cron job or scheduled task:

```bash
# Process webhooks every 5 seconds
*/5 * * * * curl https://yourapp.com/api/webhooks/process

# Or use a background job worker
node worker.js --process-webhooks
```

---

## 📊 Monitoring & Metrics

### Key Metrics to Track

```typescript
interface WebhookMetrics {
  total_deliveries: number;
  success_count: number;
  failure_count: number;
  success_rate: number;        // 0-100%
  avg_execution_time: number;  // milliseconds
  last_delivery: Date;
}

// Get metrics for a webhook
const stats = await WebhookService.getWebhookStats(webhookId);
```

### Dashboard Insights

1. **Success Rate**: % of webhooks delivered successfully
2. **Failure Trend**: Track failing webhooks over time
3. **Response Time**: Average execution time per event type
4. **Queue Depth**: Pending webhooks waiting for delivery
5. **Retry Rate**: % of deliveries that needed retries

---

## 🧪 Testing Strategy

### Unit Tests
```typescript
test('verifySignature - valid signature', () => {
  const payload = JSON.stringify({test: true});
  const secret = 'test-secret';
  const signature = WebhookService.generateSignature(payload, secret);
  
  expect(WebhookService.verifySignature(
    payload, 
    signature, 
    secret
  )).toBe(true);
});
```

### Integration Tests
```typescript
test('triggerWebhook - queues delivery', async () => {
  await WebhookService.triggerWebhook(
    'vehicle.created',
    { id: 'test-123', make: 'Toyota' },
    'workspace-123'
  );
  
  const queued = await supabase
    .from('webhook_queue')
    .select('*')
    .eq('webhook_id', 'webhook-123');
    
  expect(queued.data).toHaveLength(1);
});
```

### E2E Tests
1. Create webhook via UI
2. Trigger event
3. Verify HTTP request received
4. Check signature validation
5. Verify database logging

---

## 🚀 Performance Considerations

### Delivery Optimization

1. **Batch Processing**: Process 10 webhooks concurrently
2. **Timeouts**: 10-second hard limit per delivery
3. **Retry Logic**: Exponential backoff prevents thundering herd
4. **Queue Indexing**: `next_retry_at` indexed for fast queries

### Database Load

- Use indexes on: `webhook_id`, `status`, `next_retry_at`
- Partition `webhook_logs` by date for archiving old logs
- Vacuum `webhook_queue` to remove delivered/failed items

### API Rate Limiting

- Limit concurrent deliveries to target endpoints
- Implement surge pricing: slow down if endpoint responds slowly
- Set per-endpoint rate limits

---

## 🔒 Security Checklist

- ✅ HTTPS required (enforced in URL validation)
- ✅ HMAC-SHA256 signature on every delivery
- ✅ Secrets stored securely (Supabase encryption)
- ✅ Secret rotation supported
- ✅ RLS policies restrict webhook access
- ✅ Audit trail in webhook_logs
- ✅ Failed webhooks auto-disabled after 10 failures
- ✅ Timeout prevents hanging requests
- ✅ Signature verification prevents spoofing

---

## 📈 Scaling Webhooks

### For 1,000+ Events/Hour

1. **Use horizontal scaling**: Multiple webhook processors
2. **Implement queue workers**: Dedicated webhook service
3. **Add caching**: Cache webhook configs (5 min TTL)
4. **Distribute retries**: Stagger retry attempts
5. **Monitor actively**: Alert on high failure rates

### Database Optimization

```sql
-- Archive old logs (keep 30 days)
DELETE FROM webhook_logs
WHERE created_at < NOW() - INTERVAL '30 days';

-- Vacuum queue after reprocessing
DELETE FROM webhook_queue
WHERE status = 'delivered'
  AND updated_at < NOW() - INTERVAL '7 days';

-- Recreate indexes periodically
REINDEX TABLE webhook_logs;
REINDEX TABLE webhook_queue;
```

---

## 🐛 Troubleshooting

### Webhook Not Being Delivered

**Check:**
1. Webhook state is 'active' (not 'failed' or 'disabled')
2. Event type matches webhook configuration
3. Workspace ID matches (multi-tenant isolation)
4. Queue processor is running
5. Network connectivity to target endpoint

```sql
-- Query for pending webhooks
SELECT COUNT(*) FROM webhook_queue WHERE status = 'pending';

-- Check webhook state
SELECT id, state, last_error FROM webhooks WHERE id = $1;
```

### High Failure Rate

**Investigate:**
1. Check recent logs: `webhook_logs` table
2. Review error messages and response codes
3. Verify endpoint health and response time
4. Check custom headers and authentication
5. Test with the Test Webhook button

```typescript
// Get recent failures
const { data: failures } = await supabase
  .from('webhook_logs')
  .select('*')
  .eq('webhook_id', webhookId)
  .gte('response_status', 400)
  .order('created_at', { ascending: false })
  .limit(10);
```

### Secret Compromise

**Action Items:**
1. Click "Rotate Secret" immediately
2. Update client-side secret
3. Monitor delivery logs for failures
4. Check webhook logs for suspicious activity
5. Consider implementing IP whitelist

---

## 📞 API Endpoints

*Future: REST API for webhook management*

```
POST   /api/webhooks                 # Create webhook
GET    /api/webhooks                 # List webhooks
GET    /api/webhooks/{id}            # Get webhook
PATCH  /api/webhooks/{id}            # Update webhook
DELETE /api/webhooks/{id}            # Delete webhook
POST   /api/webhooks/{id}/test       # Test webhook
POST   /api/webhooks/{id}/rotate     # Rotate secret
GET    /api/webhooks/{id}/logs       # Get delivery logs
POST   /api/webhooks/process         # Process queue (internal)
```

---

## Version & Changelog

**v1.0** (Released 2026-03-05)
- Initial webhook system
- 14 event types
- HMAC-SHA256 signatures
- Exponential backoff retries
- Complete delivery logging
- Admin dashboard UI
- Secret rotation

**Planned v1.1**
- WebSocket real-time subscriptions
- Webhook templates for common integrations
- Advanced filtering per webhook
- Event transformation/mapping
- Batch event delivery
- Custom replay/redelivery

---

**Last Updated**: 2026-03-05  
**Status**: Production Ready
