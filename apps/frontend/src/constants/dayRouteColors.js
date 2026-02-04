/**
 * Colors per day for route polylines on the map (MVP2).
 * Same palette is used in the itinerary list so users can match each day to its line on the map.
 */
export const DAY_ROUTE_COLORS = [
  "#0284c7", // day 1: blue
  "#059669", // day 2: green
  "#d97706", // day 3: amber
  "#7c3aed", // day 4: violet
  "#dc2626", // day 5: red
  "#0891b2", // day 6: cyan
  "#65a30d", // day 7: lime
  "#c026d3", // day 8: fuchsia
  "#ea580c", // day 9: orange
  "#0d9488", // day 10: teal
];

/** Get the route color for a 0-based day index (same as map polyline). */
export function getDayRouteColor(dayIndex) {
  return DAY_ROUTE_COLORS[dayIndex % DAY_ROUTE_COLORS.length] ?? DAY_ROUTE_COLORS[0];
}
