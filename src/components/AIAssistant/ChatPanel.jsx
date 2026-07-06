import { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Send, Paperclip, Trash2, Bot, Loader2, AlertCircle } from 'lucide-react';
import { sendMessage, isGeminiConfigured, MOCK_RESPONSES } from '../../lib/gemini';
import { useNotifications } from '../../hooks/useNotifications';

function MessageBubble({ msg }) {
  const isAI = msg.role === 'model';
  return (
    <div className={`flex ${isAI ? 'justify-start' : 'justify-end'} mb-3`}>
      {isAI && (
        <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center mr-2 flex-shrink-0 mt-0.5 shadow-amber">
          <Bot className="w-3.5 h-3.5 text-white" />
        </div>
      )}
      <div
        className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed
          ${isAI
            ? 'bg-[var(--bg-secondary)] text-[var(--text-primary)] rounded-tl-sm'
            : 'bg-amber-600 text-white rounded-tr-sm'
          }
          ${msg.isAlarmPrompt ? 'border-l-2 border-amber-400' : ''}
        `}
      >
        {msg.content}
        {msg.attachment && (
          <div className="mt-2 p-2 rounded-xl bg-white/10 dark:bg-black/10 text-xs flex items-center gap-1.5">
            <Paperclip className="w-3 h-3" />
            <span className="truncate">{msg.attachment.name}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function AlarmConsentButtons({ onYes, onNo }) {
  return (
    <div className="flex gap-2 mb-3 pl-9">
      <button
        id="alarm-yes-btn"
        onClick={onYes}
        className="px-4 py-1.5 rounded-xl bg-amber-600 text-white text-xs font-medium
                   hover:bg-amber-700 active:scale-95 transition-all"
      >
        Yes, set an alarm
      </button>
      <button
        id="alarm-no-btn"
        onClick={onNo}
        className="px-4 py-1.5 rounded-xl border border-[var(--border)] text-xs
                   text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]
                   active:scale-95 transition-all"
      >
        No thanks
      </button>
    </div>
  );
}

export default function ChatPanel({ isOpen, onClose, pendingTask, onAlarmConfirmed, listId }) {
  const { t } = useTranslation();
  const { scheduleAlarm, permission } = useNotifications();

  const [messages, setMessages] = useState([
    { id: 'greeting', role: 'model', content: t('ai.greeting') },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [attachment, setAttachment] = useState(null);
  const [awaitingAlarmConsent, setAwaitingAlarmConsent] = useState(false);
  const [currentPendingTask, setCurrentPendingTask] = useState(null);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const conversationHistory = useRef([]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => { scrollToBottom(); }, [messages]);

  // When a new task is created, trigger the alarm consent flow
  useEffect(() => {
    if (pendingTask) {
      setCurrentPendingTask(pendingTask);
      const taskMsg = `Task "${pendingTask.description}" has been added (${pendingTask.startTime}${pendingTask.endTime ? ` – ${pendingTask.endTime}` : ''}). ${t('ai.taskAdded')}`;
      const askMsg = t('ai.alarmAsk');

      addAIMessage(taskMsg);
      setTimeout(() => {
        addAIMessage(askMsg, true);
        setAwaitingAlarmConsent(true);
      }, 800);
    }
  }, [pendingTask]);

  const addAIMessage = (content, isAlarmPrompt = false) => {
    const msg = { id: Date.now() + Math.random(), role: 'model', content, isAlarmPrompt };
    setMessages(prev => [...prev, msg]);
    conversationHistory.current.push({ role: 'model', content });
  };

  const addUserMessage = (content, attach = null) => {
    const msg = { id: Date.now() + Math.random(), role: 'user', content, attachment: attach };
    setMessages(prev => [...prev, msg]);
    conversationHistory.current.push({ role: 'user', content });
  };

  const handleAlarmYes = async () => {
    setAwaitingAlarmConsent(false);
    if (!currentPendingTask) return;

    addUserMessage('Yes, set an alarm');

    let alarmSet = false;
    try {
      if (permission === 'granted' || permission === 'default') {
        alarmSet = await scheduleAlarm(
          currentPendingTask.id || 'new-task',
          currentPendingTask.startTime,
          currentPendingTask.description,
          `Time to start: ${currentPendingTask.description}`
        );
      } else {
        addAIMessage(t('ai.permissionNeeded'));
        const newPerm = await scheduleAlarm(
          currentPendingTask.id || 'new-task',
          currentPendingTask.startTime,
          currentPendingTask.description,
          `Time to start: ${currentPendingTask.description}`
        );
        alarmSet = newPerm;
      }
    } catch (error) {
      console.error('Failed to set alarm:', error);
      addAIMessage('Signal o\'rnatishda xatolik yuz berdi. Iltimos, brauzer sozlamalarida bildirishnomalarni yoqing.');
    }

    if (alarmSet) {
      addAIMessage(t('ai.alarmSet', { time: currentPendingTask.startTime }));
      onAlarmConfirmed?.(currentPendingTask.id, true);
    } else {
      addAIMessage(t('ai.notificationDenied'));
    }
    setCurrentPendingTask(null);
  };

  const handleAlarmNo = () => {
    setAwaitingAlarmConsent(false);
    addUserMessage('No thanks');
    addAIMessage(t('ai.alarmDeclined'));
    setCurrentPendingTask(null);
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text && !attachment) return;
    if (loading) return;

    addUserMessage(text, attachment);
    setInput('');
    setAttachment(null);
    setLoading(true);

    try {
      let imageData = null;
      if (attachment?.data) {
        imageData = { mimeType: attachment.type, data: attachment.data };
      }

      const reply = await sendMessage(
        conversationHistory.current.slice(-10), // keep context window manageable
        text,
        imageData
      );
      addAIMessage(reply);
    } catch {
      addAIMessage("Sorry, something went wrong. Try again in a moment.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target.result;
      const base64 = dataUrl.split(',')[1];
      setAttachment({ name: file.name, type: file.type, data: base64, url: dataUrl });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const clearChat = () => {
    setMessages([{ id: 'greeting', role: 'model', content: t('ai.greeting') }]);
    conversationHistory.current = [];
    setAwaitingAlarmConsent(false);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden animate-fade-in"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 bottom-0 z-50 flex flex-col
                      w-full sm:w-96 lg:w-80 xl:w-96
                      bg-[var(--bg-card)] border-l border-[var(--border)]
                      shadow-warm-lg animate-slide-up lg:animate-none">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-[var(--border)] flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-amber">
              <Bot className="w-3.5 h-3.5 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--text-primary)]">AI Assistant</p>
              {!isGeminiConfigured && (
                <p className="text-xs text-[var(--text-muted)]">{t('ai.mockMode')}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              id="clear-chat-btn"
              onClick={clearChat}
              className="btn-ghost p-1.5"
              title={t('ai.clearChat')}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
            <button
              id="close-chat-btn"
              onClick={onClose}
              className="btn-ghost p-1.5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
          {messages.map((msg, idx) => (
            <div key={msg.id}>
              <MessageBubble msg={msg} />
              {/* Show alarm buttons after the last alarm-prompt message */}
              {awaitingAlarmConsent && msg.isAlarmPrompt && idx === messages.length - 1 && (
                <AlarmConsentButtons onYes={handleAlarmYes} onNo={handleAlarmNo} />
              )}
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-2 pl-9 mb-3">
              <div className="px-3.5 py-2.5 rounded-2xl rounded-tl-sm bg-[var(--bg-secondary)]">
                <div className="flex gap-1">
                  {[0, 1, 2].map(i => (
                    <div
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-[var(--text-muted)]"
                      style={{ animation: 'pulseSoft 1.2s ease-in-out infinite', animationDelay: `${i * 0.2}s` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Attachment preview */}
        {attachment && (
          <div className="px-4 pb-2 flex-shrink-0">
            <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)]">
              {attachment.type.startsWith('image/') && (
                <img src={attachment.url} alt="" className="w-8 h-8 rounded-lg object-cover" />
              )}
              <span className="text-xs text-[var(--text-secondary)] truncate flex-1">{attachment.name}</span>
              <button onClick={() => setAttachment(null)} className="text-[var(--text-muted)] hover:text-red-500">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Input */}
        <div className="px-4 pb-4 pt-2 border-t border-[var(--border)] flex-shrink-0">
          <div className="flex items-end gap-2">
            <button
              id="file-upload-btn"
              onClick={() => fileInputRef.current?.click()}
              className="btn-ghost p-2 flex-shrink-0"
              title={t('ai.uploadFile')}
            >
              <Paperclip className="w-4 h-4" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf,.txt,.doc,.docx"
              onChange={handleFileChange}
              className="hidden"
            />
            <textarea
              id="chat-input"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('ai.placeholder')}
              className="input-field resize-none flex-1 min-h-[40px] max-h-[120px] py-2.5 leading-relaxed"
              rows={1}
              style={{ height: 'auto' }}
              onInput={e => {
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
              }}
            />
            <button
              id="chat-send-btn"
              onClick={handleSend}
              disabled={loading || (!input.trim() && !attachment)}
              className="btn-primary p-2.5 flex-shrink-0 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
