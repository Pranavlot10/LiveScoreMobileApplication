import React from "react";
import {
  View,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { Text, Card } from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";

const screenWidth = Dimensions.get("screen").width;

const BasketScoreComponent = ({ incidentsData, match, matchStatus }) => {
  const navigation = useNavigation();

  function onPressTeam(id, teamName, teamLogo, leagueId, leagueName, seasonId) {
    console.log("param", seasonId);
    navigation.navigate("TeamDetailsScreen", {
      sport: "basketball",
      id: id,
      teamName: teamName,
      teamLogo: teamLogo,
      leagueId: leagueId,
      leagueName: leagueName,
      seasonId: seasonId,
      // leagueImage: leagueImage,
    });
  }

  return (
    <LinearGradient colors={["#272727", "#181818"]} style={styles.background}>
      <Card style={styles.card}>
        <View style={styles.container}>
          {/* Team 1 */}
          <TouchableOpacity
            style={styles.team}
            onPress={() =>
              onPressTeam(
                match?.homeTeam?.id,
                match?.homeTeam?.name,
                match?.homeTeam?.logo,
                match?.tournament?.uniqueTournament?.id,
                match?.tournament?.uniqueTournament?.name,
                match?.season?.id
              )
            }
          >
            <Image
              source={{ uri: match?.homeTeam?.logo }}
              style={styles.logo}
            />
            <Text style={styles.teamName} numberOfLines={2}>
              {match?.homeTeam?.name}
            </Text>
          </TouchableOpacity>

          {/* Score */}
          <View style={styles.scoreContainer}>
            <Text style={styles.score}>
              {match?.homeScore?.display} - {match?.awayScore?.display}
            </Text>
            {matchStatus === "inprogress" ? (
              <View style={styles.liveIndicator}>
                <Text style={styles.liveText}>LIVE</Text>
              </View>
            ) : (
              <Text style={styles.status}>
                {matchStatus === "ended"
                  ? "FT"
                  : match?.status?.description || matchStatus}
              </Text>
            )}
          </View>

          {/* Team 2 */}
          <TouchableOpacity
            style={styles.team}
            onPress={() =>
              onPressTeam(
                match?.awayTeam?.id,
                match?.awayTeam?.name,
                match?.awayTeam?.logo,
                match?.tournament?.uniqueTournament?.id,
                match?.tournament?.uniqueTournament?.name,
                match?.season?.id
              )
            }
          >
            <Image
              source={{ uri: match?.awayTeam?.logo }}
              style={styles.logo}
            />
            <Text style={styles.teamName} numberOfLines={2}>
              {match?.awayTeam?.name}
            </Text>
          </TouchableOpacity>
        </View>
      </Card>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  background: {
    width: screenWidth,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 10,
  },
  card: {
    width: screenWidth - 32,
    backgroundColor: "#252525",
    borderRadius: 12,
    padding: 16,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(150, 150, 150, 0.2)",
  },
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  team: {
    alignItems: "center",
    width: screenWidth / 4,
  },
  logo: {
    width: 40,
    height: 40,
    resizeMode: "contain",
    marginBottom: 8,
  },
  teamName: {
    color: "#E0E0E0",
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
  },
  scoreContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  score: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "bold",
  },
  liveIndicator: {
    backgroundColor: "#FF4500",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 4,
  },
  liveText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  status: {
    color: "#BBBBBB",
    fontSize: 12,
    marginTop: 4,
  },
});

export default BasketScoreComponent;
