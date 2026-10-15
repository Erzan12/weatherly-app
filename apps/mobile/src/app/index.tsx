import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  getWeatherByCity,
  CityNotFoundError,
  type WeatherResult,
} from "@weather/core";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const STORAGE_KEY = "weatherly:lastCity";

export default function HomeScreen() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<WeatherResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);

  async function search(name: string) {
    const query = name.trim();
    if (!query) return;

    const id = ++requestId.current; // ignore stale responses
    setLoading(true);
    setError(null);
    try {
      const data = await getWeatherByCity(query);
      if (id !== requestId.current) return;
      setResult(data);
      AsyncStorage.setItem(STORAGE_KEY, query).catch(() => {});
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

  // Restore the last city on launch
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((saved) => {
        if (saved) {
          setInput(saved);
          search(saved);
        }
      })
      .catch(() => {});
  }, []);

  const isDay = result ? result.weather.isDay : true;

  return (
    <SafeAreaView
      style={[styles.screen, { backgroundColor: isDay ? "#2f9bff" : "#1b3a4b" }]}
    >
      <StatusBar style="light" />

      <TextInput
        style={styles.input}
        value={input}
        onChangeText={setInput}
        placeholder="Enter a city"
        placeholderTextColor="#888"
        returnKeyType="search"
        onSubmitEditing={() => search(input)}
        autoCapitalize="words"
        autoCorrect={false}
      />

      {loading && <ActivityIndicator style={styles.gap} color="#fff" size="large" />}
      {error && <Text style={[styles.status, styles.gap]}>{error}</Text>}

      {result && !loading && (
        <View style={styles.card}>
          <Text style={styles.icon}>{result.info.icon}</Text>
          <Text style={styles.temp}>
            {Math.round(result.weather.temperature)}
            {result.weather.unit}
          </Text>
          <Text style={styles.condition}>{result.info.label}</Text>
          <Text style={styles.place}>
            {[result.city.name, result.city.region, result.city.country]
              .filter(Boolean)
              .join(", ")}
          </Text>
          <Text style={styles.daynight}>{isDay ? "Daytime" : "Nighttime"}</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, alignItems: "center", paddingHorizontal: 20, paddingTop: 24 },
  input: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#fff",
    borderRadius: 999,
    paddingHorizontal: 20,
    paddingVertical: 14,
    fontSize: 16,
    color: "#111",
  },
  gap: { marginTop: 32 },
  status: {
    color: "#fff",
    backgroundColor: "rgba(0,0,0,0.3)",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    overflow: "hidden",
  },
  card: {
    marginTop: 32,
    width: "100%",
    maxWidth: 420,
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 24,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.18)",
  },
  icon: { fontSize: 72, lineHeight: 90 },
  temp: { fontSize: 56, fontWeight: "600", color: "#fff", marginTop: 4 },
  condition: { fontSize: 20, color: "#fff" },
  place: { marginTop: 12, color: "#fff", opacity: 0.9, textAlign: "center" },
  daynight: { marginTop: 4, color: "#fff", opacity: 0.75, fontSize: 14 },
});