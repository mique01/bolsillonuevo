/**
 * Formats a number as currency according to the specified locale and currency.
 *
 * @param value The number to format.
 * @param locale The locale string (e.g., 'en-US', 'de-DE', 'es-ES'). Defaults to 'de-DE' for '.' as thousand separator.
 * @param currency The currency code (e.g., 'USD', 'EUR'). Defaults to 'USD' (can be changed).
 * @returns The formatted currency string, or an empty string if the value is invalid.
 */
export function formatCurrency(
  value: number | null | undefined,
  locale: string = 'de-DE', // Using 'de-DE' for dot as thousand separator
  currency: string = 'USD' // Default currency, adjust if needed (e.g., 'EUR', 'ARS')
): string {
  if (value === null || value === undefined || isNaN(value)) {
    return ""; // Return empty string or maybe "0" or "-" depending on desired display for invalid values
  }

  try {
    // Intl.NumberFormat handles locale-specific thousand/decimal separators.
    // We are not showing the currency symbol here, just formatting the number.
    // Use style: 'decimal' to avoid adding currency symbols automatically.
    // Set minimumFractionDigits and maximumFractionDigits to control decimal places.
    return new Intl.NumberFormat(locale, {
      style: 'decimal', // Use 'currency' if you want the currency symbol included
      // currency: currency, // Only needed if style is 'currency'
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  } catch (error) {
    console.error("Error formatting currency:", error);
    // Fallback to simple formatting if Intl fails
    return value.toFixed(2);
  }
}

/**
 * Formats a number as a compact value (e.g., 1.5k, 2M).
 *
 * @param value The number to format.
 * @param locale The locale string (e.g., 'en-US', 'de-DE'). Defaults to 'en-US'.
 * @returns The formatted compact number string, or an empty string if the value is invalid.
 */
export function formatCompactNumber(
  value: number | null | undefined,
  locale: string = 'en-US'
): string {
   if (value === null || value === undefined || isNaN(value)) {
    return "";
  }

  try {
     return new Intl.NumberFormat(locale, {
      notation: "compact",
      compactDisplay: "short",
      maximumFractionDigits: 1 // Adjust as needed
    }).format(value);
  } catch (error) {
     console.error("Error formatting compact number:", error);
     return value.toString(); // Fallback
  }
} 