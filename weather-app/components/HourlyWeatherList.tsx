import { HourlyEntry, WeatherData } from '@/types/weatherTypes';
import { getHourlyDataForDay, getWmoDescription } from '@/utils/weatherUtils';
import React, { useMemo } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

type HourlyWeatherListProps = {
    weatherData: WeatherData;
    dayIndex: number;
    initialHourIndex: number;
};

function formatTime(date: Date): string {
    return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

function HourlyRow({ entry }: { entry: HourlyEntry }) {
    return (
        <View style={styles.row} testID={`hourly-row-${entry.time.toISOString()}`}>
            <Text style={styles.time}>{formatTime(entry.time)}</Text>
            <View style={styles.details}>
                <Text style={styles.temp}>{entry.temperature_2m.toFixed(1)}°C</Text>
                <Text style={styles.feelsLike}>Feels {entry.apparent_temperature.toFixed(1)}°C</Text>
                <Text style={styles.description}>{getWmoDescription(entry.weather_code)}</Text>
            </View>
            <View style={styles.extras}>
                <Text style={styles.extraText}>💧 {entry.precipitation_probability.toFixed(0)}%</Text>
                <Text style={styles.extraText}>💨 {entry.wind_speed_10m.toFixed(0)} km/h</Text>
            </View>
        </View>
    );
}

export default function HourlyWeatherList({ weatherData, dayIndex, initialHourIndex }: HourlyWeatherListProps) {
    const hours: HourlyEntry[] = useMemo(() => getHourlyDataForDay(weatherData, dayIndex), [weatherData, dayIndex]);

    // Clamp so FlatList can always render items below the initial index
    const clampedInitialIndex = Math.min(initialHourIndex, Math.max(0, hours.length - 5));

    return (
        <FlatList
            data={hours}
            keyExtractor={(item) => item.time.toISOString()}
            renderItem={({ item }) => <HourlyRow entry={item} />}
            initialScrollIndex={clampedInitialIndex}
            getItemLayout={(_, index) => ({ length: 72, offset: 72 * index, index })}
            contentContainerStyle={styles.listContent}
            testID="hourly-weather-list"
        />
    );
}

const styles = StyleSheet.create({
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 24,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#1e3a5f',
        height: 72,
    },
    time: {
        color: '#a8c4e0',
        fontSize: 14,
        fontWeight: '600',
        width: 52,
    },
    details: {
        flex: 1,
        paddingHorizontal: 8,
    },
    temp: {
        color: '#ffffff',
        fontSize: 15,
        fontWeight: '700',
    },
    feelsLike: {
        color: '#a8c4e0',
        fontSize: 12,
    },
    description: {
        color: '#c8dff0',
        fontSize: 12,
    },
    extras: {
        alignItems: 'flex-end',
        gap: 2,
    },
    extraText: {
        color: '#a8c4e0',
        fontSize: 12,
    },
});
