/**
 * Converts seconds to milliseconds
 */
export function seconds(seconds: number) {
  return seconds * 1000;
}

/**
 * Converts minutes to milliseconds
 */
export function minutes(minutes: number) {
  return seconds(minutes * 60);
}

/**
 * Converts hours to milliseconds
 */
export function hours(hours: number) {
  return minutes(hours * 60);
}
