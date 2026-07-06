import { useTranslation } from 'react-i18next';
import { Clock, Bell, BellOff, CheckCircle2, Circle, Trash2, AlertCircle } from 'lucide-react';

const STATUS_CONFIG = {
  pending: { color: 'text-blue-500 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20', label: 'task.status.pending' },
  active:  { color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20', label: 'task.status.active' },
  done:    { color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20', label: 'task.status.done' },
  missed:  { color: 'text-red-500 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20', label: 'task.status.missed' },
};

export default function TaskCard({ task, onToggle, onDelete }) {
  const { t } = useTranslation();
  const status = task.status || 'pending';
  const cfg = STATUS_CONFIG[status];

  return (
    <div
      className={`card p-4 transition-all duration-200 group
        ${task.done ? 'opacity-60' : ''}
        hover:shadow-warm-md hover:-translate-y-0.5`}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          id={`task-toggle-${task.id}`}
          onClick={() => onToggle?.(task.id)}
          className="mt-0.5 flex-shrink-0 transition-all duration-150 hover:scale-110 active:scale-95"
          aria-label={task.done ? t('task.undo') : t('task.complete')}
        >
          {task.done
            ? <CheckCircle2 className="w-5 h-5 text-amber-500" />
            : <Circle className="w-5 h-5 text-[var(--text-muted)] hover:text-amber-500 transition-colors" />
          }
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium leading-snug mb-1.5 break-words
            ${task.done ? 'line-through text-[var(--text-muted)]' : 'text-[var(--text-primary)]'}`}>
            {task.description}
          </p>

          <div className="flex flex-wrap items-center gap-2">
            {/* Time */}
            <div className="flex items-center gap-1 text-[var(--text-muted)]">
              <Clock className="w-3 h-3" />
              <span className="text-xs">{task.startTime}{task.endTime ? ` – ${task.endTime}` : ''}</span>
            </div>

            {/* Status badge */}
            <span className={`chip ${cfg.color} ${cfg.bg} text-xs`}>
              {t(cfg.label)}
            </span>

            {/* Alarm badge */}
            {task.alarmSet
              ? <span className="chip text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20">
                  <Bell className="w-2.5 h-2.5" />{t('task.alarm.set')}
                </span>
              : <span className="chip text-[var(--text-muted)] bg-[var(--bg-secondary)]">
                  <BellOff className="w-2.5 h-2.5" />{t('task.alarm.notSet')}
                </span>
            }
          </div>
        </div>

        {/* Delete button */}
        <button
          id={`task-delete-${task.id}`}
          onClick={() => onDelete?.(task.id)}
          className="flex-shrink-0 opacity-0 group-hover:opacity-100 w-7 h-7 rounded-xl
                     flex items-center justify-center text-[var(--text-muted)]
                     hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20
                     transition-all duration-150"
          aria-label={t('task.delete')}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
