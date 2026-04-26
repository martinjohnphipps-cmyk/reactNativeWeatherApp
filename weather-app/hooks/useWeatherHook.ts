import { unitDisplayMap } from '@/constants/openmeteoConstants';
import { VariableData, WeatherData } from '@/types/weatherTypes';
import { fetchWeatherApi } from 'openmeteo';
import { useEffect, useState } from 'react';

const FETCH_RETRIES = 3;
const FETCH_BACKOFF_FACTOR = 0.2;
const FETCH_BACKOFF_MAX = 2;

export function useWeatherHook() {
    const url = 'https://api.open-meteo.com/v1/forecast';
    const [currentWeather, setCurrentWeather] = useState<WeatherData | null>(null);
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        const params = {
            latitude: 53.379059,
            longitude: -1.469003,
            timezone: 'auto',
            hourly: [
                'temperature_2m',
                'apparent_temperature',
                'cloud_cover',
                'wind_speed_10m',
                'precipitation',
                'snowfall',
                'rain',
                'showers',
                'precipitation_probability',
                'weather_code',
                'is_day',
            ],
            forecast_days: 7,
        };

        fetchWeatherApi(url, params, FETCH_RETRIES, FETCH_BACKOFF_FACTOR, FETCH_BACKOFF_MAX)
            .then((responses) => {
                const response = responses[0];
                const hourly = response.hourly()!;

                const toVariableData = (index: number): VariableData => {
                    const variable = hourly.variables(index)!;
                    return {
                        value: variable.valuesArray(),
                        unit: unitDisplayMap[variable.unit()] ?? String(variable.unit()),
                    };
                };

                const weatherData: WeatherData = {
                    time: Array.from(
                        { length: (Number(hourly.timeEnd()) - Number(hourly.time())) / hourly.interval() },
                        (_, i) => new Date((Number(hourly.time()) + i * hourly.interval()) * 1000),
                    ),
                    temperature_2m: toVariableData(0),
                    apparent_temperature: toVariableData(1),
                    cloud_cover: toVariableData(2),
                    wind_speed_10m: toVariableData(3),
                    precipitation: toVariableData(4),
                    snowfall: toVariableData(5),
                    rain: toVariableData(6),
                    showers: toVariableData(7),
                    precipitation_probability: toVariableData(8),
                    weather_code: toVariableData(9),
                    is_day: toVariableData(10),
                };
                setCurrentWeather(weatherData);
            })
            .catch((error) => {
                console.error('Error fetching weather data:', error);
                setHasError(true);
            });
    }, []);

    return { currentWeather, hasError };
}
