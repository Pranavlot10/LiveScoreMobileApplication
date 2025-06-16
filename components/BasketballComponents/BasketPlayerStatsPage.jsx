import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { TabView, SceneMap, TabBar } from "react-native-tab-view";

const screenWidth = Dimensions.get("window").width;

export default function BasketPlayerStats({
  matchInfo,
  lineupsData,
  homeDetails,
  awayDetails,
}) {
  const [index, setIndex] = useState(0);
  const hasLineupsData =
    lineupsData &&
    lineupsData.home?.players?.length > 0 &&
    lineupsData.away?.players?.length > 0;

  const TEAM_COLORS = {
    home: matchInfo?.homeTeam?.teamColors?.primary || "#FF4500",
    away: matchInfo?.awayTeam?.teamColors?.primary || "#FF4500",
  };

  const routes = useMemo(
    () => [
      { key: "home", title: homeDetails.shortName },
      { key: "away", title: awayDetails.shortName },
    ],
    [homeDetails.shortName, awayDetails.shortName]
  );

  const processTeamPlayers = (players) => {
    if (!players || players.length === 0) return [];
    return players.map((player) => ({
      name: player.player.name,
      jerseyNumber: player.jerseyNumber || "-",
      position: player.player.position || "-",
      min: player.statistics?.secondsPlayed
        ? (player.statistics.secondsPlayed / 60).toFixed(0)
        : "0",
      blocks: player.statistics?.blocks || "0",
      points: player.statistics?.points || "0",
      steals: player.statistics?.steals || "0",
      turnovers: player.statistics?.turnovers || "0",
      assists: player.statistics?.assists || "0",
      rebounds: player.statistics?.rebounds || "0",
    }));
  };

  const homeTeam = hasLineupsData
    ? processTeamPlayers(lineupsData.home.players)
    : [];
  const awayTeam = hasLineupsData
    ? processTeamPlayers(lineupsData.away.players)
    : [];

  const scrollableColumns = [
    { id: "min", label: "MIN" },
    { id: "rebounds", label: "REB" },
    { id: "blocks", label: "BLK" },
    { id: "steals", label: "STLS" },
    { id: "turnovers", label: "T/Os" },
    { id: "assists", label: "AST" },
    { id: "points", label: "PTS" },
  ];

  const renderTeamStats = useCallback(
    (team, teamName, teamColor) => (
      <View style={styles.tableContainer}>
        <View style={styles.tableContent}>
          {/* Fixed columns (number, position, name) */}
          <View style={styles.fixedColumnsContainer}>
            {/* Fixed header */}
            <View style={[styles.headerRow, { borderBottomColor: teamColor }]}>
              <Text style={[styles.headerCell, styles.numberCell]}>#</Text>
              <Text style={[styles.headerCell, styles.playerCell]}>Player</Text>
            </View>

            {/* Fixed player data */}
            {team.map((item, index) => (
              <TouchableOpacity
                key={`${teamName}-${index}`}
                style={[
                  styles.row,
                  { backgroundColor: index % 2 === 0 ? "#252D3A" : "#1E2430" },
                ]}
                activeOpacity={0.7}
              >
                <Text style={[styles.cell, styles.numberCell]}>
                  {item.jerseyNumber}
                </Text>
                <View style={styles.playerCellContainer}>
                  <View
                    style={[
                      styles.positionBadge,
                      { backgroundColor: teamColor },
                    ]}
                  >
                    <Text style={styles.playerPosition}>{item.position}</Text>
                  </View>
                  <Text
                    style={styles.playerName}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {item.name}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Scrollable columns */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View>
              {/* Scrollable header */}
              <View style={styles.headerRow}>
                {scrollableColumns.map((column) => (
                  <Text
                    key={column.id}
                    style={[styles.headerCell, styles.statCell]}
                  >
                    {column.label}
                  </Text>
                ))}
              </View>

              {/* Scrollable stats data */}
              {team.map((item, index) => (
                <TouchableOpacity
                  key={`${teamName}-${index}`}
                  style={[
                    styles.row,
                    {
                      backgroundColor: index % 2 === 0 ? "#252D3A" : "#1E2430",
                    },
                  ]}
                  activeOpacity={0.7}
                >
                  {scrollableColumns.map((column) => (
                    <Text
                      key={column.id}
                      style={[
                        styles.cell,
                        styles.statCell,
                        (column.id === "rebounds" && item.rebounds > 10) ||
                        (column.id === "points" && item.points > 20)
                          ? styles.highlightStat
                          : {},
                      ]}
                    >
                      {item[column.id]}
                    </Text>
                  ))}
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>
    ),
    []
  );

  const HomeTab = () => (
    <View style={styles.sceneContainer}>
      {renderTeamStats(homeTeam, homeDetails.shortName, TEAM_COLORS.home)}
    </View>
  );

  const AwayTab = () => (
    <View style={styles.sceneContainer}>
      {renderTeamStats(awayTeam, awayDetails.shortName, TEAM_COLORS.away)}
    </View>
  );

  const renderScene = SceneMap({
    home: HomeTab,
    away: AwayTab,
  });

  const renderTabBar = (props) => (
    <TabBar
      {...props}
      style={styles.tabBar}
      indicatorStyle={styles.indicator}
      labelStyle={styles.tabLabel}
      activeColor="#FF4500"
      inactiveColor="#AAAAAA"
      scrollEnabled={routes.length > 3}
      tabStyle={styles.tabStyle}
      pressColor="rgba(255, 69, 0, 0.1)"
    />
  );

  if (!hasLineupsData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>
            Player statistics will be available once the match starts
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false} style={styles.container}>
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: screenWidth }}
        renderTabBar={renderTabBar}
        swipeEnabled={true}
        lazy={true}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  sceneContainer: {
    flex: 1,
    backgroundColor: "#121212",
  },
  tableContainer: {
    backgroundColor: "#1E2430",
    marginHorizontal: 16,
    marginVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 69, 0, 0.3)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  tableContent: {
    flexDirection: "row",
  },
  fixedColumnsContainer: {
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 3,
    zIndex: 1,
    backgroundColor: "#1E2430",
  },
  headerRow: {
    flexDirection: "row",
    borderBottomWidth: 2,
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    backgroundColor: "#252D3A",
  },
  headerCell: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  row: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 15,
    height: 48, // Slightly taller rows for better touch area
    alignItems: "center",
  },
  cell: {
    color: "#E0E0E0",
    fontSize: 14,
    fontWeight: "500",
  },
  numberCell: {
    width: 30,
    textAlign: "center",
    fontWeight: "600",
    color: "#FFFFFF",
  },
  playerCell: {
    width: screenWidth / 2 - 30,
  },
  playerCellContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: screenWidth / 2 - 30,
    overflow: "hidden",
    paddingRight: 5,
  },
  positionBadge: {
    width: 24,
    paddingVertical: 3,
    borderRadius: 4,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  playerPosition: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
  },
  playerName: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
    flex: 1,
  },
  statCell: {
    width: 40,
    textAlign: "center",
  },
  highlightStat: {
    color: "#FFD700",
    fontWeight: "700",
    backgroundColor: "rgba(255, 215, 0, 0.1)",
    borderRadius: 4,
    paddingHorizontal: 4,
  },
  noDataContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  noDataText: {
    color: "#E0E0E0",
    fontSize: 16,
    textAlign: "center",
    fontWeight: "500",
  },
  tabBar: {
    backgroundColor: "#1A1A1A",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 69, 0, 0.2)",
  },
  indicator: {
    backgroundColor: "#FF4500",
    height: 3,
    borderRadius: 2,
  },
  tabLabel: {
    fontSize: 15,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  tabStyle: {
    width: "auto",
    paddingHorizontal: 20,
  },
});
