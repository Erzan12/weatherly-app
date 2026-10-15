import type {
  City,
  CurrentWeather,
  TemperatureUnit,
  WeatherResult,
} from "./types";
import { weatherCodeToInfo } from "./weatherCodes";

const GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search";
const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";

export class CityNotFoundError extends Error {
  constructor(query: string) {
    super(`No city found for "${query}"`);
    this.name = "CityNotFoundError";
  }
}

export class WeatherApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WeatherApiError";
  }
}

async function getJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(url, { signal });
  if (!res.ok) {
    throw new WeatherApiError(`Request failed with status ${res.status}`);
  }
  return (await res.json()) as T;
}

interface GeocodingResponse {
  results?: Array<{
    name: string;
    country?: string;
    admin1?: string;
    latitude: number;
    longitude: number;
  }>;
}

export async function searchCity(
  query: string,
  signal?: AbortSignal
): Promise<City> {
  const name = query.trim();
  if (!name) throw new CityNotFoundError(query);

  const params = new URLSearchParams({ name, count: "1", language: "en" });
  const data = await getJson<GeocodingResponse>(
    `${GEOCODING_URL}?${params}`,
    signal
  );

  const hit = data.results?.[0];
  if (!hit) throw new CityNotFoundError(name);

  return {
    name: hit.name,
    country: hit.country ?? "",
    region: hit.admin1,
    latitude: hit.latitude,
    longitude: hit.longitude,
  };
}

interface ForecastResponse {
  current: {
    time: string;
    temperature_2m: number;
    weather_code: number;
    is_day: number;
  };
  current_units: { temperature_2m: string };
}

export async function getCurrentWeather(
  latitude: number,
  longitude: number,
  unit: TemperatureUnit = "celsius",
  signal?: AbortSignal
): Promise<CurrentWeather> {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current: "temperature_2m,weather_code,is_day",
    temperature_unit: unit,
    timezone: "auto",
  });
  const data = await getJson<ForecastResponse>(
    `${FORECAST_URL}?${params}`,
    signal
  );

  return {
    temperature: data.current.temperature_2m,
    unit: data.current_units.temperature_2m,
    weatherCode: data.current.weather_code,
    isDay: data.current.is_day === 1,
    time: data.current.time,
  };
}

/** One call for the apps: city name in, everything the UI needs out. */
export async function getWeatherByCity(
  query: string,
  unit: TemperatureUnit = "celsius",
  signal?: AbortSignal
): Promise<WeatherResult> {
  const city = await searchCity(query, signal);
  const weather = await getCurrentWeather(
    city.latitude,
    city.longitude,
    unit,
    signal
  );
  return {
    city,
    weather,
    info: weatherCodeToInfo(weather.weatherCode, weather.isDay),
  };
}
