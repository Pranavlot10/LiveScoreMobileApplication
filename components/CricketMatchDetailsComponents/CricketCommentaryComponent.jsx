import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { serverIP } from "@env";
import axios from "axios";
import RenderHTML from "react-native-render-html";

const screenWidth = Dimensions.get("window").width;

function CricketMatchCommentaryComponent({ matchId, scorecardData }) {
  const [matchCommentary, setMatchCommentary] = useState(null);
  const [fetchingMore, setFetchingMore] = useState(false);
  const [loading, setLoading] = useState(true);
  // console.log(matchId);

  // Fetch match commentary and history
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `http://${serverIP}/cricket/commentary/${matchId}`
        );
        setMatchCommentary(response?.data?.matchCommentary?.commentaryList);
        // console.log(response?.data?.matchCommentary);
        // setMatchOverHistory(response?.data?.matchOverHistory);
      } catch (err) {
        console.error("Error fetching commentary:", err.toJSON());
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [matchId]);

  if (loading) {
    return (
      <View style={[styles.rootContainer, { backgroundColor: "#d1e4f3" }]}>
        <Text>Loading...</Text>
      </View>
    );
  }

  // console.log(matchCommentary.commentaryList);

  // Function to handle button click and fetch more data
  const fetchMoreCommentary = async () => {
    if (matchCommentary.length === 0) return;

    setFetchingMore(true);

    // Get the last element of the commentary list
    const lastCommentary = matchCommentary[matchCommentary.length - 1];
    const lastTimestamp = lastCommentary?.timestamp || "";
    const lastInningsId = lastCommentary?.inningsId || "";

    console.log(lastInningsId, lastTimestamp);

    try {
      const response = await axios.get(
        `http://${serverIP}/cricket/more-commentary/${matchId}`,
        {
          params: { tms: lastTimestamp, iid: lastInningsId },
        }
      );

      // Append new data to the existing commentary list
      setMatchCommentary((prev) => {
        const existingCommentary = Array.isArray(prev) ? prev : [];
        existingCommentary.pop();
        console.log(
          Array.isArray(response?.data?.matchCommentary?.commentaryList)
        );
        const newCommentary = Array.isArray(
          response?.data?.matchCommentary?.commentaryList
        )
          ? response?.data?.matchCommentary?.commentaryList
          : [];

        return [...existingCommentary, ...newCommentary];
      });
    } catch (err) {
      console.error("Error fetching more commentary:", err.toJSON());
    } finally {
      setFetchingMore(false);
    }
  };
  // console.log(matchCommentary);

  const getBallEvent = (commentary) => {
    const text = commentary.toLowerCase();
    // console.log(text);

    if (text.includes("four")) {
      return {
        event: "4",
        style: styles.fourStyle,
        textStyle: {},
      };
    } else if (text.includes("six")) {
      return {
        event: "6",
        style: styles.sixStyle,
        textStyle: { color: "black" },
      };
    } else if (
      text.includes("out") ||
      text.includes("bowled") ||
      text.includes("caught") ||
      text.includes("lbw") ||
      text.includes("run out")
    ) {
      return {
        event: "W",
        style: styles.wicketStyle,
        textStyle: { color: "black" },
      };
    } else if (text.includes("no ball")) {
      return {
        event: "NB",
        style: styles.noBallStyle,
        textStyle: {},
      };
    } else if (text.includes("wide")) {
      return {
        event: "WD",
        style: styles.wideStyle,
        textStyle: {},
      };
    } else if (text.includes("leg byes")) {
      return {
        event: "LB",
        style: styles.legByesStyle,
        textStyle: { color: "black" },
      };
    } else if (text.includes("byes")) {
      return {
        event: "B",
        style: styles.byesStyle,
        textStyle: { color: "black" },
      };
    } else if (text.includes("no run")) {
      return {
        event: "0",
        style: styles.dotBallStyle,
        textStyle: { color: "black" },
      };
    } else if (text.includes("1 run")) {
      return {
        event: "1",
        style: styles.singleRunStyle,
        textStyle: { color: "black" },
      };
    } else if (text.includes("2 run")) {
      return {
        event: "2",
        style: styles.doubleRunStyle,
        textStyle: { color: "black" },
      };
    }

    return { event: "-", style: styles.defaultStyle }; // Default styling
  };

  const formatCommentaryText = ({ commText, commentaryFormats }) => {
    if (!commentaryFormats?.bold?.formatId?.length) {
      return commText; // No formatting needed, return the plain text
    }

    commentaryFormats.bold.formatId.forEach((id, index) => {
      const boldText = commentaryFormats.bold.formatValue[index];
      commText = commText.replace(id, `<b>${boldText}</b>`); // Replace with bold HTML tag
    });

    return commText;
  };

  const formatTimestampTo12HourIntl = (timestamp) => {
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    }).format(new Date(timestamp));
  };

  const renderItem = ({ item }) => {
    const { event, style, textStyle } = getBallEvent(
      formatCommentaryText(item)
    );

    const content = formatCommentaryText(item);

    // Over End Header
    if (item.overSeparator) {
      return (
        <View style={styles.overHeader}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text style={styles.overHeaderText}>
              End of Over {Math.floor(item.ballNbr)}
            </Text>
            <Text style={styles.overHeaderText}>
              {item.overSeparator.batTeamName} {item.overSeparator.score}/
              {item.overSeparator.wickets}
            </Text>
          </View>
          {/* <Text style={styles.overSummary}>{item.overSeparator.o_summary}</Text> */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <View style={styles.batsmanInfo}>
              <Text style={{ marginTop: 5 }}>
                {item.overSeparator.batStrikerNames[0]}{" "}
                {item.overSeparator.batStrikerRuns}* (
                {item.overSeparator.batStrikerBalls})
              </Text>
              <Text>
                {item.overSeparator.batNonStrikerNames[0]}{" "}
                {item.overSeparator.batNonStrikerRuns}* (
                {item.overSeparator.batNonStrikerBalls})
              </Text>
            </View>
            <View style={styles.bowlerInfo}>
              <Text>
                {item.overSeparator.bowlNames[0]} {item.overSeparator.bowlOvers}
                -{item.overSeparator.bowlRuns}-{item.overSeparator.bowlWickets}
              </Text>
            </View>
          </View>
        </View>
      );
    }

    // Extra Info
    if (!item.overNumber) {
      return (
        <View style={styles.extraInfo}>
          <Text style={styles.timeText}>
            {formatTimestampTo12HourIntl(item.timestamp)}
          </Text>
          <RenderHTML
            baseStyle={styles.extraInfoText}
            contentWidth={screenWidth * 0.8}
            source={{ html: content }}
          />
        </View>
      );
    }

    // Regular Commentary
    return (
      <View style={styles.commentaryBox}>
        <View style={[styles.ballDataStyle, style]}>
          <Text
            style={[
              styles.wicketTextStyle,
              textStyle, // Style for no ball
            ]}
          >
            {event}
          </Text>
        </View>

        <View style={{}}>
          <Text style={styles.ballNumber}>{item.overNumber}</Text>
          <RenderHTML
            baseStyle={styles.commentaryText}
            contentWidth={screenWidth * 0.8}
            source={{ html: content }}
          />
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={matchCommentary || []}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderItem}
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
}

// Styles
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9f9f9" },
  commentaryBox: {
    padding: 10,
    // width: screenWidth,
    borderBottomWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#f9f9f9",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  ballNumber: {
    fontWeight: "bold",
  },
  commentaryText: {
    marginTop: 5,
    width: screenWidth * 0.8,
    textAlign: "justify",
  },
  overHeader: {
    backgroundColor: "#d7e3fc",
    padding: 10,
    // marginTop: 10,
  },
  overHeaderText: {
    fontWeight: "bold",
    fontSize: 16,
  },
  score: {
    fontSize: 14,
    fontWeight: "bold",
  },
  overSummary: {
    fontSize: 12,
    fontStyle: "italic",
    marginVertical: 5,
  },
  batsmanInfo: {
    justifyContent: "space-between",
  },
  bowlerInfo: {
    marginTop: 5,
  },
  extraInfo: {
    fontStyle: "italic",
    padding: 10,
    backgroundColor: "#fffae6",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  extraInfoText: {
    textAlign: "justify",
    width: screenWidth * 0.8,
  },
  timeText: {
    fontWeight: "700",
  },
  ballDataStyle: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
  },
  wicketStyle: { backgroundColor: "#FE0000" }, // Red for wicket
  fourStyle: { backgroundColor: "#00C853" }, // Blue for four
  sixStyle: { backgroundColor: "#00C853" }, // Green for six
  noBallStyle: { backgroundColor: "#FFA000" }, // Orange for no-ball
  wideStyle: { backgroundColor: "#007AFF", paddingHorizontal: 4 }, // Purple for wide
  legByesStyle: { backgroundColor: "#546E7A" }, // Grey for leg byes
  byesStyle: { backgroundColor: "#37474F" }, // Dark grey for byes
  dotBallStyle: { backgroundColor: "#fff" }, // Light grey for dot ball
  singleRunStyle: { backgroundColor: "#fff" }, // Light blue for single run
  doubleRunStyle: { backgroundColor: "#fff" }, // Dark green for two runs
  defaultStyle: { backgroundColor: "#000" }, // Black for unknown events
  wicketTextStyle: {
    color: "white", // Text color for wicket
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

export default CricketMatchCommentaryComponent;
