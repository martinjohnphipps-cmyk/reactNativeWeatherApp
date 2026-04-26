export type VariableData = {
    value: Float32Array | null;
    unit: string;
};

export type WeatherData = {
    time: Date[];
    temperature_2m: VariableData;
    apparent_temperature: VariableData;
    cloud_cover: VariableData;
    wind_speed_10m: VariableData;
    precipitation: VariableData;
    snowfall: VariableData;
    rain: VariableData;
    showers: VariableData;
    precipitation_probability: VariableData;
    weather_code: VariableData;
    is_day: VariableData;
};

export type HourlyEntry = {
    time: Date;
    temperature_2m: number;
    apparent_temperature: number;
    cloud_cover: number;
    wind_speed_10m: number;
    precipitation: number;
    precipitation_probability: number;
    weather_code: number;
    is_day: number;
};

export type DailySummary = {
    date: Date;
    minTemp: number;
    maxTemp: number;
    wmoCode: number;
};
