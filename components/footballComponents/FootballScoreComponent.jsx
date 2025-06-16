import { useNavigation } from "@react-navigation/native";
import React from "react";
import {
  View,
  Image,
  StyleSheet,
  ImageBackground,
  Dimensions,
  Touchable,
  TouchableOpacity,
} from "react-native";
import { Text, Card } from "react-native-paper";

const screenWidth = Dimensions.get("screen").width;

const FootballScoreComponent = ({ incidentsData, match, matchStatus }) => {
  const navigation = useNavigation();
  const goalScorers = incidentsData.incidents
    .map((incident) => {
      if (incident.incidentType === "goal") {
        return {
          player: incident.player.shortName,
          time: incident.time,
          isHome: incident.isHome,
          type: incident.incidentClass,
        };
      }
    })
    .filter(Boolean)
    .reverse();

  function onPressTeam(id, teamName, teamLogo, leagueId, leagueName, seasonId) {
    console.log("param", seasonId);
    navigation.navigate("TeamDetailsScreen", {
      sport: "football",
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
    <ImageBackground style={styles.background}>
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
            <Text style={styles.teamName}>{match?.homeTeam?.name}</Text>
          </TouchableOpacity>

          {/* Score */}
          <View style={styles.scoreContainer}>
            <Text style={styles.score}>
              {match?.homeScore?.display} - {match?.awayScore?.display}
            </Text>
            <Text style={styles.status}>{matchStatus}</Text>
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
            <Text style={styles.teamName}>{match?.awayTeam?.name}</Text>
          </TouchableOpacity>
        </View>

        {/* Goal Scorers */}
        {goalScorers.length > 0 && (
          <View style={styles.scorersSection}>
            <View style={styles.scorersDivider}></View>
            <View style={styles.scorers}>
              <View style={styles.homeTeamContainer}>
                {goalScorers.map(
                  (goal, index) =>
                    goal.isHome && (
                      <View key={index} style={styles.incidentContainer}>
                        <View style={{ flexDirection: "row" }}>
                          <Text style={styles.bold}>{goal.player}</Text>
                          {goal.type === "penalty" && (
                            <Text style={styles.goalType}>{` [P]`}</Text>
                          )}
                          {goal.type === "ownGoal" && (
                            <Text style={styles.goalType}>{` [OG]`}</Text>
                          )}
                        </View>
                        <Text style={styles.goal}>{goal.time}'</Text>
                      </View>
                    )
                )}
              </View>
              <View style={styles.ballIconContainer}>
                <Text style={styles.ballIcon}>⚽</Text>
              </View>
              <View style={styles.awayTeamContainer}>
                {goalScorers.map(
                  (goal, index) =>
                    !goal.isHome && (
                      <View key={index} style={styles.incidentContainer}>
                        <View style={{ flexDirection: "row" }}>
                          <Text style={styles.bold}>{goal.player}</Text>
                          {goal.type === "penalty" && (
                            <Text style={styles.goalType}>{` [P]`}</Text>
                          )}
                          {goal.type === "ownGoal" && (
                            <Text style={styles.goalType}>{` [OG]`}</Text>
                          )}
                        </View>
                        <Text style={styles.goal}>{goal.time}'</Text>
                      </View>
                    )
                )}
              </View>
            </View>
          </View>
        )}
      </Card>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: "cover",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1E1E1E",
  },
  card: {
    width: screenWidth - 30,
    backgroundColor: "#333333",
    borderRadius: 10,
    padding: 20,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    margin: 15,
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
    width: 60,
    height: 60,
    resizeMode: "contain",
    backgroundColor: "#4A4A4A",
    borderRadius: 30,
    padding: 5,
  },
  teamName: {
    color: "#E0E0E0",
    fontSize: 16,
    marginTop: 8,
    textAlign: "center",
    fontWeight: "600",
  },
  scoreContainer: {
    alignItems: "center",
    backgroundColor: "#424242",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  homeTeamContainer: {
    width: screenWidth / 2.8,
  },
  awayTeamContainer: {
    width: screenWidth / 2.8,
  },
  score: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "bold",
  },
  status: {
    color: "#BBBBBB",
    fontSize: 14,
    marginTop: 4,
  },
  scorersSection: {
    marginTop: 15,
  },
  scorersDivider: {
    height: 1,
    backgroundColor: "#555555",
    marginBottom: 15,
  },
  scorers: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  goal: {
    color: "#BBBBBB",
    fontSize: 16,
  },
  incidentContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
    paddingVertical: 3,
    paddingHorizontal: 6,
    backgroundColor: "#3A3A3A",
    borderRadius: 4,
  },
  bold: {
    fontWeight: "bold",
    color: "#E0E0E0",
  },
  goalType: {
    fontWeight: "bold",
    color: "#A0A0A0",
  },
  ballIconContainer: {
    alignItems: "center",
    paddingHorizontal: 10,
  },
  ballIcon: {
    fontSize: 20,
    color: "#E0E0E0",
  },
});

export default FootballScoreComponent;
