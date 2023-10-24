export default function formatTime(minutesParam: number): string {
  if (minutesParam < 0) {
    throw new Error("Input must be a non-negative number.")
  }

  const hours = Math.floor(minutesParam / 60)
  const minutes = Math.floor(minutesParam % 60)
  const seconds = Math.floor((minutesParam * 60) % 60)

  const formattedHours = String(hours).padStart(2, '0');
  const formattedMinutes = String(minutes).padStart(2, '0');
  const formattedSeconds = String(Math.floor(seconds)).padStart(2, '0');

  console.log(minutesParam, `${hours}:${minutes}:${seconds}`)

  return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`
}
