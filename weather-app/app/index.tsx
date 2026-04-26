import DayCarousel from '@/components/DayCarousel';
import HourlyWeatherList from '@/components/HourlyWeatherList';
import { useWeatherHook } from '@/hooks/useWeatherHook';
import { currentWeatherIndex } from '@/utils/weatherUtils';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Index() {
    const { currentWeather, hasError } = useWeatherHook();
    const [selectedDay, setSelectedDay] = useState(0);

    useEffect(() => {
        if (hasError) {
            Alert.alert('Error', 'An error occurred when attempting to fetch weather data, please try again later.');
        }
    }, [hasError]);

    const currentIndex = currentWeather ? (currentWeatherIndex(currentWeather) ?? 0) : 0;
    const initialHourIndex = selectedDay === 0 ? currentIndex % 24 : 0;

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>TES Sheffield Office</Text>
                <Text style={styles.subtitle}>53.38°N, 1.47°W</Text>
            </View>

            {currentWeather ? (
                <>
                    <DayCarousel weatherData={currentWeather} selectedDay={selectedDay} onDaySelect={setSelectedDay} />
                    <HourlyWeatherList
                        weatherData={currentWeather}
                        dayIndex={selectedDay}
                        initialHourIndex={initialHourIndex}
                    />
                </>
            ) : (
                !hasError && (
                    <View style={styles.loading}>
                        <ActivityIndicator size="large" color="#4a90d9" />
                        <Text style={styles.loadingText}>Loading weather…</Text>
                    </View>
                )
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0d2137',
    },
    header: {
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: 4,
    },
    title: {
        color: '#ffffff',
        fontSize: 20,
        fontWeight: '700',
    },
    subtitle: {
        color: '#a8c4e0',
        fontSize: 13,
    },
    loading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
    },
    loadingText: {
        color: '#a8c4e0',
        fontSize: 16,
    },
});
