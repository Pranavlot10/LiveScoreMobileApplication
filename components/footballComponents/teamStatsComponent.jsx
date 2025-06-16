import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import axios from "axios";
import { serverIP } from "@env";

import useSportsStore from "../../zustand/useSportsStore"; // Import Zustand store
import StatBar from "./StatsBarComponent";

const TeamStatsPage = ({ matchId, matchInfoData }) => {
  const selectedSport = useSportsStore((state) => state.selectedSport); // Get selected sport from Zustand
  const [statsData, setStatsData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("ALL");

  console.log(matchId, selectedSport);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        if (selectedSport === "Football") {
          const response = await axios.get(
            `http://${serverIP}/football/statistics/${matchId}`
          );
          setStatsData(response?.data?.statsData?.statistics || {});
          console.log("foot", response?.data?.statsData);
        }
        if (selectedSport === "Basketball") {
          const response = await axios.get(
            `http://${serverIP}/basketball/statistics/${matchId}`
          );
          setStatsData(response?.data?.statsData?.statistics || {});
          console.log(response?.data?.statsData);
        }

        // Update all states at once to reduce re-renders

        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setIsLoading(false);
        // You might want to show an error message to the user here
      }
    };

    fetchData();
  }, [matchId]);

  if (isLoading) return <Text style={styles.loadingText}>Loading...</Text>;

  // statsData[0].groups.map((group) => console.log(group));

  console.log(statsData);

  if (Object.keys(statsData).length === 0 || !statsData) {
    return (
      <View>
        <Text
          style={{
            color: "#DDD",
            fontSize: 18,
            fontWeight: "bold",
            textAlign: "center",
            paddingTop: 150,
          }}
        >
          No stats
        </Text>
      </View>
    );
  }

  const filters = statsData?.map((group) => group.period);
  console.log(filters);
  // console.log(statsData[filters.indexOf(activeFilter)]);
  // console.log(activeFilter);

  return (
    <ScrollView style={styles.container}>
      <View>
        {/* Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContainer}
        >
          {filters.map((filter) => {
            const title = filter.toUpperCase().trim();
            return (
              <TouchableOpacity
                key={filter}
                onPress={() => {
                  setActiveFilter(filter);
                  // if (filter === "all") {
                  //   setExpandedStat(null); // Collapse all when "all" is selected
                  // } else {
                  //   setExpandedStat(filter); // Expand only the selected filter
                  // }
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
      {statsData[filters.indexOf(activeFilter)].groups[0].statisticsItems.map(
        (stat, index) => (
          <StatBar
            key={index}
            label={stat.name}
            leftValue={stat.homeValue}
            rightValue={stat.awayValue}
            leftDominant={stat.compareCode === 1}
            rightDominant={stat.compareCode === 2}
          />
        )
      )}
      {statsData[filters.indexOf(activeFilter)].groups[1].statisticsItems.map(
        (stat, index) => (
          <StatBar
            key={index}
            label={stat.name}
            leftValue={stat.homeValue}
            rightValue={stat.awayValue}
            leftDominant={stat.compareCode === 1}
            rightDominant={stat.compareCode === 2}
          />
        )
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#333",
    padding: 10,
    // paddingBottom: 500,
    // marginBottom: 10,
  },

  teamName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    width: "40%",
  },
  vsText: {
    fontSize: 14,
    color: "#888",
    width: "20%",
    textAlign: "center",
  },
  statsContainer: {
    padding: 16,
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  statNameContainer: {
    flex: 1,
    marginHorizontal: 10,
  },
  statName: {
    fontSize: 18,
    color: "#666",
    marginBottom: 6,
    textAlign: "center",
  },
  statValue: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#333",
    width: 40,
    textAlign: "center",
  },
  progressBarContainer: {
    width: "100%",
  },
  progressBackground: {
    height: 8,
    backgroundColor: "#e0e0e0",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: 4,
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
});

export default TeamStatsPage;
