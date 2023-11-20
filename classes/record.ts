import capitalizeFirstLetter from "@/functions/capitalize"
import { formatActivityName } from "@/functions/formatActivityName"

interface Athlete {
  firstname: string
  lastname: string
}

export interface RecordData {
  athlete: Athlete
  name: string
  distance: number
  elapsed_time: number
  total_elevation_gain: number
  sport_type: string
  timestamp: string
}

class Record {
  name: string
  description: string
  distance: number
  elapsedTime: number
  totalElevationGain: number
  type: string
  date: Date

  constructor(data: RecordData) {
    this.name = `${capitalizeFirstLetter(data.athlete.firstname)} ${capitalizeFirstLetter(data.athlete.lastname)}`)
    this.description = data.name
    this.distance = data.distance
    this.elapsedTime = data.elapsed_time
    this.totalElevationGain = data.total_elevation_gain
    this.type = formatActivityName(data.sport_type)
    this.date = new Date(data.timestamp)
  }
}

export default Record
