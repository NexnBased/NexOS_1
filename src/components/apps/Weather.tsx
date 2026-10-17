import {
  useState,
  useEffect,
  useRef,
  useCallback,
  type ReactNode,
} from "react";
import {
  SearchIcon,
  MapPinIcon,
  RefreshCwIcon,
  WindIcon,
  DropletsIcon,
  ThermometerIcon,
  SunIcon,
  CloudIcon,
  NavigationIcon,
  AlertCircleIcon,
  GaugeIcon,
} from "lucide-react";
import {
  type TempUnit,
  type LocationInfo,
  type GeocodingResult,
  type WeatherDataResponse,
  LOCATION_MAPPING,
  getWeatherDetails,
  formatTemp,
  fetchWeatherData,
  searchCities,
  reverseGeocode,
  fetchIPLocation,
} from "../../services/WeatherService";
import type { AppProps } from "../../app/AppRegistry";

export interface Props extends AppProps {
  onLocationUpdate?: (
    location: LocationInfo,
    data: WeatherDataResponse,
  ) => void;
}

function Weather({ onLocationUpdate }: Props) {
  const [query, setQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<GeocodingResult[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState<boolean>(false);
  const [currentLocation, setCurrentLocation] = useState<LocationInfo | null>(
    null,
  );
  const [weather, setWeather] = useState<WeatherDataResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [units, setUnits] = useState<TempUnit>("celsius");
  const searchRef = useRef<HTMLDivElement | null>(null);

  const loadWeather = useCallback(
    async (lat: number, lon: number, locationInfo: LocationInfo) => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchWeatherData(lat, lon);
        setWeather(data);
        setCurrentLocation(locationInfo);
        onLocationUpdate?.(locationInfo, data);
      } catch (err: unknown) {
        setError(
          err instanceof Error
            ? err.message
            : "An error occurred while fetching weather.",
        );
      } finally {
        setLoading(false);
      }
    },
    [onLocationUpdate],
  );

  const handleAutoLocation = useCallback(() => {
    setLoading(true);
    setError(null);

    const fallbackToIP = async () => {
      const ip = await fetchIPLocation();
      if (ip) {
        await loadWeather(ip.latitude, ip.longitude, ip.location);
      } else {
        const fallback = LOCATION_MAPPING.FALLBACK_LOCATIONS[0];
        await loadWeather(fallback.latitude, fallback.longitude, {
          name: fallback.name,
          country: fallback.country,
        });
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          const locationInfo = await reverseGeocode(latitude, longitude);
          await loadWeather(latitude, longitude, locationInfo);
        },
        () => fallbackToIP(),
        { timeout: 5000 },
      );
    } else {
      fallbackToIP();
    }
  }, [loadWeather]);

  useEffect(() => {
    if (!query.trim() || query.length < 2) return;

    let isSubscribed = true;
    const timer = setTimeout(async () => {
      if (isSubscribed) setIsSearching(true);
      try {
        const results = await searchCities(query);
        if (isSubscribed) setSearchResults(results);
      } finally {
        if (isSubscribed) setIsSearching(false);
      }
    }, 300);

    return () => {
      isSubscribed = false;
      clearTimeout(timer);
    };
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    let active = true;
    const timer = setTimeout(() => {
      if (active) handleAutoLocation();
    }, 0);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [handleAutoLocation]);

  const selectCity = (city: GeocodingResult) => {
    setShowSearchDropdown(false);
    setQuery("");
    setSearchResults([]);
    loadWeather(city.latitude, city.longitude, {
      name: city.name,
      country: city.country_code || city.country || "",
    });
  };

  const currentDetails = weather?.current
    ? getWeatherDetails(weather.current.weather_code, weather.current.is_day)
    : null;
  const CurrentIcon = currentDetails?.icon || CloudIcon;

  return (
    <div className="w-full h-full  p-5 flex flex-col justify-between relative overflow-hidden select-none antialiased">
      <div className="flex items-center justify-between gap-2 relative z-30 shrink-0">
        <div className="relative flex-1" ref={searchRef}>
          <div className="relative flex items-center">
            <SearchIcon className="w-4 h-4 absolute left-3 text-zinc-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search city"
              value={query}
              onChange={(e) => {
                const val = e.target.value;
                setQuery(val);
                if (!val.trim() || val.length < 2) setSearchResults([]);
                setShowSearchDropdown(true);
              }}
              onFocus={() => setShowSearchDropdown(true)}
              className="w-full bg-zinc-700/80 rounded-md pl-9 pr-8 py-2 text-sm text-zinc-100 placeholder-zinc-300 focus:outline-none focus:bg-zinc-800 transition"
            />
          </div>

          {showSearchDropdown && (query.trim().length >= 2 || isSearching) && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-zinc-900/95 backdrop-blur-2xl rounded-md shadow-2xl overflow-hidden z-50 divide-y divide-zinc-800/50">
              {isSearching ? (
                <div className="p-3 text-sm text-zinc-400 text-center flex items-center justify-center gap-2">
                  <RefreshCwIcon className="size-4 animate-spin text-zinc-700" />
                </div>
              ) : searchResults.length > 0 ? (
                searchResults.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => selectCity(item)}
                    className="w-full px-3 py-2 text-left text-sm text-zinc-200 hover:bg-zinc-800/80 flex items-center justify-between transition"
                  >
                    <span className="truncate font-medium">
                      {item.name}
                      <span className="text-zinc-500 font-normal ml-1">
                        {item.admin1 ? `, ${item.admin1}` : ""}
                      </span>
                    </span>
                    <span className="text-xs text-zinc-500 uppercase ml-2">
                      {item.country_code || item.country}
                    </span>
                  </button>
                ))
              ) : (
                <div className="p-3 text-sm text-zinc-400 text-center">
                  No locations found
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleAutoLocation}
            disabled={loading}
            className="text-sm font-medium p-2.5 rounded-md bg-zinc-700/80 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition"
            title="Detect Location"
          >
            {loading ? (
              <RefreshCwIcon className="size-4" />
            ) : (
              <NavigationIcon className="size-4" />
            )}
          </button>
          <button
            onClick={() =>
              setUnits(units === "celsius" ? "fahrenheit" : "celsius")
            }
            className="text-sm font-medium p-2 rounded-md bg-zinc-700/80 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition"
          >
            {units === "celsius" ? "C" : "F"}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <RefreshCwIcon className="size-10 text-zinc-900 animate-spin" />
        </div>
      ) : error ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center gap-2">
          <AlertCircleIcon className="w-8 h-8 text-zinc-500" />
          <p className="text-sm text-zinc-800">{error}</p>
          <button
            onClick={handleAutoLocation}
            className="mt-2 px-4 py-1.5 bg-zinc-700 text-sm rounded-md text-zinc-300 hover:bg-zinc-800 transition"
          >
            Retry
          </button>
        </div>
      ) : weather ? (
        <div className="flex-1 flex gap-4 items-stretch mt-3 overflow-hidden">
          <div className="flex-1 flex flex-col justify-between h-full bg-zinc-900/50 rounded-md p-5 min-w-0">
            <div>
              <div className="flex items-center gap-2 text-zinc-300 text-sm font-medium mb-1">
                <MapPinIcon className="w-4 h-4 text-zinc-400 shrink-0" />
                <span className="truncate">
                  {currentLocation?.name}
                  {currentLocation?.country
                    ? `, ${currentLocation.country}`
                    : ""}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <CurrentIcon className="w-6 h-6 text-zinc-300 shrink-0" />
                <span className="text-base font-medium text-zinc-300 truncate">
                  {currentDetails?.label}
                </span>
              </div>
            </div>

            <div className="mt-auto pt-3">
              <div className="text-7xl font-light tracking-tight text-zinc-100 leading-none mb-2">
                {formatTemp(weather.current.temperature_2m, units)}
              </div>
              {weather.daily && (
                <div className="text-sm text-zinc-400 flex items-center gap-3">
                  <span>
                    H{" "}
                    <span className="text-zinc-200">
                      {formatTemp(weather.daily.temperature_2m_max[0], units)}
                    </span>
                  </span>
                  <span>
                    L{" "}
                    <span className="text-zinc-200">
                      {formatTemp(weather.daily.temperature_2m_min[0], units)}
                    </span>
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="w-64 flex flex-col gap-2 h-full shrink-0">
            <StatRow
              icon={
                <ThermometerIcon className="w-4 h-4 text-zinc-400 shrink-0" />
              }
              label="Feels Like"
              value={formatTemp(weather.current.apparent_temperature, units)}
            />
            <StatRow
              icon={<DropletsIcon className="w-4 h-4 text-zinc-400 shrink-0" />}
              label="Humidity"
              value={`${weather.current.relative_humidity_2m}%`}
            />
            <StatRow
              icon={<WindIcon className="w-4 h-4 text-zinc-400 shrink-0" />}
              label="Wind"
              value={`${Math.round(weather.current.wind_speed_10m)} km/h`}
            />
            <StatRow
              icon={<SunIcon className="w-4 h-4 text-zinc-400 shrink-0" />}
              label="UV Index"
              value={String(
                weather.daily?.uv_index_max?.[0]
                  ? Math.round(weather.daily.uv_index_max[0])
                  : 0,
              )}
            />
            <StatRow
              icon={<GaugeIcon className="w-4 h-4 text-zinc-400 shrink-0" />}
              label="Pressure"
              value={`${Math.round(
                weather.current.surface_pressure || 1013,
              )} hPa`}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}

function StatRow({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex-1 bg-zinc-900/50 rounded-md px-4 flex items-center justify-between min-h-0">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-sm text-zinc-400 font-medium">{label}</span>
      </div>
      <span className="text-sm font-semibold text-zinc-200 truncate">
        {value}
      </span>
    </div>
  );
}

export default Weather;
