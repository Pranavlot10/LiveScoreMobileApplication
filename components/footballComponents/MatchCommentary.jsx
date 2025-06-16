import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useState } from "react";
import { serverIP } from "@env";
import axios from "axios";
import Svg, {
  Rect,
  Circle,
  Line,
  Text as SvgText,
  Image,
} from "react-native-svg";
import { ScrollView } from "react-native-gesture-handler";
import { LinearGradient } from "expo-linear-gradient";

const screenWidth = Dimensions.get("screen").width;

export default function MatchCommentary({ matchId }) {
  const [commentaryData, setCommentaryData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(
          `http://${serverIP}/football/commentary/${matchId}`
        );
        setCommentaryData(response?.data?.commentaryData.comments || []);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setIsLoading(false);
      }
    };

    fetchData();
  }, [matchId]);

  const renderEventIcon = (commentary) => {
    const cx = 15;
    const cy = 15;

    switch (commentary.type) {
      case "substitution":
        return (
          <View style={styles.iconBackground}>
            <Svg width={30} height={30}>
              <Image
                href={require("../../assets/footballIcons/sub.png")}
                x={cx - 10}
                y={cy - 10}
                width={20}
                height={20}
              />
            </Svg>
          </View>
        );
      case "scoreChange":
        return (
          <View style={[styles.iconBackground, styles.goalBackground]}>
            <Svg width={30} height={30}>
              <Image
                href={require("../../assets/footballIcons/goal.png")}
                x={cx - 10}
                y={cy - 10}
                width={20}
                height={20}
              />
            </Svg>
          </View>
        );
      case "yellowCard":
        return (
          <View style={styles.iconBackground}>
            <Svg width={30} height={30}>
              <Rect
                x={cx - 7}
                y={cy - 12}
                rx={2}
                ry={2}
                height={18}
                width={14}
                fill="#FFC107"
              />
            </Svg>
          </View>
        );
      case "redCard":
        return (
          <View style={styles.iconBackground}>
            <Svg width={30} height={30}>
              <Rect
                x={cx - 7}
                y={cy - 12}
                rx={2}
                ry={2}
                height={18}
                width={14}
                fill="#F44336"
              />
            </Svg>
          </View>
        );
      case "matchEnded":
        return (
          <View style={[styles.iconBackground, styles.matchEndedBackground]}>
            <Svg width={30} height={30}>
              <Circle cx={cx} cy={cy} r={10} fill="#4CAF50" />
              <SvgText
                x={cx}
                y={cy + 4}
                fontSize="12"
                fontWeight="bold"
                fill="white"
                textAnchor="middle"
              >
                FT
              </SvgText>
            </Svg>
          </View>
        );
      default:
        return <View style={styles.defaultIcon} />;
    }
  };

  const formatTime = (commentary) => {
    if (commentary.type === "matchEnded") return "FT";

    if (commentary.periodName === "1ST") {
      return commentary.time <= 45
        ? `${commentary.time}'`
        : `45+${commentary.time - 45}'`;
    } else {
      return commentary.time <= 90
        ? `${commentary.time}'`
        : `90+${commentary.time - 90}'`;
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading commentary...</Text>
      </View>
    );
  }

  if (!commentaryData || commentaryData.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Svg width={60} height={60}>
          <Circle cx={30} cy={30} r={25} fill="#424242" />
          <SvgText
            x={30}
            y={35}
            fontSize="30"
            fontWeight="bold"
            fill="#757575"
            textAnchor="middle"
          >
            !
          </SvgText>
        </Svg>
        <Text style={styles.emptyText}>No Commentary Available</Text>
        <Text style={styles.emptySubText}>
          Check back later for updates on this match
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.rootContainer}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>Match Commentary</Text>
      </View>

      {commentaryData.map((commentary, index) => (
        <View
          key={index}
          style={[
            styles.commentaryRow,
            commentary.type === "scoreChange" && styles.goalHighlight,
            index === 0 && styles.firstItem,
            index === commentaryData.length - 1 && styles.lastItem,
          ]}
        >
          <View style={styles.timeContainer}>
            <Text style={styles.commentaryTime}>{formatTime(commentary)}</Text>
            {index < commentaryData.length - 1 && (
              <View style={styles.timeline} />
            )}
          </View>

          <View style={styles.iconContainer}>
            {renderEventIcon(commentary)}
            {index < commentaryData.length - 1 && (
              <View style={styles.iconTimeline} />
            )}
          </View>

          <View style={styles.textContainer}>
            <Text
              style={[
                styles.commentaryText,
                commentary.type === "scoreChange" && styles.goalText,
              ]}
            >
              {commentary.text}
            </Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: "#1E1E1E",
    width: screenWidth,
  },
  headerContainer: {
    padding: 15,
    backgroundColor: "#2A2A2A",
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  headerText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
  },
  commentaryRow: {
    flexDirection: "row",
    paddingVertical: 10,
  },
  timeContainer: {
    width: screenWidth * 0.15,
    alignItems: "center",
    position: "relative",
  },
  commentaryTime: {
    fontSize: 14,
    color: "#BBBBBB",
    fontWeight: "700",
    backgroundColor: "#333333",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: "hidden",
    textAlign: "center",
    minWidth: 45,
  },
  timeline: {
    position: "absolute",
    width: 2,
    backgroundColor: "#444",
    top: 30,
    bottom: -10,
    left: "50%",
    marginLeft: -1,
  },
  iconContainer: {
    width: screenWidth * 0.15,
    alignItems: "center",
    position: "relative",
  },
  iconBackground: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#333",
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  goalBackground: {
    backgroundColor: "#303F9F",
  },
  matchEndedBackground: {
    backgroundColor: "#333",
  },
  defaultIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#555",
  },
  iconTimeline: {
    position: "absolute",
    width: 2,
    backgroundColor: "#444",
    top: 34,
    bottom: -10,
    left: "50%",
    marginLeft: -1,
  },
  textContainer: {
    flex: 1,
    paddingRight: 15,
    justifyContent: "center",
  },
  commentaryText: {
    fontSize: 14,
    color: "#E0E0E0",
    lineHeight: 20,
    paddingLeft: 10,
  },
  goalText: {
    fontWeight: "500",
  },
  goalHighlight: {
    backgroundColor: "rgba(48, 63, 159, 0.1)",
  },
  firstItem: {
    paddingTop: 15,
  },
  lastItem: {
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1E1E1E",
    height: 300,
  },
  loadingText: {
    marginTop: 15,
    color: "#BBBBBB",
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1E1E1E",
    padding: 40,
    height: 300,
  },
  emptyText: {
    color: "#BBBBBB",
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
  },
  emptySubText: {
    color: "#888888",
    fontSize: 14,
    marginTop: 10,
    textAlign: "center",
  },
});
