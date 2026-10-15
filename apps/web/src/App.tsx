import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  CityNotFoundError,
  formatCityLabel,
  getWeatherForCity,
  searchCities,
  type City,
  type WeatherResult,
} from "@weather/core";
import "./App.css";

const STORAGE_KEY = "weatherly:lastCity:v2";

function loadCity(): City | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as City) : null;
  } catch {
    return null;
  }
}

function saveCity(city: City) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(city));
  } catch {
    /* storage unavailable, ignore */
  }
}

const cityKey = (c: City) => `${c.latitude},${c.longitude}`;

export default function App() {
  const [input, setInput] = useState("");
  const [matches, setMatches] = useState<City[]>([]);
  const [result, setResult] = useState<WeatherResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);

  // Either a typed query (search, then load the top match)
  // or a specific city (picked from the list / restored from storage).
  async function load(source: { query: string } | { city: City }) {
    const id = ++requestId.current; // ignore stale responses
    setLoading(true);
    setError(null);
    try {
      let city: City;
      if ("query" in source) {
        const cities = await searchCities(source.query);
        if (id !== requestId.current) return;
        if (cities.length === 0) throw new CityNotFoundError(source.query);
        setMatches(cities);
        city = cities[0];
      } else {
        city = source.city;
      }

      const data = await getWeatherForCity(city);
      if (id !== requestId.current) return;
      setResult(data);
      saveCity(city);
    } catch (e) {
      if (id !== requestId.current) return;
      setResult(null);
      if (e instanceof CityNotFoundError) {
        setMatches([]);
        setError(e.message);
      } else {
        setError(
          "Couldn't fetch the weather. Check your connection and try again."
        );
      }
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  }

  // Restore the last chosen city on load
  useEffect(() => {
    const saved = loadCity();
    if (saved) {
      setInput(saved.name);
      load({ city: saved });
    }
  }, []);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (input.trim()) load({ query: input.trim() });
  }

  const isDay = result ? result.weather.isDay : true;
  const selectedKey = result ? cityKey(result.city) : null;

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
          <p className="place">{formatCityLabel(result.city)}</p>
          <p className="daynight">{isDay ? "Daytime" : "Nighttime"}</p>
        </section>
      )}

      {matches.length > 1 && (
        <div className="matches">
          <p>Not the right place?</p>
          <ul>
            {matches.map((c) => (
              <li key={cityKey(c)}>
                <button
                  type="button"
                  className={cityKey(c) === selectedKey ? "active" : ""}
                  onClick={() => load({ city: c })}
                >
                  {formatCityLabel(c)}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </main>
  );
}