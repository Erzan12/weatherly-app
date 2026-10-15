export type TemperatureUnit = "celsius" | "fahrenheit";

export interface City {
  name: string;
  country: string;
  /** State / province / region, when Open-Meteo provides it */
  region?: string;
  latitude: number;
  longitude: number;
}

export interface CurrentWeather {
  temperature: number;
  /** Display unit, e.g. "°C" or "°F" */
  unit: string;
  /** WMO weather interpretation code */
  weatherCode: number;
  isDay: boolean;
  /** ISO local time of the observation at the city */
  time: string;
}

export interface WeatherInfo {
  label: string;
  /** Emoji, so it renders on both web and React Native with no assets */
  icon: string;
}

export interface WeatherResult {
  city: City;
  weather: CurrentWeather;
  info: WeatherInfo;
}
