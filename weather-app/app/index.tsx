import { useWeatherHook } from "@/hooks/useWeatherHook";
import { getLatestTemperature } from "@/utils/weatherUtils";
import { Text, View } from "react-native";

export default function Index() {
  const { currentWeather } = useWeatherHook();
  const { time, temperature_2m } = currentWeather ? getLatestTemperature(currentWeather) || {} : {};

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Current weather conditions for TES Sheffield Office</Text>
      <Text>Temperature: {temperature_2m?.toFixed(1)} @ {time?.toLocaleString()}</Text>
    </View>
  );
}
