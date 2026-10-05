import { useTheme } from '@/context/ThemeContext.jsx';
import Spinner from '@/components/ui/Spinner.jsx';
import { useSettings } from './hooks/useSettings.js';
import SettingsForm from './components/SettingsForm.jsx';
export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { data, loading, error, saving, message, saveError, save } = useSettings(setTheme);
  if (loading) return <Spinner label="Loading settings…" />;
  const settings = data?.settings || {
    topN: 20,
    minPrice: 20,
    historyDays: 5,
    refreshInterval: 5,
    theme,
  };
  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div>
        <h1 className="page-title">Settings</h1>
        <p className="page-description">
          These values are persisted in SQLite and used dynamically by the backend.
        </p>
      </div>
      {error ? (
        <div className="text-sm text-rose-600">{error}</div>
      ) : (
        <SettingsForm
          settings={settings}
          theme={theme}
          saving={saving}
          error={saveError}
          success={message}
          onSave={save}
        />
      )}
    </div>
  );
}
