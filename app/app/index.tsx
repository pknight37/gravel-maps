import React, { useCallback } from "react";
import { StyleSheet, View, Alert, Platform } from "react-native";
import * as Location from "expo-location";
import { GravelMap } from "../components/Map/GravelMap";

export default function MapScreen() {
  const handleLocateMe = useCallback(async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Location Permission",
        "Location permission is needed to show your position on the map."
      );
      return;
    }

    // Location.getCurrentPositionAsync triggers the UserLocation
    // marker in MapLibre to center on the user's position.
    // The MapLibre UserLocation component handles the actual display.
    await Location.getCurrentPositionAsync({});
  }, []);

  return (
    <View style={styles.container}>
      <GravelMap onLocateMe={handleLocateMe} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
