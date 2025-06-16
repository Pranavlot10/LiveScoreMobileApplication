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
import { COLORS } from "../constants/theme";
import { ScrollView } from "react-native-gesture-handler";
import LeagueStatsCard from "./footballComponents/LeagueComponents/LeagueStatsCard";
import TeamPlayerStatsCard from "./TeamPlayerStatsCard";

const TeamSquadPage = ({ sport, id, leagueId, seasonId, teamLogo, name }) => {
  const [squadData, setSquadData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  //   console.log(id, leagueId, seasonId);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        const response =
          sport === "football"
            ? await axios.get(`http://${serverIP}/football/team/squad/${id}`)
            : await axios.get(`http://${serverIP}/basketball/team/squad/${id}`);

        // Update fixtures data state
        setSquadData(response?.data || []);
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
      {Object.keys(squadData).map((key, index) => {
        return (
          <View key={index} style={styles.sectionContainer}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>{key.toUpperCase()}</Text>
            </View>

            {squadData[key].map((player, index) => {
              return (
                <View key={`goal-${index}`} style={styles.playerRow}>
                  <View style={styles.logoContainer}>
                    <View style={styles.placeholderLogo}>
                      <Text style={styles.placeholderText}>
                        {player?.jerseyNumber}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.playerInfoContainer}>
                    <Text style={styles.playerName}>{player?.name}</Text>
                    <Text style={styles.teamName}>{player?.country?.name}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#222",
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
    color: "#AAA",
    fontSize: 14,
  },
  logoContainer: {
    width: 42,
    height: 42,
    borderWidth: 2,
    borderRadius: 21,
    // backgroundColor: "#fff",
    borderColor: COLORS.text,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    overflow: "hidden",
  },
  placeholderText: {
    color: COLORS.text,
    // justifyContent: "center",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default TeamSquadPage;
