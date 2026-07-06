import { useTranslation } from 'react-i18next';

export default function LoadingScreen() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--bg-primary)] animate-fade-in">
      {/* Logo mark */}
      <div className="relative mb-8">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-amber-lg">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 10h16M8 16h10M8 22h12" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
            <circle cx="25" cy="22" r="5" fill="white" fillOpacity="0.3" stroke="white" strokeWidth="2"/>
            <path d="M23 22l1.5 1.5 2.5-2.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        {/* Pulse ring */}
        <div className="absolute inset-0 rounded-3xl bg-amber-500 opacity-20 animate-ping" />
      </div>

      <h1 className="text-xl font-semibold text-[var(--text-primary)] mb-2 tracking-tight">
        {t('app.name')}
      </h1>
      <p className="text-sm text-[var(--text-muted)] animate-pulse-soft">
        {t('loading.title')}
      </p>

      {/* Animated dots */}
      <div className="flex gap-1.5 mt-8">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-amber-500"
            style={{
              animation: `pulseSoft 1.2s ease-in-out infinite`,
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
