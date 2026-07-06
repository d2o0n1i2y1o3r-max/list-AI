import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from './AuthContext';

const LanguageContext = createContext(null);

export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English', nativeLabel: 'English' },
  { code: 'uz', label: 'Uzbek', nativeLabel: "O'zbek" },
  { code: 'ru', label: 'Russian', nativeLabel: 'Русский' },
];

export function LanguageProvider({ children }) {
  const { i18n } = useTranslation();
  const { userProfile, updateUserProfile } = useAuth();
  const [language, setLanguageState] = useState('en');

  useEffect(() => {
    if (userProfile?.language) {
      setLanguageState(userProfile.language);
      i18n.changeLanguage(userProfile.language);
    }
  }, [userProfile?.language, i18n]);

  const setLanguage = useCallback((lang) => {
    setLanguageState(lang);
    i18n.changeLanguage(lang);
    updateUserProfile?.({ language: lang });
  }, [i18n, updateUserProfile]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, supportedLanguages: SUPPORTED_LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
}
