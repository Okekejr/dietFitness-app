import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View, StyleSheet } from "react-native";

interface RouteUpdatesCardT {
  onBack: () => void;
}

const RouteUpdatesCard = ({ onBack }: RouteUpdatesCardT) => {
  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#4F46E5" />
        </TouchableOpacity>
        <Text style={styles.title}>Latest Routes</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  backButton: {
    backgroundColor: "#fff",
    borderRadius: 25,
    padding: 5,
    elevation: 5, // Android shadow
    shadowColor: "#000", // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  topBar: {
    display: "flex",
    justifyContent: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
  },
  title: { fontSize: 18, fontWeight: "bold", marginLeft: 90 },
});

export default RouteUpdatesCard;
