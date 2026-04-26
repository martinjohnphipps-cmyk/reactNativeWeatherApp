import { WeatherData } from "@/types/weatherTypes";
import { fetchWeatherApi } from "openmeteo";
import { useEffect, useState } from "react";

export function useWeatherHook() {
    const url = "https://api.open-meteo.com/v1/forecast";
    const [currentWeather, setCurrentWeather] = useState<WeatherData | null>(null);

    useEffect(() => {
        const params = {
            latitude: 53.379059,
            longitude: -1.469003,
            timezone: 'auto',
            hourly: "temperature_2m",
            forecast_days: 7,
        };

        // Fetch weather api takes retry params etc. for if it failed - could be good to add
        fetchWeatherApi(url, params)
            .then((responses) => {
                const response = responses[0];
                const hourly = response.hourly()!;

                const weatherData = {
                    current: {
                        time: Array.from(
                            { length: (Number(hourly.timeEnd()) - Number(hourly.time())) / hourly.interval() }, 
                            (_ , i) => new Date((Number(hourly.time()) + i * hourly.interval()) * 1000)
                        ),
                        temperature_2m: hourly.variables(0)!.valuesArray(),
                        unit: hourly.variables(0)!.unit()
                    },
                };
                setCurrentWeather(weatherData);
            })
            .catch((error) => {
                // Add better error handling, say in UI that it has errored
                console.error("Error fetching weather data:", error);
            });
    }, []);

    return { currentWeather };
}