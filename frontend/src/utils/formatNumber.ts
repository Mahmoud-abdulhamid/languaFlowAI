/**
 * Format large numbers with k suffix
 * Examples:
 * - 500 -> 500
 * - 1000 -> 1k
 * - 1234 -> 1.23k
 * - 5024 -> 5.02k
 * - 12500 -> 12.5k
 * - 999999 -> 1000k (could extend to M for millions)
 */
export function formatNumber(num: number | undefined): string {
    if (num === undefined || num === null) return '0';

    if (num < 1000) {
        return num.toString();
    }

    // For thousands
    const thousands = num / 1000;

    // If it's a whole thousand, show without decimal
    if (thousands % 1 === 0) {
        return `${thousands}k`;
    }

    // Otherwise show up to 2 decimal places, removing trailing zeros
    return `${thousands.toFixed(2).replace(/\.?0+$/, '')}k`;
}
