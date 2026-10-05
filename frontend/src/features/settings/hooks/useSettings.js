import { useCallback, useState } from 'react';
import { api } from '@/services/api.js';
import { useAsync } from '@/hooks/useAsync.js';
export function useSettings(setTheme) {
  const loader = useCallback(() => api.settings(), []);
  const state = useAsync(loader);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [saveError, setSaveError] = useState('');

  const save = async (form) => {
    setSaving(true);
    setMessage('');
    setSaveError('');
    try {
      const result = await api.saveSettings({
        ...form,
        topN: Number(form.topN),
        minPrice: Number(form.minPrice),
        historyDays: Number(form.historyDays),
        refreshInterval: Number(form.refreshInterval),
      });
      setTheme(result.settings.theme);
      setMessage(
        'Settings saved. The next 5-minute market snapshot will use the new configuration.',
      );
      return result.settings;
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Unable to save settings');
      return null;
    } finally {
      setSaving(false);
    }
  };

  return { ...state, saving, message, saveError, save };
}
