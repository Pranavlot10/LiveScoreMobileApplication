import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Image, Dimensions } from "react-native";
import { serverIP } from "@env";
import axios from "axios";
import { ScrollView } from "react-native-gesture-handler";

const screenWidth = Dimensions.get("screen").width;

const TableComponent = ({ leagueId, seasonId }) => {
  const [tableData, setTableData] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(
          `http://${serverIP}/football/table/${leagueId}/${seasonId}`
        );
        setTableData(response?.data);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
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

  if (Object.keys(tableData).length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>No Table for Cups</Text>
      </View>
    );
  }

  const teamsData = tableData[0].rows;

  const scrollableColumns = [
    { id: "matches", label: "P" },
    { id: "wins", label: "W" },
    { id: "draws", label: "D" },
    { id: "losses", label: "L" },
    { id: "points", label: "PTS" },
    { id: "scoresFor", label: "GF" },
    { id: "scoresAgainst", label: "GA" },
    { id: "scoreDiffFormatted", label: "GD" },
  ];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{tableData[0].name}</Text>

      <View style={styles.tableContainer}>
        {/* Fixed columns (position and team) */}
        <View style={styles.fixedColumnsContainer}>
          {/* Fixed header */}
          <View style={styles.headerRow}>
            <Text style={[styles.headerCell, styles.positionCell]}>#</Text>
            <Text style={[styles.headerCell, styles.teamCell]}>Team</Text>
          </View>

          {/* Fixed team data */}
          {teamsData.map((item) => (
            <View key={item.position} style={styles.row}>
              <Text
                style={[
                  styles.cell,
                  styles.positionCell,
                  item.position <= 4
                    ? styles.topTeam
                    : item.position >= 18
                    ? styles.bottomTeam
                    : {},
                ]}
              >
                {item.position}
              </Text>
              <View style={styles.teamCellContainer}>
                {item.team.logo ? (
                  <Image
                    source={{ uri: item.team.logo }}
                    style={styles.teamLogo}
                  />
                ) : (
                  <View style={styles.teamLogoPlaceholder}>
                    <Text style={styles.teamLogoText}>
                      {item.team.name.charAt(0)}
                    </Text>
                  </View>
                )}
                <Text style={styles.teamName} numberOfLines={1}>
                  {item.team.name}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Scrollable columns */}
        <ScrollView horizontal={true} showsHorizontalScrollIndicator={true}>
          <View>
            {/* Scrollable header */}
            <View style={styles.headerRow}>
              {scrollableColumns.map((column) => (
                <Text
                  key={column.id}
                  style={[styles.headerCell, styles.dataCell]}
                >
                  {column.label}
                </Text>
              ))}
            </View>

            {/* Scrollable team data */}
            {teamsData.map((item) => (
              <View key={item.position} style={styles.row}>
                <Text style={[styles.cell, styles.dataCell]}>
                  {item.matches}
                </Text>
                <Text style={[styles.cell, styles.dataCell]}>{item.wins}</Text>
                <Text style={[styles.cell, styles.dataCell]}>{item.draws}</Text>
                <Text style={[styles.cell, styles.dataCell]}>
                  {item.losses}
                </Text>
                <Text style={[styles.cell, styles.dataCell, styles.pointsCell]}>
                  {item.points}
                </Text>
                <Text style={[styles.cell, styles.dataCell]}>
                  {item.scoresFor}
                </Text>
                <Text style={[styles.cell, styles.dataCell]}>
                  {item.scoresAgainst}
                </Text>
                <Text style={[styles.cell, styles.dataCell]}>
                  {item.scoreDiffFormatted}
                </Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#1A1A1A",
    padding: 12,
    borderRadius: 8,
    width: screenWidth,
    // marginBottom: 50,
  },
  loadingContainer: {
    width: screenWidth,
    padding: 40,
    backgroundColor: "#1A1A1A",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    marginBottom: 12,
  },
  tableContainer: {
    flexDirection: "row",
  },
  fixedColumnsContainer: {
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    zIndex: 1,
    backgroundColor: "#1A1A1A",
  },
  headerRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#333",
    paddingBottom: 8,
  },
  headerCell: {
    color: "#AAA",
    fontSize: 14,
    fontWeight: "500",
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#333",
    paddingVertical: 10,
    height: 44, // Fixed height for all rows
    alignItems: "center",
  },
  cell: {
    color: "white",
    fontSize: 14,
  },
  positionCell: {
    width: 30,
    textAlign: "center",
  },
  teamCell: {
    width: 150,
  },
  teamCellContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: 150,
    overflow: "hidden",
    paddingRight: 5,
  },
  teamLogo: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  teamLogoPlaceholder: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
    backgroundColor: "#DDD",
  },
  teamLogoText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#333",
  },
  teamName: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
  },
  dataCell: {
    width: 40,
    textAlign: "center",
  },
  pointsCell: {
    fontWeight: "bold",
  },
  topTeam: {
    color: "#3B82F6", // blue
  },
  bottomTeam: {
    color: "#EF4444", // red
  },
  loadingText: {
    color: "white",
    fontSize: 16,
    textAlign: "center",
  },
});

export default TableComponent;
