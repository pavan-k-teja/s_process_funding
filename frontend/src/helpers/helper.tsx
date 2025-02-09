export const shortenNumber = (number: number, k_digits: number = 3, m_digits: number = 6, k_decimal_places: number = 3, m_decimal_places: number = 1): string => {
    if (number.toString().length > m_digits) {
        return (number / 1000000).toFixed(m_decimal_places) + "M";
    } else if (number.toString().length > k_digits) {
        return (number / 1000).toFixed(k_decimal_places) + "k";
    } else {
        return number.toString();
    }
}