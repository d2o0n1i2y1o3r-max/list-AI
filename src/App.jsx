import { useState, useEffect } from 'react';
import './i18n/index.js';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { ListsProvider } from './contexts/ListsContext';
import { useConnectivity } from './hooks/useConnectivity';
import LoadingScreen from './components/Common/LoadingScreen';
import OfflineScreen from './components/Common/OfflineScreen';
import SignInPage from './components/Auth/SignInPage';
import ListSetup from './components/Onboarding/ListSetup';
import Dashboard from './components/Lists/Dashboard';
import SettingsPage from './components/Settings/SettingsPage';

// Inner app: has access to all contexts
function AppInner() {
  const { user, userProfile, loading: authLoading } = useAuth();
  const { isOnline, isChecking, retry } = useConnectivity();
  const [appLoading, setAppLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [view, setView] = useState('dashboard'); // 'dashboard' | 'settings'

  // Minimum loading screen for 1.2s for polish
  useEffect(() => {
    const timer = setTimeout(() => setAppLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  // Show loading while auth or app is initializing
  if (appLoading || authLoading) return <LoadingScreen />;

  // Offline gate
  if (!isOnline && !isChecking) return <OfflineScreen onRetry={retry} />;

  // Auth gate
  if (!user) return <SignInPage onSuccess={() => {}} />;

  // Onboarding gate
  if (userProfile && !userProfile.onboardingComplete) {
    return <ListSetup onComplete={() => {}} />;
  }

  // Settings overlay
  if (showSettings) {
    return <SettingsPage onClose={() => setShowSettings(false)} />;
  }

  // Main dashboard
  return <Dashboard onSettingsOpen={() => setShowSettings(true)} />;
}

// Root: wraps all providers
export default function App() {
  return (
    <AuthProvider>
      <AppInnerWithProviders />
    </AuthProvider>
  );
}

// Separate component so ThemeProvider and others can access AuthContext
function AppInnerWithProviders() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <ListsProvider>
          <AppInner />
        </ListsProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
