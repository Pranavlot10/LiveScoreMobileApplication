import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { serverIP } from "@env";
import axios from "axios";

const screenWidth = Dimensions.get("screen").width;

const CricketOverHistoryComponent = ({ matchId }) => {
  const [oversData, setOversData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchingMore, setFetchingMore] = useState(false);

  console.log(matchId);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Replace with your actual API endpoint
        const response = await axios.get(
          `http://${serverIP}/cricket/overHistory/${matchId}`
        );
        setOversData(response.data.matchOverHistory?.overSummaryList);
        // console.log(response.data.matchOverHistory); // Assuming API returns an "overs" array
      } catch (error) {
        console.error("Error fetching match data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [matchId]);

  const fetchMoreCommentary = async () => {
    if (oversData.length === 0) return;

    setFetchingMore(true);

    // Get the last element of the commentary list
    const lastCommentary = oversData[oversData.length - 1];
    const lastTimestamp = Number(lastCommentary?.timestamp) || "";
    const lastInningsId = lastCommentary?.inningsId || "";

    console.log(lastInningsId, lastTimestamp);

    try {
      const response = await axios.get(
        `http://${serverIP}/cricket/more-overHistory/${matchId}`,
        {
          params: { tms: lastTimestamp, iid: lastInningsId },
        }
      );

      // Append new data to the existing commentary list
      setOversData((prev) => {
        const existingCommentary = Array.isArray(prev) ? prev : [];

        console.log(
          Array.isArray(response?.data?.matchOverHistory?.overSepList?.overSep)
        );

        const newCommentary = Array.isArray(
          response?.data?.matchOverHistory?.overSepList?.overSep
        )
          ? response?.data?.matchOverHistory?.overSepList?.overSep
          : [];
        if (newCommentary.length === 0) {
          existingCommentary.pop();
        }
        return [...existingCommentary, ...newCommentary];
      });
    } catch (err) {
      console.error("Error fetching more commentary:", err.toJSON());
    } finally {
      setFetchingMore(false);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.overContainer}>
      <View style={styles.overSubHeader}>
        <Text style={styles.overTitle}>
          Ov. {Math.floor(item.overNum) + 1}{" "}
          <Text style={styles.bowlerName}>{item.bowlNames[0]}</Text>
        </Text>
        <Text style={styles.overDetails}>
          {item.runs} runs | {item.wickets} wicket
          {item.wickets !== 1 ? "s" : ""} | {item.score}/{item.wickets}
        </Text>
      </View>
      {/* <Text style={styles.crrText}>CRR: {item.crr}</Text> */}

      <View style={styles.ballsContainer}>
        {item.o_summary
          .trim()
          .split(" ")
          .map((ball, index) => (
            <Text key={index} style={[styles.ball, getBallStyle(ball)]}>
              {ball}
            </Text>
          ))}
      </View>
    </View>
  );

  if (loading) {
    return (
      <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />
    );
  }
  // console.log(matchId, oversData);

  return (
    <View style={styles.container}>
      <FlatList
        data={oversData}
        renderItem={renderItem}
        keyExtractor={(item) => `${item.inningsId}${item.overNum}}`}
        contentContainerStyle={styles.listContainer}
      />
      {/* Button at the Bottom */}
      <TouchableOpacity
        style={styles.button}
        onPress={fetchMoreCommentary}
        disabled={fetchingMore}
      >
        {fetchingMore ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.buttonText}>Fetch More Commentary</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const getBallStyle = (ball) => {
  if (ball === "W") return styles.wicket;
  if (ball === "4") return styles.four;
  if (ball === "6") return styles.four;
  if (ball === "Wd") return styles.wide;
  return styles.defaultBall;
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9f9f9" },
  listContainer: {
    padding: 10,
    backgroundColor: "#fff", // Light blue-gray background
  },
  overContainer: {
    backgroundColor: "#d0d8e0",
    padding: 12,
    marginBottom: 10,
    borderRadius: 8,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
  },
  overSubHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  overTitle: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#333",
  },
  bowlerName: {
    fontWeight: "600",
    color: "#000",
  },
  overDetails: {
    fontSize: 14,
    marginVertical: 3,
    color: "#555",
  },
  crrText: {
    fontSize: 14,
    color: "#777",
  },
  ballsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 5,
  },
  ball: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    margin: 3,
    borderRadius: 4,
    borderWidth: 1,
    textAlign: "center",
    fontWeight: "bold",
  },
  defaultBall: {
    backgroundColor: "#fff",
    borderWidth: 1,
    // borderColor: "#ddd",
  },
  wicket: {
    backgroundColor: "#ff4d4d", // Red for wickets
    color: "white",
  },
  four: {
    backgroundColor: "#33cc33", // Green for fours
    color: "white",
  },
  six: {
    backgroundColor: "#ffcc00", // Yellow for sixes
    color: "#000",
  },
  wide: {
    backgroundColor: "#3399ff", // Blue for wides
    color: "white",
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    backgroundColor: "#444",
    padding: 15,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    width: screenWidth - 30,
    alignSelf: "center",

    marginVertical: 5,
  },
  buttonText: { color: "white", fontWeight: "bold", fontSize: 16 },
});

export default CricketOverHistoryComponent;
