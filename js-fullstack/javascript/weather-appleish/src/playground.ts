import { fetchForecast } from "./api/openMeteoForecast";
import { searchLocations } from "./api/openMeteoGeocoding";
import { mapOpenMeteoForecast } from "./mappers/openMeteoMapper";

export async function runPlayground() {
  const results = await searchLocations("Ekibastuz");
  const location = results[0];
  if (!location) throw new Error("No location found");

  const timezone = location.timezone ?? "auto";
  const rawForecast = await fetchForecast(
    location.latitude,
    location.longitude,
    timezone,
    "metric",
  );

  const mappedForecast = mapOpenMeteoForecast(rawForecast, {
    locationId: location.id,
    units: "metric",
  });

  console.log("Mapped forecast:", mappedForecast);
  console.log("Hourly[0]:", mappedForecast.hourly[0]);
  console.log("Daily[0]:", mappedForecast.daily[0]);
}
