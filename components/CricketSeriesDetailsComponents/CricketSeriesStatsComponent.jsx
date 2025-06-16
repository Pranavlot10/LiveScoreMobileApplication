import { StyleSheet, View, Text, Dimensions, Image } from "react-native";
import { FlatList, ScrollView } from "react-native-gesture-handler";
import { useEffect, useState } from "react";
import { serverIP } from "@env";
import axios from "axios";

import NewsCardSkeleton from "../SkeletonPlaceholder";
import StatCategoryCard from "./StatCategoryCard";

const screenWidth = Dimensions.get("screen").width;

export default function SeriesStatsComponent({ seriesId, seriesName }) {
  const [seriesData, setSeriesData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSeriesData = async () => {
      try {
        console.log("seriesID", seriesId);
        const response = await axios.get(
          `http://${serverIP}/cricket/series/stats?seriesId=${seriesId}&seriesName=${seriesName}`
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

  if (!seriesId) {
    return (
      <View>
        <Text>No Stats Data Available</Text>
      </View>
    );
  }

  const getHeadersForStat = (statType) => {
    const headersMap = {
      mostRuns: ["Player", "M", "R", "Avg"],
      highestScore: ["Player", "SR", "HS"],
      mostWickets: ["Player", "M", "W", "Econ"],
      bestBowling: ["Player", "BBI", "W"],
    };
    return headersMap[statType] || ["Player", "Stat"];
  };

  const getStatKeyForStat = (statType) => {
    const statKeyMap = {
      mostRuns: "R",
      highestScore: "HS",
      mostWickets: "W",
      bestBowling: "BBI",
    };
    return statKeyMap[statType] || "Stat";
  };

  return (
    <View style={styles.rootContainer}>
      {["t20StatsList", "odiStatsList", "testStatsList"].map((formatKey) => {
        // Debugging: Check if format is present
        {
          /* console.log(`Checking format: ${formatKey}`); */
        }

        const formatStats = seriesData?.statsData
          ?.map((statCategory) =>
            Object.keys(statCategory).map((statType) => {
              const data = statCategory[statType]?.[formatKey]; // Safe access

              return data ? { formatKey, statType, data } : null;
            })
          )
          .flat()
          .filter(Boolean); // Remove null values

        if (formatStats.length === 0) return null; // Skip if no data for this format

        return (
          <View key={formatKey} style={styles.formatContainer}>
            <Text style={styles.formatTitle}>
              {formatKey.replace("StatsList", "").toUpperCase()} Stats
            </Text>
            {formatStats.map(({ statType, data }, index) => (
              <StatCategoryCard
                key={`${formatKey}-${statType}-${index}`}
                values={data.values || []}
                title={data.title || "Unknown"}
                headers={getHeadersForStat(statType)}
                statKey={getStatKeyForStat(statType)}
              />
            ))}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: "#F5F5F5", // Light background for visibility
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  formatContainer: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3, // Shadow for Android
  },
  formatTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
    textAlign: "center",
  },
  table: {
    width: screenWidth - 32,
    flexDirection: "row",
    borderWidth: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  tableHeader: {
    flexDirection: "row",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#222",
  },
  image: {
    height: 25,
    width: 25,
    borderRadius: 25,
    borderWidth: 1,
  },
  headerText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "bold",
    marginRight: 10,
    textAlign: "center",
    textAlign: "center",
  },
  rowText: {
    flex: 1,
    fontSize: 14,
    textAlign: "center",
    marginRight: 15,
    lineHeight: 26,
    textAlign: "center",
  },
  formWin: {
    backgroundColor: "#06D001",
    borderRadius: 15,
    height: 25,
    width: 25,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 5,
    borderWidth: 1,
  },
  formLoss: {
    backgroundColor: "#FF2929",
    borderRadius: 15,
    height: 25,
    width: 25,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 5,
    borderWidth: 1,
  },
  formDraw: {
    backgroundColor: "#A6AEBF",
    borderRadius: 15,
    height: 25,
    width: 25,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 5,
    borderWidth: 1,
  },
  formText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
