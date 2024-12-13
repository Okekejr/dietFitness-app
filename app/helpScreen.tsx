import CustomText from "@/components/ui/customText";
import { useThemeColor } from "@/hooks/useThemeColor";
import { HelpScreenSettings } from "@/utils";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  SafeAreaView,
  TouchableOpacity,
  StyleSheet,
  View,
  Dimensions,
  Linking,
  FlatList,
} from "react-native";

const { height, width } = Dimensions.get("window");

export default function HelpScreen() {
  const router = useRouter();
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: backgroundColor }]}
    >
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <View style={styles.scrollContent}>
        <CustomText style={[styles.heading, { color: textColor }]}>
          Help & Info
        </CustomText>

        <View style={styles.categoryContainer}>
          <FlatList
            data={HelpScreenSettings}
            scrollEnabled={false}
            keyExtractor={(item) => item.key}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.categoryBox}
                onPress={() => {
                  item.hrefLink &&
                    Linking.openURL("https://example.com/learn-more");
                }}
              >
                <Ionicons name={item.leftIcon} size={24} color="#000" />
                <CustomText style={styles.boxText}>{item.name}</CustomText>
                <Ionicons name={item.rightIcon} size={24} color="#000" />
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    alignItems: "flex-start",
    marginLeft: 20,
  },
  backButton: {
    backgroundColor: "#c7c7c7",
    borderRadius: 25,
    padding: 5,
    marginTop: 10,
  },
  scrollContent: {
    padding: 20,
  },
  heading: {
    fontSize: 22,
    fontFamily: "HostGrotesk-Medium",
    textAlign: "center",
    marginBottom: 30,
  },
  termsBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
  },
  categoryBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    padding: 15,
    borderRadius: 10,
    marginVertical: 3,
  },
  categoryContainer: {
    marginVertical: 10,
  },
  boxText: { flex: 1, marginLeft: 10, fontSize: 16 },
  openModalButton: {
    backgroundColor: "#007bff",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  openModalButtonText: {
    color: "white",
    fontSize: 16,
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: "flex-end", // Align the modal to the bottom of the screen
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: width, // Take up the full width
    height: height * 0.8, // Take up 80% of the height from the bottom
    padding: 20,
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    alignItems: "center",
  },
  modalText: {
    fontSize: 18,
    marginBottom: 20,
  },
  closeButton: {
    backgroundColor: "#007bff",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  closeButtonText: {
    color: "white",
    fontSize: 16,
  },
});
