// app/activities.tsx
import Header from "@/components/header/header";
import React from "react";
import { View, StyleSheet, SafeAreaView, ScrollView } from "react-native";
import { Text } from "react-native-paper";

export default function ActivitiesScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Header headerTitle="Activity" />
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <Text
          variant="headlineMedium"
          style={{
            textAlign: "center",
          }}
        >
          Activities Screen
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollViewContent: {
    paddingHorizontal: 25,
    paddingBottom: 20,
  },
});
