import { StyleSheet, View, Text, Animated, Dimensions } from "react-native";
import React, { useRef, useState, useEffect, lazy, Suspense } from "react";
import { serverIP } from "@env";
import axios from "axios";

import { TabView, TabBar } from "react-native-tab-view";
import { FlatList } from "react-native-gesture-handler";

import { COLORS } from "../constants/theme";
import NewsCardSkeleton from "../components/SkeletonPlaceholder";
import CricketMatchOverviewComponent from "../components/CricketMatchDetailsComponents/CricketMatchOverviewComponent";
import PointsTableComponent from "../components/CricketSeriesDetailsComponents/PointsTableComponent";
import SeriesStatsComponent from "../components/CricketSeriesDetailsComponents/CricketSeriesStatsComponent";

const screenWidth = Dimensions.get("window").width;

function CricketSeriesScreen({ route }) {
  const { seriesId, seriesName } = route.params;

  const [seriesData, setSeriesData] = useState(null);
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: "matches", title: "Matches" },
    ...(!seriesName.includes("tour") ? [{ key: "table", title: "Table" }] : []),
    { key: "stats", title: "Stats" },
  ]);

  const [isLoading, setIsLoading] = useState(true);

  const scrollY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const fetchSeriesData = async () => {
      try {
        const response = await axios.get(
          `http://${serverIP}/cricket/series?seriesId=${seriesId}&seriesName=${seriesName}`
        );
        setSeriesData(response?.data); // Set the data from the server response
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSeriesData();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.rootContainer}>
        <FlatList
          data={[1, 2, 3, 4, 5, 6, 7, 8]}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item }) => <NewsCardSkeleton />}
          showsVerticalScrollIndicator={false}
        />
      </View>
    );
  }

  const filteredMatches = seriesData?.data?.matchDetails.filter(
    (match) => !match.adDetail
  );

  const renderScene = ({ route }) => {
    switch (route.key) {
      case "matches":
        return <MatchesComponent />;
      case "table":
        return !seriesName.includes("tour") ? (
          <Suspense
            fallback={<Text style={styles.loadingText}>Loading Table...</Text>}
          >
            <PointsTableComponent
              seriesData={seriesData}
              seriesName={seriesName}
            />
          </Suspense>
        ) : null;
      case "stats":
        return (
          <Suspense
            fallback={<Text style={styles.loadingText}>Loading Stats...</Text>}
          >
            <SeriesStatsComponent seriesId={seriesId} seriesName={seriesName} />
          </Suspense>
        );
    }
  };

  const renderTabBar = (props) => (
    <TabBar
      {...props}
      indicatorStyle={{ backgroundColor: COLORS.text }}
      style={{
        backgroundColor: COLORS.background,
        elevation: 0,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0,
        shadowRadius: 0,
      }}
      labelStyle={{
        color: COLORS.text,
        fontWeight: "600",
        textTransform: "none",
      }}
      activeColor={COLORS.text}
      inactiveColor="#666666"
    />
  );

  function MatchComponentSelector(item) {
    const matches = item["matchDetailsMap"]?.match || []; // Get matches safely

    if (matches.length === 0) {
      return null; // If no matches, return nothing
    }

    return matches.map((match) => {
      const score = {
        hScore: match?.matchScore?.team1Score || "", // Handle missing scores
        aScore: match?.matchScore?.team2Score || "",
      };

      const matchDetails = {
        matchId: match.matchInfo.matchId,
        result: match.matchInfo.status || "No result available",
        matchType: match.matchInfo.seriesName || "Unknown Series",
        status: match.matchInfo.status,
        date:
          match.matchInfo.matchFormat === "TEST"
            ? `${new Date(Number(match.matchInfo.startDate))
                .toLocaleDateString("en-GB", { day: "2-digit" })
                .replace(" ", "-")}-${new Date(Number(match.matchInfo.endDate))
                .toLocaleDateString("en-GB", { day: "2-digit", month: "short" })
                .replace(" ", "-")}`
            : new Date(Number(match.matchInfo.startDate))
                .toLocaleDateString("en-GB", { day: "2-digit", month: "short" })
                .replace(" ", "-"),
      };

      return (
        <CricketMatchOverviewComponent
          key={match.matchInfo.matchId} // Ensure unique key for each match
          hTeam={match.matchInfo.team1}
          aTeam={match.matchInfo.team2}
          score={score}
          matchDetails={matchDetails}
          matchStatus={match.matchInfo.state}
        />
      );
    });
  }

  function MatchesComponent() {
    return (
      <View style={styles.rootContainer}>
        <FlatList
          data={filteredMatches}
          renderItem={({ item }) => MatchComponentSelector(item)}
          showsVerticalScrollIndicator={false}
        />
      </View>
    );
  }

  return (
    <TabView
      navigationState={{ index, routes }}
      renderScene={renderScene}
      renderTabBar={renderTabBar}
      onIndexChange={setIndex}
      initialLayout={{ width: screenWidth }}
    />
  );
}

export default CricketSeriesScreen;

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    borderWidth: 2,
    borderRadius: 8,
    marginHorizontal: 10,
    padding: 10,
  },
  page: {
    width: screenWidth,
    justifyContent: "flex-start",
    paddingVertical: 10,
  },
});
