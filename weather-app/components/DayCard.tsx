import { getWmoDescription } from '@/utils/weatherUtils';
import { DailySummary } from '@/types/weatherTypes';
import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

type DayCardProps = {
    summary: DailySummary;
    isSelected: boolean;
    isToday: boolean;
    onPress: () => void;
};

function getDayLabel(date: Date, isToday: boolean): string {
    if (isToday) return 'Today';
    return date.toLocaleDateString('en-GB', { weekday: 'short' });
}

export default function DayCard({ summary, isSelected, isToday, onPress }: DayCardProps) {
    const dayLabel = getDayLabel(summary.date, isToday);
    const description = getWmoDescription(summary.wmoCode);

    return (
        <Pressable
            onPress={onPress}
            style={[styles.card, isSelected && styles.cardSelected]}
            testID={`day-card-${dayLabel}`}
        >
            <Text style={[styles.dayLabel, isSelected && styles.textSelected]}>{dayLabel}</Text>
            <Text style={[styles.description, isSelected && styles.textSelected]} numberOfLines={2}>
                {description}
            </Text>
            <Text style={[styles.temps, isSelected && styles.textSelected]}>
                {summary.maxTemp.toFixed(0)}° / {summary.minTemp.toFixed(0)}°
            </Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    card: {
        width: 100,
        marginHorizontal: 6,
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderRadius: 12,
        backgroundColor: '#1e3a5f',
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardSelected: {
        backgroundColor: '#4a90d9',
    },
    dayLabel: {
        color: '#a8c4e0',
        fontSize: 13,
        fontWeight: '600',
        marginBottom: 4,
    },
    description: {
        color: '#a8c4e0',
        fontSize: 11,
        textAlign: 'center',
        marginBottom: 6,
    },
    temps: {
        color: '#ffffff',
        fontSize: 13,
        fontWeight: '700',
    },
    textSelected: {
        color: '#ffffff',
    },
});
