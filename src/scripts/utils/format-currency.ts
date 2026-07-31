/**
 * Formats a number of cents into a currency string using a Shopify format
 * string.
 *
 * https://help.shopify.com/en/manual/international/pricing/currency-formatting#currency-formatting-options
 *
 * Originally from: https://gist.github.com/stewartknapman/8d8733ea58d2314c373e94114472d44c
 *
 * @param cents - The number of cents to format.
 * @param formatString - The format string to use.
 * @returns The formatted currency string.
 */
export function formatCurrency(cents: number, formatString: string) {
  const placeholderRegex = /{{\s*(\w+)\s*}}/;

  /**
   * Formats a number of cents into a currency string using the provided
   * precision, thousands separator, and decimal separator.
   * @param number - The number of cents to format.
   * @param precision - The number of decimal places to include.
   * @param thousands - The character to use as the thousands separator.
   * @param decimal - The character to use as the decimal separator.
   * @returns The formatted currency string.
   */
  function formatWithDelimiters(
    number: number,
    precision: number = 2,
    thousands: string = ",",
    decimal: string = ".",
  ) {
    if (isNaN(number) || number == null) {
      return "0";
    }

    const numString = (number / 100.0).toFixed(precision);
    const parts = numString.split(".");
    const dollars = parts[0].replace(
      /(\d)(?=(\d\d\d)+(?!\d))/g,
      "$1" + thousands,
    );
    const cents = parts[1] ? decimal + parts[1] : "";
    return dollars + cents;
  }

  return formatString.replace(placeholderRegex, (match, placeholder) => {
    switch (placeholder) {
      case "amount":
        // Ex.	1,134.65
        return formatWithDelimiters(cents, 2);
      case "amount_no_decimals":
        // Ex. 1,135
        return formatWithDelimiters(cents, 0);
      case "amount_with_comma_separator":
        // Ex. 1.134,65
        return formatWithDelimiters(cents, 2, ".", ",");
      case "amount_no_decimals_with_comma_separator":
        // Ex. 1.135
        return formatWithDelimiters(cents, 0, ".", ",");
      case "amount_with_apostrophe_separator":
        // Ex. 1'134.65
        return formatWithDelimiters(cents, 2, "'", ".");
      case "amount_no_decimals_with_space_separator":
        // Ex. 1 135
        return formatWithDelimiters(cents, 0, " ");
      case "amount_with_space_separator":
        // 1 134,65
        return formatWithDelimiters(cents, 2, " ", ",");
      case "amount_with_period_and_space_separator":
        // 1 134.65
        return formatWithDelimiters(cents, 2, " ", ".");
      default:
        return match;
    }
  });
}