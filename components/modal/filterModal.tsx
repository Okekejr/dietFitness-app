import { Filters } from "@/types/filter";
import React, { FC, useState, useEffect } from "react";
import {
  View,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Dimensions,
} from "react-native";
import CustomText from "../ui/customText";
import * as Haptics from "expo-haptics";

interface FilterModalProps {
  visible: boolean;
  onApplyFilters: (filters: Filters) => void;
  onClose: () => void;
  activeFilters: Filters;
}

const filterOptions: Record<keyof Filters, string[]> = {
  duration: ["15-20 mins", "25-30 mins", ">30 mins"],
  activityLevel: ["Beginner", "Intermediate", "Advanced"],
  intensity: ["Low", "Medium", "High"],
};

const FilterModal: FC<FilterModalProps> = ({
  visible,
  onApplyFilters,
  onClose,
  activeFilters,
}) => {
  const [localFilters, setLocalFilters] = useState<Filters>(activeFilters);

  useEffect(() => {
    setLocalFilters(activeFilters);
  }, [activeFilters]);

  const handleFilterChange = (type: keyof Filters, value: string) => {
    setLocalFilters((prev) => ({
      ...prev,
      [type]: prev[type].includes(value)
        ? prev[type].filter((v) => v !== value)
        : [...prev[type], value],
    }));
  };

  const handleResetFilters = () => {
    const resetFilters = { duration: [], activityLevel: [], intensity: [] };
    setLocalFilters(resetFilters);
    onApplyFilters(resetFilters);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Modal visible={visible} animationType="slide" transparent>
        <View style={styles.overlay}>
          <View style={styles.modalContent}>
            <CustomText style={styles.modalTitle}>Filter Workouts</CustomText>

            <ScrollView contentContainerStyle={styles.scrollContent}>
              {Object.entries(filterOptions).map(([type, options]) => (
                <View key={type} style={styles.filterGroup}>
                  <CustomText style={styles.filterLabel}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </CustomText>
                  <View style={styles.optionContainer}>
                    {options.map((option) => (
                      <TouchableOpacity
                        key={option}
                        style={[
                          styles.filterButton,
                          localFilters[type as keyof Filters].includes(
                            option
                          ) && styles.selectedFilterButton,
                        ]}
                        onPress={() => {
                          Haptics.selectionAsync();
                          handleFilterChange(type as keyof Filters, option);
                        }}
                      >
                        <CustomText
                          style={[
                            styles.filterButtonText,
                            localFilters[type as keyof Filters].includes(
                              option
                            ) && styles.selectedFilterButtonText,
                          ]}
                        >
                          {option}
                        </CustomText>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              ))}
            </ScrollView>

            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.resetButton}
                onPress={() => {
                  Haptics.selectionAsync();
                  handleResetFilters();
                }}
              >
                <CustomText style={styles.resetButtonText}>
                  Reset Filters
                </CustomText>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.applyButton}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  onApplyFilters(localFilters);
                }}
              >
                <CustomText style={styles.applyButtonText}>
                  Apply Filters
                </CustomText>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => {
                  Haptics.selectionAsync();
                  onClose();
                }}
              >
                <CustomText style={styles.closeButtonText}>Close</CustomText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const { height } = Dimensions.get("window");

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Dim the background
  },
  modalContent: {
    width: "90%",
    maxHeight: height * 0.7,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontFamily: "HostGrotesk-Medium",
    marginBottom: 20,
    textAlign: "center",
  },
  filterGroup: {
    marginBottom: 15,
  },
  filterLabel: {
    fontFamily: "HostGrotesk-Medium",
    fontSize: 16,
    marginBottom: 10,
  },
  optionContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  filterButton: {
    backgroundColor: "#e0e0e0",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  selectedFilterButton: {
    backgroundColor: "#4CAF50",
  },
  filterButtonText: {
    fontSize: 14,
    color: "#000",
  },
  selectedFilterButtonText: {
    color: "#fff",
  },
  actionButtons: {
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  resetButton: {
    backgroundColor: "#ff5252",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  resetButtonText: {
    color: "#fff",
    fontFamily: "HostGrotesk-Medium",
  },
  applyButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  applyButtonText: {
    color: "#fff",
    fontFamily: "HostGrotesk-Medium",
  },
  closeButton: {
    backgroundColor: "#9e9e9e",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  closeButtonText: {
    color: "#fff",
    fontFamily: "HostGrotesk-Medium",
  },
});

export default FilterModal;
