import { StyleSheet, View, Text, Image, Dimensions } from "react-native";

const screenWidth = Dimensions.get("screen").width;

export default function CricketMinimalScoreComponent({
  scorecardData,
  teamImageData,
}) {
  if (!scorecardData || !teamImageData) return null; // Ensure data exists

  const { matchHeader, scoreCard } = scorecardData;
  const isUpcomingMatch = scoreCard.length === 0; // Check if the match hasn't started

  // Extract teams from matchHeader
  const teamA = matchHeader.team1;
  const teamB = matchHeader.team2;

  // Get team images safely
  const teamAImgURL = {
    uri: teamImageData.find((team) => team.teamId === teamA.id)?.url || "",
  };
  const teamBImgURL = {
    uri: teamImageData.find((team) => team.teamId === teamB.id)?.url || "",
  };

  const teamAName = teamA.shortName || "Team A";
  const teamBName = teamB.shortName || "Team B";

  const status = matchHeader.status || "Match Not Started";
  const matchType = matchHeader.matchFormat === "TEST";

  // Extract score details if the match has started
  const teamAscore = !isUpcomingMatch
    ? scoreCard.filter((inng) => inng.batTeamDetails.batTeamId === teamA.id)
    : [];
  const teamBscore = !isUpcomingMatch
    ? scoreCard.filter((inng) => inng.batTeamDetails.batTeamId === teamB.id)
    : [];

  // Get the latest innings score for each team
  const getLatestInning = (teamScore) =>
    teamScore[teamScore.length - 1] || null;
  const latestTeamAInning = getLatestInning(teamAscore);
  const latestTeamBInning = getLatestInning(teamBscore);

  return (
    <View style={styles.rootContainer}>
      {/* Team A */}
      <View style={styles.teamContainer}>
        <Image style={styles.imgstyle} source={teamAImgURL} />
        {/* <Text style={styles.textStyle}>{teamAName}</Text> */}

        {/* Display score only if match has started */}
        {!isUpcomingMatch && latestTeamAInning && (
          <View>
            <Text style={styles.textStyle}>{`${
              latestTeamAInning.scoreDetails.runs
            }/${latestTeamAInning.scoreDetails.wickets || 0}`}</Text>
            {matchType && teamAscore.length > 1 ? (
              <Text style={styles.textStyle}>
                {`${teamAscore[0].scoreDetails.runs}/${
                  teamAscore[0].scoreDetails.wickets || 0
                }`}
              </Text>
            ) : (
              <Text
                style={styles.textStyle}
              >{`(${latestTeamAInning.scoreDetails.overs})`}</Text>
            )}
          </View>
        )}
      </View>

      {/* Match Status */}
      <View style={styles.textContainer}>
        <Text style={styles.textStyle}>{status}</Text>
      </View>

      {/* Team B */}
      <View style={styles.teamContainer}>
        {/* Display score only if match has started */}
        {!isUpcomingMatch && latestTeamBInning && (
          <View>
            <Text style={styles.textStyle}>{`${
              latestTeamBInning.scoreDetails.runs
            }/${latestTeamBInning.scoreDetails.wickets || 0}`}</Text>
            {matchType && teamBscore.length > 1 ? (
              <Text style={styles.textStyle}>{`${
                teamBscore[0].scoreDetails.runs
              }/${teamBscore[0].scoreDetails.wickets || 0}`}</Text>
            ) : (
              <Text
                style={styles.textStyle}
              >{`(${latestTeamBInning.scoreDetails.overs})`}</Text>
            )}
          </View>
        )}

        {/* <Text style={styles.textStyle}>{teamBName}</Text> */}
        <Image style={styles.imgstyle} source={teamBImgURL} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    width: "99%",
    flexDirection: "row",
    backgroundColor: "white",
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  teamContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    width: screenWidth / 4,
  },
  textContainer: {
    justifyContent: "center",
    width: screenWidth / 3,
  },
  textStyle: {
    color: "black",
    fontSize: 14,
    textAlign: "center",
  },
  imgstyle: {
    width: 40,
    height: 40,
    borderRadius: 4,
    borderWidth: 1,
  },
});
