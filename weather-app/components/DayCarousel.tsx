import DayCard from '@/components/DayCard';
import { DailySummary, WeatherData } from '@/types/weatherTypes';
import { getDailySummary } from '@/utils/weatherUtils';
import React, { useMemo } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

const CARD_WIDTH = 100;
const CARD_MARGIN = 6;
const SNAP_INTERVAL = CARD_WIDTH + CARD_MARGIN * 2;

type DayCarouselProps = {
    weatherData: WeatherData;
    selectedDay: number;
    onDaySelect: (index: number) => void;
};

export default function DayCarousel({ weatherData, selectedDay, onDaySelect }: DayCarouselProps) {
    const summaries: DailySummary[] = useMemo(
        () => Array.from({ length: 7 }, (_, i) => getDailySummary(weatherData, i)),
        [weatherData],
    );

    return (
        <View style={styles.container} testID="day-carousel">
            <FlatList
                data={summaries}
                keyExtractor={(_, index) => String(index)}
                horizontal
                showsHorizontalScrollIndicator={false}
                snapToInterval={SNAP_INTERVAL}
                decelerationRate="fast"
                contentContainerStyle={styles.listContent}
                renderItem={({ item, index }) => (
                    <DayCard
                        summary={item}
                        isSelected={index === selectedDay}
                        isToday={index === 0}
                        onPress={() => onDaySelect(index)}
                    />
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingVertical: 12,
        backgroundColor: '#0d2137',
    },
    listContent: {
        paddingHorizontal: 10,
    },
});
