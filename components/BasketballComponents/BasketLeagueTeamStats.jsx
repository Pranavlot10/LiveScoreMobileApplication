import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
} from "react-native";
import { serverIP } from "@env";
import { ScrollView } from "react-native-gesture-handler";

import LeagueStatsCard from "../footballComponents/LeagueComponents/LeagueStatsCard";

const LeagueTeamStatsPageBasketball = ({
  leagueId,
  seasonId,
  onContentReady,
}) => {
  const [statsData, setStatsData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedStat, setExpandedStat] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");

  const filters = [
    "all",
    "points",
    "pointsAgainst",
    "fieldGoalsPercentage",
    "freeThrowsPercentage",
    "threePointsPercentage",
    "rebounds",
    "assists",
    "steals",
    "blocks",
    "turnovers",
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        const response = await axios.get(
          `http://${serverIP}/basketball/league/teamStats/${leagueId}/${seasonId}`
        );

        setStatsData(response?.data || []);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching basketball team stats:", error);
        setIsLoading(false);
      }
    };

    fetchData();
  }, [leagueId, seasonId]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false} style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
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
          console.log(filter);
          return (
            <TouchableOpacity
              key={filter}
              onPress={() => {
                setActiveFilter(filter);
                setExpandedStat(filter === "all" ? null : filter);
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

      {statsData.map((stat, index) => {
        const statKey = Object.keys(stat)[0];
        return (
          <LeagueStatsCard
            key={statKey}
            stat={stat}
            index={index}
            activeFilter={activeFilter}
            expandedStat={expandedStat}
            setActiveFilter={setActiveFilter}
            onToggleList={(statName) =>
              setExpandedStat(statName === expandedStat ? null : statName)
            }
            teamName={false}
          />
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    backgroundColor: "#222",
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#222",
  },
  loadingText: {
    color: "#ccc",
    fontSize: 16,
  },
});

export default LeagueTeamStatsPageBasketball;
