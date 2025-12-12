import { Logger } from "./logger";

/**
 * @param {string} dateString
 * @returns {string}
 */
export function formatDate(dateString) {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  } catch (err) {
    Logger.error("Failed to format date", { dateString, err });
    return dateString;
  }
}
