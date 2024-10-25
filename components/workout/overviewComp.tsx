import { OverviewStatsT } from "@/types";
import {
  ActivityIndicator,
  Text,
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
} from "react-native";
import CircularProgress from "react-native-circular-progress-indicator";
import { PieChart } from "react-native-chart-kit";
import { getTagColor } from "@/utils";

interface OverviewCompT {
  stats: OverviewStatsT;
  isLoading: boolean;
  isError: boolean;
}

const { width } = Dimensions.get("window");

export default function OverviewComp({
  stats,
  isError,
  isLoading,
}: OverviewCompT) {
  if (isLoading) {
    return <ActivityIndicator size="large" color="#4F46E5" />;
  }

  if (isError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load overview data.</Text>
      </View>
    );
  }

  if (stats.totalWorkouts === 0) {
    return (
      <View>
        <Text style={styles.description}>
          You havent completed any workouts yet.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Total Workouts</Text>
        <Text style={styles.cardValue}>{stats.totalWorkouts}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Total Calories Burned</Text>
        <CircularProgress
          value={stats.totalCalories}
          radius={60}
          maxValue={5000}
          activeStrokeColor="#FF6347"
          inActiveStrokeColor="#D3D3D3"
          title={"kcal"}
          titleColor="#000"
          titleStyle={{ fontWeight: "bold" }}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Total Workout Minutes</Text>
        <CircularProgress
          value={stats.totalMinutes}
          radius={60}
          maxValue={1000}
          activeStrokeColor="#4CAF50"
          inActiveStrokeColor="#D3D3D3"
          title={"mins"}
          titleColor="#000"
          titleStyle={{ fontWeight: "bold" }}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Most Active Day</Text>
        <Text style={styles.cardValue}>{stats.bestDay}</Text>
      </View>

      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Workouts Breakdown</Text>
        <PieChart
          data={stats.workoutBreakdown.map((item) => ({
            name: item.name,
            population: Number(item.population),
            color: getTagColor(item.name),
            legendFontColor: "#4F46E5",
          }))}
          width={width - 40}
          height={220}
          chartConfig={{
            backgroundColor: "#FFF",
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          }}
          accessor={"population"}
          backgroundColor={"transparent"}
          paddingLeft={"15"}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 5,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  cardValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4F46E5",
  },
  chartContainer: {
    marginTop: 20,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "red",
    fontSize: 18,
  },
  description: {
    fontSize: 14,
    color: "#555",
    textAlign: "center",
  },
});
