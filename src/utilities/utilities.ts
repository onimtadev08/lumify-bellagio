export function ThousandSeparator(value: string | number) {
  if (value !== undefined && value !== null) {
    const number = parseFloat(value.toString().replace(/,/g, ''));
    if (isNaN(number)) return '';
    return new Intl.NumberFormat().format(number);
  } else {
    return '';
  }
}
