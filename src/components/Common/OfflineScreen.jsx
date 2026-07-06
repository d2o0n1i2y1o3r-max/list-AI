import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { WifiOff, RefreshCw } from 'lucide-react';

export default function OfflineScreen({ onRetry }) {
  const { t } = useTranslation();
  const [checking, setChecking] = useState(false);

  const handleRetry = async () => {
    setChecking(true);
    await onRetry?.();
    setTimeout(() => setChecking(false), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--bg-primary)] px-6 animate-fade-in">
      {/* Icon */}
      <div className="w-20 h-20 rounded-full bg-charcoal-100 dark:bg-charcoal-700 flex items-center justify-center mb-6">
        <WifiOff className="w-9 h-9 text-[var(--text-muted)]" />
      </div>

      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-3 text-center tracking-tight">
        {t('offline.title')}
      </h1>
      <p className="text-sm text-[var(--text-secondary)] text-center max-w-xs leading-relaxed mb-8">
        {t('offline.description')}
      </p>

      <button
        id="offline-retry-btn"
        onClick={handleRetry}
        disabled={checking}
        className="btn-primary gap-2 disabled:opacity-60"
      >
        <RefreshCw className={`w-4 h-4 ${checking ? 'animate-spin' : ''}`} />
        {checking ? t('offline.retrying') : t('offline.retry')}
      </button>
    </div>
  );
}
