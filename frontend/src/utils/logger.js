// Centralized logger for consistent, auditable logging.
export const Logger = {
  info(message, data) {
    console.info(`[INFO] ${new Date().toISOString()} - ${message}`, data ?? "");
  },
  warn(message, data) {
    console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, data ?? "");
  },
  error(message, err) {
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, err ?? "");
  }
};
