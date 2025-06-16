// PlayerStatsModal.js
import React, { useState, useEffect } from "react";
import {
  View,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Text,
  ScrollView,
} from "react-native";
import { serverIP } from "@env";
import axios from "axios";

const PlayerStatsModal = ({
  visible,
  onClose,
  player,
  matchId,
  goalScorers,
  yellowCardIncidents,
  redCardIncidents,
  subOutIncidents,
}) => {
  const [playerStats, setPlayerStats] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch player stats when the modal is opened and a player is selected
  useEffect(() => {
    if (visible && player) {
      const fetchPlayerStats = async () => {
        try {
          setLoading(true);
          const response = await axios.get(
            `http://${serverIP}/football/player/statistics/${matchId}/${player.player.id}`
          );
          setPlayerStats(response?.data?.statsData);
        } catch (error) {
          console.error("Error fetching player stats:", error);
          setPlayerStats(null);
        } finally {
          setLoading(false);
        }
      };
      fetchPlayerStats();
    }
  }, [visible, player]); // Run when modal visibility or player changes

  if (!player) return null;

  if (loading) {
    return <Text style={styles.loadingText}>Loading...</Text>;
  }

  // console.log(playerStats);
  console.log(player);

  const playerName = player.player.name || "Unknown";
  const jerseyNumber = player.jerseyNumber || "?";
  const position = player.player.position || "N/A";
  const teamName = playerStats?.team?.name || "Unknown Team";

  const goals = goalScorers.filter((scorer) => scorer === playerName).length;
  const yellowCards = yellowCardIncidents.includes(playerName) ? 1 : 0;
  const redCards = redCardIncidents.includes(playerName) ? 1 : 0;
  const substituted = subOutIncidents.includes(playerName);

  const stats = playerStats?.statistics || {};

  // console.log(matchId, player.player.id);
  console.log(playerStats?.team?.teamColors?.primary);

  return (
    <Modal
      animationType="slide"
      transparent={false} // Full-screen modal
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalContent}>
        {/* Header */}
        <View
          style={[
            styles.header,
            { backgroundColor: playerStats?.team?.teamColors?.primary },
          ]}
        >
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => {
              console.log("Close button pressed");
              onClose();
            }}
          >
            <Text style={styles.closeButtonText}>X</Text>
          </TouchableOpacity>
          <Text
            style={[
              styles.headerText,
              { color: playerStats?.team?.teamColors?.secondary },
            ]}
          >
            {playerName}
          </Text>
          <View style={styles.playerInfo}>
            <Text
              style={[
                styles.playerInfoText,
                { color: playerStats?.team?.teamColors?.secondary },
              ]}
            >
              #{jerseyNumber} • {position} • {teamName}
            </Text>
          </View>
        </View>

        {/* Body */}
        <ScrollView style={styles.body}>
          {playerStats ? (
            <>
              {/* Stats Overview */}
              <Text style={styles.sectionTitle}>STATS OVERVIEW</Text>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Minutes played</Text>
                <Text style={styles.statValue}>
                  {stats.minutesPlayed || 0}'
                </Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Goals</Text>
                <Text style={styles.statValue}>{goals}</Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Assists</Text>
                <Text style={styles.statValue}>{stats.goalAssist || 0}</Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Pass success rate</Text>
                <Text style={styles.statValue}>
                  {stats.accuratePass && stats.totalPass
                    ? `${((stats.accuratePass / stats.totalPass) * 100).toFixed(
                        1
                      )}%`
                    : "0%"}
                </Text>
              </View>

              {/* Attacking */}
              <Text style={styles.sectionTitle}>ATTACKING</Text>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Shots on target</Text>
                <Text style={styles.statValue}>
                  {stats.onTargetScoringAttempt || 0}
                </Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Shots off target</Text>
                <Text style={styles.statValue}>{stats.totalContest || 0}</Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Offsides</Text>
                <Text style={styles.statValue}>0</Text>
                {/* Not in sample data */}
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Was fouled</Text>
                <Text style={styles.statValue}>{stats.wasFouled || 0}</Text>
              </View>

              {/* Passing */}
              <Text style={styles.sectionTitle}>PASSING</Text>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Total passes</Text>
                <Text style={styles.statValue}>{stats.totalPass || 0}</Text>
              </View>

              {/* Additional Stats (Optional) */}
              <Text style={styles.sectionTitle}>DEFENSE</Text>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Tackles</Text>
                <Text style={styles.statValue}>{stats.totalTackle || 0}</Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Duels won</Text>
                <Text style={styles.statValue}>{stats.duelWon || 0}</Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Duels lost</Text>
                <Text style={styles.statValue}>{stats.duelLost || 0}</Text>
              </View>
            </>
          ) : (
            <Text style={styles.errorText}>Failed to load stats</Text>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContent: {
    flex: 1,
    backgroundColor: "#1A1A1A", // Dark background
  },
  header: {
    // backgroundColor: "#CC0000", // Red background for header
    padding: 20,
    paddingTop: 40, // Extra padding for status bar
    position: "relative",
  },
  closeButton: {
    position: "absolute",
    top: 40,
    left: 20,
  },
  closeButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
  },
  playerInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  playerInfoText: {
    color: "white",
    fontSize: 16,
  },
  body: {
    padding: 20,
  },
  sectionTitle: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    textTransform: "uppercase",
    marginTop: 15,
    marginBottom: 10,
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 5,
  },
  statLabel: {
    color: "white",
    fontSize: 16,
  },
  statValue: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  loadingText: {
    color: "white",
    fontSize: 18,
    textAlign: "center",
  },
  errorText: {
    color: "red",
    fontSize: 18,
    textAlign: "center",
  },
});

export default PlayerStatsModal;
