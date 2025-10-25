import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'fr' : 'en';
    i18n.changeLanguage(newLang);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleLanguage}
      className="fixed top-4 right-4 z-50 font-semibold"
    >
      {i18n.language === 'en' ? '🇫🇷 FR' : '🇬🇧 EN'}
    </Button>
  );
};

export default LanguageSwitcher;
