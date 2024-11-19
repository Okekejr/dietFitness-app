import React from "react";
import { ScrollView, StyleSheet } from "react-native";
import ClubDetailsCard from "./clubs/clubDetailsCard";
import ActivityFeedCard from "./clubs/activityFeedCard";
import ClubCards from "./clubs/clubCards";
import { ClubData } from "@/types";
import RouteUpdatesCard from "./clubs/routesUpdatesCard";

interface BottomSheetContentProps {
  selectedCard: string | null;
  setSelectedCard: (card: string | null) => void;
  club: ClubData;
  isLeader: boolean;
}

const BottomSheetContent: React.FC<BottomSheetContentProps> = ({
  selectedCard,
  setSelectedCard,
  club,
  isLeader,
}) => {
  if (selectedCard === "Club Details") {
    return (
      <ClubDetailsCard
        onBack={() => setSelectedCard(null)}
        club={club}
        isLeader={isLeader}
      />
    );
  }

  // if (selectedCard === "Leaderboard") {
  //   return <LeaderBoardCard onBack={() => setSelectedCard(null)} />;
  // }

  if (selectedCard === "Activity Feed") {
    return <ActivityFeedCard clubId={club.id} onBack={() => setSelectedCard(null)} />;
  }

  if (selectedCard === "Routes Feed") {
    return (
      <RouteUpdatesCard clubId={club.id} onBack={() => setSelectedCard(null)} />
    );
  }

  return (
    <ScrollView>
      <ClubCards
        title={`${club?.name} Details` || "Club Details"}
        description="View club information"
        icon="information-circle-outline"
        onPress={() => setSelectedCard("Club Details")}
      />
      <ClubCards
        title="Routes"
        description="Recent routes"
        icon="infinite-outline"
        onPress={() => setSelectedCard("Routes Feed")}
      />
      {/* <ClubCards
        title="Leaderboard"
        description="See top performers"
        icon="trophy-outline"
        onPress={() => setSelectedCard("Leaderboard")}
      /> */}
      <ClubCards
        title="Activity Feed"
        description="Recent activities"
        icon="list-outline"
        onPress={() => setSelectedCard("Activity Feed")}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  cardContainer: { padding: 20 },
});

export default BottomSheetContent;
