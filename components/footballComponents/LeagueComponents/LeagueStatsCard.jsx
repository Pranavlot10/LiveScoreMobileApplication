import React, { useState, useEffect } from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";

const LeagueStatsCard = ({
  stat,
  index,
  activeFilter,
  setActiveFilter,
  expandedStat,
  onToggleList,
  teamName,
}) => {
  function addPlayersRanks(teams, statKey) {
    // Sort teams by goalsScored in descending order
    teams.sort((a, b) => b.statistics[statKey] - a.statistics[statKey]);

    let rank = 1;
    for (let i = 0; i < teams.length; i++) {
      if (
        i > 0 &&
        teams[i].statistics[statKey] < teams[i - 1].statistics[statKey]
      ) {
        rank = i + 1; // Update rank only if goalsScored is different
      }
      teams[i].rank = rank;
    }

    return teams;
  }

  const key = Object.keys(stat)[0];
  const title = key
    .replace(/([A-Z])/g, " $1")
    .toUpperCase()
    .trim();
  const values = Object.values(stat)[0];

  const rankedValues = addPlayersRanks(values, key);

  // Show full list if this stat matches the expanded stat
  const showFullList = expandedStat === key;

  // Decide whether to show this card based on active filter
  const shouldShowCard = activeFilter === "all" || activeFilter === key;

  // If this card shouldn't be shown based on filter, return null
  if (!shouldShowCard) return null;

  const data = showFullList ? rankedValues : rankedValues.slice(0, 5);

  return (
    <View key={index} style={styles.sectionContainer}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>{title}</Text>

        {/* Only show these additional headers for team stats */}
        {!teamName && (
          <View style={styles.statHeadersContainer}>
            {key !== "averageBallPossession" && (
              <Text style={[styles.statHeaderText, { marginRight: 5 }]}>
                PER GAME
              </Text>
            )}
            <Text style={[styles.statHeaderText, { marginRight: 5 }]}>
              TOTAL
            </Text>
          </View>
        )}
      </View>

      {data.map((player, index) => {
        return teamName ? (
          <View key={`goal-${index}`} style={styles.playerRow}>
            <View style={styles.rankContainer}>
              <Text style={styles.rankText}>{player.rank}</Text>
            </View>

            <Image
              source={{ uri: player?.team?.logo }}
              style={styles.teamLogo}
            />

            <View style={styles.playerInfoContainer}>
              <Text style={styles.playerName}>{player?.player?.name}</Text>
              {teamName && (
                <Text style={styles.teamName}>{player?.team?.name}</Text>
              )}
            </View>

            <Text style={styles.statValue}>
              {key === "averageBallPossession"
                ? `${player.statistics[key].toFixed(0)}%`
                : key === "fieldGoalsPercentage"
                ? `${player.statistics[key].toFixed(0)}%`
                : key === "threePointsPercentage"
                ? `${player.statistics[key].toFixed(0)}%`
                : key === "freeThrowsPercentage"
                ? `${player.statistics[key].toFixed(0)}%`
                : player.statistics[key]}
            </Text>
          </View>
        ) : (
          <View key={`goal-${index}`} style={styles.playerRow}>
            <View style={styles.rankContainer}>
              <Text style={styles.rankText}>{player.rank}</Text>
            </View>

            <Image source={{ uri: player.team.logo }} style={styles.teamLogo} />

            <View style={styles.playerInfoContainer}>
              <Text style={styles.playerName}>{player.team.name}</Text>
            </View>

            {key !== "averageBallPossession" && (
              <Text style={[styles.statValue, { marginRight: 35 }]}>
                {(player.statistics[key] / player.statistics.matches).toFixed(
                  1
                )}
              </Text>
            )}
            <Text style={[styles.statValue, { marginRight: 10 }]}>
              {key === "averageBallPossession"
                ? `${player.statistics[key].toFixed(0)}%`
                : key === "fieldGoalsPercentage"
                ? `${player.statistics[key].toFixed(0)}%`
                : key === "threePointsPercentage"
                ? `${player.statistics[key].toFixed(0)}%`
                : key === "freeThrowsPercentage"
                ? `${player.statistics[key].toFixed(0)}%`
                : player.statistics[key]}
            </Text>
          </View>
        );
      })}

      {!showFullList && (
        <TouchableOpacity
          onPress={() => {
            onToggleList(key);
            setActiveFilter(key);
          }}
          style={styles.seeAllButton}
        >
          <Text style={styles.seeAllText}>See all</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#222",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  laligaLogo: {
    width: 30,
    height: 30,
    marginRight: 10,
    tintColor: "red",
  },
  title: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  subtitle: {
    color: "#999",
    fontSize: 14,
  },
  tabsContainer: {
    paddingHorizontal: 15,
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  tabButton: {
    paddingVertical: 15,
    marginRight: 25,
  },
  tabText: {
    color: "#999",
    fontSize: 16,
    fontWeight: "500",
  },
  activeTabText: {
    color: "orange",
    fontWeight: "bold",
  },
  filtersContainer: {
    paddingVertical: 15,
    paddingHorizontal: 10,
    flexDirection: "row",
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#444",
    marginHorizontal: 5,
  },
  activeFilterButton: {
    backgroundColor: "white",
  },
  filterText: {
    color: "#999",
    fontSize: 14,
  },
  activeFilterText: {
    color: "black",
    fontWeight: "bold",
  },
  contentContainer: {
    flex: 1,
  },
  sectionContainer: {
    marginTop: 10,
    marginHorizontal: 15,
  },
  sectionTitle: {
    color: "#999",
    fontSize: 16,
    fontWeight: "bold",
    // marginBottom: 10,
  },
  playerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#222",
  },
  rankContainer: {
    width: 25,
  },
  rankText: {
    color: "white",
    fontSize: 16,
  },
  teamLogo: {
    width: 25,
    height: 25,
    marginRight: 10,
  },
  playerInfoContainer: {
    flex: 1,
  },
  playerName: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
  teamName: {
    color: "#999",
    fontSize: 14,
  },
  statValue: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 5,
  },
  seeAllButton: {
    alignItems: "center",
    paddingVertical: 15,
  },
  seeAllText: {
    color: "#999",
    fontSize: 14,
  },
  bottomNav: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#222",
    backgroundColor: "#111",
  },
  bottomNavItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
  },
  activeBottomNavItem: {
    backgroundColor: "white",
    borderRadius: 30,
    marginVertical: 5,
    marginHorizontal: 10,
  },
  bottomNavText: {
    color: "#999",
    fontSize: 12,
    marginTop: 5,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  statHeadersContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  statHeaderText: {
    color: "#999",
    fontSize: 12,
    fontWeight: "bold",
    marginLeft: 10,
    // width: 70,
    textAlign: "center",
  },
});

export default LeagueStatsCard;
