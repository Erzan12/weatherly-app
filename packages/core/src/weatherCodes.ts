import type { WeatherInfo } from "./types";

// WMO weather codes as used by Open-Meteo.
// [label, day icon, night icon]
const CODES: Record<number, [string, string, string]> = {
  0: ["Clear sky", "☀️", "🌙"],
  1: ["Mainly clear", "🌤️", "🌙"],
  2: ["Partly cloudy", "⛅", "☁️"],
  3: ["Overcast", "☁️", "☁️"],
  45: ["Fog", "🌫️", "🌫️"],
  48: ["Rime fog", "🌫️", "🌫️"],
  51: ["Light drizzle", "🌦️", "🌧️"],
  53: ["Drizzle", "🌦️", "🌧️"],
  55: ["Heavy drizzle", "🌧️", "🌧️"],
  56: ["Light freezing drizzle", "🌧️", "🌧️"],
  57: ["Freezing drizzle", "🌧️", "🌧️"],
  61: ["Light rain", "🌦️", "🌧️"],
  63: ["Rain", "🌧️", "🌧️"],
  65: ["Heavy rain", "🌧️", "🌧️"],
  66: ["Light freezing rain", "🌧️", "🌧️"],
  67: ["Freezing rain", "🌧️", "🌧️"],
  71: ["Light snow", "🌨️", "🌨️"],
  73: ["Snow", "❄️", "❄️"],
  75: ["Heavy snow", "❄️", "❄️"],
  77: ["Snow grains", "❄️", "❄️"],
  80: ["Light rain showers", "🌦️", "🌧️"],
  81: ["Rain showers", "🌧️", "🌧️"],
  82: ["Violent rain showers", "⛈️", "⛈️"],
  85: ["Light snow showers", "🌨️", "🌨️"],
  86: ["Heavy snow showers", "🌨️", "🌨️"],
  95: ["Thunderstorm", "⛈️", "⛈️"],
  96: ["Thunderstorm with hail", "⛈️", "⛈️"],
  99: ["Severe thunderstorm with hail", "⛈️", "⛈️"],
};

export function weatherCodeToInfo(code: number, isDay: boolean): WeatherInfo {
  const entry = CODES[code];
  if (!entry) return { label: "Unknown", icon: "❔" };
  return { label: entry[0], icon: isDay ? entry[1] : entry[2] };
}
