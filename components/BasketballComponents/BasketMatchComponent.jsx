import React, { memo } from "react";
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  Dimensions,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import IconComponent from "../PressableComponents/IconComponent";
import { useFavouritesStore } from "../../zustand/useFavouritesStore";

const screenWidth = Dimensions.get("screen").width;

const BasketMatchComponent = memo(
  ({ id, match, matchStatus, homeLogo, awayLogo, isFavorite }) => {
    const navigation = useNavigation();
    const { isFavourite, addFavourite, removeFavourite } = useFavouritesStore();

    const sport = "basketball";
    const type = "matches";

    const fav = isFavourite(id, sport, type) || isFavorite;
    const isFinished = matchStatus?.toLowerCase() === "ft";

    const matchItem = {
      id,
      name: `${match?.homeTeam?.name} vs ${match?.awayTeam?.name}`,
      homeTeam: match?.homeTeam,
      awayTeam: match?.awayTeam,
      matchStatus,
      homeLogo,
      awayLogo,
    };

    const toggleFavourite = () => {
      if (isFinished) return;

      if (fav) {
        removeFavourite(id, sport, type);
      } else {
        addFavourite(matchItem, sport, type);
      }
    };

    const getStatusColor = (status) => {
      switch (status?.toLowerCase()) {
        case "live":
          return "#7ef240";
        case "finished":
          return "#999";
        case "upcoming":
        case "scheduled":
          return "#f2c940";
        default:
          return "#999";
      }
    };

    return (
      <Pressable
        style={[styles.rootContainer, isFinished && styles.finishedMatch]}
        onPress={() => {
          navigation.navigate("BasketMatchDetails", {
            matchId: id,
            match: match,
            matchStatus: matchStatus,
          });
        }}
        android_ripple={{ color: "#444" }}
      >
        <View style={styles.innerContainer}>
          <View style={styles.matchStatusContainer}>
            <Text
              style={[
                styles.statusText,
                { color: getStatusColor(matchStatus) },
              ]}
            >
              {matchStatus}
            </Text>
          </View>

          <View style={styles.teamsContainer}>
            <View style={styles.teamRow}>
              <Image style={styles.logo} source={{ uri: homeLogo }} />
              <Text style={styles.teamText} numberOfLines={1}>
                {match?.homeTeam?.name}
              </Text>
              <Text style={styles.scoreText}>
                {match?.homeScore?.penalties
                  ? `${match?.homeScore?.display} (${match?.homeScore?.penalties})`
                  : match?.homeScore?.display}
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.teamRow}>
              <Image style={styles.logo} source={{ uri: awayLogo }} />
              <Text style={styles.teamText} numberOfLines={1}>
                {match?.awayTeam?.name}
              </Text>
              <Text style={styles.scoreText}>
                {match?.awayScore?.penalties
                  ? `${match?.awayScore?.display} (${match?.awayScore?.penalties})`
                  : match?.awayScore?.display}
              </Text>
            </View>
          </View>

          <IconComponent
            name={fav ? "star" : "star-outline"}
            color={fav ? "#f2c940" : isFinished ? "#666" : "#AAA"}
            packageName="Ionicon"
            style={[styles.favButton, isFinished && styles.disabledFavButton]}
            iconSize={22}
            onPress={toggleFavourite}
          />
        </View>
      </Pressable>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.matchStatus === nextProps.matchStatus &&
      prevProps.isFavorite === nextProps.isFavorite &&
      prevProps.match?.homeScore?.display ===
        nextProps.match?.homeScore?.display &&
      prevProps.match?.awayScore?.display ===
        nextProps.match?.awayScore?.display
    );
  }
);

export default BasketMatchComponent;

const styles = StyleSheet.create({
  rootContainer: {
    borderWidth: 1,
    borderColor: "#444",
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    backgroundColor: "#292929",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  innerContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  matchStatusContainer: {
    width: screenWidth / 8,
    paddingRight: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  teamsContainer: {
    flex: 1,
    paddingHorizontal: 8,
  },
  teamRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
  },
  divider: {
    height: 1,
    backgroundColor: "#444",
    marginVertical: 2,
  },
  logo: {
    height: 22,
    width: 22,
    marginRight: 10,
    borderRadius: 11,
  },
  teamText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
    color: "#EEE",
    marginRight: 8,
  },
  scoreText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFF",
    width: 45,
    textAlign: "right",
  },
  favButton: {
    padding: 8,
  },
  disabledFavButton: {
    opacity: 0.5,
  },
});
