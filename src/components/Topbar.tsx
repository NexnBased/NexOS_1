import dayjs from "dayjs";
import { useState, useEffect } from "react";
import { PowerIcon, Volume2Icon, WifiIcon } from "lucide-react";
import {
  type LocationInfo,
  type WeatherDataResponse,
  fetchWeatherData,
  fetchIPLocation,
  formatTemp,
  LOCATION_MAPPING,
} from "../services/WeatherService";

function Topbar() {
  const [currentTime, setCurrentTime] = useState(dayjs());
  const [location, setLocation] = useState<LocationInfo | null>(null);
  const [weather, setWeather] = useState<WeatherDataResponse | null>(null);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTime(dayjs());
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      const ip = await fetchIPLocation();
      const fallback = LOCATION_MAPPING.FALLBACK_LOCATIONS[0];

      const lat = ip?.latitude ?? fallback.latitude;
      const lon = ip?.longitude ?? fallback.longitude;
      const place: LocationInfo = ip?.location ?? {
        name: fallback.name,
        country: fallback.country,
      };

      const data = await fetchWeatherData(lat, lon);
      if (active) {
        setWeather(data);
        setLocation(place);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const celsius = weather
    ? formatTemp(weather.current.temperature_2m, "celsius")
    : "";
  const fahrenheit = weather
    ? formatTemp(weather.current.temperature_2m, "fahrenheit")
    : "";

  return (
    <nav className="w-full h-fit p-2 flex justify-center bg-transparent">
      <header className="w-200 h-10 p-1 pr-2 pl-2 rounded-2xl flex flex-row items-center justify-between transition-all backdrop-blur-2xl bg-zinc-950/70 hover:scale-99">
        <section className="relative w-1/5 flex flex-row gap-1 items-center justify-start">
          <button
            type="button"
            className="w-18 h-6 font-bold text-sm  tracking-wider text-purple-400 select-none pointer-events-none"
            disabled
          >
            NexOS
          </button>
        </section>
        <section className="relative w-3/5 flex flex-row gap-2 items-center justify-center">
          <button
            disabled
            type="button"
            className="w-fit h-6 font-bold text-sm flex items-center justify-center tracking-wider select-none pointer-events-none text-purple-400"
          >
            {location?.country ?? ""} — {fahrenheit} {celsius}
          </button>
          <button
            disabled
            type="button"
            className="w-18 h-6 font-bold text-sm flex items-center justify-center tracking-wider select-none pointer-events-none text-purple-400"
          >
            {currentTime.format("MMM D")}
          </button>
          <button
            disabled
            type="button"
            className="w-21 h-6 font-bold text-sm flex items-center justify-center tracking-wider select-none pointer-events-none text-purple-400"
          >
            {currentTime.format("HH:mm A")}
          </button>
        </section>
        <section className="relative w-1/5 flex flex-row items-center justify-end">
          <button
            disabled
            type="button"
            className="w-24 h-6 font-bold text-sm flex gap-3 items-center justify-center pointer-events-none select-none tracking-wider text-purple-400"
          >
            <WifiIcon size={15} strokeWidth={3} />
            <Volume2Icon size={15} strokeWidth={3} />
            <PowerIcon size={15} strokeWidth={3} />
          </button>
        </section>
      </header>
    </nav>
  );
}

export default Topbar;
