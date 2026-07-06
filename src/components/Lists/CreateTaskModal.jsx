import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Clock, AlignLeft } from 'lucide-react';

export default function CreateTaskModal({ listId, onClose, onCreated }) {
  const { t } = useTranslation();
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!startTime || !description.trim()) return;
    setSaving(true);
    try {
      await onCreated?.({ startTime, endTime, description: description.trim() });
      onClose?.();
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed bottom-0 left-0 right-0 z-50 sm:inset-0 sm:flex sm:items-center sm:justify-center sm:p-6">
        <div className="card w-full sm:max-w-md rounded-b-none sm:rounded-3xl p-6 animate-slide-up
                        max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-[var(--text-primary)] tracking-tight">
              {t('task.create')}
            </h2>
            <button
              id="modal-close-btn"
              onClick={onClose}
              className="w-8 h-8 rounded-xl flex items-center justify-center
                         text-[var(--text-muted)] hover:text-[var(--text-primary)]
                         hover:bg-[var(--bg-secondary)] transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Time row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">
                  <Clock className="w-3 h-3 inline mr-1" />
                  {t('task.startTime')}
                </label>
                <input
                  id="task-start-time"
                  type="time"
                  value={startTime}
                  onChange={e => setStartTime(e.target.value)}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="label">
                  <Clock className="w-3 h-3 inline mr-1" />
                  {t('task.endTime')}
                </label>
                <input
                  id="task-end-time"
                  type="time"
                  value={endTime}
                  onChange={e => setEndTime(e.target.value)}
                  className="input-field"
                  min={startTime}
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="label">
                <AlignLeft className="w-3 h-3 inline mr-1" />
                {t('task.description')}
              </label>
              <textarea
                id="task-description"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder={t('task.descriptionPlaceholder')}
                className="input-field resize-none"
                rows={3}
                required
                maxLength={300}
              />
              <p className="text-right text-xs text-[var(--text-muted)] mt-1">
                {description.length}/300
              </p>
            </div>

            {/* Info note about AI */}
            <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
              <p className="text-xs text-amber-700 dark:text-amber-400">
                After creating, the AI assistant will ask if you'd like an alarm set for this task.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-1">
              <button
                id="modal-cancel-btn"
                type="button"
                onClick={onClose}
                className="btn-secondary flex-1 justify-center"
              >
                {t('common.cancel')}
              </button>
              <button
                id="task-create-btn"
                type="submit"
                disabled={saving || !startTime || !description.trim()}
                className="btn-primary flex-1 justify-center disabled:opacity-60"
              >
                {saving ? t('task.saving') : t('task.create')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
