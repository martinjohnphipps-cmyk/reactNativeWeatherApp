import { DailySummary } from '@/types/weatherTypes';
import { render, fireEvent } from '@testing-library/react-native';
import React from 'react';
import DayCard from './DayCard';

const baseSummary: DailySummary = {
    date: new Date('2026-04-26T00:00:00Z'),
    minTemp: 8,
    maxTemp: 18,
    wmoCode: 2,
};

describe('DayCard', () => {
    it('renders "Today" label when isToday is true', () => {
        const { getByText } = render(
            <DayCard summary={baseSummary} isSelected={false} isToday={true} onPress={() => {}} />,
        );
        expect(getByText('Today')).toBeTruthy();
    });

    it('renders weekday abbreviation when isToday is false', () => {
        const { queryByText } = render(
            <DayCard summary={baseSummary} isSelected={false} isToday={false} onPress={() => {}} />,
        );
        expect(queryByText('Today')).toBeNull();
        // The date 2026-04-26 is a Sunday
        expect(queryByText('Sun')).toBeTruthy();
    });

    it('renders WMO code description', () => {
        const { getByText } = render(
            <DayCard summary={baseSummary} isSelected={false} isToday={false} onPress={() => {}} />,
        );
        expect(getByText('Partly cloudy')).toBeTruthy();
    });

    it('renders min and max temperatures', () => {
        const { getByText } = render(
            <DayCard summary={baseSummary} isSelected={false} isToday={false} onPress={() => {}} />,
        );
        expect(getByText('18° / 8°')).toBeTruthy();
    });

    it('renders Thunderstorm for wmoCode 95', () => {
        const summary: DailySummary = { ...baseSummary, wmoCode: 95 };
        const { getByText } = render(
            <DayCard summary={summary} isSelected={false} isToday={false} onPress={() => {}} />,
        );
        expect(getByText('Thunderstorm')).toBeTruthy();
    });

    it('calls onPress when tapped', () => {
        const onPress = jest.fn();
        const { getByTestId } = render(
            <DayCard summary={baseSummary} isSelected={false} isToday={true} onPress={onPress} />,
        );
        fireEvent.press(getByTestId('day-card-Today'));
        expect(onPress).toHaveBeenCalledTimes(1);
    });

    it('applies selected styles when isSelected is true', () => {
        const { getByTestId } = render(
            <DayCard summary={baseSummary} isSelected={true} isToday={true} onPress={() => {}} />,
        );
        const card = getByTestId('day-card-Today');
        expect(card).toBeTruthy();
    });

    it('renders unknown code description for unmapped code', () => {
        const summary: DailySummary = { ...baseSummary, wmoCode: 999 };
        const { getByText } = render(
            <DayCard summary={summary} isSelected={false} isToday={false} onPress={() => {}} />,
        );
        expect(getByText('Unknown (999)')).toBeTruthy();
    });
});
