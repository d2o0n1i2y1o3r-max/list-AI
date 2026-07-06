import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Sun, Moon, Monitor, Globe, LogOut, Bell, BellOff, CreditCard, User, Heart } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage, SUPPORTED_LANGUAGES } from '../../contexts/LanguageContext';
import { useNotifications } from '../../hooks/useNotifications';
import PricingPage from '../Pricing/PricingPage';
import DonateModal from '../Common/DonateModal';
import { createCheckoutSession, redirectToCheckout } from '../../lib/stripe';

function Section({ title, children }) {
  return (
    <div className="mb-6">
      <p className="label mb-3">{title}</p>
      <div className="card divide-y divide-[var(--border)]">
        {children}
      </div>
    </div>
  );
}

function RowItem({ icon: Icon, label, children, onClick }) {
  return (
    <div
      className={`flex items-center justify-between px-4 py-3.5 ${onClick ? 'cursor-pointer hover:bg-[var(--bg-secondary)] transition-colors' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        {Icon && <Icon className="w-4 h-4 text-[var(--text-muted)]" />}
        <span className="text-sm text-[var(--text-primary)]">{label}</span>
      </div>
      <div className="text-[var(--text-secondary)]">{children}</div>
    </div>
  );
}

export default function SettingsPage({ onClose }) {
  const { t } = useTranslation();
  const { user, signOut, userProfile } = useAuth();
  const { theme, setTheme } = useTheme();
  const { language, setLanguage } = useLanguage();
  const { permission, requestPermission } = useNotifications();
  const [showPricing, setShowPricing] = useState(false);
  const [showDonate, setShowDonate] = useState(false);

  const THEME_OPTIONS = [
    { value: 'light', label: t('settings.themeLight'), icon: Sun },
    { value: 'dark', label: t('settings.themeDark'), icon: Moon },
    { value: 'system', label: t('settings.themeSystem'), icon: Monitor },
  ];

  if (showPricing) {
    return <PricingPage onClose={() => setShowPricing(false)} currentPlan={userProfile?.plan || 'trial'} />;
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] animate-fade-in">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[var(--bg-primary)]/90 backdrop-blur-md border-b border-[var(--border)]">
        <div className="max-w-lg mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <h1 className="section-title">{t('settings.title')}</h1>
          {onClose && (
            <button id="settings-close-btn" onClick={onClose} className="btn-ghost p-2">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 sm:px-6 py-6">
        {/* Profile */}
        <Section title={t('settings.profile')}>
          <RowItem icon={User} label={t('settings.name')}>
            <span className="text-sm text-[var(--text-secondary)]">
              {user?.displayName || '—'}
            </span>
          </RowItem>
          <RowItem icon={User} label={t('settings.email')}>
            <span className="text-xs text-[var(--text-secondary)] font-mono">
              {user?.email || '—'}
            </span>
          </RowItem>
        </Section>

        {/* Appearance */}
        <Section title={t('settings.theme')}>
          <div className="px-4 py-3">
            <div className="flex gap-2">
              {THEME_OPTIONS.map(opt => {
                const Icon = opt.icon;
                const active = theme === opt.value;
                return (
                  <button
                    key={opt.value}
                    id={`theme-${opt.value}-btn`}
                    onClick={() => setTheme(opt.value)}
                    className={`flex-1 flex flex-col items-center gap-1.5 py-2.5 px-2 rounded-2xl text-xs font-medium
                               transition-all duration-150
                               ${active
                                 ? 'bg-amber-600 text-white shadow-amber'
                                 : 'border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]'
                               }`}
                  >
                    <Icon className="w-4 h-4" />
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        </Section>

        {/* Language */}
        <Section title={t('settings.language')}>
          <div className="px-4 py-3">
            <div className="grid grid-cols-3 gap-2">
              {SUPPORTED_LANGUAGES.map(lang => (
                <button
                  key={lang.code}
                  id={`lang-${lang.code}-btn`}
                  onClick={() => setLanguage(lang.code)}
                  className={`py-2.5 rounded-2xl text-xs font-medium transition-all duration-150
                             ${language === lang.code
                               ? 'bg-amber-600 text-white shadow-amber'
                               : 'border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]'
                             }`}
                >
                  {lang.nativeLabel}
                </button>
              ))}
            </div>
          </div>
        </Section>

        {/* Notifications */}
        <Section title={t('settings.notifications')}>
          <RowItem
            icon={permission === 'granted' ? Bell : BellOff}
            label={permission === 'granted' ? t('settings.notificationsEnabled') : t('settings.notificationsDisabled')}
          >
            {permission !== 'granted' ? (
              <button
                id="enable-notifications-btn"
                onClick={requestPermission}
                className="text-xs text-amber-600 dark:text-amber-400 font-medium"
              >
                {t('settings.notificationsEnable')}
              </button>
            ) : (
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            )}
          </RowItem>
        </Section>

        {/* Plan */}
        <Section title={t('settings.plan')}>
          <RowItem icon={CreditCard} label={t('settings.plan')} onClick={() => setShowPricing(true)}>
            <div className="flex items-center gap-2">
              <span className="chip bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 capitalize text-xs">
                {userProfile?.plan || 'Trial'}
              </span>
              <span className="text-xs text-amber-600 dark:text-amber-400">{t('settings.managePlan')} →</span>
            </div>
          </RowItem>
        </Section>

        {/* Donate */}
        <Section title={t('donate.title')}>
          <RowItem icon={Heart} label={t('donate.button')} onClick={() => setShowDonate(true)}>
            <span className="text-xs text-rose-500">→</span>
          </RowItem>
        </Section>

        {/* Account */}
        <Section title={t('settings.account')}>
          <RowItem icon={LogOut} label={t('settings.signOut')} onClick={signOut}>
            <span className="text-xs text-red-500">→</span>
          </RowItem>
        </Section>

        {/* Footer */}
        <div className="text-center mt-8 space-y-1">
          <p className="text-xs text-[var(--text-muted)]">{t('settings.version', { version: '1.0.0' })}</p>
          <p className="text-xs text-[var(--text-muted)]">{t('settings.madeWith')} ♥</p>
        </div>
      </div>

      {/* Donate modal */}
      {showDonate && (
        <DonateModal
          onClose={() => setShowDonate(false)}
          onDonate={async (amount) => {
            try {
              const sessionId = await createCheckoutSession(amount, user?.uid);
              await redirectToCheckout(sessionId);
            } catch (error) {
              console.error('Donation error:', error);
              throw error;
            }
          }}
        />
      )}
    </div>
  );
}
