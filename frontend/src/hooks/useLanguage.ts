import { useState, useEffect } from 'react';
import { translations, Translations } from '../i18n/translations';

export const useLanguage = () => {
  const [language, setLanguage] = useState<string>(() => {
    const saved = localStorage.getItem('bgpack-language');
    return saved || 'en';
  });

  const [t, setT] = useState<Translations>(translations[language]);

  useEffect(() => {
    setT(translations[language]);
    localStorage.setItem('bgpack-language', language);
  }, [language]);

  const changeLanguage = (newLanguage: string) => {
    setLanguage(newLanguage);
  };

  return {
    language,
    t,
    changeLanguage,
    isEnglish: language === 'en',
    isPolish: language === 'pl'
  };
};
