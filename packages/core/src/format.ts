import type { City } from "./types";

/** "Cebu, Central Visayas, Philippines" */
export function formatCityLabel(city: City): string {
  return [city.name, city.region, city.country].filter(Boolean).join(", ");
}