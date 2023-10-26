export default function addOrdinalSuffix(number: number) {
  if (number % 10 === 1 && number % 100 !== 11) {
    return number + "st"
  } else if (number % 10 === 2 && number % 100 !== 12) {
    return number + "nd"
  } else if (number % 10 === 3 && number % 100 !== 13) {
    return number + "rd"
  } else {
    return number + "th"
  }
}
