import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { STORE_CONFIG, normalizeStoreSettings } from '@/utils/calculations';

const StoreSettingsContext = createContext(null);

const defaultSettings = {
  whatsapp: STORE_CONFIG.whatsapp,
  delivery_time: STORE_CONFIG.deliveryTime,
  business_hours: STORE_CONFIG.businessHours,
};

export function StoreSettingsProvider({ children }) {
  const [settings, setSettings] = useState(defaultSettings);
  const [loadingSettings, setLoadingSettings] = useState(true);

  const refreshSettings = useCallback(async () => {
    try {
      const response = await api.get('/settings');
      setSettings({ ...defaultSettings, ...(response.data || {}) });
    } catch {
      setSettings(defaultSettings);
    } finally {
      setLoadingSettings(false);
    }
  }, []);

  useEffect(() => {
    refreshSettings();
  }, [refreshSettings]);

  const value = useMemo(() => ({
    settings,
    normalizedSettings: normalizeStoreSettings(settings),
    loadingSettings,
    refreshSettings,
    setSettings,
  }), [settings, loadingSettings, refreshSettings]);

  return (
    <StoreSettingsContext.Provider value={value}>
      {children}
    </StoreSettingsContext.Provider>
  );
}

export function useStoreSettings() {
  const context = useContext(StoreSettingsContext);
  if (!context) {
    throw new Error('useStoreSettings must be used within StoreSettingsProvider');
  }
  return context;
}
