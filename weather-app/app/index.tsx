import { useWeatherHook } from '@/hooks/useWeatherHook';
import { currentWeatherIndex } from '@/utils/weatherUtils';
import { Text, View, ActivityIndicator } from 'react-native';

export default function Index() {
    const { currentWeather } = useWeatherHook();
    const currentIndex = currentWeather ? currentWeatherIndex(currentWeather) : null;
    const time = currentIndex !== null ? currentWeather?.time[currentIndex] : undefined;
    const temperature_2m = currentIndex !== null ? currentWeather?.temperature_2m.value?.[currentIndex] : undefined;
    const temperatureUnit = currentIndex !== null ? currentWeather?.temperature_2m.unit : undefined;

    return (
        <View
            style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
            }}
        >
            <Text>Current weather conditions for TES Sheffield Office</Text>
            {currentWeather && currentIndex !== null ? (
                <Text>
                    Temperature: {temperature_2m?.toFixed(1)}
                    {temperatureUnit} @ {time?.toLocaleString()}
                </Text>
            ) : (
                <>
                    <ActivityIndicator size="large" />
                    <Text>Loading...</Text>
                </>
            )}
        </View>
    );
}
