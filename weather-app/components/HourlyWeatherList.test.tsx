import { WeatherData } from '@/types/weatherTypes';
import { render } from '@testing-library/react-native';
import React from 'react';
import HourlyWeatherList from './HourlyWeatherList';

function make168Times(startDate: Date): Date[] {
    return Array.from({ length: 168 }, (_, i) => new Date(startDate.getTime() + i * 3600 * 1000));
}

function makeWeatherData(wmoOverride: number = 0): WeatherData {
    const startDate = new Date('2026-04-26T00:00:00Z');
    const times = make168Times(startDate);
    const wmo = new Float32Array(168).fill(wmoOverride);

    return {
        time: times,
        temperature_2m: { value: new Float32Array(168).fill(15), unit: '°C' },
        apparent_temperature: { value: new Float32Array(168).fill(13), unit: '°C' },
        cloud_cover: { value: new Float32Array(168).fill(40), unit: '%' },
        wind_speed_10m: { value: new Float32Array(168).fill(10), unit: 'km/h' },
        precipitation: { value: new Float32Array(168).fill(0), unit: 'mm' },
        snowfall: { value: new Float32Array(168).fill(0), unit: 'mm' },
        rain: { value: new Float32Array(168).fill(0), unit: 'mm' },
        showers: { value: new Float32Array(168).fill(0), unit: 'mm' },
        precipitation_probability: { value: new Float32Array(168).fill(20), unit: '%' },
        weather_code: { value: wmo, unit: 'wmo' },
        is_day: { value: new Float32Array(168).fill(1), unit: '' },
    };
}

describe('HourlyWeatherList', () => {
    it('renders the hourly list container', () => {
        const data = makeWeatherData();
        const { getByTestId } = render(<HourlyWeatherList weatherData={data} dayIndex={0} initialHourIndex={0} />);
        expect(getByTestId('hourly-weather-list')).toBeTruthy();
    });

    it('renders temperature values for day 0', () => {
        const data = makeWeatherData();
        const { getAllByText } = render(<HourlyWeatherList weatherData={data} dayIndex={0} initialHourIndex={0} />);
        const tempTexts = getAllByText('15.0°C');
        expect(tempTexts.length).toBeGreaterThan(0);
    });

    it('renders "feels like" temperature', () => {
        const data = makeWeatherData();
        const { getAllByText } = render(<HourlyWeatherList weatherData={data} dayIndex={0} initialHourIndex={0} />);
        const feelsLike = getAllByText('Feels 13.0°C');
        expect(feelsLike.length).toBeGreaterThan(0);
    });

    it('renders WMO description for Clear sky (code 0)', () => {
        const data = makeWeatherData(0);
        const { getAllByText } = render(<HourlyWeatherList weatherData={data} dayIndex={0} initialHourIndex={0} />);
        const descriptions = getAllByText('Clear sky');
        expect(descriptions.length).toBeGreaterThan(0);
    });

    it('renders WMO description for Thunderstorm (code 95)', () => {
        const data = makeWeatherData(95);
        const { getAllByText } = render(<HourlyWeatherList weatherData={data} dayIndex={0} initialHourIndex={0} />);
        const descriptions = getAllByText('Thunderstorm');
        expect(descriptions.length).toBeGreaterThan(0);
    });

    it('renders precipitation probability', () => {
        const data = makeWeatherData();
        const { getAllByText } = render(<HourlyWeatherList weatherData={data} dayIndex={0} initialHourIndex={0} />);
        const precip = getAllByText('💧 20%');
        expect(precip.length).toBeGreaterThan(0);
    });

    it('renders wind speed', () => {
        const data = makeWeatherData();
        const { getAllByText } = render(<HourlyWeatherList weatherData={data} dayIndex={0} initialHourIndex={0} />);
        const wind = getAllByText('💨 10 km/h');
        expect(wind.length).toBeGreaterThan(0);
    });

    it('renders correct hours for day 1', () => {
        const data = makeWeatherData();
        const { getByTestId } = render(<HourlyWeatherList weatherData={data} dayIndex={1} initialHourIndex={0} />);
        // Day 1 starts at 2026-04-27T00:00:00Z (hour index 24)
        expect(getByTestId('hourly-row-2026-04-27T00:00:00.000Z')).toBeTruthy();
    });

    it('accepts initialHourIndex beyond list length without crashing', () => {
        const data = makeWeatherData();
        const { getByTestId } = render(<HourlyWeatherList weatherData={data} dayIndex={0} initialHourIndex={50} />);
        expect(getByTestId('hourly-weather-list')).toBeTruthy();
    });
});
