import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
} from "react-native";
import { serverIP } from "@env";
import { ScrollView } from "react-native-gesture-handler";
import LeagueStatsCard from "./footballComponents/LeagueComponents/LeagueStatsCard";
import TeamPlayerStatsCard from "./TeamPlayerStatsCard";

const TeamPlayerStatsPage = ({
  sport,
  id,
  leagueId,
  seasonId,
  teamLogo,
  name,
}) => {
  const [statsData, setStatsData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedStat, setExpandedStat] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const filters =
    sport === "football"
      ? [
          "all",
          "goals",
          "assists",
          "shotsOnTarget",
          "yellowCards",
          // "redCards",
          "tackles",
          "interceptions",
          // "cleanSheet",
          // "leastConceded",
          // "mostConceded",
        ]
      : [
          "all",
          "points",
          "assists",
          "fieldGoalsPercentage",
          "freeThrowsPercentage",
          "threePointsPercentage",
          "turnovers",
          "blocks",
          "steals",
          "rebounds",
          "doubleDoubles",
        ];
  // console.log(id, leagueId, seasonId);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        const response =
          sport === "football"
            ? await axios.get(
                `http://${serverIP}/football/team/playerStats/${id}/${leagueId}/${seasonId}`
              )
            : await axios.get(
                `http://${serverIP}/basketball/team/playerStats/${id}/${leagueId}/${seasonId}`
              );

        // Update fixtures data state
        setStatsData(response?.data || []);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setIsLoading(false);
      }
    };

    fetchData();
  }, [leagueId, seasonId]);

  if (isLoading)
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );

  return (
    <ScrollView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      <View>
        {/* Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContainer}
        >
          {filters.map((filter) => {
            const title = filter
              .replace(/([A-Z])/g, " $1")
              .toUpperCase()
              .trim();
            return (
              <TouchableOpacity
                key={filter}
                onPress={() => {
                  setActiveFilter(filter);
                  if (filter === "all") {
                    setExpandedStat(null); // Collapse all when "all" is selected
                  } else {
                    setExpandedStat(filter); // Expand only the selected filter
                  }
                }}
                style={[
                  styles.filterButton,
                  activeFilter === filter && styles.activeFilterButton,
                ]}
              >
                <Text
                  style={[
                    styles.filterText,
                    activeFilter === filter && styles.activeFilterText,
                  ]}
                >
                  {title}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {statsData.map((stat, index) => {
        const statKey = Object.keys(stat)[0];
        return (
          <TeamPlayerStatsCard
            key={statKey} // Add a proper key
            stat={stat}
            index={index}
            activeFilter={activeFilter}
            expandedStat={expandedStat}
            setActiveFilter={setActiveFilter}
            onToggleList={(statName) =>
              setExpandedStat(statName === expandedStat ? null : statName)
            }
            teamName={true}
            name={name}
            teamLogo={teamLogo}
          />
        );
      })}
    </ScrollView>
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
    marginBottom: 10,
  },
  playerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#222",
    // justifyContent: "space-around",
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
});

export default TeamPlayerStatsPage;
