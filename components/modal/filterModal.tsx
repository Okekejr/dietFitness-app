import { Filters } from "@/types/filter";
import React, { FC, useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Dimensions,
} from "react-native";

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
    setLocalFilters({ duration: [], activityLevel: [], intensity: [] });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Modal visible={visible} animationType="slide" transparent>
        <View style={styles.overlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Filter Workouts</Text>

            <ScrollView contentContainerStyle={styles.scrollContent}>
              {Object.entries(filterOptions).map(([type, options]) => (
                <View key={type} style={styles.filterGroup}>
                  <Text style={styles.filterLabel}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
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
                        onPress={() =>
                          handleFilterChange(type as keyof Filters, option)
                        }
                      >
                        <Text
                          style={[
                            styles.filterButtonText,
                            localFilters[type as keyof Filters].includes(
                              option
                            ) && styles.selectedFilterButtonText,
                          ]}
                        >
                          {option}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              ))}
            </ScrollView>

            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.resetButton}
                onPress={handleResetFilters}
              >
                <Text style={styles.resetButtonText}>Reset Filters</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.applyButton}
                onPress={() => onApplyFilters(localFilters)}
              >
                <Text style={styles.applyButtonText}>Apply Filters</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Text style={styles.closeButtonText}>Close</Text>
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
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  filterGroup: {
    marginBottom: 15,
  },
  filterLabel: {
    fontWeight: "bold",
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
    fontWeight: "bold",
  },
  applyButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  applyButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  closeButton: {
    backgroundColor: "#9e9e9e",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  closeButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default FilterModal;
