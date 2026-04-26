import { CurrentTemperature, WeatherData } from "@/types/weatherTypes";

export function getLatestTemperature(weatherData: WeatherData): CurrentTemperature | null {
    let currentTimeIndex = 0;

    for (let i = 0; i < weatherData.current.time.length; i++) {
        const time = weatherData.current.time[i];
        if (time < new Date()) {
            currentTimeIndex = i;
        }
        else {
            break;
        }
    }
  
    return weatherData.current.temperature_2m?.[currentTimeIndex] ?
        {
            time: weatherData.current.time[currentTimeIndex],
            temperature_2m: weatherData.current.temperature_2m[currentTimeIndex]
        } : null;
}