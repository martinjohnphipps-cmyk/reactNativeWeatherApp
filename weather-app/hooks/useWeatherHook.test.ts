import { Unit } from '@openmeteo/sdk/unit';
import { renderHook, waitFor } from '@testing-library/react-native';
import { fetchWeatherApi } from 'openmeteo';
import { useWeatherHook } from './useWeatherHook';

jest.mock('openmeteo');

const mockFetchWeatherApi = fetchWeatherApi as jest.MockedFunction<typeof fetchWeatherApi>;

const START_SEC = 1745625600; // 2026-04-26T00:00:00Z
const INTERVAL = 3600;
const COUNT = 168;

function makeVariable(fill: number, unit: number) {
    return {
        valuesArray: () => new Float32Array(COUNT).fill(fill),
        unit: () => unit,
    };
}

function makeMockResponse(variables?: ReturnType<typeof makeVariable>[]) {
    const vars = variables ?? [
        makeVariable(15, Unit.celsius), // 0: temperature_2m
        makeVariable(13, Unit.celsius), // 1: apparent_temperature
        makeVariable(50, Unit.percentage), // 2: cloud_cover
        makeVariable(10, Unit.kilometres_per_hour), // 3: wind_speed_10m
        makeVariable(0, Unit.millimetre), // 4: precipitation
        makeVariable(0, Unit.centimetre), // 5: snowfall
        makeVariable(0, Unit.millimetre), // 6: rain
        makeVariable(0, Unit.millimetre), // 7: showers
        makeVariable(20, Unit.percentage), // 8: precipitation_probability
        makeVariable(0, Unit.wmo_code), // 9: weather_code
        makeVariable(1, Unit.dimensionless_integer), // 10: is_day
    ];
    return {
        hourly: () => ({
            time: () => BigInt(START_SEC),
            timeEnd: () => BigInt(START_SEC + COUNT * INTERVAL),
            interval: () => INTERVAL,
            variables: (i: number) => vars[i],
        }),
    };
}

describe('useWeatherHook', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('returns null currentWeather initially', () => {
        mockFetchWeatherApi.mockReturnValue(new Promise(() => {})); // never resolves
        const { result } = renderHook(() => useWeatherHook());
        expect(result.current.currentWeather).toBeNull();
    });

    it('returns WeatherData after successful fetch', async () => {
        mockFetchWeatherApi.mockResolvedValue([makeMockResponse() as never]);
        const { result } = renderHook(() => useWeatherHook());

        await waitFor(() => {
            expect(result.current.currentWeather).not.toBeNull();
        });

        const weather = result.current.currentWeather!;
        expect(weather.time).toHaveLength(168);
        expect(weather.temperature_2m.value).toHaveLength(168);
        expect(weather.weather_code.value).toHaveLength(168);
        expect(weather.is_day.value).toHaveLength(168);
    });

    it('builds time array from hourly start/end/interval', async () => {
        mockFetchWeatherApi.mockResolvedValue([makeMockResponse() as never]);
        const { result } = renderHook(() => useWeatherHook());

        await waitFor(() => expect(result.current.currentWeather).not.toBeNull());

        const { time } = result.current.currentWeather!;
        expect(time[0]).toEqual(new Date(START_SEC * 1000));
        expect(time[1]).toEqual(new Date((START_SEC + INTERVAL) * 1000));
        expect(time[167]).toEqual(new Date((START_SEC + 167 * INTERVAL) * 1000));
    });

    it('maps celsius unit to °C', async () => {
        mockFetchWeatherApi.mockResolvedValue([makeMockResponse() as never]);
        const { result } = renderHook(() => useWeatherHook());

        await waitFor(() => expect(result.current.currentWeather).not.toBeNull());

        expect(result.current.currentWeather!.temperature_2m.unit).toBe('°C');
    });

    it('maps wmo_code unit to "wmo"', async () => {
        mockFetchWeatherApi.mockResolvedValue([makeMockResponse() as never]);
        const { result } = renderHook(() => useWeatherHook());

        await waitFor(() => expect(result.current.currentWeather).not.toBeNull());

        expect(result.current.currentWeather!.weather_code.unit).toBe('wmo');
    });

    it('maps dimensionless_integer unit to empty string', async () => {
        mockFetchWeatherApi.mockResolvedValue([makeMockResponse() as never]);
        const { result } = renderHook(() => useWeatherHook());

        await waitFor(() => expect(result.current.currentWeather).not.toBeNull());

        expect(result.current.currentWeather!.is_day.unit).toBe('');
    });

    it('falls back to string representation for unknown units', async () => {
        const unknownUnit = 9999;
        const vars = [
            makeVariable(0, unknownUnit), // unknown unit for temperature_2m
            makeVariable(13, Unit.celsius),
            makeVariable(50, Unit.percentage),
            makeVariable(10, Unit.kilometres_per_hour),
            makeVariable(0, Unit.millimetre),
            makeVariable(0, Unit.centimetre),
            makeVariable(0, Unit.millimetre),
            makeVariable(0, Unit.millimetre),
            makeVariable(20, Unit.percentage),
            makeVariable(0, Unit.wmo_code),
            makeVariable(1, Unit.dimensionless_integer),
        ];
        mockFetchWeatherApi.mockResolvedValue([makeMockResponse(vars) as never]);
        const { result } = renderHook(() => useWeatherHook());

        await waitFor(() => expect(result.current.currentWeather).not.toBeNull());

        expect(result.current.currentWeather!.temperature_2m.unit).toBe(String(unknownUnit));
    });

    it('calls fetchWeatherApi with Sheffield coordinates and 7 forecast days', async () => {
        mockFetchWeatherApi.mockResolvedValue([makeMockResponse() as never]);
        renderHook(() => useWeatherHook());

        await waitFor(() => expect(mockFetchWeatherApi).toHaveBeenCalledTimes(1));

        const [, params] = mockFetchWeatherApi.mock.calls[0];
        expect(params).toMatchObject({
            latitude: 53.379059,
            longitude: -1.469003,
            timezone: 'auto',
            forecast_days: 7,
        });
    });

    it('calls fetchWeatherApi requesting all 11 hourly variables', async () => {
        mockFetchWeatherApi.mockResolvedValue([makeMockResponse() as never]);
        renderHook(() => useWeatherHook());

        await waitFor(() => expect(mockFetchWeatherApi).toHaveBeenCalledTimes(1));

        const [, params] = mockFetchWeatherApi.mock.calls[0];
        const hourly = (params as { hourly: string[] }).hourly;
        expect(hourly).toContain('temperature_2m');
        expect(hourly).toContain('weather_code');
        expect(hourly).toContain('is_day');
        expect(hourly).toHaveLength(11);
    });

    it('keeps currentWeather null and logs error on fetch failure', async () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        const error = new Error('Network error');
        mockFetchWeatherApi.mockRejectedValue(error);

        const { result } = renderHook(() => useWeatherHook());

        await waitFor(() => expect(consoleSpy).toHaveBeenCalledWith('Error fetching weather data:', error));

        expect(result.current.currentWeather).toBeNull();
        consoleSpy.mockRestore();
    });
});
