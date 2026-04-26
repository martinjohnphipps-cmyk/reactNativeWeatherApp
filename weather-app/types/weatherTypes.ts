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

export type CurrentTemperature = {
    time: Date;
    temperature_2m: number | null;
};
