import { wmoCodeDescriptions } from '@/constants/openmeteoConstants';
import { DailySummary, HourlyEntry, WeatherData } from '@/types/weatherTypes';

export function currentWeatherIndex(weatherData: WeatherData): number | null {
    if (weatherData.time.length === 0) return null;

    let currentWeatherIndex = 0;

    for (let i = 0; i < weatherData.time.length; i++) {
        const time = weatherData.time[i];
        if (time < new Date()) {
            currentWeatherIndex = i;
        } else {
            break;
        }
    }

    return currentWeatherIndex;
}

export function getWmoDescription(code: number): string {
    return wmoCodeDescriptions[code] ?? `Unknown (${code})`;
}

export function getHourlyDataForDay(weatherData: WeatherData, dayIndex: number): HourlyEntry[] {
    const start = dayIndex * 24;
    const end = start + 24;
    const entries: HourlyEntry[] = [];

    for (let i = start; i < end && i < weatherData.time.length; i++) {
        entries.push({
            time: weatherData.time[i],
            temperature_2m: weatherData.temperature_2m.value?.[i] ?? 0,
            apparent_temperature: weatherData.apparent_temperature.value?.[i] ?? 0,
            cloud_cover: weatherData.cloud_cover.value?.[i] ?? 0,
            wind_speed_10m: weatherData.wind_speed_10m.value?.[i] ?? 0,
            precipitation: weatherData.precipitation.value?.[i] ?? 0,
            precipitation_probability: weatherData.precipitation_probability.value?.[i] ?? 0,
            weather_code: weatherData.weather_code.value?.[i] ?? 0,
            is_day: weatherData.is_day.value?.[i] ?? 0,
        });
    }

    return entries;
}

export function getDailySummary(weatherData: WeatherData, dayIndex: number): DailySummary {
    const start = dayIndex * 24;
    const end = Math.min(start + 24, weatherData.time.length);
    const temps = weatherData.temperature_2m.value;

    let minTemp = Infinity;
    let maxTemp = -Infinity;

    for (let i = start; i < end; i++) {
        const t = temps?.[i] ?? 0;
        if (t < minTemp) minTemp = t;
        if (t > maxTemp) maxTemp = t;
    }

    // Use noon (index 12 within the day) as the representative weather code
    const noonIndex = start + 12;
    const wmoCode = weatherData.weather_code.value?.[noonIndex] ?? 0;

    return {
        date: weatherData.time[start],
        minTemp: minTemp === Infinity ? 0 : minTemp,
        maxTemp: maxTemp === -Infinity ? 0 : maxTemp,
        wmoCode: Math.round(wmoCode),
    };
}
