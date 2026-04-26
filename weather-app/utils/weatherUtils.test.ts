import { getLatestTemperature } from './weatherUtils';
import type { WeatherData } from '../types/weatherTypes';

describe('getLatestTemperature', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('returns null when time array is empty', () => {
        const data: WeatherData = {
            current: {
                time: [],
                temperature_2m: new Float32Array([]),
            },
        };
        expect(getLatestTemperature(data)).toBeNull();
    });

    it('returns null when time array is empty and temperature_2m is null', () => {
        const data: WeatherData = {
            current: {
                time: [],
                temperature_2m: null,
            },
        };
        expect(getLatestTemperature(data)).toBeNull();
    });

    it('returns temperature for the most recent past time, not a future one', () => {
        jest.setSystemTime(new Date('2026-04-26T12:30:00Z'));

        const data: WeatherData = {
            current: {
                time: [
                    new Date('2026-04-26T10:00:00Z'),
                    new Date('2026-04-26T11:00:00Z'),
                    new Date('2026-04-26T12:00:00Z'), // most recent past
                    new Date('2026-04-26T13:00:00Z'),
                    new Date('2026-04-26T14:00:00Z'),
                ],
                temperature_2m: new Float32Array([10.0, 11.0, 12.5, 13.0, 14.0]),
            },
        };

        const result = getLatestTemperature(data);
        expect(result).not.toBeNull();
        expect(result?.time).toEqual(new Date('2026-04-26T12:00:00Z'));
        expect(result?.temperature_2m).toBeCloseTo(12.5);
    });

    it('returns the last entry when all times are in the past', () => {
        jest.setSystemTime(new Date('2026-04-26T20:00:00Z'));

        const data: WeatherData = {
            current: {
                time: [
                    new Date('2026-04-26T10:00:00Z'),
                    new Date('2026-04-26T11:00:00Z'),
                    new Date('2026-04-26T12:00:00Z'), // last in array
                ],
                temperature_2m: new Float32Array([10.0, 11.0, 12.0]),
            },
        };

        const result = getLatestTemperature(data);
        expect(result).not.toBeNull();
        expect(result?.time).toEqual(new Date('2026-04-26T12:00:00Z'));
        expect(result?.temperature_2m).toBeCloseTo(12.0);
    });

    it('returns the correct temperature just after midnight when times span across midnight', () => {
        jest.setSystemTime(new Date('2026-04-27T00:30:00Z'));

        const data: WeatherData = {
            current: {
                time: [
                    new Date('2026-04-26T22:00:00Z'),
                    new Date('2026-04-26T23:00:00Z'),
                    new Date('2026-04-27T00:00:00Z'), // just past midnight, most recent past
                    new Date('2026-04-27T01:00:00Z'),
                ],
                temperature_2m: new Float32Array([8.0, 7.5, 7.0, 6.8]),
            },
        };

        const result = getLatestTemperature(data);
        expect(result).not.toBeNull();
        expect(result?.time).toEqual(new Date('2026-04-27T00:00:00Z'));
        expect(result?.temperature_2m).toBeCloseTo(7.0);
    });

    it('returns null when temperature_2m is null', () => {
        jest.setSystemTime(new Date('2026-04-26T12:00:00Z'));

        const data: WeatherData = {
            current: {
                time: [
                    new Date('2026-04-26T10:00:00Z'),
                    new Date('2026-04-26T11:00:00Z'),
                ],
                temperature_2m: null,
            },
        };

        expect(getLatestTemperature(data)).toBeNull();
    });

    it('returns null without throwing when there is no temperature entry for the latest time index', () => {
        jest.setSystemTime(new Date('2026-04-26T12:00:00Z'));

        // time has 2 entries but temperature_2m only covers the first
        const data: WeatherData = {
            current: {
                time: [
                    new Date('2026-04-26T10:00:00Z'),
                    new Date('2026-04-26T11:00:00Z'), // most recent past, index 1
                ],
                temperature_2m: new Float32Array([10.0]), // only index 0 exists
            },
        };

        expect(() => getLatestTemperature(data)).not.toThrow();
        expect(getLatestTemperature(data)).toBeNull();
    });
});
