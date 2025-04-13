/* eslint-disable no-console */
export const logger = {
  info: (message: string) => console.log(`[INFO] ${message}`),
  error: (message: string, error?: unknown) => console.error(`[ERROR] ${message}`, error),
  debug: (message: string) => console.log(`[DEBUG] ${message}`),
};
