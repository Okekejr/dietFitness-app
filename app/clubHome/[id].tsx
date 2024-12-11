import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  Image,
} from "react-native";
import { BlurView } from "expo-blur";
import MapView, { Marker, Polyline, Region } from "react-native-maps";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import BottomSheetContent from "@/components/BottomSheetContent";
import { getInitials } from "@/utils";
import { useUserData } from "@/context/userDataContext";
import { useClubQueries } from "@/hooks/useClubQueries";
import CustomText from "@/components/ui/customText";
import DateTimePicker from "@react-native-community/datetimepicker";

const ClubHomeScreen = () => {
  const { id } = useLocalSearchParams();
  const { userData } = useUserData();
  const router = useRouter();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["10%", "52%"], []);
  const [latestRegion, setLatestRegion] = useState<Region | null>(null);
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
    locationNames,
    saveRoute,
    handleMapPress,
    handleRegionChangeComplete,
    searching,
    polylineCoords,
    selectedCard,
    setSelectedCard,
    latestRoute,
    reverseGeocode,
    startAddress,
    setStartAddress,
    endAddress,
    setEndAddress,
    latestPolylineCoords,
    latestDistance,
    latestEstimatedTime,
    fetchLatestRoutePolyline,
    runDate,
    runTime,
    showPicker,
    onDateChange,
    onTimeChange,
    togglePicker,
  } = useClubQueries({
    id,
    userData,
  });

  useEffect(() => {
    const fetchAddresses = async () => {
      if (!latestRoute) return;

      const { startPoint, endPoint } = latestRoute;

      if (startPoint && endPoint) {
        // Fetch and set the addresses for start and end points
        const startAddress = await reverseGeocode(startPoint);
        const endAddress = await reverseGeocode(endPoint);

        setStartAddress(startAddress);
        setEndAddress(endAddress);
      }

      // Fetch the polyline for the latest route
      if (startPoint && endPoint) {
        await fetchLatestRoutePolyline(startPoint, endPoint);
      }

      // Calculate the region to pan to the latest route
      if (startPoint && endPoint) {
        const centerLat = (startPoint.latitude + endPoint.latitude) / 2;
        const centerLng = (startPoint.longitude + endPoint.longitude) / 2;

        const latDelta =
          Math.abs(startPoint.latitude - endPoint.latitude) * 1.5;
        const lngDelta =
          Math.abs(startPoint.longitude - endPoint.longitude) * 1.5;

        setLatestRegion({
          latitude: centerLat,
          longitude: centerLng,
          latitudeDelta: latDelta || 0.01,
          longitudeDelta: lngDelta || 0.01,
        });
      }
    };

    fetchAddresses();
  }, [latestRoute]);

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

      {!isLeader?.isLeader && (
        <BlurView tint="dark" style={styles.logoContainer}>
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

      <BlurView
        tint="dark"
        style={
          isLeader?.isLeader ? styles.homeContainer : styles.memberHomeContainer
        }
      >
        <TouchableOpacity
          onPress={() => router.push("/")}
          style={styles.bookmarkButton}
        >
          <Ionicons name="home-outline" size={24} color="#FFF" />
        </TouchableOpacity>
      </BlurView>

      <BlurView
        tint="dark"
        style={
          isLeader?.isLeader ? styles.navContainer : styles.memberNavContainer
        }
      >
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
              <CustomText style={styles.title}>Creating Route:</CustomText>
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

              {/* Single Button for Date & Time Picker with Toggle */}
              {estimatedTime && (
                <TouchableOpacity
                  style={styles.datePickerButton}
                  onPress={togglePicker} // Toggle picker on button press
                >
                  <CustomText style={styles.datePickerText}>
                    {runDate && runTime
                      ? `Run Date: ${runDate.toLocaleDateString()} | Time: ${runTime.toLocaleTimeString()}`
                      : "Select Run Date & Time"}
                  </CustomText>
                </TouchableOpacity>
              )}

              {/* Modal-like layout for both Date and Time Pickers */}
              {showPicker && (
                <View style={styles.pickerContainer}>
                  <DateTimePicker
                    value={runDate || new Date()}
                    mode="date"
                    display="default"
                    onChange={onDateChange}
                    style={styles.picker}
                  />
                  <DateTimePicker
                    value={runTime || new Date()}
                    mode="time"
                    display="default"
                    onChange={onTimeChange}
                    style={styles.picker}
                  />
                </View>
              )}

              {estimatedTime && runDate && runTime && (
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

      {route.pointA === null &&
        latestRoute?.startPoint.latitude &&
        startAddress && (
          <BlurView
            tint="dark"
            style={
              isLeader?.isLeader
                ? styles.routeContainer
                : styles.memberRouteContainer
            }
          >
            <>
              <CustomText style={styles.title}>
                Latest Routes you created:
              </CustomText>
              {startAddress && (
                <CustomText>
                  Start Point: {startAddress || "Loading..."}
                </CustomText>
              )}
              {endAddress && (
                <CustomText>End Point: {endAddress || "Loading..."}</CustomText>
              )}
              {latestRoute.estimatedDistance && (
                <CustomText>Distance: {latestDistance}</CustomText>
              )}
              {latestRoute.estimatedTime && (
                <CustomText>Estimated Time: {latestEstimatedTime}</CustomText>
              )}
              {latestRoute?.formattedDateTime && (
                <CustomText>
                  Run Date: {latestRoute.formattedDateTime}
                </CustomText>
              )}

              {isLeader?.isLeader && (
                <CustomText
                  style={{
                    color: "#4F46E5",
                    fontSize: 14,
                    fontFamily: "HostGrotesk-Medium",
                  }}
                >
                  Click on the map to create new routes
                </CustomText>
              )}
            </>
          </BlurView>
        )}

      {/* Map Background */}
      {isLeader?.isLeader && (
        <View style={styles.mapContainer}>
          <MapView
            style={StyleSheet.absoluteFillObject}
            region={searching ? region : latestRegion || region}
            onRegionChangeComplete={handleRegionChangeComplete}
            onPress={isLeader?.isLeader ? handleMapPress : () => null}
            showsUserLocation={true} // Display user's location on the map
            zoomEnabled={true}
            zoomControlEnabled={true}
            followsUserLocation={follow}
          >
            {route.pointA ? (
              <Marker coordinate={route.pointA} pinColor="green" />
            ) : (
              latestRoute?.startPoint && (
                <Marker coordinate={latestRoute.startPoint} pinColor="green" />
              )
            )}
            {route.pointB ? (
              <Marker coordinate={route.pointB} pinColor="red" />
            ) : (
              latestRoute?.endPoint && (
                <Marker coordinate={latestRoute.endPoint} pinColor="red" />
              )
            )}
            {polylineCoords.length > 0 ? (
              <Polyline
                coordinates={polylineCoords}
                strokeColor="#4F46E5"
                strokeWidth={3}
              />
            ) : (
              latestRoute?.startPoint &&
              latestRoute.endPoint && (
                <Polyline
                  coordinates={latestPolylineCoords}
                  strokeColor="#4F46E5"
                  strokeWidth={3}
                />
              )
            )}
          </MapView>
        </View>
      )}

      {!isLeader?.isLeader && latestRegion && (
        <View style={styles.mapContainer}>
          <MapView
            style={StyleSheet.absoluteFillObject}
            region={follow ? undefined : latestRegion} // Center the map on the calculated region
            onRegionChangeComplete={(newRegion) => setLatestRegion(newRegion)}
            onPress={() => null}
            showsUserLocation={true} // Display user's location on the map
            zoomEnabled={true}
            zoomControlEnabled={true}
            followsUserLocation={follow}
          >
            {latestRoute?.startPoint && (
              <Marker coordinate={latestRoute.startPoint} pinColor="green" />
            )}
            {latestRoute?.endPoint && (
              <Marker coordinate={latestRoute.endPoint} pinColor="red" />
            )}

            {latestRoute?.startPoint && latestRoute.endPoint && (
              <Polyline
                coordinates={latestPolylineCoords}
                strokeColor="#4F46E5"
                strokeWidth={3}
              />
            )}
          </MapView>
        </View>
      )}

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
            <CustomText>...loading</CustomText>
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
    zIndex: 5,
  },
  routeContainer: {
    position: "absolute",
    borderRadius: 25,
    gap: 5,
    padding: 10,
    maxWidth: 300,
    maxHeight: 500,
    top: 200,
    left: 20,
    overflow: "hidden",
    zIndex: 5,
  },
  memberRouteContainer: {
    position: "absolute",
    borderRadius: 25,
    gap: 5,
    padding: 10,
    maxWidth: 300,
    maxHeight: 500,
    top: 100,
    left: 20,
    overflow: "hidden",
    zIndex: 5,
  },
  navContainer: {
    position: "absolute",
    borderRadius: 25,
    overflow: "hidden",
    top: 250,
    right: 20,
    zIndex: 5,
  },
  memberNavContainer: {
    position: "absolute",
    borderRadius: 25,
    overflow: "hidden",
    top: 200,
    right: 20,
    zIndex: 5,
  },
  logoContainer: {
    position: "absolute",
    borderRadius: 25,
    overflow: "hidden",
    top: 100,
    right: 20,
    zIndex: 5,
  },
  memberHomeContainer: {
    position: "absolute",
    borderRadius: 25,
    overflow: "hidden",
    top: 150,
    right: 20,
    zIndex: 5,
  },
  homeContainer: {
    position: "absolute",
    borderRadius: 25,
    overflow: "hidden",
    top: 200,
    right: 20,
    zIndex: 5,
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
    zIndex: 5,
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
  title: {
    fontSize: 18,
    fontFamily: "HostGrotesk-Medium",
    color: "#000",
  },
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
  datePickerButton: {
    backgroundColor: "#4F46E5",
    padding: 10,
    borderRadius: 5,
  },
  timePickerButton: {
    backgroundColor: "#4F46E5",
    padding: 10,
    borderRadius: 5,
  },
  datePickerText: {
    color: "#FFF",
    fontSize: 16,
  },
  pickerContainer: {
    flexDirection: "row", // Side-by-side layout for date and time pickers
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  picker: {
    flex: 1, // Each picker takes up half the available space
    marginHorizontal: 5,
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
