import React, { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, Image, Dimensions } from "react-native";
import { serverIP } from "@env";
import axios from "axios";

import ProgressBarComponent from "../CricketMatchDetailsComponents/ProgressbarComponent";
import useSportsStore from "../../zustand/useSportsStore"; // Import Zustand store
import FootballMatchComponent from "./FootballMatchComponent";
import { ScrollView } from "react-native-gesture-handler";

const screenWidth = Dimensions.get("screen").width;

const H2HPage = ({ matchId, currentMatch, matchInfoData }) => {
  const selectedSport = useSportsStore((state) => state.selectedSport); // Get selected sport from Zustand
  const [h2hData, setH2HData] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // console.log(matchInfoData);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        if (selectedSport === "Football") {
          const response = await axios.get(
            `http://${serverIP}/football/h2h/${matchId}`
          );

          // Update all states at once to reduce re-renders
          setH2HData(response?.data);
        }
        if (selectedSport === "Basketball") {
          const response = await axios.get(
            `http://${serverIP}/basketball/h2h/${matchId}`
          );

          // Update all states at once to reduce re-renders
          setH2HData(response?.data);
        }
        // console.log(h2hData[0]);

        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setIsLoading(false);
        // You might want to show an error message to the user here
      }
    };

    fetchData();
  }, [matchId]);

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

    if (statusCode === 40) return "OT";
    if (statusCode === 31) return "HT";
    if (statusCode === 100) return "FT";
    if (statusCode === 13) return "1Q";
    if (statusCode === 14) return "2Q";
    if (statusCode === 15) return "3Q";
    if (statusCode === 16) return "4Q";
    if (statusCode === 110) return "AET";
    if (statusCode === 70) return "Canc.";
    if (statusCode === 60) return "PST";
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
    const [tournamentId, tournamentMatches] = item;
    console.log(tournamentMatches.matches[0].tournament);

    return (
      <View>
        <View style={styles.leagueContainer}>
          <View style={{ marginRight: 10, marginLeft: 10, marginTop: 10 }}>
            <Image
              style={styles.logo}
              source={{
                uri: tournamentMatches.matches[0].tournament.uniqueTournament
                  .logo,
              }}
              resizeMode="contain"
              // defaultSource={require("../assets/placeholder-logo.png")} // Optional
              onError={(error) =>
                console.log("Error loading logo:", error.nativeEvent.error)
              }
            />
          </View>
          <View>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "bold",
                marginTop: 10,
                color: "#DDD",
              }}
            >
              {tournamentMatches.name}
            </Text>
            <Text style={{ fontSize: 14, color: "#DDD" }}>
              {tournamentMatches.matches[0].tournament.category.country.name}
            </Text>
          </View>
        </View>
        {tournamentMatches.matches.map((match) => {
          const homeLogo =
            match.homeTeam.id === currentMatch.homeTeam.id
              ? currentMatch?.homeTeam?.logo
              : currentMatch?.awayTeam?.logo;
          const awayLogo =
            match.awayTeam.id === currentMatch.awayTeam.id
              ? currentMatch?.awayTeam?.logo
              : currentMatch?.homeTeam?.logo;

          return (
            <FootballMatchComponent
              key={match.id}
              id={match.id}
              match={match}
              homeLogo={homeLogo}
              awayLogo={awayLogo}
              matchStatus={getMatchStatus(match)}
            />
          );
        })}
      </View>
    );
  }, []);

  if (isLoading) return <Text style={styles.loadingText}>Loading...</Text>;

  const groupMatchesByTournament = (matches) => {
    // console.log(matches[0], "matches");

    return matches.reduce((acc, match) => {
      // console.log(match.season);
      if (match.status.code !== 60 && match.winnerCode) {
        const tournamentKey = match.season
          ? match.season.name
          : match.tournament.name; // Use unique ID instead of name

        if (!acc[tournamentKey]) {
          acc[tournamentKey] = {
            name: match.season ? match.season.name : match.tournament.name,
            // country: match.tournament.country?.name, // Optional, if available
            matches: [],
          };
        }

        acc[tournamentKey].matches.push(match);
      }
      return acc;
    }, {});
  };

  function calculateOverallWins(data) {
    let overallHomeTeamWins = 0;
    let overallAwayTeamWins = 0;
    let overallDraws = 0;
    data.map((match) =>
      match.winnerCode === 1
        ? match.homeTeam.id === currentMatch.homeTeam.id
          ? overallHomeTeamWins++
          : overallAwayTeamWins++
        : match.winnerCode === 2
        ? match.awayTeam.id === currentMatch.awayTeam.id
          ? overallAwayTeamWins++
          : overallHomeTeamWins++
        : match.winnerCode === 3
        ? overallDraws++
        : ""
    );
    return { overallHomeTeamWins, overallAwayTeamWins, overallDraws };
  }

  function calculateWins(data) {
    let homeTeamWins = 0;
    let awayTeamWins = 0;
    let Draws = 0;
    let lp = 0;
    let hp = 5;

    // console.log(data[0].winnerCode);

    !data[0].winnerCode && lp++, hp++;

    data
      .slice(lp, hp)
      .map((match) =>
        match.winnerCode === 1
          ? match.homeTeam.id === currentMatch.homeTeam.id
            ? homeTeamWins++
            : awayTeamWins++
          : match.winnerCode === 2
          ? match.awayTeam.id === currentMatch.awayTeam.id
            ? awayTeamWins++
            : homeTeamWins++
          : match.winnerCode === 3
          ? Draws++
          : ""
      );
    return { homeTeamWins, awayTeamWins, Draws };
  }

  const { overallHomeTeamWins, overallAwayTeamWins, overallDraws } =
    calculateOverallWins(h2hData);

  const { homeTeamWins, awayTeamWins, Draws } = calculateWins(h2hData);

  const data = [
    {
      value: homeTeamWins,
      color: "#8FD14F",
    }, // Team A Wins
    { value: Draws, color: "#DDD" }, // Draws
    {
      value: awayTeamWins,
      color: "#836FFF",
    }, // Team B Wins
  ];

  const overallData = [
    {
      value: overallHomeTeamWins,
      color: "#8FD14F",
    }, // Team A Wins
    { value: overallDraws, color: "#DDD" }, // Draws
    {
      value: overallAwayTeamWins,
      color: "#836FFF",
    }, // Team B Wins
  ];
  const groupedMatches = groupMatchesByTournament(h2hData);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.line} />
        <Text style={styles.headerText}>H2H</Text>
        <View style={styles.line} />
      </View>
      <View style={styles.statsContainer}>
        <Text style={styles.statName}>Overall</Text>
        <View style={styles.statRow}>
          <View style={styles.statNameContainer}>
            <Text style={styles.statValue}>{`${overallHomeTeamWins}`}</Text>
            <Text style={styles.vsText}>{` Wins`}</Text>
          </View>
          <View style={styles.statNameContainer}>
            <Text style={styles.statValue}>{`${overallDraws}`}</Text>
            <Text style={styles.vsText}>{` Wins`}</Text>
          </View>
          <View style={styles.statNameContainer}>
            <Text style={styles.statValue}>{`${overallAwayTeamWins}`}</Text>
            <Text style={styles.vsText}>{` Wins`}</Text>
          </View>
        </View>
        <ProgressBarComponent segments={overallData} />
      </View>
      <View style={styles.statsContainer}>
        <Text style={styles.statName}>Last 5 Matches</Text>
        <View style={styles.statRow}>
          <View style={styles.statNameContainer}>
            <Text style={styles.statValue}>{`${homeTeamWins}`}</Text>
            <Text style={styles.vsText}>{` Wins`}</Text>
          </View>
          <View style={styles.statNameContainer}>
            <Text style={styles.statValue}>{`${Draws}`}</Text>
            <Text style={styles.vsText}>{` Wins`}</Text>
          </View>
          <View style={styles.statNameContainer}>
            <Text style={styles.statValue}>{`${awayTeamWins}`}</Text>
            <Text style={styles.vsText}>{` Wins`}</Text>
          </View>
        </View>
        <ProgressBarComponent segments={data} />
      </View>
      <View>
        <View style={styles.headerContainer}>
          <View style={styles.line} />
          <Text style={styles.headerText}>Previous Meetings</Text>
          <View style={styles.line} />
        </View>
        {Object.entries(groupedMatches).map((item, index) => (
          <View key={index}>{renderItem(item)}</View>
        ))}
      </View>
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
    height: 30,
    width: undefined,
    aspectRatio: 1, // Adjust based on the NBA logo's natural aspect ratio
  },
  leagueContainer: {
    flexDirection: "row",
    alignItems: "center",
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

export default H2HPage;
