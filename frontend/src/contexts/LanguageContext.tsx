import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { translations, Translations } from '../i18n/translations';

interface LanguageContextType {
  language: string;
  t: Translations;
  changeLanguage: (newLanguage: string) => void;
  isEnglish: boolean;
  isPolish: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({
  children,
}) => {
  const [language, setLanguage] = useState<string>(() => {
    const saved = localStorage.getItem('bgpack-language');
    return saved || 'en';
  });

  const [t, setT] = useState<Translations>(() => {
    return translations[language] || translations['en'];
  });

  useEffect(() => {
    console.log('Language changed to:', language);
    console.log('Loading translations for:', language);
    const newTranslations = translations[language] || translations['en'];
    setT(newTranslations);
    localStorage.setItem('bgpack-language', language);
  }, [language]);

  const changeLanguage = (newLanguage: string) => {
    console.log('Changing language to:', newLanguage);
    setLanguage(newLanguage);
  };

  const value: LanguageContextType = {
    language,
    t,
    changeLanguage,
    isEnglish: language === 'en',
    isPolish: language === 'pl',
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
