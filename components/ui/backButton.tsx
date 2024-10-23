import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

const BackButton = () => {
  const router = useRouter();

  return (
    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
      <Ionicons name="chevron-back-outline" size={28} color="black" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  backButton: {
    position: "absolute",
    top: 60,
    left: 20,
    backgroundColor: "#fff",
    borderRadius: 25,
    padding: 5,
    elevation: 5, // Android shadow
    shadowColor: "#000", // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});

export default BackButton;
