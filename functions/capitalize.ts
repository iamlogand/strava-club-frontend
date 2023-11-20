function capitalizeFirstLetter(input: string): string {
  if (input.length === 0) {
    return input // Return the input unchanged if it's an empty string
  }

  const firstLetter = input.charAt(0).toUpperCase()
  const restOfString = input.slice(1)

  return `${firstLetter}${restOfString}`
}

export default capitalizeFirstLetter
