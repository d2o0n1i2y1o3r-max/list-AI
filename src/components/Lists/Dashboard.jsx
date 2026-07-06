import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Settings, MessageCircle, Plus, ChevronRight, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { useLists } from '../../contexts/ListsContext';
import { useAuth } from '../../contexts/AuthContext';
import TaskCard from './TaskCard';
import CreateTaskModal from './CreateTaskModal';
import ChatPanel from '../AIAssistant/ChatPanel';

const LIST_EMOJIS = ['📋', '💼', '🏃', '🎯', '📚', '🌱', '✈️', '💡'];

export default function Dashboard({ onSettingsOpen }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { lists, createTask, updateTask, deleteTask, toggleTaskDone, getTasksForList } = useLists();

  const [selectedListId, setSelectedListId] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [pendingTask, setPendingTask] = useState(null);

  const activeListId = selectedListId || lists[0]?.id;
  const activeList = lists.find(l => l.id === activeListId);
  const activeTasks = activeListId ? getTasksForList(activeListId) : [];
  const today = format(new Date(), 'EEEE, MMMM d');

  const handleTaskCreated = async (taskData) => {
    if (!activeListId) return;
    const newTask = await createTask(activeListId, taskData);
    setPendingTask(newTask);
    setShowChat(true);
  };

  const handleAlarmConfirmed = async (taskId, alarmSet) => {
    if (!activeListId || !taskId) return;
    await updateTask(activeListId, taskId, { alarmSet });
    setPendingTask(null);
  };

  const handleDeleteTask = async (taskId) => {
    if (!activeListId) return;
    await deleteTask(activeListId, taskId);
  };

  const doneTasks = activeTasks.filter(t => t.done).length;
  const totalTasks = activeTasks.length;

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col">
      {/* Top bar */}
      <header className="sticky top-0 z-30 bg-[var(--bg-primary)]/90 backdrop-blur-md border-b border-[var(--border)]">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          {/* Logo + date */}
          <div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-amber">
                <svg width="14" height="14" viewBox="0 0 32 32" fill="none">
                  <path d="M8 10h16M8 16h10M8 22h12" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
                </svg>
              </div>
              <h1 className="text-base font-bold text-[var(--text-primary)] tracking-tight">
                {t('dashboard.title')}
              </h1>
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-0.5 ml-9">
              {t('dashboard.subtitle', { date: today })}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1.5">
            <button
              id="open-chat-btn"
              onClick={() => setShowChat(true)}
              className="btn-ghost p-2 relative"
              title={t('dashboard.openChat')}
            >
              <MessageCircle className="w-5 h-5" />
              {pendingTask && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-500" />
              )}
            </button>
            <button
              id="open-settings-btn"
              onClick={onSettingsOpen}
              className="btn-ghost p-2"
              title={t('dashboard.settings')}
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 py-4">
        {/* Welcome */}
        <div className="mb-5">
          <p className="text-[var(--text-secondary)] text-sm">
            Hey{user?.displayName ? `, ${user.displayName.split(' ')[0]}` : ''}. Here's your day.
          </p>
        </div>

        {/* List tabs */}
        {lists.length > 1 && (
          <div className="flex gap-2 mb-5 overflow-x-auto no-scrollbar -mx-4 px-4">
            {lists.map((list, i) => (
              <button
                key={list.id}
                id={`list-tab-${list.id}`}
                onClick={() => setSelectedListId(list.id)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium
                           transition-all duration-150
                           ${activeListId === list.id
                             ? 'bg-amber-600 text-white shadow-amber'
                             : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border)] hover:border-amber-400'
                           }`}
              >
                <span>{list.emoji || LIST_EMOJIS[i % LIST_EMOJIS.length]}</span>
                <span>{list.name}</span>
              </button>
            ))}
          </div>
        )}

        {/* Active list */}
        {activeList && (
          <>
            {/* List header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xl">{activeList.emoji || '📋'}</span>
                <h2 className="text-lg font-semibold text-[var(--text-primary)]">{activeList.name}</h2>
                {totalTasks > 0 && (
                  <span className="chip bg-[var(--bg-secondary)] text-[var(--text-muted)] text-xs">
                    {doneTasks}/{totalTasks}
                  </span>
                )}
              </div>
            </div>

            {/* Progress bar */}
            {totalTasks > 0 && (
              <div className="mb-4 h-1.5 bg-[var(--bg-secondary)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-amber-600 rounded-full transition-all duration-500"
                  style={{ width: `${(doneTasks / totalTasks) * 100}%` }}
                />
              </div>
            )}

            {/* Tasks */}
            {activeTasks.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 rounded-3xl bg-[var(--bg-secondary)] flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-7 h-7 text-[var(--text-muted)]" />
                </div>
                <p className="font-medium text-[var(--text-secondary)] mb-1">
                  {t('dashboard.listEmpty')}
                </p>
                <p className="text-sm text-[var(--text-muted)]">
                  {t('dashboard.noTasksHint')}
                </p>
              </div>
            ) : totalTasks > 0 && doneTasks === totalTasks ? (
              <div className="text-center py-12">
                <p className="text-2xl mb-3">🎉</p>
                <p className="font-medium text-[var(--text-primary)]">{t('dashboard.allDone')}</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {activeTasks.map(task => (
                  <div key={task.id} className="animate-slide-up">
                    <TaskCard
                      task={task}
                      onToggle={() => toggleTaskDone(activeListId, task.id)}
                      onDelete={() => handleDeleteTask(task.id)}
                    />
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* No lists state */}
        {lists.length === 0 && (
          <div className="text-center py-16">
            <p className="text-[var(--text-secondary)]">No lists yet. Go to settings to add some.</p>
          </div>
        )}
      </div>

      {/* FAB — Add Task */}
      {activeList && (
        <button
          id="add-task-fab"
          onClick={() => setShowCreateModal(true)}
          className="fixed bottom-6 right-6 z-30 flex items-center gap-2
                     px-5 py-3.5 rounded-full bg-amber-600 text-white font-medium text-sm
                     shadow-amber-lg hover:bg-amber-700 active:scale-95
                     transition-all duration-150 hover:shadow-amber"
        >
          <Plus className="w-4 h-4" />
          {t('dashboard.addTask')}
        </button>
      )}

      {/* Create Task Modal */}
      {showCreateModal && (
        <CreateTaskModal
          listId={activeListId}
          onClose={() => setShowCreateModal(false)}
          onCreated={handleTaskCreated}
        />
      )}

      {/* AI Chat Panel */}
      <ChatPanel
        isOpen={showChat}
        onClose={() => { setShowChat(false); }}
        pendingTask={pendingTask}
        onAlarmConfirmed={handleAlarmConfirmed}
        listId={activeListId}
      />
    </div>
  );
}
