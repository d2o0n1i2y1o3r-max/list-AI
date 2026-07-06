import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Minus, Plus, ArrowRight, Lightbulb } from 'lucide-react';
import { useLists } from '../../contexts/ListsContext';
import { useAuth } from '../../contexts/AuthContext';

const LIST_EMOJIS = ['📋', '💼', '🏃', '🎯', '📚', '🌱', '✈️', '💡', '🎨', '🔬'];
const EMOJI_SUGGESTIONS = ['Work', 'Personal', 'Fitness', 'Study', 'Shopping', 'Projects', 'Travel', 'Ideas'];

export default function ListSetup({ onComplete }) {
  const { t } = useTranslation();
  const { initializeLists } = useLists();
  const { updateUserProfile } = useAuth();

  const [count, setCount] = useState(3);
  const [names, setNames] = useState(['', '', '']);
  const [saving, setSaving] = useState(false);

  const updateCount = (newCount) => {
    const clamped = Math.max(1, Math.min(10, newCount));
    setCount(clamped);
    setNames(prev => {
      const next = [...prev];
      while (next.length < clamped) next.push('');
      return next.slice(0, clamped);
    });
  };

  const setName = (i, val) => {
    setNames(prev => {
      const next = [...prev];
      next[i] = val;
      return next;
    });
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const finalNames = names.map((n, i) => n.trim() || EMOJI_SUGGESTIONS[i] || `List ${i + 1}`);
      await initializeLists(finalNames);
      await updateUserProfile({ onboardingComplete: true, listCount: count });
      onComplete?.();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] px-6 py-12">
      <div className="w-full max-w-md animate-slide-up">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-3xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center mx-auto mb-5 shadow-amber">
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
              <path d="M8 10h16M8 16h10M8 22h12" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight mb-2">
            {t('onboarding.title')}
          </h1>
          <p className="text-[var(--text-secondary)] text-sm max-w-xs mx-auto">
            {t('onboarding.subtitle')}
          </p>
        </div>

        {/* Count stepper */}
        <div className="card p-5 mb-5">
          <label className="label">{t('onboarding.listCount')}</label>
          <div className="flex items-center gap-4 mt-2">
            <button
              id="count-decrease-btn"
              onClick={() => updateCount(count - 1)}
              disabled={count <= 1}
              className="w-10 h-10 rounded-xl border border-[var(--border)] flex items-center justify-center
                         text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] disabled:opacity-30
                         transition-all active:scale-95"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="text-3xl font-bold text-[var(--text-primary)] w-8 text-center select-none">
              {count}
            </span>
            <button
              id="count-increase-btn"
              onClick={() => updateCount(count + 1)}
              disabled={count >= 10}
              className="w-10 h-10 rounded-xl border border-[var(--border)] flex items-center justify-center
                         text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] disabled:opacity-30
                         transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* List name inputs */}
        <div className="card p-5 mb-5 space-y-3">
          {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="animate-slide-down" style={{ animationDelay: `${i * 0.05}s` }}>
              <label className="label">
                {t('onboarding.listNameLabel', { index: i + 1 })}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base">
                  {LIST_EMOJIS[i % LIST_EMOJIS.length]}
                </span>
                <input
                  id={`list-name-${i}`}
                  type="text"
                  value={names[i]}
                  onChange={e => setName(i, e.target.value)}
                  placeholder={EMOJI_SUGGESTIONS[i] || t('onboarding.listNamePlaceholder')}
                  className="input-field pl-10"
                  maxLength={40}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Tip */}
        <div className="flex items-start gap-2.5 px-1 mb-6">
          <Lightbulb className="w-3.5 h-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-[var(--text-muted)]">{t('onboarding.tip')}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            id="onboarding-skip-btn"
            onClick={() => { updateUserProfile({ onboardingComplete: true }); onComplete?.(); }}
            className="btn-ghost flex-shrink-0"
          >
            {t('onboarding.skip')}
          </button>
          <button
            id="onboarding-continue-btn"
            onClick={handleSubmit}
            disabled={saving}
            className="btn-primary flex-1 justify-center"
          >
            {saving ? t('common.loading') : t('onboarding.continue')}
            {!saving && <ArrowRight className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
