export const convertToBaseE = (value: number | string, decimal: number) => {
  value = Number(value);
  // Check if the value is a valid number
  if (value === undefined || value === null) return null;

  // Convert the number to exponential notation
  const exponentialValue = value.toExponential();

  // Split the exponential value into mantissa and exponent
  let [mantissa, exponent] = exponentialValue.split('e');

  // Provide fallbacks for both mantissa and exponent
  mantissa = mantissa ?? '1'; // If undefined, use '1' as a default mantissa
  exponent = exponent ?? '0'; // If undefined, use '0' as a default exponent

  // Convert exponent to an integer and add the decimal shift
  const newExponent = parseInt(exponent, 10) + decimal;

  // Remove trailing zeros from the mantissa part
  mantissa = mantissa.replace(/(\.\d*?)0+$/, '$1'); // Remove trailing zeros in mantissa

  // Remove a decimal point if it's the last character before 'e'
  mantissa = mantissa.replace(/\.$/, ''); // If there's a trailing '.', remove it

  // Return the final result with the adjusted exponent
  return `${mantissa}e${newExponent}`;
};
