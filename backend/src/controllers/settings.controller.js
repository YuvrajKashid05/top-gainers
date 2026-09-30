import { getSettings, updateSettings, validateSettings } from '../services/settings.service.js';
import { scheduleWithCurrentSettings } from '../jobs/scheduler.js';

export function getSettingsController(_req, res) {
  res.json({ success: true, settings: getSettings() });
}

export function putSettingsController(req, res) {
  try {
    const current = getSettings();
    const parsed = validateSettings({ ...current, ...req.body });
    const settings = updateSettings(parsed);
    scheduleWithCurrentSettings();
    return res.json({ success: true, settings, message: 'Settings saved. The new values will be used by the next refresh.' });
  } catch (error) {
    return res.status(400).json({ success: false, message: error instanceof Error ? error.message : 'Invalid settings' });
  }
}
