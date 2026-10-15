import { searchCities, getWeatherForCity, formatCityLabel } from "./src";

declare const process: { argv: string[] };

async function main() {
  const query = process.argv[2] ?? "Iloilo";
  const cities = await searchCities(query);
  if (cities.length === 0) {
    console.error(`No city found for "${query}"`);
    return;
  }

  console.log("Matches:");
  cities.forEach((c, i) => console.log(`  ${i + 1}. ${formatCityLabel(c)}`));

  const { weather, info } = await getWeatherForCity(cities[0]);
  console.log(
    `\n${formatCityLabel(cities[0])}: ${weather.temperature}${weather.unit}, ` +
      `${info.label} ${info.icon}, ${weather.isDay ? "day" : "night"}`
  );
}

main();