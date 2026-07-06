import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Heart, Check, AlertCircle } from 'lucide-react';

const PRESET_AMOUNTS = ['1', '5', '10', '20', '50'];

export default function DonateModal({ onClose, onDonate }) {
  const { t } = useTranslation();
  const [selectedAmount, setSelectedAmount] = useState('5');
  const [customAmount, setCustomAmount] = useState('');
  const [isCustom, setIsCustom] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState(null); // null | 'success' | 'error'

  const handleAmountSelect = (amount) => {
    setSelectedAmount(amount);
    setIsCustom(false);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setCustomAmount(value);
    if (value) {
      setSelectedAmount(value);
      setIsCustom(true);
    }
  };

  const handleDonate = async () => {
    const amount = isCustom ? customAmount : selectedAmount;
    if (!amount || parseFloat(amount) <= 0) return;

    setIsProcessing(true);
    setStatus(null);

    try {
      await onDonate(parseFloat(amount));
      setStatus('success');
    } catch (error) {
      console.error('Donation error:', error);
      setStatus('error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    if (!isProcessing) {
      setStatus(null);
      onClose();
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-fade-in" onClick={handleClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="card max-w-sm w-full p-6 animate-scale-in">
          {status === null && (
            <>
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-rose-500" />
                  <h3 className="font-semibold text-[var(--text-primary)]">{t('donate.title')}</h3>
                </div>
                <button onClick={handleClose} className="btn-ghost p-1.5">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Description */}
              <p className="text-sm text-[var(--text-secondary)] mb-4">{t('donate.description')}</p>

              {/* Amount selection */}
              <p className="text-xs text-[var(--text-muted)] mb-2">{t('donate.selectAmount')}</p>
              <div className="grid grid-cols-5 gap-2 mb-4">
                {PRESET_AMOUNTS.map((amount) => (
                  <button
                    key={amount}
                    onClick={() => handleAmountSelect(amount)}
                    className={`py-2 rounded-xl text-sm font-medium transition-all duration-150
                      ${selectedAmount === amount && !isCustom
                        ? 'bg-rose-500 text-white shadow-rose'
                        : 'border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]'
                      }`}
                  >
                    ${amount}
                  </button>
                ))}
              </div>

              {/* Custom amount */}
              <div className="mb-4">
                <button
                  onClick={() => {
                    setIsCustom(true);
                    setSelectedAmount('');
                  }}
                  className={`w-full py-2.5 rounded-xl text-sm font-medium transition-all duration-150 border
                    ${isCustom
                      ? 'border-rose-500 text-rose-500 bg-rose-50 dark:bg-rose-900/10'
                      : 'border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]'
                    }`}
                >
                  {t('donate.customAmount')}
                </button>
                {isCustom && (
                  <input
                    type="text"
                    value={customAmount}
                    onChange={handleCustomAmountChange}
                    placeholder={t('donate.amountPlaceholder')}
                    className="w-full mt-2 px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                    autoFocus
                  />
                )}
              </div>

              {/* Confirm button */}
              <button
                onClick={handleDonate}
                disabled={!selectedAmount || parseFloat(selectedAmount) <= 0 || isProcessing}
                className="btn-primary w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? t('donate.processing') : t('donate.confirm')}
              </button>
            </>
          )}

          {status === 'success' && (
            <div className="text-center py-8">
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-4">
                <Check className="w-6 h-6 text-emerald-500" />
              </div>
              <p className="text-sm text-[var(--text-primary)] font-medium mb-2">{t('donate.success')}</p>
              <button onClick={handleClose} className="btn-primary mt-4">
                {t('common.close')}
              </button>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center py-8">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-6 h-6 text-red-500" />
              </div>
              <p className="text-sm text-[var(--text-primary)] font-medium mb-2">{t('donate.error')}</p>
              <div className="flex gap-2 mt-4">
                <button onClick={handleClose} className="btn-secondary flex-1 justify-center">
                  {t('donate.cancel')}
                </button>
                <button onClick={handleDonate} className="btn-primary flex-1 justify-center">
                  {t('common.retry')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
