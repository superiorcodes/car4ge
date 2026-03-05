import React, { useEffect, useState } from 'react';
import {
  Plus,
  Trash2,
  Eye,
  EyeOff,
  RefreshCw,
  Share2,
  AlertCircle,
  CheckCircle2,
  Clock,
  Copy,
  ChevronDown,
  ChevronUp,
  Play,
  LogOut,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import WebhookService from '../lib/webhookService';
import { useAuth } from '../contexts/AuthContext';
import { Toast } from '../components/Toast';
import type { Webhook, WebhookEvent, WebhookLog } from '../lib/webhook.types';

// Helper function to generate webhook secret
function generateSecret(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

const WEBHOOK_EVENTS: WebhookEvent[] = [
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
  'notification.sent',
];

interface WebhookFormData {
  name: string;
  url: string;
  event_type: WebhookEvent;
  description: string;
  headers: string;
  max_attempts: number;
  backoff_ms: number;
}

const WebhookManagement: React.FC = () => {
  const { user } = useAuth();
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [formData, setFormData] = useState<WebhookFormData>({
    name: '',
    url: '',
    event_type: 'user.created',
    description: '',
    headers: '{}',
    max_attempts: 3,
    backoff_ms: 1000,
  });
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [webhookLogs, setWebhookLogs] = useState<Record<string, WebhookLog[]>>({});
  const [logs, setLogs] = useState<any>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (user) {
      loadWebhooks();
    }
  }, [user]);

  const loadWebhooks = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('webhooks')
        .select('*')
        .eq('workspace_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWebhooks(data || []);
    } catch (error) {
      console.error('Error loading webhooks:', error);
      setToast({ message: 'Failed to load webhooks', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const loadWebhookLogs = async (webhookId: string) => {
    try {
      const { data, error } = await supabase
        .from('webhook_logs')
        .select('*')
        .eq('webhook_id', webhookId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setWebhookLogs(prev => ({ ...prev, [webhookId]: data || [] }));
    } catch (error) {
      console.error('Error loading logs:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Validate form
      if (!formData.name.trim() || !formData.url.trim()) {
        setToast({ message: 'Name and URL are required', type: 'error' });
        return;
      }

      if (!formData.url.match(/^https?:\/\//)) {
        setToast({ message: 'URL must start with http:// or https://', type: 'error' });
        return;
      }

      // Parse headers
      let headers = {};
      if (formData.headers.trim()) {
        try {
          headers = JSON.parse(formData.headers);
        } catch {
          setToast({ message: 'Invalid headers JSON', type: 'error' });
          return;
        }
      }

      const Secret = generateSecret();

      if (editingId) {
        // Update existing webhook
        const { error } = await supabase
          .from('webhooks')
          .update({
            name: formData.name,
            url: formData.url,
            event_type: formData.event_type,
            description: formData.description,
            headers,
            retry_policy: {
              max_attempts: formData.max_attempts,
              backoff_ms: formData.backoff_ms,
            },
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingId);

        if (error) throw error;
        setToast({ message: 'Webhook updated successfully', type: 'success' });
      } else {
        // Create new webhook
        const { error } = await supabase
          .from('webhooks')
          .insert({
            workspace_id: user?.id,
            name: formData.name,
            url: formData.url,
            event_type: formData.event_type,
            description: formData.description,
            secret: Secret,
            headers,
            state: 'active',
            retry_policy: {
              max_attempts: formData.max_attempts,
              backoff_ms: formData.backoff_ms,
            },
            created_by: user?.id,
          });

        if (error) throw error;
        setToast({ message: 'Webhook created successfully', type: 'success' });
      }

      resetForm();
      loadWebhooks();
    } catch (error) {
      console.error('Error saving webhook:', error);
      setToast({ message: 'Failed to save webhook', type: 'error' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this webhook?')) return;

    try {
      const { error } = await supabase
        .from('webhooks')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setToast({ message: 'Webhook deleted successfully', type: 'success' });
      loadWebhooks();
    } catch (error) {
      console.error('Error deleting webhook:', error);
      setToast({ message: 'Failed to delete webhook', type: 'error' });
    }
  };

  const handleRotateSecret = async (webhookId: string) => {
    try {
      const newSecret = await WebhookService.rotateWebhookSecret(webhookId);
      if (newSecret) {
        setToast({ message: 'Secret rotated successfully', type: 'success' });
        loadWebhooks();
      }
    } catch (error) {
      console.error('Error rotating secret:', error);
      setToast({ message: 'Failed to rotate secret', type: 'error' });
    }
  };

  const handleTestWebhook = async (webhookId: string) => {
    try {
      const result = await WebhookService.testWebhook(webhookId);
      setToast({
        message: result.message,
        type: result.success ? 'success' : 'error',
      });
    } catch (error) {
      console.error('Error testing webhook:', error);
      setToast({ message: 'Failed to test webhook', type: 'error' });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      url: '',
      event_type: 'user.created',
      description: '',
      headers: '{}',
      max_attempts: 3,
      backoff_ms: 1000,
    });
    setEditingId(null);
    setShowForm(false);
  };

  const toggleExpanded = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
    if (!webhookLogs[id] && expandedId !== id) {
      loadWebhookLogs(id);
    }
  };

  const getStateColor = (state: string) => {
    switch (state) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'failed':
        return 'bg-orange-100 text-orange-800';
      case 'disabled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (state: string) => {
    switch (state) {
      case 'active':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4" />;
      case 'disabled':
        return <LogOut className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin">
          <RefreshCw className="h-8 w-8 text-gray-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Webhook Management</h2>
          <p className="text-gray-600 mt-1">
            Manage webhooks for integrations with external services
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          <Plus className="h-5 w-5" />
          Add Webhook
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">
            {editingId ? 'Edit Webhook' : 'Add New Webhook'}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Webhook Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Send to Analytics"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Event Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Event Type
                </label>
                <select
                  value={formData.event_type}
                  onChange={e => setFormData({ ...formData, event_type: e.target.value as WebhookEvent })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {WEBHOOK_EVENTS.map(event => (
                    <option key={event} value={event}>
                      {event}
                    </option>
                  ))}
                </select>
              </div>

              {/* URL */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Webhook URL
                </label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={e => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://example.com/webhook"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Optional description for this webhook"
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Headers */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Custom Headers (JSON)
                </label>
                <textarea
                  value={formData.headers}
                  onChange={e => setFormData({ ...formData, headers: e.target.value })}
                  placeholder='{"Authorization": "Bearer token"}'
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Retry Config */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Retry Attempts
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={formData.max_attempts}
                  onChange={e =>
                    setFormData({ ...formData, max_attempts: parseInt(e.target.value) })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Backoff Duration (ms)
                </label>
                <input
                  type="number"
                  min="100"
                  step="100"
                  value={formData.backoff_ms}
                  onChange={e =>
                    setFormData({ ...formData, backoff_ms: parseInt(e.target.value) })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-medium"
              >
                {editingId ? 'Update Webhook' : 'Create Webhook'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Webhooks List */}
      <div className="space-y-4">
        {webhooks.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
            <Share2 className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No webhooks configured yet</p>
            <p className="text-sm text-gray-500 mb-4">
              Create your first webhook to start integrating with external services
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Create First Webhook
            </button>
          </div>
        ) : (
          webhooks.map(webhook => (
            <div key={webhook.id} className="border border-gray-200 rounded-lg">
              {/* Webhook Card */}
              <div className="p-4 bg-white hover:bg-gray-50 transition">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900">{webhook.name}</h3>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStateColor(
                          webhook.state
                        )}`}
                      >
                        {getStatusIcon(webhook.state)}
                        {webhook.state}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 font-mono break-all mb-2">
                      {webhook.url}
                    </p>
                    <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                      <span>Event: {webhook.event_type}</span>
                      <span>
                        Created: {new Date(webhook.created_at).toLocaleDateString()}
                      </span>
                      {webhook.last_triggered_at && (
                        <span>
                          Last triggered:{' '}
                          {new Date(webhook.last_triggered_at).toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => toggleExpanded(webhook.id)}
                      className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg transition"
                      title="View details and logs"
                    >
                      {expandedId === webhook.id ? (
                        <ChevronUp className="h-5 w-5" />
                      ) : (
                        <ChevronDown className="h-5 w-5" />
                      )}
                    </button>
                    <button
                      onClick={() => handleTestWebhook(webhook.id)}
                      className="p-2 text-gray-600 hover:bg-blue-100 rounded-lg transition"
                      title="Send test webhook"
                    >
                      <Play className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleRotateSecret(webhook.id)}
                      className="p-2 text-gray-600 hover:bg-purple-100 rounded-lg transition"
                      title="Rotate secret"
                    >
                      <RefreshCw className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(webhook.id)}
                      className="p-2 text-gray-600 hover:bg-red-100 rounded-lg transition"
                      title="Delete webhook"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Failure Info */}
                {webhook.failure_count > 0 && (
                  <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded text-sm text-orange-800">
                    <AlertCircle className="h-4 w-4 inline mr-2" />
                    {webhook.failure_count} consecutive failures
                    {webhook.last_error && `: ${webhook.last_error}`}
                  </div>
                )}
              </div>

              {/* Expanded Details */}
              {expandedId === webhook.id && (
                <div className="border-t border-gray-200 p-4 bg-gray-50">
                  {/* Secret */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Webhook Secret
                    </label>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 bg-white border border-gray-300 rounded px-3 py-2 font-mono text-xs break-all">
                        {showSecrets[webhook.id]
                          ? webhook.secret
                          : '•'.repeat(webhook.secret.length)}
                      </code>
                      <button
                        onClick={() =>
                          setShowSecrets(prev => ({
                            ...prev,
                            [webhook.id]: !prev[webhook.id],
                          }))
                        }
                        className="p-2 text-gray-600 hover:bg-white rounded-lg"
                      >
                        {showSecrets[webhook.id] ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(webhook.secret);
                          setToast({ message: 'Secret copied to clipboard', type: 'success' });
                        }}
                        className="p-2 text-gray-600 hover:bg-white rounded-lg"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="text-xs text-gray-600 mt-2">
                      Use this secret to verify webhook signatures on your server using HMAC-SHA256
                    </p>
                  </div>

                  {/* Retry Policy */}
                  <div className="mb-4 p-3 bg-white border border-gray-200 rounded">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Retry Policy</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Max Attempts:</span>
                        <p className="font-medium">{webhook.retry_policy?.max_attempts || 3}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Backoff:</span>
                        <p className="font-medium">{webhook.retry_policy?.backoff_ms || 1000}ms</p>
                      </div>
                    </div>
                  </div>

                  {/* Custom Headers */}
                  {webhook.headers && Object.keys(webhook.headers).length > 0 && (
                    <div className="mb-4 p-3 bg-white border border-gray-200 rounded">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">
                        Custom Headers
                      </h4>
                      <div className="bg-gray-50 p-2 rounded text-xs font-mono overflow-auto max-h-32">
                        {JSON.stringify(webhook.headers, null, 2)}
                      </div>
                    </div>
                  )}

                  {/* Webhook Logs */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-3">
                      Recent Deliveries ({webhookLogs[webhook.id]?.length || 0})
                    </h4>
                    {webhookLogs[webhook.id] && webhookLogs[webhook.id].length > 0 ? (
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {webhookLogs[webhook.id].map(log => (
                          <div
                            key={log.id}
                            className={`p-2 rounded text-xs ${
                              (log.response_status || 500) < 400
                                ? 'bg-green-50 border border-green-200'
                                : 'bg-red-50 border border-red-200'
                            }`}
                          >
                            <div className="flex justify-between items-start gap-2">
                              <div>
                                <p className="font-medium">
                                  Attempt #{log.attempt_number} -{' '}
                                  {new Date(log.created_at).toLocaleString()}
                                </p>
                                {log.response_status && (
                                  <p className="text-gray-600">
                                    Status: {log.response_status} - {log.execution_time_ms}ms
                                  </p>
                                )}
                                {log.error_message && (
                                  <p className="text-red-600">{log.error_message}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No deliveries yet</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default WebhookManagement;
