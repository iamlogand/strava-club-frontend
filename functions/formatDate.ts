export default function formatDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0") // Months are 0-indexed
  const day = String(date.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}

export function parseDate(dateString: string) {
  const [year, month, day] = dateString.split("-")
  return new Date(Number(year), Number(month) - 1, Number(day))
}
