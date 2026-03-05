# Webhooks - Quick Start Reference

## ⚡ 5-Minute Setup

### 1. Access Webhooks
```
Admin Dashboard → Webhooks Tab
```

### 2. Create Webhook
Click **Add Webhook** and fill in:
- **Name**: "Send to CRM" 
- **Event**: `vehicle.created`
- **URL**: `https://api.example.com/webhook`
- Click **Create** → Secret auto-generated ✓

### 3. View Your Secret
```
Click webhook row → Expand details → Click eye icon
Copy secret to your .env file
```

### 4. Test It
```
Click webhook row → Click Play button
Check "Recent Deliveries" tab → Should see ✓
```

### 5. Verify Signatures (Your Server)

**Node.js:**
```javascript
const crypto = require('crypto');

function verifySignature(body, signature, secret) {
  const hmac = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(body))
    .digest('hex');
  return signature === `sha256=${hmac}`;
}

app.post('/webhook', (req, res) => {
  const sig = req.headers['x-webhook-signature'];
  if (!verifySignature(req.body, sig, process.env.WEBHOOK_SECRET)) {
    return res.status(401).json({ error: 'Invalid' });
  }
  // Process webhook...
  res.json({ ok: true });
});
```

**Python:**
```python
import hmac, hashlib, json

def verify(body, sig, secret):
  h = hmac.new(secret.encode(), body, hashlib.sha256).hexdigest()
  return sig == f'sha256={h}'

@app.post('/webhook')
def webhook():
  body = request.get_data()
  sig = request.headers.get('X-Webhook-Signature')
  if not verify(body, sig, os.getenv('WEBHOOK_SECRET')):
    return {'error': 'Invalid'}, 401
  # Process...
  return {'ok': True}
```

---

## 📡 Webhook Payload Structure

What you receive:
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
    "license_plate": "ABC-1234"
  },
  "attempt": 1,
  "delivery_id": "delivery-uuid"
}
```

**Key Fields:**
- `event` → Event type (see list below)
- `timestamp` → When it happened
- `data` → Event-specific information
- `attempt` → Retry attempt #
- `delivery_id` → Unique ID (use for idempotency)

---

## 🎯 14 Event Types

### User Events
- `user.created` - New user registered
- `user.updated` - Profile changed
- `user.deleted` - Account deleted

### Vehicle Events
- `vehicle.created` - New vehicle added
- `vehicle.updated` - Details modified
- `vehicle.deleted` - Vehicle removed

### Garage Events
- `garage.created` - New garage
- `garage.updated` - Info changed
- `garage.deleted` - Garage removed

### Maintenance Events
- `maintenance.created` - New maintenance record
- `maintenance.updated` - Record modified
- `maintenance.completed` - Work finished
- `maintenance.deleted` - Record removed

### Notifications
- `notification.sent` - System alert sent

---

## 🔐 Headers You'll Receive

```
Content-Type: application/json
User-Agent: Car4ge-Webhook/1.0
X-Webhook-Event: vehicle.created
X-Webhook-Delivery: [unique-id]
X-Webhook-Signature: sha256=abc123...
X-Webhook-Attempt: 1
X-Webhook-Test: false
```

**Always check:**
- `X-Webhook-Signature` - Verify it with your secret
- `X-Webhook-Delivery` - Store it to prevent duplicates
- `X-Webhook-Event` - Check event type

---

## ✅ Common Patterns

### 1. Sync to CRM (HubSpot)
```
Event: vehicle.created
URL: https://api.hubspot.com/crm/v3/objects/vehicles
Headers: { "Authorization": "Bearer hubspot-key" }
```

### 2. Track in Analytics (Segment)
```
Event: maintenance.completed
URL: https://api.segment.com/v1/track
Headers: { "Authorization": "Bearer segment-token" }
```

### 3. Slack Alerts
```
Event: maintenance.completed
URL: https://hooks.slack.com/services/T00/B00/XXXX
Headers: {} (none needed)
```

### 4. Email Notification
```
Event: user.created
URL: https://api.sendgrid.com/v3/mail/send
Headers: { "Authorization": "Bearer sendgrid-key" }
```

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| **Still pending?** | Check if URL is HTTPS and accessible |
| **Failed delivery?** | Click webhook → view logs → check error |
| **401 Unauthorized?** | Check custom headers and API key |
| **Signature invalid?** | Use raw body string, not parsed JSON |
| **Missing data?** | Check event_data in webhook logs |

### Check Webhook Status
```
Webhook Row → Status Badge
- ✅ Active = Delivering
- ⏱️ Inactive = Paused
- ⚠️ Failed = Recent failures (still trying)
- 🛑 Disabled = Auto-disabled (10+ failures)
```

---

## 🔄 Retry Behavior

**Exponential Backoff:**
```
1st attempt: Immediate
2nd attempt: ~1 second (configurable)
3rd attempt: ~2 seconds
4th attempt: ~4 seconds
...continues until max_retries
```

**Configure per webhook:**
- Max Attempts: 1-10 (default 3)
- Backoff Duration: 100-60000ms (default 1000)

---

## 🛡️ Security Best Practices

✅ **Always verify signatures**
```javascript
if (!verifySignature(body, sig)) return 401;
```

✅ **Store secrets in .env**
```bash
# .env
WEBHOOK_SECRET=abc123xyz...
```

✅ **Handle idempotency**
```javascript
// Check if we've processed this before
if (await db.isProcessed(delivery_id)) return 200;
```

✅ **Use HTTPS only**
- Webhook URLs must start with `https://`
- Never use `http://` in production

✅ **Log everything**
```javascript
console.log({
  delivery_id: payload.delivery_id,
  event: payload.event,
  timestamp: new Date(),
  success: response.ok
});
```

---

## 📊 Monitoring Dashboard

In Admin Dashboard → Webhooks tab, you can see:

- **Key Metrics**
  - Success count / Total deliveries  
  - Success rate percentage
  - Average response time

- **Recent Deliveries** (per webhook)
  - Timestamp of each delivery
  - HTTP status code
  - Response time
  - Error messages

- **Webhook Health**
  - Current state (active/failed/disabled)
  - Last triggered time
  - Failure count
  - Last error message

---

## 💡 Pro Tips

### 1. Test Before Production
```
Click webhook → Click Play button
Check Recent Deliveries for ✓ success
```

### 2. Process Asynchronously
```
Don't block the webhook request!
Queue the task and return 200 immediately
```

### 3. Monitor Response Times
```
Admin Dashboard shows avg execution time
Ideal: < 100ms (process async)
Max: 10 seconds (hard timeout)
```

### 4. Rotate Secrets Quarterly
```
Click webhook → Click "Rotate Secret" button
Update your endpoint with new secret
```

### 5. Archive Old Logs
```
Logs kept 30 days by default
Plan for long-term storage in your system
```

---

## 🚀 Performance Tips

| Task | Time | Notes |
|------|------|-------|
| Create webhook | <100ms | Instant |
| Test webhook | 100-500ms | Depends on your server |
| Signature verification | <10ms | Super fast |
| Database logging | <50ms | Automatic |
| Retry scheduling | ~1s | Exponential backoff |

---

## 📝 Webhook Response

Your endpoint should respond with:

**Success (200-299):**
```json
{
  "success": true
}
```

**Error (400+):**
```json
{
  "error": "Invalid data"
}
```

**Don't return:**
- `30x` redirects (won't follow)
- `5xx` errors (will retry immediately)
- Anything that takes >10 seconds (timeout)

---

## 🎯 Integration Checklist

- [ ] Created webhook in Admin Dashboard
- [ ] Copied webhook secret
- [ ] Built signature verification
- [ ] Tested with test button
- [ ] Checked Recent Deliveries
- [ ] Deployed to production
- [ ] Set up monitoring/alerts
- [ ] Documented webhook handler
- [ ] Added error logging
- [ ] Set up dead letter queue (optional)

---

## 📞 Need Help?

### Resources
1. **Webhooks_Complete_Guide.md** - Full user guide
2. **Webhooks_API_Reference.md** - Technical deep dive
3. **Admin Dashboard** - Live webhook testing
4. **Recent Deliveries** - Debugging logs

### Common Questions

**Q: How do I know if a webhook failed?**  
A: Check webhook status badge (⚠️ Failed) and click to see logs

**Q: When are retries scheduled?**  
A: Exponential backoff - 2^attempt (1s, 2s, 4s, 8s...)

**Q: Can I change the secret?**  
A: Yes! Click "Rotate Secret" button to generate new one

**Q: How long are logs kept?**  
A: 30 days by default (configurable, archivable)

**Q: What if my endpoint is slow?**  
A: Keep it under 10 seconds. Better: Return 200 immediately, process async

---

## 🎓 Next Steps

1. ✅ Visit Admin Dashboard → Webhooks
2. ✅ Create your first webhook
3. ✅ Test with the test button
4. ✅ Implement signature verification
5. ✅ Deploy to your production endpoint
6. ✅ Monitor delivery logs

**You're ready to integrate!** 🚀

---

**Last Updated**: March 5, 2026  
**Version**: 1.0  
**Status**: Production Ready ✅
