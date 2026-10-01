import { getSettings, updateSettings } from "../services/settings.service.js";
import { scheduleWithCurrentSettings } from "../jobs/scheduler.js";

export function getSettingsController(_req, res) {
  return res.json({ success: true, settings: getSettings() });
}
export function putSettingsController(req, res) {
  const settings = updateSettings(req.validated.body);
  scheduleWithCurrentSettings();
  return res.json({
    success: true,
    settings,
    message: "Settings saved. The new values will be used by the next refresh.",
  });
}
