import { useWarehouse } from '../context/WarehouseContext';
import { translations } from '../i18n';

export function useT() {
  const { language } = useWarehouse();
  return translations[language] || translations.en;
}
