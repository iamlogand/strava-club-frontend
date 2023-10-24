import ActivityType from "@/types/ActivityType"

export default function getAggregateColumnVisibilityModel(
  filter: ActivityType
): { [key: string]: boolean } {
  switch (filter) {
    case "All":
      return { pace: false }
    case "Weight Training":
    case "Yoga":
      return { distance: false, totalElevationGain: false, pace: false }
    case "Football":
      return { totalElevationGain: false }
    default:
      return {}
  }
}
