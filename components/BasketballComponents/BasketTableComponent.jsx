import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { serverIP } from "@env";
import axios from "axios";
import { ScrollView } from "react-native-gesture-handler";

const screenWidth = Dimensions.get("screen").width;

const BasketTableComponent = ({ leagueId, seasonId }) => {
  const [tableData, setTableData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("");

  // Keep the original fixed columns
  const scrollableColumns = [
    { id: "matches", label: "P" },
    { id: "wins", label: "W" },
    { id: "draws", label: "D" },
    { id: "losses", label: "L" },
    { id: "gamesBehind", label: "GB" },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(
          `http://${serverIP}/basketball/table/${leagueId}/${seasonId}`
        );

        // Process the response data
        const data = response?.data || [];
        let processedData = [];

        // Handle both array and object response structures
        if (Array.isArray(data)) {
          processedData = data;
        } else if (typeof data === "object") {
          // If it's a single table object, convert to array format
          processedData = [data];
        }

        if (processedData.length > 0) {
          // Set the active filter to the first group by default
          setActiveFilter(processedData[0].name || "Standings");
        }

        setTableData(processedData);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setIsLoading(false);
      }
    };

    fetchData();
  }, [leagueId, seasonId]);

  // Function to get table rows safely
  const getTableRows = (table) => {
    if (!table) return [];

    // Handle different data structures
    if (Array.isArray(table.rows)) {
      return table.rows;
    } else if (typeof table.rows === "object") {
      return Object.values(table.rows);
    }

    return [];
  };

  // Function to safely get team data
  const getTeamData = (item) => {
    if (!item) return { name: "Unknown", logo: null };

    // If team property exists
    if (item.team) {
      return {
        name: item.team.name || "Unknown",
        logo: item.team.logo || null,
      };
    }

    // If direct properties exist on the item
    return {
      name: item.name || item.teamName || "Unknown",
      logo: item.logo || item.teamLogo || null,
    };
  };

  // Function to safely get position
  const getPosition = (item, index) => {
    if (item.position !== undefined) return item.position;
    if (item.rank !== undefined) return item.rank;
    if (item.stagePosition !== undefined) return item.stagePosition;
    return index + 1;
  };

  // Function to safely get cell value
  const getCellValue = (item, columnId) => {
    if (item[columnId] !== undefined) {
      return item[columnId].toString();
    }
    return "-";
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFF" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!tableData || tableData.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>No table data available</Text>
      </View>
    );
  }

  // Get all unique group names for filters
  const filters = tableData.map((table) => table.name || "Standings");
  const activeTableIndex = Math.max(
    0,
    filters.findIndex((name) => name === activeFilter)
  );
  const activeTable = tableData[activeTableIndex];
  const tableRows = getTableRows(activeTable);

  return (
    <ScrollView showsVerticalScrollIndicator={false} style={styles.container}>
      {/* Only show filters if there's more than one table */}
      {filters.length > 1 && (
        <View style={{ marginBottom: 10 }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersContainer}
          >
            {filters.map((filter) => {
              const title = filter ? filter.toUpperCase().trim() : "STANDINGS";
              return (
                <TouchableOpacity
                  key={filter}
                  onPress={() => setActiveFilter(filter)}
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
      )}

      <View style={styles.tableContainer}>
        {/* Fixed columns (position and team) */}
        <View style={styles.fixedColumnsContainer}>
          {/* Fixed header */}
          <View style={styles.headerRow}>
            <Text style={[styles.headerCell, styles.positionCell]}>#</Text>
            <Text style={[styles.headerCell, styles.teamCell]}>Team</Text>
          </View>

          {/* Fixed team data */}
          {tableRows.map((item, index) => {
            const teamData = getTeamData(item);
            const position = getPosition(item, index);

            return (
              <View key={`team-${index}-${position}`} style={styles.row}>
                <Text
                  style={[
                    styles.cell,
                    styles.positionCell,
                    getPositionStyle(position, tableRows.length, activeTable),
                  ]}
                >
                  {position}
                </Text>
                <View style={styles.teamCellContainer}>
                  {teamData.logo ? (
                    <Image
                      source={{ uri: teamData.logo }}
                      style={styles.teamLogo}
                    />
                  ) : (
                    <View style={styles.teamLogoPlaceholder}>
                      <Text style={styles.teamLogoText}>
                        {teamData.name.charAt(0)}
                      </Text>
                    </View>
                  )}
                  <Text style={styles.teamName} numberOfLines={1}>
                    {teamData.name}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Scrollable columns - Keeping the original columns */}
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
            {tableRows.map((item, index) => (
              <View
                key={`data-${index}-${getPosition(item, index)}`}
                style={styles.row}
              >
                {scrollableColumns.map((column) => (
                  <Text
                    key={column.id}
                    style={[
                      styles.cell,
                      styles.dataCell,
                      column.id === "points" && styles.pointsCell,
                    ]}
                  >
                    {getCellValue(item, column.id)}
                  </Text>
                ))}
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    </ScrollView>
  );
};

// Helper function to determine position styling based on league context
const getPositionStyle = (position, totalTeams, tableData) => {
  // Default styling for generic leagues
  if (!tableData || !tableData.type) {
    // Generic approach: highlight top 25% and bottom 25%
    if (position <= Math.ceil(totalTeams * 0.25)) {
      return styles.topTeam;
    } else if (position > Math.floor(totalTeams * 0.75)) {
      return styles.bottomTeam;
    }
    return {};
  }

  // League-specific styling logic (you can customize this)
  const leagueName = tableData.tournament?.name || "";

  if (leagueName.includes("BBL") || leagueName.includes("Germany")) {
    // German BBL - top 8 usually qualify for playoffs
    if (position <= 8) return styles.topTeam;
    // Bottom teams
    if (position > totalTeams - 2) return styles.bottomTeam;
  } else {
    // Default for other leagues
    if (position <= 4) return styles.topTeam;
    if (position > totalTeams - 3) return styles.bottomTeam;
  }

  return {};
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#1A1A1A",
    padding: 12,
    borderRadius: 8,
    width: screenWidth,
  },
  loadingContainer: {
    width: screenWidth,
    padding: 40,
    backgroundColor: "#1A1A1A",
    justifyContent: "center",
    alignItems: "center",
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
    height: 44,
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
    width: 180,
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
    color: "#3B82F6", // blue for playoff/qualification spots
  },
  bottomTeam: {
    color: "#EF4444", // red for relegation/danger spots
  },
  loadingText: {
    color: "white",
    fontSize: 16,
    textAlign: "center",
  },
  filtersContainer: {
    paddingVertical: 15,
    flexDirection: "row",
    gap: 8,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#444",
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
  tieBreakingRule: {
    color: "#999",
    fontSize: 12,
    marginTop: 10,
    fontStyle: "italic",
  },
});

export default BasketTableComponent;
