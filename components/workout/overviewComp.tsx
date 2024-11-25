import { OverviewStatsT } from "@/types";
import {
  ActivityIndicator,
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
} from "react-native";
import CircularProgress from "react-native-circular-progress-indicator";
import { PieChart } from "react-native-chart-kit";
import { getTagColor } from "@/utils";
import CustomText from "../ui/customText";
import { useThemeColor } from "@/hooks/useThemeColor";

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
  const textColor = useThemeColor({}, "text");
  const backgroundColor = useThemeColor({}, "background");

  if (isLoading) {
    return <ActivityIndicator size="large" color="#4F46E5" />;
  }

  if (isError) {
    return (
      <View
        style={[styles.errorContainer, { backgroundColor: backgroundColor }]}
      >
        <CustomText style={[styles.errorText, { color: textColor }]}>
          Failed to load overview data.
        </CustomText>
      </View>
    );
  }

  if (stats.totalWorkouts === 0) {
    return (
      <View style={[styles.center, { backgroundColor: backgroundColor }]}>
        <CustomText style={[styles.description, { color: textColor }]}>
          You haven't completed any workouts yet.
        </CustomText>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        { backgroundColor: backgroundColor },
      ]}
    >
      <View style={styles.card}>
        <CustomText style={styles.cardTitle}>Total Workouts</CustomText>
        <CustomText style={styles.cardValue}>{stats.totalWorkouts}</CustomText>
      </View>

      <View style={styles.card}>
        <CustomText style={styles.cardTitle}>Total Calories Burned</CustomText>
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
        <CustomText style={styles.cardTitle}>Total Workout Minutes</CustomText>
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
        <CustomText style={styles.cardTitle}>Most Active Day</CustomText>
        <CustomText style={styles.cardValue}>{stats.bestDay}</CustomText>
      </View>

      <View style={styles.chartContainer}>
        <CustomText style={[styles.chartTitle, { color: textColor }]}>
          Workouts Breakdown
        </CustomText>
        <PieChart
          data={stats.workoutBreakdown.map((item) => ({
            name: item.name,
            population: Number(item.population),
            color: getTagColor(item.name),
            legendFontColor: textColor,
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
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: "HostGrotesk-Medium",
    marginBottom: 10,
  },
  cardValue: {
    fontSize: 24,
    fontFamily: "HostGrotesk-Medium",
    color: "#4F46E5",
  },
  chartContainer: {
    marginTop: 20,
  },
  chartTitle: {
    fontSize: 18,
    fontFamily: "HostGrotesk-Medium",
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
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  description: {
    fontSize: 14,
    color: "#555",
    textAlign: "center",
  },
});
