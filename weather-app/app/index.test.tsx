import { useWeatherHook } from '@/hooks/useWeatherHook';
import { WeatherData } from '@/types/weatherTypes';
import { fireEvent, render } from '@testing-library/react-native';
import Index from './index';

jest.mock('@/hooks/useWeatherHook');

// All factory functions use require() to avoid jest.mock hoisting scope restrictions
jest.mock('react-native-safe-area-context', () => ({
    SafeAreaView: ({ children, style }: any) => {
        const { createElement } = require('react');
        const { View } = require('react-native');
        return createElement(View, { style }, children);
    },
}));

jest.mock('@/components/DayCarousel', () => ({
    __esModule: true,
    default: ({ selectedDay, onDaySelect }: any) => {
        const { createElement } = require('react');
        const { View, Text, TouchableOpacity } = require('react-native');
        return createElement(
            View,
            { testID: 'mock-day-carousel' },
            createElement(Text, { testID: 'carousel-selected-day' }, String(selectedDay)),
            createElement(
                TouchableOpacity,
                { testID: 'select-day-0', onPress: () => onDaySelect(0) },
                createElement(Text, null, 'Day 0'),
            ),
            createElement(
                TouchableOpacity,
                { testID: 'select-day-3', onPress: () => onDaySelect(3) },
                createElement(Text, null, 'Day 3'),
            ),
        );
    },
}));

jest.mock('@/components/HourlyWeatherList', () => ({
    __esModule: true,
    default: ({ dayIndex, initialHourIndex }: any) => {
        const { createElement } = require('react');
        const { View, Text } = require('react-native');
        return createElement(
            View,
            { testID: 'mock-hourly-list' },
            createElement(Text, { testID: 'prop-day-index' }, String(dayIndex)),
            createElement(Text, { testID: 'prop-initial-hour' }, String(initialHourIndex)),
        );
    },
}));

const mockUseWeatherHook = useWeatherHook as jest.MockedFunction<typeof useWeatherHook>;

function makeWeatherData(): WeatherData {
    const startDate = new Date('2026-04-26T00:00:00Z');
    const times = Array.from({ length: 168 }, (_, i) => new Date(startDate.getTime() + i * 3600 * 1000));
    const val = (fill: number): { value: Float32Array; unit: string } => ({
        value: new Float32Array(168).fill(fill),
        unit: '',
    });
    return {
        time: times,
        temperature_2m: val(15),
        apparent_temperature: val(13),
        cloud_cover: val(50),
        wind_speed_10m: val(10),
        precipitation: val(0),
        snowfall: val(0),
        rain: val(0),
        showers: val(0),
        precipitation_probability: val(20),
        weather_code: val(0),
        is_day: val(1),
    };
}

describe('Index screen', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('shows loading indicator when weather data is null', () => {
        mockUseWeatherHook.mockReturnValue({ currentWeather: null });
        const { getByText, queryByTestId } = render(<Index />);

        expect(getByText('Loading weather…')).toBeTruthy();
        expect(queryByTestId('mock-day-carousel')).toBeNull();
        expect(queryByTestId('mock-hourly-list')).toBeNull();
    });

    it('shows the location title and subtitle regardless of weather state', () => {
        mockUseWeatherHook.mockReturnValue({ currentWeather: null });
        const { getByText } = render(<Index />);

        expect(getByText('TES Sheffield Office')).toBeTruthy();
        expect(getByText('53.38°N, 1.47°W')).toBeTruthy();
    });

    it('hides loading and shows carousel and hourly list when weather loads', () => {
        mockUseWeatherHook.mockReturnValue({ currentWeather: makeWeatherData() });
        const { queryByText, getByTestId } = render(<Index />);

        expect(queryByText('Loading weather…')).toBeNull();
        expect(getByTestId('mock-day-carousel')).toBeTruthy();
        expect(getByTestId('mock-hourly-list')).toBeTruthy();
    });

    it('starts with day 0 (today) selected', () => {
        mockUseWeatherHook.mockReturnValue({ currentWeather: makeWeatherData() });
        const { getByTestId } = render(<Index />);

        expect(getByTestId('carousel-selected-day').props.children).toBe('0');
        expect(getByTestId('prop-day-index').props.children).toBe('0');
    });

    it('passes initialHourIndex as 0 when all weather times are in the future', () => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date('2025-01-01T00:00:00Z'));

        mockUseWeatherHook.mockReturnValue({ currentWeather: makeWeatherData() });
        const { getByTestId } = render(<Index />);

        // All times in future → currentWeatherIndex = 0 → initialHourIndex = 0 % 24 = 0
        expect(getByTestId('prop-initial-hour').props.children).toBe('0');
        jest.useRealTimers();
    });

    it('derives initialHourIndex from current hour for today (day 0)', () => {
        jest.useFakeTimers();
        // Set time to hour 10 of day 0 (index 10 in the 168-entry array)
        jest.setSystemTime(new Date('2026-04-26T10:30:00Z'));

        mockUseWeatherHook.mockReturnValue({ currentWeather: makeWeatherData() });
        const { getByTestId } = render(<Index />);

        // currentWeatherIndex = 10, initialHourIndex = 10 % 24 = 10
        expect(getByTestId('prop-initial-hour').props.children).toBe('10');
        jest.useRealTimers();
    });

    it('passes initialHourIndex as 0 for non-today days', () => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date('2026-04-26T10:30:00Z'));

        mockUseWeatherHook.mockReturnValue({ currentWeather: makeWeatherData() });
        const { getByTestId } = render(<Index />);

        fireEvent.press(getByTestId('select-day-3'));

        expect(getByTestId('prop-day-index').props.children).toBe('3');
        expect(getByTestId('prop-initial-hour').props.children).toBe('0');
        jest.useRealTimers();
    });

    it('updates selected day when carousel triggers onDaySelect', () => {
        mockUseWeatherHook.mockReturnValue({ currentWeather: makeWeatherData() });
        const { getByTestId } = render(<Index />);

        expect(getByTestId('carousel-selected-day').props.children).toBe('0');

        fireEvent.press(getByTestId('select-day-3'));

        expect(getByTestId('carousel-selected-day').props.children).toBe('3');
        expect(getByTestId('prop-day-index').props.children).toBe('3');
    });

    it('resets to day 0 when today card is pressed again', () => {
        mockUseWeatherHook.mockReturnValue({ currentWeather: makeWeatherData() });
        const { getByTestId } = render(<Index />);

        fireEvent.press(getByTestId('select-day-3'));
        fireEvent.press(getByTestId('select-day-0'));

        expect(getByTestId('prop-day-index').props.children).toBe('0');
    });
});
