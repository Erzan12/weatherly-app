import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  getWeatherByCity,
  CityNotFoundError,
  type WeatherResult,
} from "@weather/core";
import "./App.css";

const STORAGE_KEY = "weatherly:lastCity";

function loadCity(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}

function saveCity(city: string) {
  try {
    localStorage.setItem(STORAGE_KEY, city);
  } catch {
    /* storage unavailable, ignore */
  }
}

export default function App() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<WeatherResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);

  async function search(name: string) {
    const query = name.trim();
    if (!query) return;

    const id = ++requestId.current; // lets us ignore stale responses
    setLoading(true);
    setError(null);
    try {
      const data = await getWeatherByCity(query);
      if (id !== requestId.current) return;
      setResult(data);
      saveCity(query);
    } catch (e) {
      if (id !== requestId.current) return;
      setResult(null);
      setError(
        e instanceof CityNotFoundError
          ? e.message
          : "Couldn't fetch the weather. Check your connection and try again."
      );
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  }

  // Bonus feature: restore the last city on load
  useEffect(() => {
    const saved = loadCity();
    if (saved) {
      setInput(saved);
      search(saved);
    }
  }, []);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    search(input);
  }

  const isDay = result ? result.weather.isDay : true;

  return (
    <main className={`app ${isDay ? "day" : "night"}`}>
      <form onSubmit={onSubmit} className="search">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter a city and press Enter"
          aria-label="City name"
          autoFocus
        />
      </form>

      {loading && <p className="status">Loading…</p>}
      {error && <p className="status error">{error}</p>}

      {result && !loading && (
        <section className="card">
          <div className="icon">{result.info.icon}</div>
          <h1>
            {Math.round(result.weather.temperature)}
            {result.weather.unit}
          </h1>
          <p className="condition">{result.info.label}</p>
          <p className="place">
            {result.city.name}
            {result.city.region ? `, ${result.city.region}` : ""}
            {result.city.country ? `, ${result.city.country}` : ""}
          </p>
          <p className="daynight">{isDay ? "Daytime" : "Nighttime"}</p>
        </section>
      )}
    </main>
  );
}