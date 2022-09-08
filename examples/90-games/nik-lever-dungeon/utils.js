import { waypoints } from './data.js'

export const randomWaypoint = () => {
  const i = Math.floor(Math.random() * waypoints.length)
  return waypoints[i]
}
