import { type ComponentType } from "react";
import {
  SunIcon,
  MoonIcon,
  CloudIcon,
  CloudMoonIcon,
  CloudFogIcon,
  CloudDrizzleIcon,
  CloudRainIcon,
  CloudSnowIcon,
  CloudLightningIcon,
} from "lucide-react";

export type TempUnit = "celsius" | "fahrenheit";
export interface LocationInfo {
  name: string;
  country: string;
}
export interface GeocodingResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country_code?: string;
  country?: string;
  admin1?: string;
}
export interface CurrentWeather {
  temperature_2m: number;
  apparent_temperature: number;
  relative_humidity_2m: number;
  wind_speed_10m: number;
  surface_pressure: number;
  weather_code: number;
  is_day: number;
}
export interface DailyWeather {
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  uv_index_max?: number[];
}
export interface WeatherDataResponse {
  current: CurrentWeather;
  daily: DailyWeather;
}
export interface WeatherDetail {
  label: string;
  icon: ComponentType<{ className?: string }>;
}

export const API_ENDPOINTS = {
  weather: "https://api.open-meteo.com/v1/forecast",
  geocoding: "https://geocoding-api.open-meteo.com/v1/search",
  reverseGeocode: "https://api.bigdatacloud.net/data/reverse-geocode-client",
  ipLocation: "https://ipwho.is/",
} as const;
export const LOCATION_MAPPING = {
  FALLBACK_LOCATIONS: [
    { name: "New York", country: "US", latitude: 40.7128, longitude: -74.006 },
    { name: "London", country: "GB", latitude: 51.5074, longitude: -0.1278 },
  ] as Array<{
    name: string;
    country: string;
    latitude: number;
    longitude: number;
  }>,
};

export async function fetchWeatherData(
  lat: number,
  lon: number,
): Promise<WeatherDataResponse> {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    current:
      "temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,surface_pressure,weather_code,is_day",
    daily: "temperature_2m_max,temperature_2m_min,uv_index_max",
    timezone: "auto",
  });
  const res = await fetch(`${API_ENDPOINTS.weather}?${params.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch weather data.");
  return (await res.json()) as WeatherDataResponse;
}

export async function searchCities(query: string): Promise<GeocodingResult[]> {
  try {
    const params = new URLSearchParams({
      name: query,
      count: "5",
      language: "en",
      format: "json",
    });
    const res = await fetch(`${API_ENDPOINTS.geocoding}?${params.toString()}`);
    if (!res.ok) return [];
    const data = await res.json();
    return (data.results as GeocodingResult[]) || [];
  } catch {
    return [];
  }
}

export async function reverseGeocode(
  lat: number,
  lon: number,
): Promise<LocationInfo> {
  try {
    const params = new URLSearchParams({
      latitude: String(lat),
      longitude: String(lon),
      localityLanguage: "en",
    });
    const res = await fetch(
      `${API_ENDPOINTS.reverseGeocode}?${params.toString()}`,
    );
    const data = await res.json();
    return {
      name:
        data.city ||
        data.locality ||
        data.principalSubdivision ||
        "Current Location",
      country: data.countryCode || data.countryName || "",
    };
  } catch {
    return { name: "My Location", country: "" };
  }
}

export async function fetchIPLocation(): Promise<{
  latitude: number;
  longitude: number;
  location: LocationInfo;
} | null> {
  try {
    const res = await fetch(API_ENDPOINTS.ipLocation);
    const data = await res.json();
    if (data.success) {
      return {
        latitude: data.latitude,
        longitude: data.longitude,
        location: { name: data.city, country: data.country_code },
      };
    }
  } catch {
    // null
  }
  return null;
}

export function formatTemp(temp: number, units: TempUnit): string {
  const value = units === "fahrenheit" ? (temp * 9) / 5 + 32 : temp;
  return `${Math.round(value)}°${units === "fahrenheit" ? "F" : "C"}`;
}

export function getWeatherDetails(code: number, isDay: number): WeatherDetail {
  if (code === 0) return { label: "Clear", icon: isDay ? SunIcon : MoonIcon };
  if (code >= 1 && code <= 2)
    return { label: "Partly Cloudy", icon: isDay ? CloudIcon : CloudMoonIcon };
  if (code === 3) return { label: "Overcast", icon: CloudIcon };
  if (code === 45 || code === 48) return { label: "Fog", icon: CloudFogIcon };
  if (code >= 51 && code <= 57)
    return { label: "Drizzle", icon: CloudDrizzleIcon };
  if (code >= 61 && code <= 67) return { label: "Rain", icon: CloudRainIcon };
  if (code >= 71 && code <= 77) return { label: "Snow", icon: CloudSnowIcon };
  if (code >= 80 && code <= 82)
    return { label: "Rain Showers", icon: CloudRainIcon };
  if (code >= 85 && code <= 86)
    return { label: "Snow Showers", icon: CloudSnowIcon };
  if (code >= 95) return { label: "Thunderstorm", icon: CloudLightningIcon };
  return { label: "Unknown", icon: CloudIcon };
}
