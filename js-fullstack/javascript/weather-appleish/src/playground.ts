import { fetchForecast } from "./api/openMeteoForecast";
import { searchLocations } from "./api/openMeteoGeocoding";

export async function runPlayground() {
  const results = await searchLocations("Ekibastuz");
  console.log("Geocoding results:", results);

  const location = results[0];
  if (!location) throw new Error("No location found");

  const timezone = location.timezone ?? "auto";
  const forecast = await fetchForecast(
    location.latitude,
    location.longitude,
    timezone,
    "metric",
  );

  console.log("Current", forecast.current);
  console.log(
    "Hourly sample:",
    forecast.hourly?.time?.slice(0, 5),
    forecast.hourly?.temperature_2m?.slice(0, 5),
  );
  console.log("Daily:", forecast.daily);
}
