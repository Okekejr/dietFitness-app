import React, { useMemo, useRef } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  Image,
} from "react-native";
import { BlurView } from "expo-blur";
import MapView, { Marker, Polyline } from "react-native-maps";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import BottomSheetContent from "@/components/BottomSheetContent";
import { getInitials } from "@/utils";
import { useUserData } from "@/context/userDataContext";
import { useClubQueries } from "@/hooks/useClubQueries";
import CustomText from "@/components/ui/customText";

const ClubHomeScreen = () => {
  const { id } = useLocalSearchParams();
  const { userData } = useUserData();
  const router = useRouter();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["10%", "52%"], []);
  const {
    loadingLocation,
    clubLoading,
    isLeader,
    searchQuery,
    setSearchQuery,
    handleSearchLocation,
    club,
    follow,
    toggleFollow,
    route,
    resetHandler,
    savedRoute,
    distance,
    region,
    estimatedTime,
    setRegion,
    locationNames,
    saveRoute,
    handleMapPress,
    polylineCoords,
    selectedCard,
    setSelectedCard,
    latestRoute,
  } = useClubQueries({
    id,
    userData,
  });

  if (loadingLocation || clubLoading) {
    return <ActivityIndicator size="large" color="#4F46E5" />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* Search Bar only available to leader */}
      {isLeader?.isLeader && (
        <BlurView tint="dark" intensity={80} style={styles.searchContainer}>
          <TextInput
            placeholder="Search location"
            placeholderTextColor="#000"
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
            onSubmitEditing={handleSearchLocation}
          />
          <View style={styles.profileContainer}>
            {club?.logo ? (
              <Image
                source={{ uri: club.logo, cache: "force-cache" }}
                style={styles.profileImage}
              />
            ) : (
              <View style={styles.profileFallback}>
                <CustomText style={styles.initials}>
                  {club?.name ? getInitials(club.name) : "?"}
                </CustomText>
              </View>
            )}
          </View>
        </BlurView>
      )}

      <BlurView tint="dark" style={styles.homeContainer}>
        <TouchableOpacity
          onPress={() => router.push("/")}
          style={styles.bookmarkButton}
        >
          <Ionicons name="home-outline" size={24} color="#FFF" />
        </TouchableOpacity>
      </BlurView>

      <BlurView tint="dark" style={styles.navContainer}>
        <TouchableOpacity onPress={toggleFollow} style={styles.bookmarkButton}>
          <Ionicons
            name={follow ? "navigate-circle" : "navigate-circle-outline"}
            size={28}
            color="#FFF"
          />
        </TouchableOpacity>
      </BlurView>

      {route.pointA && isLeader?.isLeader && (
        <BlurView tint="dark" style={styles.clearContainer}>
          <TouchableOpacity
            onPress={resetHandler}
            style={styles.bookmarkButton}
          >
            <Ionicons name="reload-outline" size={24} color="#FFF" />
          </TouchableOpacity>
        </BlurView>
      )}

      {route.pointA && isLeader?.isLeader && (
        <BlurView tint="dark" style={styles.routeContainer}>
          {!savedRoute && (
            <>
              {route.pointA && locationNames.pointA && (
                <CustomText>Start Point: {locationNames.pointA}</CustomText>
              )}
              {route.pointB && locationNames.pointB && (
                <CustomText>End Point: {locationNames.pointB}</CustomText>
              )}
              {distance && <CustomText>Distance: {distance}</CustomText>}
              {estimatedTime && (
                <CustomText>Estimated Time: {estimatedTime}</CustomText>
              )}

              {estimatedTime && (
                <TouchableOpacity style={styles.saveButton} onPress={saveRoute}>
                  <CustomText style={styles.saveButtonText}>
                    Save Route
                  </CustomText>
                </TouchableOpacity>
              )}
            </>
          )}
        </BlurView>
      )}

      {/* Map Background */}
      <View style={styles.mapContainer}>
        <MapView
          style={StyleSheet.absoluteFillObject}
          region={region}
          onRegionChangeComplete={(newRegion) => setRegion(newRegion)}
          onPress={isLeader?.isLeader ? handleMapPress : () => null}
          showsUserLocation={true} // Display user's location on the map
          zoomEnabled={true}
          zoomControlEnabled={true}
          followsUserLocation={follow}
        >
          {route.pointA && (
            <Marker coordinate={route.pointA} pinColor="green" />
          )}
          {route.pointB && <Marker coordinate={route.pointB} pinColor="red" />}
          {polylineCoords.length > 0 && (
            <Polyline
              coordinates={polylineCoords}
              strokeColor="#4F46E5"
              strokeWidth={3}
            />
          )}
        </MapView>
      </View>

      {/* Bottom Sheet */}
      <BottomSheet
        ref={bottomSheetRef}
        index={0}
        snapPoints={snapPoints}
        backgroundStyle={styles.bottomSheetBackground}
        handleIndicatorStyle={styles.handleIndicator}
      >
        <BottomSheetView style={styles.contentContainer}>
          <View style={styles.header}>
            <CustomText style={styles.sectionTitle}>
              Explore Your Club
            </CustomText>
            <CustomText style={styles.sectionSubtitle}>
              Get insights, activities, and updates about "{club && club.name}
              ".
            </CustomText>
          </View>

          {club && isLeader ? (
            <BottomSheetContent
              selectedCard={selectedCard}
              setSelectedCard={setSelectedCard}
              club={club}
              isLeader={isLeader?.isLeader}
            />
          ) : (
            "...loading"
          )}
        </BottomSheetView>
      </BottomSheet>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
    backgroundColor: "#fff",
  },
  mapContainer: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  profileContainer: {
    width: 40,
    height: 40,
    borderRadius: 25,
    overflow: "hidden",
  },
  profileImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  initials: {
    color: "#fff",
    fontSize: 22,
    fontFamily: "HostGrotesk-Medium",
  },
  profileFallback: {
    width: "100%",
    height: "100%",
    backgroundColor: "#c4c4c4",
    justifyContent: "center",
    alignItems: "center",
  },
  clearContainer: {
    position: "absolute",
    borderRadius: 25,
    overflow: "hidden",
    top: 300,
    right: 20,
    zIndex: 10,
  },
  routeContainer: {
    position: "absolute",
    borderRadius: 25,
    gap: 5,
    padding: 10,
    maxWidth: 300,
    maxHeight: 300,
    top: 200,
    left: 20,
    overflow: "hidden",
    zIndex: 10,
  },
  navContainer: {
    position: "absolute",
    borderRadius: 25,
    overflow: "hidden",
    top: 250,
    right: 20,
    zIndex: 10,
  },
  homeContainer: {
    position: "absolute",
    borderRadius: 25,
    overflow: "hidden",
    top: 200,
    right: 20,
    zIndex: 10,
  },
  searchContainer: {
    position: "absolute",
    top: 80,
    left: 20,
    right: 20,
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 25,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 10,
    zIndex: 10,
  },
  searchInput: {
    flex: 1,
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 25,
    marginRight: 10,
    elevation: 3,
  },
  bookmarkButton: {
    width: 40,
    height: 40,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  bottomSheetBackground: {
    backgroundColor: "#f0f0f0",
    borderRadius: 20,
  },
  handleIndicator: {
    width: 50,
    height: 5,
    backgroundColor: "#ccc",
    borderRadius: 10,
    alignSelf: "center",
    marginVertical: 10,
  },
  homeButton: {
    backgroundColor: "#FFF",
    padding: 10,
    width: 40,
    height: 40,
    borderRadius: 25,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  marker: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(0, 122, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  markerInner: {
    width: 15,
    height: 15,
    borderRadius: 7.5,
    backgroundColor: "#007AFF",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 18,
    color: "red",
  },
  header: { marginBottom: 10 },
  sectionTitle: {
    fontSize: 22,
    fontFamily: "HostGrotesk-Medium",
    marginBottom: 5,
  },
  sectionSubtitle: { fontSize: 16, color: "#777" },
  routeInfo: {
    marginTop: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
  },
  saveButton: {
    marginTop: 10,
    backgroundColor: "#4F46E5",
    padding: 15,
    borderRadius: 10,
    width: "100%",
  },
  saveButtonText: {
    color: "#FFF",
    textAlign: "center",
    fontFamily: "HostGrotesk-Medium",
  },
});

export default ClubHomeScreen;
