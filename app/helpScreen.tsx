import CustomText from "@/components/ui/customText";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  SafeAreaView,
  TouchableOpacity,
  StyleSheet,
  View,
  Dimensions,
  Modal,
} from "react-native";

const { height, width } = Dimensions.get("window");

export default function HelpScreen() {
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);

  const openModal = () => setModalVisible(true);
  const closeModal = () => setModalVisible(false);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <View style={styles.scrollContent}>
        <CustomText style={styles.heading}>Help & Info</CustomText>

        <TouchableOpacity style={styles.termsBox}>
          <CustomText style={styles.boxText}>Terms and Conditions</CustomText>
          <Ionicons name="chevron-forward" size={24} color="#000" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.box}>
          <CustomText style={styles.boxText}>Privacy Policy</CustomText>
          <Ionicons name="chevron-forward" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={openModal} style={styles.openModalButton}>
        <CustomText style={styles.openModalButtonText}>Open Modal</CustomText>
      </TouchableOpacity>

      {/* Modal Component */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={closeModal}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <CustomText style={styles.modalText}>
              This is a simple modal
            </CustomText>
            <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
              <CustomText style={styles.closeButtonText}>Close</CustomText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    marginTop: 10,
  },
  scrollContent: {
    alignItems: "center",
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
  box: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    padding: 15,
    borderRadius: 10,
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
