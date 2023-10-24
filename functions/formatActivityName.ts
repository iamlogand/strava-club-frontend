export function formatActivityName(activityName: string) {
  switch (activityName) {
    case "VirtualRide":
      return "Virtual Ride"
    case "MountainBikeRide":
      return "Mountain Bike Ride"
    case "WeightTraining":
      return "Weight Training"
    case "Soccer":
      return "Football"
    default:
      return activityName
  }
}
