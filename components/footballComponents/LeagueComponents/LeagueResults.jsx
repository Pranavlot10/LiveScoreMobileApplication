import React, { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, Image, Dimensions } from "react-native";
import { serverIP } from "@env";
import axios from "axios";

import FootballMatchComponent from "../FootballMatchComponent";
import { ScrollView } from "react-native-gesture-handler";

const screenWidth = Dimensions.get("screen").width;

const LeagueResults = ({ leagueId, seasonId }) => {
  const [resultsData, setResultsData] = useState({});
  let page = 0;
  const [isLoading, setIsLoading] = useState(true);

  // console.log(matchId);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        const response = await axios.get(
          `http://${serverIP}/football/league/results/${leagueId}/${seasonId}?page=${page}`
        );

        // Update all states at once to reduce re-renders
        setResultsData(response?.data);
        // console.log(h2hData[0]);

        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setIsLoading(false);
        // You might want to show an error message to the user here
      }
    };

    fetchData();
  }, [leagueId, seasonId]);

  const getMatchStatus = (match) => {
    const statusCode = match?.status?.code;
    const startTimestamp = match?.startTimestamp;
    const currentPeriodStart = match?.time?.currentPeriodStartTimestamp;

    if (statusCode === 6 || statusCode === 7) {
      const currentTime = Math.floor(Date.now() / 1000);
      const minutesPlayed = Math.min(
        Math.floor((currentTime - currentPeriodStart) / 60),
        45
      );
      return statusCode === 6 ? `${minutesPlayed}’` : `${45 + minutesPlayed}’`;
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
  };

  const renderItem = useCallback((item) => {
    // console.log(
    //   tournamentMatches.matches[0].tournament.uniqueTournament.id,
    //   tournamentMatches.matches[0].tournament.uniqueTournament.name
    // );

    return (
      <View>
        <FootballMatchComponent
          key={item.id}
          id={item.id}
          match={item}
          homeLogo={item?.homeTeam?.logo}
          awayLogo={item?.awayTeam?.logo}
          matchStatus={getMatchStatus(item)}
        />
      </View>
    );
  }, []);

  if (isLoading) return <Text style={styles.loadingText}>Loading...</Text>;

  return (
    <ScrollView style={styles.container}>
      {resultsData.map((item, index) => (
        <View key={index}>{renderItem(item)}</View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#333",
    padding: 10,
  },
  headerContainer: {
    paddingVertical: 10,
    marginVertical: 5,
    flexDirection: "row",
    justifyContent: "center",
    // borderWidth: 1,
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
    // width: 60,
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
    // borderWidth: 1,
    // borderColor: "white",
  },
  leagueContainer: {
    flexDirection: "row",
    marginBottom: 10,
  },
  line: {
    height: 1,
    backgroundColor: "#ccc", // Light grey
    alignSelf: "center", // Center it
    marginVertical: 10,
    width: screenWidth,
    borderRadius: 15,
  },
});

export default LeagueResults;
