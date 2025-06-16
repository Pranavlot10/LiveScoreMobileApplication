import { useEffect, useState, useRef } from "react";
import { StyleSheet, View, Text, Dimensions } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { TabView, TabBar } from "react-native-tab-view";

const screenWidth = Dimensions.get("window").width;

export default function CricketScorecardComponent({
  scorecardData,
  squadsData,
  onHeightChange,
}) {
  const scrollViewRef = useRef(null);
  const innings = scorecardData ? scorecardData?.scorecard : [];

  const isUpcoming =
    scorecardData?.matchHeader?.state === "Upcoming" ||
    scorecardData?.matchHeader?.state === "Preview";

  // Set up tab view state
  const [index, setIndex] = useState(0);

  // Define routes based on the data
  const [routes, setRoutes] = useState([]);

  // Initialize routes when data changes
  useEffect(() => {
    if (isUpcoming && squadsData) {
      setRoutes([
        { key: "team1", title: squadsData?.team1?.team?.teamSName || "Team A" },
        { key: "team2", title: squadsData?.team2?.team?.teamSName || "Team B" },
      ]);
    } else if (innings.length > 0) {
      if (innings.length === 1) {
        setRoutes([
          {
            key: "batting",
            title: innings[0]?.batTeamDetails?.batTeamShortName,
          },
          {
            key: "bowling",
            title: innings[0]?.bowlTeamDetails?.bowlTeamShortName,
          },
        ]);
      } else {
        setRoutes(
          innings.map((inning, idx) => ({
            key: `innings${idx}`,
            title: inning?.batTeamDetails?.batTeamShortName,
          }))
        );
      }
    }
  }, [scorecardData, squadsData, isUpcoming, innings]);

  const renderSquadsRow = (item) => {
    if (!Array.isArray(item)) return null; // Prevents errors if item is not an array

    return item.map((data) => {
      let roleText = data.fullName;

      if (data.captain && data.keeper) {
        roleText += " (c)(wk)";
      } else if (data.captain) {
        roleText += " (c)";
      } else if (data.keeper) {
        roleText += " (wk)";
      }

      return (
        <View style={styles.rowContainer} key={data.id || data.fullName}>
          <View style={styles.infoContainer}>
            <Text style={styles.squadRowText}>{roleText}</Text>
            <Text style={styles.fallOfWicketsText}>{data.role}</Text>
          </View>
        </View>
      );
    });
  };

  const upcomingMatchesTeamData = [squadsData?.team1, squadsData?.team2];

  if (!scorecardData && !squadsData) {
    return (
      <View style={styles.centeredContainer}>
        <Text>Scorecard data is unavailable.</Text>
      </View>
    );
  }

  const renderRow = (item, rowType) => {
    const rowDetails =
      rowType === "batsman"
        ? [
            item?.runs || 0,
            item.balls,
            item?.fours || 0,
            item?.sixes || 0,
            item.strkRate,
          ]
        : [item.overs, item.maidens, item.runs, item.wickets, item.economy];

    return (
      <View style={styles.rowContainer}>
        <View style={styles.infoContainer}>
          <Text style={styles.rowText}>
            {rowType === "batsman"
              ? `${item.name}${
                  item.isCaptain && item.isKeeper
                    ? " (c & wk)"
                    : item.isCaptain
                    ? " (c)"
                    : item.isKeeper
                    ? " (wk)"
                    : ""
                }`
              : item.name || "Unknown"}
          </Text>
          {rowType === "batsman" && (
            <Text style={styles.outByText}>{item.outDec?.trim()}</Text>
          )}
        </View>
        <View style={styles.detailsContainer}>
          {rowDetails.map((data, index) => (
            <Text key={index} style={styles.rowDetailsText}>
              {data ?? "-"} {/* Handles undefined or null values */}
            </Text>
          ))}
        </View>
      </View>
    );
  };

  const renderYetToBat = (title, headers) => {
    const data = Object.values(headers).filter(
      (player) => player.outDesc === ""
    );

    if (data.length === 0) {
      return null;
    }

    return (
      <View style={styles.specialRow}>
        <Text style={styles.headerText}>{title}</Text>
        <Text style={styles.fallOfWicketsText}>
          {data
            .map((player, index) => {
              let playerLabel = player.batName || "";

              // Add (c) if the player is captain
              if (player.isCaptain) {
                playerLabel += " (c)";
              }

              // Add (wk) if the player is wicketkeeper
              if (player.isKeeper) {
                playerLabel += " (wk)";
              }

              return playerLabel;
            })
            .join(" · ")}
        </Text>
      </View>
    );
  };

  const renderFallOfWicket = (title, headers) => {
    return (
      <View style={styles.specialRow}>
        <Text style={styles.headerText}>{title}</Text>
        <Text style={styles.fallOfWicketsText}>
          {Object.keys(headers)
            ?.map(
              (header, index) =>
                `${headers[header].runs}/${index + 1} (${
                  headers[header].batsmanName
                }, ${headers[header].overNbr})`
            )
            .join(" · ") || "No fall of wickets data"}
        </Text>
      </View>
    );
  };

  const renderSectionHeader = (title, headers) => {
    return (
      <View style={styles.tableHeader}>
        <Text style={styles.headerText}>{title}</Text>
        <View style={styles.subHeaderContainer}>
          {headers?.map((header, index) => (
            <Text key={index} style={styles.headerDetailsText}>
              {header}
            </Text>
          ))}
        </View>
      </View>
    );
  };

  const renderExtrasRow = (title, headers) => {
    return (
      <View style={styles.tableHeader}>
        <Text style={styles.headerText}>{title}</Text>
        <View style={styles.specialSubHeaderContainer}>
          <Text style={styles.rowText}>{headers.total}</Text>
          <Text style={styles.rowText}>
            {`(wd = ${headers?.wides || 0} nb = ${headers?.noBalls || 0} lb = ${
              headers?.legByes || 0
            } b = ${headers?.byes || 0})`}
          </Text>
        </View>
      </View>
    );
  };

  const renderTotalRow = (title, headers) => {
    return (
      <View style={styles.tableHeader}>
        <Text style={styles.headerText}>{title}</Text>
        <View style={styles.specialSubHeaderContainer}>
          <Text style={styles.rowText}>{headers.runs}</Text>
          <Text style={styles.rowText}>
            {`(${headers.wickets} wkts, ${headers.overs}overs)`}
          </Text>
        </View>
      </View>
    );
  };

  function SquadView(team) {
    if (!team) return <Text>Team data unavailable</Text>;

    const data = team?.team?.players?.Squad;
    return (
      <View style={styles.page}>
        <Text
          style={styles.squadheaderText}
        >{`${team.team.team.teamName} Squad`}</Text>
        {renderSquadsRow(data)}
        <View style={styles.rowContainer}>
          <Text style={styles.headerText}>Venue</Text>
          <View style={styles.subHeaderContainer}>
            <Text style={styles.rowText}>
              {/* {matchInfoData?.venue || "Unknown"} */}
            </Text>
          </View>
        </View>
      </View>
    );
  }

  // Render upcoming match tabs
  const renderUpcomingScene = ({ route }) => {
    const teamIndex = route.key === "team1" ? 0 : 1;
    return (
      <View style={styles.rootContainer}>
        <SquadView team={upcomingMatchesTeamData[teamIndex]} />
      </View>
    );
  };

  // Render innings tabs
  const renderInningsScene = ({ route }) => {
    if (innings.length === 1) {
      // Special case for single innings
      if (route.key === "batting") {
        // Batting team view
        return (
          <View style={styles.rootContainer}>
            <View style={styles.page}>
              {renderSectionHeader("Batsman", ["R", "B", "4s", "6s", "SR"])}
              {Object.values(innings[0]?.batsman).map(
                (batsman) =>
                  batsman.outDesc !== "" && renderRow(batsman, "batsman")
              )}
              {renderExtrasRow("Extras", innings[0]?.extras)}
              {renderTotalRow("Total", {
                runs: innings[0]?.score,
                wickets: innings[0]?.wickets,
                overs: innings[0]?.overs,
              })}
              {renderYetToBat("Yet to Bat", innings[0]?.batsman)}
              {renderFallOfWicket("Fall of Wickets", innings[0]?.fow.fow)}
              {renderSectionHeader("Bowler", ["O", "M", "R", "W", "ER"])}
              {Object.values(innings[0]?.bowler).map((bowler) =>
                renderRow(bowler, "bowler")
              )}
            </View>
          </View>
        );
      } else {
        // Bowling team view (squad)
        const team = Object.values(squadsData).find(
          (team) =>
            team?.team.teamId === innings[0]?.bowlTeamDetails?.bowlTeamId
        );
        return (
          <View style={styles.rootContainer}>
            <SquadView team={team} />
          </View>
        );
      }
    } else {
      // Multiple innings - determine which innings to show based on route key
      const inningIndex = parseInt(route.key.replace("innings", ""), 10);
      const inning = innings[inningIndex];

      return (
        <View style={styles.rootContainer}>
          <View style={styles.page}>
            {renderSectionHeader("Batsman", ["R", "B", "4s", "6s", "SR"])}
            {Object.values(inning?.batsman).map(
              (batsman) =>
                batsman.outDesc !== "" && renderRow(batsman, "batsman")
            )}
            {renderExtrasRow("Extras", inning?.extras)}
            {renderTotalRow("Total", {
              runs: inning?.score,
              wickets: inning?.wickets,
              overs: inning?.overs,
            })}
            {renderYetToBat("Yet to Bat", inning?.batsman)}
            {renderFallOfWicket("Fall of Wickets", inning?.fow.fow)}
            {renderSectionHeader("Bowler", ["O", "M", "R", "W", "ER"])}
            {Object.values(inning?.bowler).map((bowler) =>
              renderRow(bowler, "bowler")
            )}
          </View>
        </View>
      );
    }
  };

  // Custom TabBar
  const renderTabBar = (props) => (
    <TabBar
      {...props}
      indicatorStyle={styles.tabIndicator}
      style={styles.tabBar}
      labelStyle={styles.tabLabel}
      activeColor="#0055cc"
      inactiveColor="#555"
      pressColor="rgba(0, 85, 204, 0.1)"
    />
  );

  return (
    <View style={styles.container}>
      <TabView
        navigationState={{ index, routes }}
        renderScene={isUpcoming ? renderUpcomingScene : renderInningsScene}
        onIndexChange={setIndex}
        initialLayout={{ width: screenWidth }}
        renderTabBar={renderTabBar}
        lazy
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  rootContainer: {
    paddingHorizontal: 10,
    marginTop: 10,
    backgroundColor: "#f9f9f9", // Light background for better readability
  },
  page: {
    width: screenWidth - 20,
    justifyContent: "flex-start",
    backgroundColor: "#ffffff", // Ensures white background for pages
    paddingVertical: 10,
  },
  rowContainer: {
    flexDirection: "row",
    marginVertical: 4,
    alignItems: "flex-start",
    padding: 8,
    borderBottomWidth: 1,
    borderColor: "#ddd", // Light border for row separation
    backgroundColor: "#fff", // White rows
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  infoContainer: {
    flex: 1,
  },
  detailsContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  subHeaderContainer: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginRight: 10,
  },
  rowText: {
    fontSize: 14,
    marginHorizontal: 5,
    color: "#333", // Dark text color
    fontWeight: "500",
  },
  squadRowText: {
    fontSize: 14,
    marginHorizontal: 5,
    color: "#333",
    fontWeight: "500",
  },
  headerDetailsText: {
    fontSize: 14,
    marginRight: 12,
    color: "#555", // Muted text for less prominence
  },
  rowDetailsText: {
    fontSize: 14,
    marginLeft: 10,
    textAlign: "right",
    color: "#444", // Slightly muted text
  },
  outByText: {
    fontSize: 13,
    marginHorizontal: 5,
    marginTop: 5,
    color: "#999", // Grey text for "Not Out" or dismissal info
    width: screenWidth,
  },
  specialSubHeaderContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    backgroundColor: "#f7f7f7",
    borderRadius: 6,
  },
  tableHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderColor: "#ddd",
    paddingVertical: 10,
    marginTop: 5,
    backgroundColor: "#f2f2f2", // Slightly shaded header
    borderRadius: 8,
  },
  headerText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#222", // Prominent dark color
  },
  specialRow: {
    borderTopWidth: 1,
    borderColor: "#ddd",
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: "#fefefe",
    borderRadius: 8,
    marginBottom: 10,
  },
  squadheaderText: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 10,
    color: "#0055cc", // Highlighted blue for squad headers
    textAlign: "center",
  },
  fallOfWicketsText: {
    fontSize: 14,
    color: "#666", // Muted grey for less prominent text
    marginVertical: 5,
    lineHeight: 20, // Adds clarity to multi-line text
  },
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
  },
  // Tab styles
  tabBar: {
    backgroundColor: "#f2f2f2",
    elevation: 0,
    shadowOpacity: 0,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: "500",
    textTransform: "none",
  },
  tabIndicator: {
    backgroundColor: "#0055cc",
    height: 3,
  },
});
