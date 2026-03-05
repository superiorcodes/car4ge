# Webhooks System - Complete Integration Guide

## 📡 Overview

The webhooks system enables your car garage management platform to communicate with external services whenever important events occur. This guide covers setup, usage, and best practices.

### What are Webhooks?

Webhooks are HTTP callbacks that are triggered when specific events happen in your system. Instead of constantly polling your API, external services subscribe to events and receive real-time notifications.

**Example Flow:**
```
User creates vehicle → Database updates
                    → Webhook triggered
                    → HTTP POST sent to your configured URL
                    → External service processes the event
```

---

## 🚀 Getting Started

### Step 1: Access Webhook Management

1. Log in as an **admin** user
2. Navigate to **Admin Dashboard** → **Webhooks** tab
3. Click **Add Webhook** button

### Step 2: Configure Your Webhook

Fill in the following fields:

| Field | Required | Example | Notes |
|-------|----------|---------|-------|
| **Webhook Name** | Yes | "Send to Analytics" | For your reference |
| **Event Type** | Yes | vehicle.created | Choose from 14 event types |
| **Webhook URL** | Yes | https://api.example.com/webhooks/vehicle | Must be HTTPS |
| **Description** | No | "Sync vehicles to Analytics platform" | Optional |
| **Custom Headers** | No | `{"Authorization": "Bearer token"}` | JSON format |
| **Max Retries** | No | 3 (default) | How many times to retry failed deliveries |
| **Backoff Duration** | No | 1000ms (default) | Wait time between retries (exponential) |

### Step 3: Save Your Webhook

Click "Create Webhook" - your unique webhook secret will be generated automatically.

---

## 📋 Supported Events

Your system can trigger webhooks for these events:

### User Events
- `user.created` - New user registered
- `user.updated` - User profile modified
- `user.deleted` - User account deleted

### Vehicle Events
- `vehicle.created` - New vehicle added to garage
- `vehicle.updated` - Vehicle details updated
- `vehicle.deleted` - Vehicle removed

### Garage Events
- `garage.created` - New garage created
- `garage.updated` - Garage information updated
- `garage.deleted` - Garage removed

### Maintenance Events
- `maintenance.created` - New maintenance record created
- `maintenance.updated` - Maintenance record modified
- `maintenance.completed` - Maintenance work completed
- `maintenance.deleted` - Maintenance record removed

### Notification Events
- `notification.sent` - System notification sent to user

---

## 🔐 Security

### Webhook Signatures

Every webhook delivery includes an `X-Webhook-Signature` header with an HMAC-SHA256 signature. Always verify this signature on your server.

**Headers Sent:**
```
X-Webhook-Event: vehicle.created
X-Webhook-Delivery: [unique-delivery-id]
X-Webhook-Signature: sha256=abc123...
X-Webhook-Attempt: 1
X-Webhook-Test: false (or true for test deliveries)
```

### Verification Example (Node.js)

```javascript
const crypto = require('crypto');

function verifyWebhookSignature(payload, signature, secret) {
  const hmac = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(`sha256=${hmac}`)
  );
}

// In your webhook handler:
app.post('/webhook', (req, res) => {
  const signature = req.headers['x-webhook-signature'];
  const payloadString = JSON.stringify(req.body);
  
  if (!verifyWebhookSignature(payloadString, signature, WEBHOOK_SECRET)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }
  
  // Process webhook...
  res.json({ success: true });
});
```

### Secret Management

- Secrets are automatically generated and unique per webhook
- Store your secret securely (environment variable)
- Never commit secrets to version control
- Use the **Rotate Secret** button to generate a new secret
- All previous secrets are archived

---

## 📨 Webhook Payload

All webhooks send JSON payloads with this structure:

```json
{
  "event": "vehicle.created",
  "timestamp": "2026-03-05T14:30:45.123Z",
  "data": {
    "id": "uuid-123",
    "garage_id": "uuid-456",
    "make": "Toyota",
    "model": "Camry",
    "year": 2024,
    "license_plate": "ABC-1234",
    "vin": "...",
    "created_at": "2026-03-05T14:30:45.123Z"
  },
  "attempt": 1,
  "delivery_id": "delivery-uuid"
}
```

### Payload Fields

| Field | Type | Description |
|-------|------|-------------|
| `event` | string | Event type that triggered the webhook |
| `timestamp` | ISO8601 | When the event occurred |
| `data` | object | Event-specific data (varies by event type) |
| `attempt` | number | Retry attempt number (1 = first attempt) |
| `delivery_id` | string | Unique identifier for this delivery |

---

## 🔄 Retry Logic

If your webhook endpoint returns an error or doesn't respond:

1. **First Attempt**: Sent immediately
2. **Failed**: Marked for retry
3. **Exponential Backoff**: 
   - Attempt 2: ~1s (configurable base)
   - Attempt 3: ~2s 
   - Attempt 4: ~4s
   - Maximum: Based on `max_retries` setting

**Webhook Status Tracking:**
- ✅ **Active**: Delivering successfully
- ⏰ **Inactive**: Manually disabled
- ⚠️ **Failed**: Recent failures (resets on success)
- 🛑 **Disabled**: Auto-disabled after 10+ consecutive failures

---

## 🧪 Testing Your Webhook

### Method 1: Use the Test Button

1. Open webhook details (click the chevron icon)
2. Click the **Play button** (Test Webhook)
3. Check the response in "Recent Deliveries"

### Method 2: Monitor Deliveries

Each webhook shows "Recent Deliveries" with:
- Delivery timestamp
- HTTP status code
- Response time
- Error message (if applicable)

---

## 💡 Common Integrations

### CRM System (HubSpot, Salesforce)

Create webhook for `vehicle.created` and `user.created`:

```
Event: user.created
URL: https://api.hubspot.com/crm/v3/webhooks
Headers: {
  "Authorization": "Bearer HubSpot-API-Key",
  "X-HubSpot-Request-Id": "webhook-car4ge"
}
```

### Analytics Platform (Mixpanel, Segment)

Create webhooks for maintenance tracking:

```
Event: maintenance.completed
URL: https://api.segment.com/webhooks
Headers: {
  "Authorization": "Bearer Segment-API-Key"
}
```

### Slack Notifications

Send alerts for important events:

```
Event: maintenance.completed
URL: https://hooks.slack.com/services/YOUR/WEBHOOK/URL
Headers: {} (none needed)
```

Custom headers would include formatted message payload.

### Email Notification Service

Trigger emails for user actions:

```
Event: user.created
URL: https://api.sendgrid.com/v3/webhooks
Headers: {
  "Authorization": "Bearer SendGrid-API-Key"
}
```

---

## 📊 Monitoring & Troubleshooting

### View Webhook Logs

1. Click the **chevron icon** on any webhook to expand details
2. **Recent Deliveries** section shows:
   - Timestamp, attempt number, status
   - Response time and error messages
   - Retry scheduling info

### Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| **400 Bad Request** | Malformed JSON payload | Check data schema matches your expectations |
| **401 Unauthorized** | Invalid authentication | Verify custom headers and API keys |
| **403 Forbidden** | Access denied | Check endpoint permissions |
| **404 Not Found** | Wrong URL | Verify webhook URL is correct |
| **408 Timeout** | Server too slow | Increase timeout (default: 10s) |
| **500+ Server Error** | Endpoint error | Check target service logs |
| **Network Error** | Endpoint unreachable | Verify URL is accessible from internet |

### Re-enable Disabled Webhooks

If webhook is auto-disabled (10+ failures):

1. **Fix the issue** on your receiving endpoint
2. Click **Rotate Secret** to generate fresh credentials
3. Click the webhook state to manually re-activate
4. Send a test delivery

---

## 🔧 Advanced Configuration

### Custom Headers

Use custom headers to pass authentication or metadata:

```json
{
  "Authorization": "Bearer YOUR_API_KEY",
  "X-Custom-Header": "value",
  "X-Garage-ID": "123"
}
```

These headers are sent with every webhook delivery.

### Retry Policy

Configure retry behavior per webhook:

- **Max Attempts**: 1-10 (default: 3)
- **Backoff Duration**: 100-60000ms (default: 1000ms)

Example config:
```json
{
  "max_attempts": 5,
  "backoff_ms": 2000
}
```

This means:
- Try up to 5 times total
- Wait 2s, then 4s, then 8s, then 16s

---

## 📈 Best Practices

### 1. **Respond Quickly**
- Endpoint should respond within 10 seconds
- Do heavy processing asynchronously
- Return 200 OK as soon as possible

### 2. **Validate Signatures**
```javascript
// Always verify! Don't trust untrusted sources
if (req.headers['x-webhook-test'] !== 'true') {
  verifySignature(req.body, req.headers['x-webhook-signature']);
}
```

### 3. **Handle Idempotency**
- Use `delivery_id` to prevent duplicate processing
- Store processed delivery IDs in database
- Multiple deliveries of same event can occur due to retries

### 4. **Log Events**
```javascript
console.log({
  delivery_id: req.body.delivery_id,
  event: req.body.event,
  timestamp: new Date(),
  status: 'received'
});
```

### 5. **Monitor Resources**
- Set up alerts for failed webhook deliveries
- Monitor endpoint response times
- Track Failed webhook metrics

### 6. **Secure Your Endpoints**
- Use HTTPS only (required)
- Implement rate limiting
- Authenticate all requests
- Keep API keys in environment variables

### 7. **Test Thoroughly**
- Use Test Webhook button before production
- Monitor delivery logs
- Set up dead letter queue for investigation

---

## 🚨 Rate Limits & Constraints

| Limit | Value | Notes |
|-------|-------|-------|
| Max webhooks per event | Unlimited | Create as many as needed |
| Max custom headers | 20 | Per webhook |
| Payload size | 1MB | Total JSON payload size |
| URL length | 2048 chars | Must be valid URL |
| Retry attempts | 1-10 | Max retries per delivery |
| Request timeout | 10 seconds | Hard limit |
| Concurrent deliveries | 10 | Per workspace |

---

## 📝 Event Data Schemas

### User Events
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "full_name": "John Doe",
  "role": "manager",
  "created_at": "2026-03-05T14:30:45.123Z",
  "updated_at": "2026-03-05T14:30:45.123Z"
}
```

### Vehicle Events
```json
{
  "id": "uuid",
  "garage_id": "uuid",
  "make": "Toyota",
  "model": "Camry",
  "year": 2024,
  "license_plate": "ABC-1234",
  "vin": "JTEGH5C1005009186",
  "created_at": "2026-03-05T14:30:45.123Z"
}
```

### Maintenance Events
```json
{
  "id": "uuid",
  "vehicle_id": "uuid",
  "type": "oil-change",
  "description": "Regular oil change",
  "status": "completed",
  "scheduled_date": "2026-03-05",
  "completion_date": "2026-03-05T10:30:00Z",
  "cost": 45.99,
  "created_at": "2026-03-05T08:00:00Z"
}
```

---

## 🔄 Integration Workflow Example

### Real-World Scenario: Sync New Vehicles to Analytics

```
Step 1: Admin configures webhook
  URL: https://analytics.com/api/events
  Event: vehicle.created
  Headers: { "Api-Key": "analytics-key-123" }

Step 2: User creates vehicle in Car4ge
  - Vehicle stored in database
  - Webhook event triggered
  - Payload sent to analytics endpoint

Step 3: Analytics receives webhook
  - Validates signature
  - Checks delivery_id (idempotency)
  - Processes vehicle data
  - Returns 200 OK

Step 4: Car4ge logs success
  - Marks delivery as "delivered"
  - Updates last_triggered_at
  - Resets failure count

Step 5: Analytics dashboard updated
  - New vehicle appears in stats
  - Reports updated
```

---

## 📞 Support & Debugging

### Check Delivery Status

1. Webhook detail view → "Recent Deliveries"
2. Shows: timestamp, status code, response time, errors
3. Click entry for full request/response bodies

### Rotate Webhook Secret

If you suspect your secret was compromised:

1. Click webhook to expand
2. Click "Rotate Secret" button
3. New secret generated automatically
4. Update your endpoint with new secret
5. Old secrets are archived

### Disable Webhook Temporarily

If experiencing issues:

1. Webhook state changes automatically based on failures
2. Manual action: Click state badge to disable
3. Fix your endpoint
4. Manually re-enable webhook

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-03-05 | Initial release |
| | | - 14 event types supported |
| | | - HMAC-SHA256 signature verification |
| | | - Exponential backoff retry logic |
| | | - Complete delivery logging |
| | | - Secret rotation support |

---

## Next Steps

1. ✅ Access webhook management (Admin Dashboard)
2. ✅ Create your first webhook
3. ✅ Implement signature verification on your endpoint
4. ✅ Test with the Test Webhook button
5. ✅ Monitor delivery logs in Real Deliveries section
6. ✅ Deploy to production

For more details on specific event types or implementation patterns, see the **WebhookManagement** component documentation or API reference.
