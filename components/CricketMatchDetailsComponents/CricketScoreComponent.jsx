import { StyleSheet, View, Text, Dimensions } from "react-native";
import ImageButtonComponent from "../PressableComponents/imageButtonComponent";

const screenWidth = Dimensions.get("window").width;

export default function CricketScoreComponent({
  scorecardData,
  teamImageData,
  matchHeader,
}) {
  if (!scorecardData || !teamImageData) {
    return (
      <View>
        <Text>Loading or Missing Data...</Text>
      </View>
    );
  }

  const { scorecard } = scorecardData;
  const isUpcomingMatch = scorecard.length === 0; // Check if the match hasn't started

  // Extract teams from matchHeader
  const teamA = matchHeader.team1;
  const teamB = matchHeader.team2;

  // console.log(teamA);

  // Get team images safely
  const teamAImgURL = {
    uri: teamImageData.find((team) => team.teamId === teamA.teamId)?.url || "",
  };
  const teamBImgURL = {
    uri: teamImageData.find((team) => team.teamId === teamB.teamId)?.url || "",
  };

  // Team names
  const teamAName = teamA.teamName || "Team A";
  const teamBName = teamB.teamName || "Team B";

  // Match details
  const status = matchHeader.status || "Live";
  const matchNumber = matchHeader.matchDescription || "Unknown Match";
  const seriesName = matchHeader.seriesName || "Cricket Series";

  // Extract score details if the match has started
  const teamAscore = !isUpcomingMatch
    ? scorecard.filter((inng) => inng.batTeamName === teamA.teamName)
    : [];
  const teamBscore = !isUpcomingMatch
    ? scorecard.filter((inng) => inng.batTeamName === teamB.teamName)
    : [];

  // Get the latest innings score for each team
  const getLatestInning = (teamScore) =>
    teamScore[teamScore.length - 1] || null;
  const latestTeamAInning = getLatestInning(teamAscore);
  const latestTeamBInning = getLatestInning(teamBscore);

  return (
    <View style={styles.rootContainer}>
      <Text style={[styles.text, { textAlign: "center" }]}>{seriesName}</Text>

      {/* Team A */}
      <View style={styles.innerContainer}>
        <View style={styles.innerContainer}>
          <View style={styles.flagContainer}>
            <ImageButtonComponent
              imgStyle={styles.imgStyle}
              iconSource={teamAImgURL}
              alt={teamAName}
            />
            <Text style={styles.boldText}>{teamAName}</Text>
          </View>

          {/* Display score only if match has started */}
          {!isUpcomingMatch && latestTeamAInning && (
            <View style={styles.flagContainer}>
              <Text style={styles.textStyle}>{`${latestTeamAInning.score}/${
                latestTeamAInning.wickets || 0
              }`}</Text>
              <Text
                style={styles.textStyle}
              >{`(${latestTeamAInning.overs})`}</Text>
            </View>
          )}
        </View>

        {/* Team B */}
        <View style={styles.innerContainer}>
          {/* Display score only if match has started */}
          {!isUpcomingMatch && latestTeamBInning && (
            <View style={styles.flagContainer}>
              <Text style={styles.textStyle}>{`${latestTeamBInning.score}/${
                latestTeamBInning.wickets || 0
              }`}</Text>
              <Text
                style={styles.textStyle}
              >{`(${latestTeamBInning.overs})`}</Text>
            </View>
          )}

          <View style={styles.flagContainer}>
            <ImageButtonComponent
              imgStyle={styles.imgStyle}
              iconSource={teamBImgURL}
              alt={teamBName}
            />
            <Text style={styles.boldText}>{teamBName}</Text>
          </View>
        </View>
      </View>

      {/* Match Status */}
      <View>
        <Text style={styles.text}>{status}</Text>
        <Text style={styles.text}>{matchNumber}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    marginTop: 20,
    width: screenWidth,
    marginBottom: 10,
  },
  innerContainer: {
    padding: 5,
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 8,
  },
  flagContainer: {
    justifyContent: "center",
  },
  text: {
    textAlign: "center",
    fontWeight: "500",
    fontSize: 16,
  },
  boldText: {
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },
  imgStyle: {
    width: 60,
    height: 60,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "grey",
  },
  textStyle: {
    fontSize: 14,
    textAlign: "center",
  },
});
