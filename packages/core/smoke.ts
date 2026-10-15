import { getWeatherByCity, CityNotFoundError } from "./src";

async function main() {
  const city = process.argv[2] ?? "Iloilo";
  try {
    const { city: c, weather, info } = await getWeatherByCity(city);
    console.log(
      `${c.name}, ${c.country}: ${weather.temperature}${weather.unit}, ` +
        `${info.label} ${info.icon}, ${weather.isDay ? "day" : "night"}`
    );
  } catch (e) {
    if (e instanceof CityNotFoundError) console.error(e.message);
    else throw e;
  }
}

main();
