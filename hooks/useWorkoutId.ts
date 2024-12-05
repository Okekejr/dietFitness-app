import { API_URL } from "@/constants/apiUrl";
import { UserDataT, WorkoutsT } from "@/types";
import { useQueryClient } from "@tanstack/react-query";
import { AVPlaybackStatus, Video } from "expo-av";
import { useRef, useState } from "react";
import { Alert, Platform } from "react-native";
import * as Calendar from "expo-calendar";

interface useWorkoutIdT {
  id: string | string[];
  userData: UserDataT | null;
}

export const useWorkoutId = ({ id, userData }: useWorkoutIdT) => {
  const queryClient = useQueryClient();
  const [workout, setWorkout] = useState<WorkoutsT | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [userId, setUserId] = useState<string>("");
  const [videoVisible, setVideoVisible] = useState(false);
  const videoRef = useRef<Video | null>(null);
  const [is60SecondsCalled, setIs60SecondsCalled] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [isSchedule, setIsSchedule] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isPermissionGranted, setIsPermissionGranted] =
    useState<boolean>(false);
  const [calendarID, setCalendarID] = useState<string | null>(null);

  // Check if the calendar exists and create if not
  const createOrGetCalendar = async () => {
    const calendars = await Calendar.getCalendarsAsync(
      Calendar.EntityTypes.EVENT
    );

    // Check if the calendar already exists
    const existingCalendar = calendars.find(
      (calendar) => calendar.title === "Diet & Fitness Calendar"
    );

    if (existingCalendar) {
      setCalendarID(existingCalendar.id);
      console.log("Using existing calendar:", existingCalendar.id);
      return existingCalendar.id;
    } else {
      // If calendar doesn't exist, create it
      const defaultCalendarSource: Calendar.Source =
        Platform.OS === "ios"
          ? await getDefaultCalendarSource()
          : {
              isLocalAccount: true,
              type: "local",
              name: "Diet & Fitness Calendar",
            };

      const newCalendarID = await Calendar.createCalendarAsync({
        title: "Diet & Fitness Calendar",
        color: "blue",
        entityType: Calendar.EntityTypes.EVENT,
        sourceId: defaultCalendarSource.id,
        source: defaultCalendarSource,
        name: "internalCalendarName",
        ownerAccount: "personal",
        accessLevel: Calendar.CalendarAccessLevel.OWNER,
      });

      setCalendarID(newCalendarID);
      console.log("Created new calendar with ID:", newCalendarID);
      return newCalendarID;
    }
  };

  async function getDefaultCalendarSource() {
    const defaultCalendar = await Calendar.getDefaultCalendarAsync();
    return defaultCalendar.source;
  }

  // Function to add event to the calendar
  const addEventToCalendar = async (date: Date) => {
    if (!isPermissionGranted) {
      return;
    }

    if (!calendarID) {
      const createdCalendarID = await createOrGetCalendar();
      setCalendarID(createdCalendarID);
    }

    if (calendarID && workout) {
      // Ensure calendarID is not null before proceeding
      try {
        const eventData = {
          title: `Time to Crush Your ${workout.name} workout!`,
          startDate: date,
          endDate: new Date(date.getTime() + 60 * 60 * 1000), // Example: event duration of 1 hour
          alarms: [{ relativeOffset: -15 }], // Remind 15 minutes before the event
        };

        const newEventID = await Calendar.createEventAsync(
          calendarID,
          eventData
        );
        console.log(`Event created with ID: ${newEventID}`);
        Alert.alert(
          "Reminder Set",
          `Your ${workout.name} workout reminder is set!`
        );
        setIsSchedule(false);
      } catch (error) {
        console.error("Error adding event to calendar:", error);
        Alert.alert("Error", "There was an error setting your reminder.");
      }
    } else {
      console.error("Calendar ID is null or undefined.");
    }
  };

  // Date picker change handler
  const onDateChange = (event: any, date?: Date) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  const handleEnterFullscreen = async () => {
    try {
      setVideoVisible(true);

      // Wait for the video to be fully loaded and start fullscreen
      if (videoRef.current) {
        await videoRef.current.presentFullscreenPlayer();
      }
    } catch (error) {
      Alert.alert("Fullscreen Error");
    }
  };

  // Handle video playback status updates
  const handlePlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if ("positionMillis" in status && status.positionMillis !== undefined) {
      const position = status.positionMillis;

      if ("durationMillis" in status && status.durationMillis !== undefined) {
        const duration = status.durationMillis;

        // Check if we're within 60 seconds of the video ending
        if (position >= duration - 60000 && !is60SecondsCalled) {
          console.log("60 seconds remaining");
          // Set the flag to prevent repeated calls
          setIs60SecondsCalled(true);
          handleCompleteWorkout();
        }
      }
    }
  };

  const handleCompleteWorkout = async () => {
    if (workout && userId) {
      console.log(workout.id, userId);

      try {
        const request = await fetch(`${API_URL}/api/completedWorkouts`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, workoutId: workout?.id }),
        });

        if (request.ok) {
          setIsCompleted(true);
          setModalVisible(true);
          queryClient.invalidateQueries({
            queryKey: ["completedWorkouts"],
          });
          queryClient.invalidateQueries({ queryKey: ["userOverview", userId] });
          queryClient.invalidateQueries({ queryKey: ["getCompleted"] });
          queryClient.invalidateQueries({ queryKey: ["allWorkouts"] });
          queryClient.invalidateQueries({ queryKey: ["favoritedWorkouts"] });
        }
      } catch (error) {
        console.error("Error marking workout as completed", error);
      }
    }
  };

  const closeModal = () => setModalVisible(false);

  const fetchWorkoutDetails = async () => {
    if (!userData || !id) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/workouts/${id}`);
      const data = await response.json();
      setWorkout(data);

      // Check if workout is completed
      const completedResponse = await fetch(
        `${API_URL}/api/completedWorkouts?userId=${userData.user_id}`
      );

      if (completedResponse.ok) {
        const completedData = await completedResponse.json();

        // Check if the workout ID is in the completed workouts
        const isWorkoutCompleted = completedData.some(
          (workout: WorkoutsT) => workout.id === data.id
        );
        setIsCompleted(isWorkoutCompleted);
      }

      setLoading(false);
    } catch (error) {
      console.error("Error fetching workout details:", error);
      setLoading(false);
    }
  };

  const fetchFavoritesStatus = async () => {
    if (userId && workout) {
      try {
        const response = await fetch(
          `${API_URL}/api/favorites?userId=${userId}`
        );

        if (response.ok) {
          const favoritedWorkouts = await response.json();

          // Check if the workout ID is in the favorited workouts
          const isworkoutFavorited = favoritedWorkouts.some(
            (work: WorkoutsT) => work.id === workout.id
          );
          setIsFavorite(isworkoutFavorited);
        }
      } catch (error) {
        console.error("Failed to fetch completed status:", error);
      }
    }
  };

  const handleFavorite = async () => {
    if (!workout) {
      return;
    }

    console.log(userId, workout.id, isFavorite);
    try {
      const response = await fetch(`${API_URL}/api/favorites`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          workoutId: workout.id,
          isFavorite,
        }),
      });

      if (response.ok) {
        setIsFavorite(!isFavorite);
        // Invalidate relevant queries to refetch and update UI
        queryClient.invalidateQueries({ queryKey: ["favoritedWorkouts"] });
        queryClient.invalidateQueries({ queryKey: ["allWorkouts"] });
      } else {
        console.error(
          "Failed to update favorite status:",
          await response.text()
        );
      }
    } catch (error) {
      console.error("Error updating favorite status:", error);
    }
  };

  return {
    setIsPermissionGranted,
    createOrGetCalendar,
    setUserId,
    fetchWorkoutDetails,
    fetchFavoritesStatus,
    handleFavorite,
    handleEnterFullscreen,
    setIsSchedule,
    handlePlaybackStatusUpdate,
    addEventToCalendar,
    onDateChange,
    closeModal,
    isModalVisible,
    selectedDate,
    isSchedule,
    videoVisible,
    videoRef,
    isFavorite,
    isCompleted,
    userId,
    workout,
    loading,
  };
};
