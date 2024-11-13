import CustomText from "@/components/ui/customText";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SafeAreaView, TouchableOpacity, StyleSheet, View } from "react-native";

export default function HelpScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={28} color="#000" />
        </TouchableOpacity>
      </View>

      <View style={styles.scrollContent}>
        <TouchableOpacity style={styles.termsBox}>
          <CustomText style={styles.boxText}>Terms and Conditions</CustomText>
          <Ionicons name="chevron-forward" size={24} color="#000" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.box}>
          <CustomText style={styles.boxText}>Privacy Policy</CustomText>
          <Ionicons name="chevron-forward" size={24} color="#000" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  topBar: {
    alignItems: "flex-start",
    marginLeft: 20,
  },
  backButton: {
    backgroundColor: "#c7c7c7",
    borderRadius: 25,
    padding: 5,
  },
  scrollContent: {
    alignItems: "center",
    padding: 20,
  },
  termsBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
  },
  box: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
  },
  boxText: { flex: 1, marginLeft: 10, fontSize: 16 },
});
