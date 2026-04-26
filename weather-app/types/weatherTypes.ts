export type WeatherData = {
    current: {
        time: Date[];
        temperature_2m: Float32Array<ArrayBufferLike> | null;
    };
};

export type CurrentTemperature = {
    time: Date;
    temperature_2m: number | null;
}