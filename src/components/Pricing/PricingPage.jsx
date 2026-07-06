import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, Zap, Star, Sparkles, X } from 'lucide-react';

const PLANS = [
  {
    id: 'trial',
    nameKey: 'pricing.plans.trial.name',
    priceKey: 'pricing.plans.trial.price',
    periodKey: 'pricing.plans.trial.period',
    descKey: 'pricing.plans.trial.description',
    features: ['upTo3Lists', 'basicAI', 'alarmBasic'],
    cta: 'getStarted',
    highlight: false,
    icon: Sparkles,
  },
  {
    id: 'weekly',
    nameKey: 'pricing.plans.weekly.name',
    priceKey: 'pricing.plans.weekly.price',
    periodKey: 'pricing.plans.weekly.period',
    descKey: 'pricing.plans.weekly.description',
    features: ['unlimitedLists', 'aiScheduling', 'smartAlarms', 'fileUploads'],
    cta: 'upgrade',
    highlight: false,
    icon: Zap,
  },
  {
    id: 'monthly',
    nameKey: 'pricing.plans.monthly.name',
    priceKey: 'pricing.plans.monthly.price',
    periodKey: 'pricing.plans.monthly.period',
    descKey: 'pricing.plans.monthly.description',
    features: ['unlimitedLists', 'aiScheduling', 'smartAlarms', 'fileUploads', 'prioritySupport'],
    cta: 'upgrade',
    highlight: true,
    icon: Star,
    badge: 'popular',
  },
  {
    id: 'yearly',
    nameKey: 'pricing.plans.yearly.name',
    priceKey: 'pricing.plans.yearly.price',
    periodKey: 'pricing.plans.yearly.period',
    descKey: 'pricing.plans.yearly.description',
    features: ['unlimitedLists', 'aiScheduling', 'smartAlarms', 'fileUploads', 'prioritySupport'],
    savings: 'pricing.plans.yearly.savings',
    cta: 'upgrade',
    highlight: false,
    icon: Star,
  },
];

function PlanCard({ plan, currentPlan, onSelect }) {
  const { t } = useTranslation();
  const Icon = plan.icon;
  const isCurrent = currentPlan === plan.id;

  return (
    <div className={`relative card p-6 transition-all duration-200
      ${plan.highlight
        ? 'border-amber-400 dark:border-amber-500 shadow-amber ring-1 ring-amber-400/30'
        : 'hover:shadow-warm-md hover:-translate-y-0.5'
      }
    `}>
      {/* Popular badge */}
      {plan.badge === 'popular' && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="px-3 py-1 rounded-full bg-amber-600 text-white text-xs font-semibold shadow-amber">
            {t('pricing.popular')}
          </span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center
            ${plan.highlight ? 'bg-amber-600' : 'bg-[var(--bg-secondary)]'}`}>
            <Icon className={`w-4 h-4 ${plan.highlight ? 'text-white' : 'text-[var(--text-secondary)]'}`} />
          </div>
          <div>
            <h3 className="font-semibold text-[var(--text-primary)] text-sm">{t(plan.nameKey)}</h3>
            <p className="text-xs text-[var(--text-muted)]">{t(plan.descKey)}</p>
          </div>
        </div>
        {isCurrent && (
          <span className="chip bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-xs">
            {t('pricing.currentPlan')}
          </span>
        )}
      </div>

      {/* Price */}
      <div className="mb-4">
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold text-[var(--text-primary)]">{t(plan.priceKey)}</span>
          <span className="text-sm text-[var(--text-muted)]">{t(plan.periodKey)}</span>
        </div>
        {plan.savings && (
          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5 font-medium">{t(plan.savings)}</p>
        )}
      </div>

      {/* Features */}
      <ul className="space-y-2 mb-5">
        {plan.features.map(f => (
          <li key={f} className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
            <Check className={`w-3.5 h-3.5 flex-shrink-0 ${plan.highlight ? 'text-amber-500' : 'text-emerald-500'}`} />
            {t(`pricing.features.${f}`)}
          </li>
        ))}
      </ul>

      {/* CTA */}
      <button
        id={`plan-select-${plan.id}`}
        onClick={() => onSelect(plan)}
        disabled={isCurrent}
        className={`w-full py-2.5 rounded-2xl text-sm font-medium transition-all duration-150 active:scale-95
          ${isCurrent
            ? 'bg-[var(--bg-secondary)] text-[var(--text-muted)] cursor-not-allowed'
            : plan.highlight
              ? 'btn-primary w-full justify-center'
              : 'btn-secondary w-full justify-center'
          }`}
      >
        {isCurrent ? t('pricing.currentPlan') : t(`pricing.${plan.cta}`)}
      </button>
    </div>
  );
}

function CheckoutModal({ plan, onClose }) {
  const { t } = useTranslation();
  const [step, setStep] = useState('confirm'); // 'confirm' | 'processing' | 'done'

  const handleCheckout = () => {
    setStep('processing');
    // Simulate Stripe checkout redirect
    setTimeout(() => setStep('done'), 2000);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-fade-in" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="card max-w-sm w-full p-6 animate-scale-in">
          {step === 'confirm' && (
            <>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-[var(--text-primary)]">{t('pricing.checkout')}</h3>
                <button onClick={onClose} className="btn-ghost p-1.5"><X className="w-4 h-4" /></button>
              </div>
              <div className="p-3.5 rounded-2xl bg-[var(--bg-secondary)] mb-4">
                <p className="text-sm font-medium text-[var(--text-primary)]">{plan.name}</p>
                <p className="text-xl font-bold text-[var(--text-primary)] mt-0.5">{plan.price} <span className="text-sm font-normal text-[var(--text-muted)]">{plan.period}</span></p>
              </div>
              <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 mb-4">
                <p className="text-xs text-amber-700 dark:text-amber-400">{t('pricing.checkoutNote')}</p>
              </div>
              <button id="checkout-confirm-btn" onClick={handleCheckout} className="btn-primary w-full justify-center">
                {t('pricing.checkout')} →
              </button>
            </>
          )}
          {step === 'processing' && (
            <div className="text-center py-8">
              <div className="w-12 h-12 rounded-full border-2 border-amber-500 border-t-transparent animate-spin mx-auto mb-4" />
              <p className="text-[var(--text-secondary)] text-sm">Redirecting to Stripe...</p>
            </div>
          )}
          {step === 'done' && (
            <div className="text-center py-8">
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-4">
                <Check className="w-6 h-6 text-emerald-500" />
              </div>
              <p className="text-sm text-[var(--text-muted)] mb-4">{t('pricing.checkoutNote')}</p>
              <button id="checkout-done-btn" onClick={onClose} className="btn-primary">Done</button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default function PricingPage({ onClose, currentPlan = 'trial' }) {
  const { t } = useTranslation();
  const [selectedPlan, setSelectedPlan] = useState(null);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] animate-fade-in">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[var(--bg-primary)]/90 backdrop-blur-md border-b border-[var(--border)]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <h1 className="section-title">{t('pricing.title')}</h1>
          {onClose && (
            <button id="pricing-close-btn" onClick={onClose} className="btn-ghost p-2">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <p className="text-[var(--text-secondary)] text-center mb-8">{t('pricing.subtitle')}</p>

        {/* Plan grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {PLANS.map(plan => (
            <PlanCard
              key={plan.id}
              plan={plan}
              currentPlan={currentPlan}
              onSelect={(p) => setSelectedPlan({
                id: p.id,
                name: t(p.nameKey),
                price: t(p.priceKey),
                period: t(p.periodKey),
              })}
            />
          ))}
        </div>

        <p className="text-center text-xs text-[var(--text-muted)]">{t('pricing.trialNote')}</p>
      </div>

      {/* Checkout modal */}
      {selectedPlan && (
        <CheckoutModal plan={selectedPlan} onClose={() => setSelectedPlan(null)} />
      )}
    </div>
  );
}
