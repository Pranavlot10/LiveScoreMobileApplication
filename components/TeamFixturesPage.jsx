import React, { useEffect, useState, useCallback, useRef } from "react";
import { View, Text, StyleSheet, Image, Dimensions } from "react-native";
import { serverIP } from "@env";
import axios from "axios";

import FootballMatchComponent from "./footballComponents/FootballMatchComponent";
import { ScrollView } from "react-native-gesture-handler";

const screenWidth = Dimensions.get("screen").width;

const TeamFixturesPage = ({ sport, teamId, onContentReady }) => {
  const [fixturesData, setFixturesData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [contentHeight, setContentHeight] = useState(0);

  // Use refs to avoid re-renders
  const page = 0;
  const contentHeightRef = useRef(0);
  const hasNotifiedReadyRef = useRef(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        const response =
          sport === "football"
            ? await axios.get(
                `http://${serverIP}/football/team/fixtures/${teamId}?page=${page}`
              )
            : await axios.get(
                `http://${serverIP}/basketball/team/fixtures/${teamId}?page=${page}`
              );

        // Update fixtures data state
        setFixturesData(response?.data || []);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setIsLoading(false);
      }
    };

    fetchData();
  }, [teamId]);

  // Separate useEffect for handling content ready notification
  useEffect(() => {
    if (
      !isLoading &&
      !hasNotifiedReadyRef.current &&
      onContentReady &&
      contentHeight > 0
    ) {
      // Only notify once data is loaded, content height is measured, and component has rendered
      hasNotifiedReadyRef.current = true;
      onContentReady();
    }
  }, [isLoading, onContentReady, contentHeight]);

  // Add an onLayout handler to measure the content height
  const onContainerLayout = useCallback((event) => {
    const { height } = event.nativeEvent.layout;
    // Only update if there's a significant height change to avoid update loops
    if (Math.abs(height - contentHeightRef.current) > 10) {
      contentHeightRef.current = height; // Update ref first
      setContentHeight(height); // Then update state (causes one render)
    }
  }, []);

  const getMatchStatus = useCallback((match) => {
    const statusCode = match?.status?.code;
    const startTimestamp = match?.startTimestamp;
    const currentPeriodStart = match?.time?.currentPeriodStartTimestamp;

    if (statusCode === 6 || statusCode === 7) {
      const currentTime = Math.floor(Date.now() / 1000);
      const minutesPlayed = Math.min(
        Math.floor((currentTime - currentPeriodStart) / 60),
        45
      );
      return statusCode === 6 ? `${minutesPlayed}'` : `${45 + minutesPlayed}'`;
    }

    if (statusCode === 100) return "FT";
    if (statusCode === 120) return "AP";
    if (statusCode === 0) {
      const date = new Date(startTimestamp * 1000);
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    return "Unknown";
  }, []);

  const renderItem = useCallback(
    (item) => {
      return (
        <FootballMatchComponent
          key={item.id}
          id={item.id}
          match={item}
          homeLogo={item?.homeTeam?.logo}
          awayLogo={item?.awayTeam?.logo}
          matchStatus={getMatchStatus(item)}
        />
      );
    },
    [getMatchStatus]
  );

  if (isLoading)
    return (
      <View style={styles.loadingContainer} onLayout={onContainerLayout}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );

  return (
    <ScrollView style={styles.container} onLayout={onContainerLayout}>
      <View>
        {fixturesData.map((item, index) => (
          <View key={index}>{renderItem(item)}</View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#333",
    padding: 10,
  },
  loadingContainer: {
    width: screenWidth,
    height: "100%", // Provide some initial height
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#333",
  },
  headerContainer: {
    paddingVertical: 10,
    marginVertical: 5,
    flexDirection: "row",
    justifyContent: "center",
    borderColor: "#DDD",
    overflow: "hidden",
  },
  headerText: {
    fontSize: 18,
    fontWeight: "500",
    color: "#DDD",
    textAlign: "center",
    marginHorizontal: 2,
  },
  vsText: {
    fontSize: 14,
    color: "#DDD",
  },
  statsContainer: {
    backgroundColor: "#333",
    padding: 16,
    borderRadius: 5,
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  statNameContainer: {
    flexDirection: "row",
  },
  statName: {
    fontSize: 18,
    color: "#DDD",
    marginBottom: 6,
    textAlign: "center",
  },
  statValue: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#DDD",
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
  logo: {
    height: 20,
    width: 20,
    marginRight: 10,
    marginLeft: 10,
    marginTop: 10,
    padding: 20,
    backgroundColor: "#DDD",
  },
  leagueContainer: {
    flexDirection: "row",
    marginBottom: 10,
  },
  line: {
    height: 1,
    backgroundColor: "#ccc",
    alignSelf: "center",
    marginVertical: 10,
    width: screenWidth,
    borderRadius: 15,
  },
  loadingText: {
    color: "#DDD",
    fontSize: 16,
    textAlign: "center",
  },
});

export default TeamFixturesPage;
