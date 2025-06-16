import { StyleSheet, View, Text, Dimensions } from "react-native";
import { useEffect, useState } from "react";
import { serverIP } from "@env";
import axios from "axios";
import { TabView, TabBar } from "react-native-tab-view";
import CricketMatchOverviewComponent from "./CricketMatchOverviewComponent";
import ProgressBarComponent from "./ProgressbarComponent";
import PartnershipsComponent from "./CricketMatchPartnershipsComponent";

const screenWidth = Dimensions.get("screen").width;

export default function CricketMatchStatsComponent({
  matchId,
  scorecardData,
  matchHeader,
}) {
  const [seriesMatchesData, setSeriesMatchesData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // TabView state
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: "headToHead", title: "Head to Head" },
    { key: "form", title: "Form" },
    { key: "partnerships", title: "Partnerships" },
  ]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `http://${serverIP}/cricket/matchForms/${matchId}?seriesId=${matchHeader.seriesId}`
        );

        setSeriesMatchesData(response.data?.seriesMatches);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [matchId]);

  if (!scorecardData) {
    return (
      <View>
        <Text>No Stats Data Available</Text>
      </View>
    );
  }

  const getH2HStats = (matches, teamAName, teamBName) => {
    let teamAWins = 0,
      teamBWins = 0,
      draws = 0;

    const filteredMatches = matches.filter((match) => !match.adDetail);

    // Filter completed matches where BOTH teams played
    const h2hMatches = filteredMatches.filter(
      (match) =>
        match["matchDetailsMap"].match[0].matchInfo.state === "Complete" &&
        ((match["matchDetailsMap"].match[0].matchInfo.team1.teamName ===
          teamAName &&
          match["matchDetailsMap"].match[0].matchInfo.team2.teamName ===
            teamBName) ||
          (match["matchDetailsMap"].match[0].matchInfo.team1.teamName ===
            teamBName &&
            match["matchDetailsMap"].match[0].matchInfo.team2.teamName ===
              teamAName))
    );

    // Iterate through filtered matches
    h2hMatches.forEach((match) => {
      if (
        match["matchDetailsMap"].match[0].matchInfo.status.includes(teamAName)
      ) {
        teamAWins++;
      } else if (
        match["matchDetailsMap"].match[0].matchInfo.status.includes(teamBName)
      ) {
        teamBWins++;
      } else {
        draws++; // If there is a draw condition (null or "draw")
      }
    });

    return { teamAWins, teamBWins, draws, h2hMatches };
  };

  function getLastFiveResults(seriesData, team1Name, team2Name) {
    // Step 1: Remove ads and extract only match details
    let matches = seriesData.matchDetails
      .filter((item) => item.matchDetailsMap)
      .flatMap((item) => item.matchDetailsMap.match);

    // Step 2: Filter out live and upcoming matches (only keep "Complete" matches)
    let completedMatches = matches.filter(
      (match) => match.matchInfo.state === "Complete"
    );

    // Step 3: Function to get last 5 results for a given team
    function getTeamResults(teamName) {
      // Filter matches where this team played
      let teamMatches = completedMatches.filter(
        (match) =>
          match.matchInfo.team1.teamName === teamName ||
          match.matchInfo.team2.teamName === teamName
      );

      let results = [];

      for (let match of teamMatches) {
        let team1 = match.matchInfo.team1;
        let team2 = match.matchInfo.team2;
        let status = match.matchInfo.status.toLowerCase(); // Convert status to lowercase for easy checking

        let isTeam1 = team1.teamName === teamName;
        let isTeam2 = team2.teamName === teamName;

        if (isTeam1 || isTeam2) {
          if (
            status.includes("abandoned") ||
            status.includes("no result") ||
            status.includes("draw")
          ) {
            results.push("D"); // Match was abandoned or ended in a draw
          } else {
            // Check if this team won the match
            let teamShortName = isTeam1 ? team1.teamName : team2.teamName;
            let won = status.includes(teamShortName.toLowerCase());

            results.push(won ? "W" : "L");
          }
        }
      }

      return results.reverse().slice(0, 5);
    }

    // Step 4: Get results for both teams separately
    let team1Results = getTeamResults(team1Name);
    let team2Results = getTeamResults(team2Name);

    return {
      [team1Name]: team1Results,
      [team2Name]: team2Results,
    };
  }

  function recentForm(result) {
    if (!result || result.length === 0) {
      return <Text style={styles.noDataText}>No recent form available</Text>;
    }

    return result.map((match, index) => {
      if (match === "won" || match === "W") {
        return (
          <View key={index} style={styles.formWin}>
            <Text style={styles.formText}>W</Text>
          </View>
        );
      }
      if (match === "loss" || match === "L") {
        return (
          <View key={index} style={styles.formLoss}>
            <Text style={styles.formText}>L</Text>
          </View>
        );
      }
      if (match === "draw" || match === "D") {
        return (
          <View key={index} style={styles.formDraw}>
            <Text style={styles.formText}>D</Text>
          </View>
        );
      }

      // If the match result is unknown or invalid, return a placeholder
      return (
        <View key={index} style={styles.formUnknown}>
          <Text style={styles.formText}>?</Text>
        </View>
      );
    });
  }

  if (isLoading) return <Text style={styles.loadingText}>Loading...</Text>;

  // Get head-to-head data
  const { teamAWins, teamBWins, draws, h2hMatches } = seriesMatchesData
    ? getH2HStats(
        seriesMatchesData["matchDetails"],
        matchHeader.team1.teamName,
        matchHeader.team2.teamName
      )
    : { teamAWins: 0, teamBWins: 0, draws: 0, h2hMatches: [] };

  const totalMatches = teamAWins + teamBWins + draws;

  // Get form data
  const results = seriesMatchesData
    ? getLastFiveResults(
        seriesMatchesData,
        matchHeader.team1.teamName,
        matchHeader.team2.teamName
      )
    : {};

  // Progress bar data
  const data = [
    { value: teamAWins, color: "#16C47F" }, // Team A Wins
    { value: draws, color: "#aaaaaa" }, // Draws
    { value: teamBWins, color: "#7C00FE" }, // Team B Wins
  ];

  // Render TabBar
  const renderTabBar = (props) => (
    <TabBar
      {...props}
      indicatorStyle={{ backgroundColor: "#06D001" }}
      style={{ backgroundColor: "white" }}
      labelStyle={{ color: "#222", fontWeight: "600" }}
      activeColor="#06D001"
      inactiveColor="#666"
    />
  );

  // Render Head to Head tab
  const renderHeadToHead = () => {
    return (
      <View style={styles.tabContent}>
        <View style={styles.h2hContainer}>
          <Text style={styles.title}>Head-to-head record</Text>
          <Text style={styles.subtitle}>Last {totalMatches} matches</Text>

          <View style={styles.row}>
            <View style={styles.teamContainer}>
              <Text style={styles.teamName}>{matchHeader.team1.teamName}</Text>
              <Text style={styles.teamWins}>{teamAWins} wins</Text>
            </View>

            <View style={styles.drawContainer}>
              <Text style={styles.drawText}>Draws</Text>
              <Text style={styles.drawText}>{draws}</Text>
            </View>

            <View style={styles.teamContainer}>
              <Text style={styles.teamName}>{matchHeader.team2.teamName}</Text>
              <Text style={styles.teamWins}>{teamBWins} wins</Text>
            </View>
          </View>
          <ProgressBarComponent segments={data} />
        </View>

        <View style={styles.h2hContainer}>
          {h2hMatches && h2hMatches.length > 0 ? (
            h2hMatches.map((match, index) => {
              const score = {
                hScore:
                  match["matchDetailsMap"].match[0]?.matchScore?.team1Score ||
                  "",

                aScore:
                  match["matchDetailsMap"].match[0]?.matchScore?.team2Score ||
                  "",
              };
              const matchDetails = {
                matchId: match["matchDetailsMap"].match[0].matchInfo.matchId,
                result:
                  match["matchDetailsMap"].match[0].matchInfo.status ||
                  "No result available",
                matchType:
                  match["matchDetailsMap"].match[0].matchInfo.seriesName ||
                  "Unknown Series",
                status: match["matchDetailsMap"].match[0].matchInfo.status,

                date:
                  match["matchDetailsMap"].match[0].matchInfo.matchFormat ===
                  "TEST"
                    ? `${new Date(
                        Number(
                          match["matchDetailsMap"].match[0].matchInfo.startDate
                        )
                      )
                        .toLocaleDateString("en-GB", {
                          day: "2-digit",
                        })
                        .replace(" ", "-")}-${new Date(
                        Number(
                          match["matchDetailsMap"].match[0].matchInfo.endDate
                        )
                      )
                        .toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                        })
                        .replace(" ", "-")}`
                    : new Date(
                        Number(
                          match["matchDetailsMap"].match[0].matchInfo.startDate
                        )
                      )
                        .toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                        })
                        .replace(" ", "-"),
              };
              return (
                <View key={index}>
                  <CricketMatchOverviewComponent
                    hTeam={match["matchDetailsMap"].match[0].matchInfo.team1}
                    aTeam={match["matchDetailsMap"].match[0].matchInfo.team2}
                    score={score}
                    matchDetails={matchDetails}
                    matchStatus={
                      match["matchDetailsMap"].match[0].matchInfo.state
                    }
                  />
                </View>
              );
            })
          ) : (
            <Text style={styles.noDataText}>
              No head-to-head records available
            </Text>
          )}
        </View>
      </View>
    );
  };

  // Render Form tab
  const renderForm = () => {
    if (!seriesMatchesData || matchHeader.seriesName.includes("tour")) {
      return (
        <View style={styles.tabContent}>
          <Text style={styles.noDataText}>
            Form data not available for this match
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.tabContent}>
        <View style={styles.h2hContainer}>
          <Text style={styles.title}>Form</Text>
          <Text style={styles.subtitle}>Last 5 matches</Text>

          <View style={styles.formRowContainer}>
            <Text style={styles.formTeamText}>
              {matchHeader.team1.teamName}
            </Text>
            <View style={styles.formContainer}>
              {recentForm(results[matchHeader.team1.teamName])}
            </View>
          </View>
          <View style={styles.formRowContainer}>
            <Text style={styles.formTeamText}>
              {matchHeader.team2.teamName}
            </Text>
            <View style={styles.formContainer}>
              {recentForm(results[matchHeader.team2.teamName])}
            </View>
          </View>
        </View>
      </View>
    );
  };

  // Render Partnerships tab
  const renderPartnerships = () => {
    if (Object.keys(scorecardData.scorecard).length <= 0) {
      return (
        <View style={styles.tabContent}>
          <Text style={styles.noDataText}>Partnership data not available</Text>
        </View>
      );
    }

    return (
      <View style={styles.tabContent}>
        <View style={styles.h2hContainer}>
          <Text style={styles.title}>Partnerships</Text>
          <PartnershipsComponent cricbuzzScorecard={scorecardData?.scorecard} />
        </View>
      </View>
    );
  };

  // Scene selector for TabView
  const renderScene = ({ route }) => {
    switch (route.key) {
      case "headToHead":
        return renderHeadToHead();
      case "form":
        return renderForm();
      case "partnerships":
        return renderPartnerships();
      default:
        return null;
    }
  };

  return (
    <View style={styles.rootContainer}>
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: screenWidth }}
        renderTabBar={renderTabBar}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: "#F6F4EB",
  },
  tabContent: {
    flex: 1,
    padding: 5,
  },
  h2hContainer: {
    padding: 8,
    margin: 4,
    borderRadius: 8,
    borderWidth: 2,
    backgroundColor: "#E3F4F4",
  },
  title: {
    textAlign: "center",
    fontSize: 18,
    marginBottom: 5,
    fontWeight: "bold",
  },
  subtitle: {
    textAlign: "center",
    fontSize: 14,
    marginBottom: 16,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  teamContainer: {
    alignItems: "center",
    flex: 1,
  },
  teamName: {
    fontSize: 14,
    textAlign: "center",
  },
  teamWins: {
    fontSize: 14,
    fontWeight: "bold",
  },
  drawContainer: {
    alignItems: "center",
    flex: 0.5,
  },
  drawText: {
    fontSize: 14,
  },
  progressBar: {
    flexDirection: "row",
    height: 10,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "transparent",
    alignItems: "center",
  },
  progressSegment: {
    height: "100%",
    borderRadius: 10,
  },
  formWin: {
    backgroundColor: "#06D001",
    borderRadius: 15,
    height: 25,
    width: 25,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 5,
  },
  formLoss: {
    backgroundColor: "#FF2929",
    borderRadius: 15,
    height: 25,
    width: 25,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 5,
  },
  formDraw: {
    backgroundColor: "#A6AEBF",
    borderRadius: 15,
    height: 25,
    width: 25,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 5,
  },
  formUnknown: {
    backgroundColor: "#888888",
    borderRadius: 15,
    height: 25,
    width: 25,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 5,
  },
  formRowContainer: {
    flexDirection: "row",
    paddingVertical: 10,
    justifyContent: "space-between",
  },
  formContainer: {
    flexDirection: "row",
  },
  formText: {
    color: "#fff",
    fontWeight: "bold",
  },
  formTeamText: {
    fontWeight: "600",
    fontSize: 16,
  },
  noDataText: {
    textAlign: "center",
    padding: 20,
    fontStyle: "italic",
    color: "#666",
  },
  loadingText: {
    textAlign: "center",
    padding: 20,
    fontSize: 16,
    color: "#333",
  },
});
