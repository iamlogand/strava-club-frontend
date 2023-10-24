export default function getPace(time: number, distance: number) {
  if (time === 0 || distance === 0) return 0
  return time / 60 / (distance / 1000)
}
