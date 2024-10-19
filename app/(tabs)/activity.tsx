// app/activities.tsx
import React from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "react-native-paper";

export default function ActivitiesScreen() {
  return (
    <View style={styles.container}>
      <Text variant="headlineMedium">Activities Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
