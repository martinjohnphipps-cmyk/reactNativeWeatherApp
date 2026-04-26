import { WeatherData } from '@/types/weatherTypes';

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
