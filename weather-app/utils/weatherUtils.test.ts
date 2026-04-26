import { currentWeatherIndex, getDailySummary, getHourlyDataForDay, getWmoDescription } from './weatherUtils';
import type { VariableData, WeatherData } from '../types/weatherTypes';

const emptyVar: VariableData = { value: new Float32Array([]), unit: '' };

function make168Times(startDate: Date): Date[] {
    const times: Date[] = [];
    for (let i = 0; i < 168; i++) {
        times.push(new Date(startDate.getTime() + i * 3600 * 1000));
    }
    return times;
}

function make168Values(fillValue: number = 10, overrides: Record<number, number> = {}): Float32Array {
    const arr = new Float32Array(168).fill(fillValue);
    for (const [idx, val] of Object.entries(overrides)) {
        arr[Number(idx)] = val;
    }
    return arr;
}

function makeFullWeatherData(startDate: Date, temps: Float32Array, wmoValues: Float32Array): WeatherData {
    const times = make168Times(startDate);
    return {
        time: times,
        temperature_2m: { value: temps, unit: '°C' },
        apparent_temperature: { value: new Float32Array(168).fill(9), unit: '°C' },
        cloud_cover: { value: new Float32Array(168).fill(50), unit: '%' },
        wind_speed_10m: { value: new Float32Array(168).fill(15), unit: 'km/h' },
        precipitation: { value: new Float32Array(168).fill(0), unit: 'mm' },
        snowfall: emptyVar,
        rain: emptyVar,
        showers: emptyVar,
        precipitation_probability: { value: new Float32Array(168).fill(20), unit: '%' },
        weather_code: { value: wmoValues, unit: 'wmo' },
        is_day: { value: new Float32Array(168).fill(1), unit: '' },
    };
}

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
            [new Date('2026-04-26T10:00:00Z'), new Date('2026-04-26T11:00:00Z'), new Date('2026-04-26T12:00:00Z')],
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

describe('getWmoDescription', () => {
    it('returns Clear sky for code 0', () => {
        expect(getWmoDescription(0)).toBe('Clear sky');
    });

    it('returns Partly cloudy for code 2', () => {
        expect(getWmoDescription(2)).toBe('Partly cloudy');
    });

    it('returns Thunderstorm for code 95', () => {
        expect(getWmoDescription(95)).toBe('Thunderstorm');
    });

    it('returns Thunderstorm with heavy hail for code 99', () => {
        expect(getWmoDescription(99)).toBe('Thunderstorm with heavy hail');
    });

    it('returns Unknown fallback for an unknown code', () => {
        expect(getWmoDescription(999)).toBe('Unknown (999)');
    });
});

describe('getHourlyDataForDay', () => {
    const startDate = new Date('2026-04-26T00:00:00Z');

    it('returns 24 entries for day 0', () => {
        const temps = make168Values(15);
        const wmo = make168Values(1);
        const data = makeFullWeatherData(startDate, temps, wmo);
        const hours = getHourlyDataForDay(data, 0);
        expect(hours).toHaveLength(24);
    });

    it('returns 24 entries for day 3', () => {
        const temps = make168Values(15);
        const wmo = make168Values(1);
        const data = makeFullWeatherData(startDate, temps, wmo);
        const hours = getHourlyDataForDay(data, 3);
        expect(hours).toHaveLength(24);
    });

    it('returns correct time for first hour of day 0', () => {
        const temps = make168Values(15);
        const wmo = make168Values(1);
        const data = makeFullWeatherData(startDate, temps, wmo);
        const hours = getHourlyDataForDay(data, 0);
        expect(hours[0].time).toEqual(startDate);
    });

    it('returns correct time for first hour of day 1', () => {
        const temps = make168Values(15);
        const wmo = make168Values(1);
        const data = makeFullWeatherData(startDate, temps, wmo);
        const hours = getHourlyDataForDay(data, 1);
        expect(hours[0].time).toEqual(new Date('2026-04-27T00:00:00Z'));
    });

    it('returns the temperature value at the correct index', () => {
        const temps = make168Values(10, { 25: 22.5 }); // day 1, hour 1
        const wmo = make168Values(0);
        const data = makeFullWeatherData(startDate, temps, wmo);
        const hours = getHourlyDataForDay(data, 1);
        expect(hours[1].temperature_2m).toBeCloseTo(22.5, 1);
    });

    it('returns the weather_code at the correct index', () => {
        const temps = make168Values(10);
        const wmo = make168Values(0, { 48: 63 }); // day 2, hour 0
        const data = makeFullWeatherData(startDate, temps, wmo);
        const hours = getHourlyDataForDay(data, 2);
        expect(hours[0].weather_code).toBe(63);
    });

    it('returns empty array when dayIndex is out of range', () => {
        const data = makeWeatherData([], emptyVar);
        const hours = getHourlyDataForDay(data, 0);
        expect(hours).toHaveLength(0);
    });

    it('defaults all numeric fields to 0 when value arrays are null', () => {
        const times = make168Times(startDate);
        const nullVar = { value: null as unknown as Float32Array, unit: '' };
        const data: WeatherData = {
            time: times,
            temperature_2m: nullVar,
            apparent_temperature: nullVar,
            cloud_cover: nullVar,
            wind_speed_10m: nullVar,
            precipitation: nullVar,
            snowfall: nullVar,
            rain: nullVar,
            showers: nullVar,
            precipitation_probability: nullVar,
            weather_code: nullVar,
            is_day: nullVar,
        };
        const hours = getHourlyDataForDay(data, 0);
        expect(hours).toHaveLength(24);
        expect(hours[0].temperature_2m).toBe(0);
        expect(hours[0].apparent_temperature).toBe(0);
        expect(hours[0].cloud_cover).toBe(0);
        expect(hours[0].wind_speed_10m).toBe(0);
        expect(hours[0].precipitation).toBe(0);
        expect(hours[0].precipitation_probability).toBe(0);
        expect(hours[0].weather_code).toBe(0);
        expect(hours[0].is_day).toBe(0);
    });
});

describe('getDailySummary', () => {
    const startDate = new Date('2026-04-26T00:00:00Z');

    it('returns correct date for day 0', () => {
        const temps = make168Values(10);
        const wmo = make168Values(0);
        const data = makeFullWeatherData(startDate, temps, wmo);
        const summary = getDailySummary(data, 0);
        expect(summary.date).toEqual(startDate);
    });

    it('returns correct date for day 2', () => {
        const temps = make168Values(10);
        const wmo = make168Values(0);
        const data = makeFullWeatherData(startDate, temps, wmo);
        const summary = getDailySummary(data, 2);
        expect(summary.date).toEqual(new Date('2026-04-28T00:00:00Z'));
    });

    it('returns correct min and max temperature for day 0', () => {
        const temps = make168Values(15, { 0: 5, 10: 20, 23: 8 }); // day 0: min=5, max=20
        const wmo = make168Values(0);
        const data = makeFullWeatherData(startDate, temps, wmo);
        const summary = getDailySummary(data, 0);
        expect(summary.minTemp).toBeCloseTo(5, 1);
        expect(summary.maxTemp).toBeCloseTo(20, 1);
    });

    it('uses noon (hour 12) as representative weather code', () => {
        const temps = make168Values(10);
        const wmo = make168Values(0, { 12: 95 }); // noon of day 0
        const data = makeFullWeatherData(startDate, temps, wmo);
        const summary = getDailySummary(data, 0);
        expect(summary.wmoCode).toBe(95);
    });

    it('uses noon of day 1 for day 1 summary', () => {
        const temps = make168Values(10);
        const wmo = make168Values(0, { 36: 63 }); // day 1, hour 12 = index 36
        const data = makeFullWeatherData(startDate, temps, wmo);
        const summary = getDailySummary(data, 1);
        expect(summary.wmoCode).toBe(63);
    });

    it('returns 0 for minTemp/maxTemp when value array is null', () => {
        const times = make168Times(startDate);
        const data: WeatherData = {
            time: times,
            temperature_2m: { value: null, unit: '°C' },
            apparent_temperature: emptyVar,
            cloud_cover: emptyVar,
            wind_speed_10m: emptyVar,
            precipitation: emptyVar,
            snowfall: emptyVar,
            rain: emptyVar,
            showers: emptyVar,
            precipitation_probability: emptyVar,
            weather_code: { value: new Float32Array(168).fill(0), unit: 'wmo' },
            is_day: emptyVar,
        };
        const summary = getDailySummary(data, 0);
        expect(summary.minTemp).toBe(0);
        expect(summary.maxTemp).toBe(0);
    });

    it('rounds float weather codes to the nearest integer', () => {
        const temps = make168Values(10);
        const wmo = make168Values(0);
        // Set noon of day 0 to 2.7 (should round to 3)
        wmo[12] = 2.7;
        const data = makeFullWeatherData(startDate, temps, wmo);
        const summary = getDailySummary(data, 0);
        expect(summary.wmoCode).toBe(3);
    });

    it('defaults wmoCode to 0 when weather_code.value is null', () => {
        const times = make168Times(startDate);
        const nullVar = { value: null as unknown as Float32Array, unit: '' };
        const data: WeatherData = {
            time: times,
            temperature_2m: { value: make168Values(10), unit: '°C' },
            apparent_temperature: emptyVar,
            cloud_cover: emptyVar,
            wind_speed_10m: emptyVar,
            precipitation: emptyVar,
            snowfall: emptyVar,
            rain: emptyVar,
            showers: emptyVar,
            precipitation_probability: emptyVar,
            weather_code: nullVar,
            is_day: emptyVar,
        };
        const summary = getDailySummary(data, 0);
        expect(summary.wmoCode).toBe(0);
    });

    it('returns 0 min/max when day range has no entries', () => {
        // dayIndex=7 with 168-entry data: start=168, end=min(192,168)=168, loop runs 0 times
        const temps = make168Values(10);
        const wmo = make168Values(0);
        const data = makeFullWeatherData(startDate, temps, wmo);
        const summary = getDailySummary(data, 7);
        expect(summary.minTemp).toBe(0);
        expect(summary.maxTemp).toBe(0);
    });
});
