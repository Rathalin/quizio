/**
 * Converts seconds to milliseconds
 */
export function seconds(seconds: number = 1) {
  return seconds * 1000;
}

/**
 * Converts minutes to milliseconds
 */
export function minutes(minutes: number = 1) {
  return seconds(minutes * 60);
}

/**
 * Converts hours to milliseconds
 */
export function hours(hours: number = 1) {
  return minutes(hours * 60);
}
