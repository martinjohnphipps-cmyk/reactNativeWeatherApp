import { currentWeatherIndex } from './weatherUtils';
import type { VariableData, WeatherData } from '../types/weatherTypes';

const emptyVar: VariableData = { value: new Float32Array([]), unit: '' };

function makeWeatherData(time: Date[], temperature_2m: VariableData): WeatherData {
    return {
        time,
        temperature_2m,
        apparent_temperature: emptyVar,
        cloud_cover: emptyVar,
        wind_speed_10m: emptyVar,
        precipitation: emptyVar,
        snowfall: emptyVar,
        rain: emptyVar,
        showers: emptyVar,
        precipitation_probability: emptyVar,
        weather_code: emptyVar,
        is_day: emptyVar,
    };
}

describe('currentWeatherIndex', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('returns null when time array is empty', () => {
        const data = makeWeatherData([], { value: new Float32Array([]), unit: '°C' });
        expect(currentWeatherIndex(data)).toBeNull();
    });

    it('returns the index of the most recent past time, not a future one', () => {
        jest.setSystemTime(new Date('2026-04-26T12:30:00Z'));

        const data = makeWeatherData(
            [
                new Date('2026-04-26T10:00:00Z'),
                new Date('2026-04-26T11:00:00Z'),
                new Date('2026-04-26T12:00:00Z'), // most recent past, index 2
                new Date('2026-04-26T13:00:00Z'),
                new Date('2026-04-26T14:00:00Z'),
            ],
            { value: new Float32Array([10.0, 11.0, 12.5, 13.0, 14.0]), unit: '°C' },
        );

        expect(currentWeatherIndex(data)).toBe(2);
    });

    it('returns the last index when all times are in the past', () => {
        jest.setSystemTime(new Date('2026-04-26T20:00:00Z'));

        const data = makeWeatherData(
            [
                new Date('2026-04-26T10:00:00Z'),
                new Date('2026-04-26T11:00:00Z'),
                new Date('2026-04-26T12:00:00Z'),
            ],
            { value: new Float32Array([10.0, 11.0, 12.0]), unit: '°C' },
        );

        expect(currentWeatherIndex(data)).toBe(2);
    });

    it('returns the correct index just after midnight when times span across midnight', () => {
        jest.setSystemTime(new Date('2026-04-27T00:30:00Z'));

        const data = makeWeatherData(
            [
                new Date('2026-04-26T22:00:00Z'),
                new Date('2026-04-26T23:00:00Z'),
                new Date('2026-04-27T00:00:00Z'), // just past midnight, most recent past, index 2
                new Date('2026-04-27T01:00:00Z'),
            ],
            { value: new Float32Array([8.0, 7.5, 7.0, 6.8]), unit: '°C' },
        );

        expect(currentWeatherIndex(data)).toBe(2);
    });
});
