/**
 * Date formatting constants used across chat and gap components
 */
export const DATE_FORMAT_OPTIONS = {
  chatTimestamp: {
    hour: '2-digit' as const,
    minute: '2-digit' as const,
    month: 'short' as const,
    day: 'numeric' as const,
    hour12: true as const,
  },
  fullDateTime: {
    year: 'numeric' as const,
    month: 'long' as const,
    day: 'numeric' as const,
    hour: '2-digit' as const,
    minute: '2-digit' as const,
    hour12: true as const,
  },
  dateOnly: {
    year: 'numeric' as const,
    month: 'short' as const,
    day: 'numeric' as const,
  }
};

/**
 * Formats timestamp for chat messages
 */
export const formatChatTimestamp = (timestamp: Date): string => {
  return timestamp.toLocaleString('en-US', DATE_FORMAT_OPTIONS.chatTimestamp);
};

/**
 * Formats full date and time
 */
export const formatFullDateTime = (date: Date): string => {
  return date.toLocaleString('en-US', DATE_FORMAT_OPTIONS.fullDateTime);
};

/**
 * Formats date only (no time)
 */
export const formatDateOnly = (date: Date): string => {
  return date.toLocaleString('en-US', DATE_FORMAT_OPTIONS.dateOnly);
};