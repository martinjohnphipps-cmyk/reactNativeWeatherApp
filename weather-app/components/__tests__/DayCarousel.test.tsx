import { WeatherData } from '@/types/weatherTypes';
import { render, fireEvent } from '@testing-library/react-native';
import React from 'react';
import DayCarousel from '../DayCarousel';

function make168Times(startDate: Date): Date[] {
    return Array.from({ length: 168 }, (_, i) => new Date(startDate.getTime() + i * 3600 * 1000));
}

function makeWeatherData(): WeatherData {
    const startDate = new Date('2026-04-26T00:00:00Z');
    const times = make168Times(startDate);
    const temps = new Float32Array(168).fill(15);
    const wmo = new Float32Array(168).fill(1);

    return {
        time: times,
        temperature_2m: { value: temps, unit: '°C' },
        apparent_temperature: { value: new Float32Array(168).fill(13), unit: '°C' },
        cloud_cover: { value: new Float32Array(168).fill(40), unit: '%' },
        wind_speed_10m: { value: new Float32Array(168).fill(10), unit: 'km/h' },
        precipitation: { value: new Float32Array(168).fill(0), unit: 'mm' },
        snowfall: { value: new Float32Array(168).fill(0), unit: 'mm' },
        rain: { value: new Float32Array(168).fill(0), unit: 'mm' },
        showers: { value: new Float32Array(168).fill(0), unit: 'mm' },
        precipitation_probability: { value: new Float32Array(168).fill(10), unit: '%' },
        weather_code: { value: wmo, unit: 'wmo' },
        is_day: { value: new Float32Array(168).fill(1), unit: '' },
    };
}

describe('DayCarousel', () => {
    it('renders the carousel container', () => {
        const data = makeWeatherData();
        const { getByTestId } = render(<DayCarousel weatherData={data} selectedDay={0} onDaySelect={() => {}} />);
        expect(getByTestId('day-carousel')).toBeTruthy();
    });

    it('renders 7 day cards', () => {
        const data = makeWeatherData();
        const { getAllByText } = render(<DayCarousel weatherData={data} selectedDay={0} onDaySelect={() => {}} />);
        // Each card shows a temp in format "X° / Y°" — there should be 7
        const tempTexts = getAllByText(/°\s*\/\s*\d+°/);
        expect(tempTexts).toHaveLength(7);
    });

    it('renders "Today" for the first card', () => {
        const data = makeWeatherData();
        const { getByText } = render(<DayCarousel weatherData={data} selectedDay={0} onDaySelect={() => {}} />);
        expect(getByText('Today')).toBeTruthy();
    });

    it('calls onDaySelect with index 0 when Today card is pressed', () => {
        const onDaySelect = jest.fn();
        const data = makeWeatherData();
        const { getByTestId } = render(<DayCarousel weatherData={data} selectedDay={0} onDaySelect={onDaySelect} />);
        fireEvent.press(getByTestId('day-card-Today'));
        expect(onDaySelect).toHaveBeenCalledWith(0);
    });

    it('calls onDaySelect with index 1 when the second card is pressed', () => {
        const onDaySelect = jest.fn();
        const data = makeWeatherData();
        // 2026-04-26 is Sunday, so 2026-04-27 is Mon
        const { getByTestId } = render(<DayCarousel weatherData={data} selectedDay={0} onDaySelect={onDaySelect} />);
        fireEvent.press(getByTestId('day-card-Mon'));
        expect(onDaySelect).toHaveBeenCalledWith(1);
    });
});
