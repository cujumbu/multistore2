import { createContext, useContext, ReactNode, useMemo } from 'react';
import { Store, StoreSettings } from '../../types/store';
import { getTranslations } from '../../lib/i18n';

interface StoreContextType {
  store: Store;
  settings: StoreSettings;
  t: ReturnType<typeof getTranslations>;
}

const StoreContext = createContext<StoreContextType | null>(null);

export function useStoreContext() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStoreContext must be used within a StoreProvider');
  }
  return context;
}

interface StoreProviderProps {
  store: Store;
  settings: StoreSettings;
  children: ReactNode;
}

export function StoreProvider({ store, settings, children }: StoreProviderProps) {
  const t = useMemo(() => getTranslations(settings.locale_settings.locale), [settings.locale_settings.locale]);

  return (
    <StoreContext.Provider value={{ store, settings, t }}>
      {children}
    </StoreContext.Provider>
  );
}