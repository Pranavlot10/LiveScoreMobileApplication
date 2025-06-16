import React from "react";
import { StyleSheet, View, Text, Dimensions } from "react-native";

const screenWidth = Dimensions.get("screen").width;

const StatBar = ({
  label,
  leftValue,
  rightValue,
  leftDominant,
  rightDominant,
  dominantColor = "#B771E5",
  recessiveColor = "#FFD95F",
}) => {
  // Calculate proportions for the bars
  const total = parseFloat(leftValue) + parseFloat(rightValue);
  const leftProportion = total === 0 ? 0.5 : parseFloat(leftValue) / total;
  const rightProportion = total === 0 ? 0.5 : parseFloat(rightValue) / total;

  // Determine colors based on dominance
  const leftColor = leftDominant ? dominantColor : recessiveColor;
  const rightColor = rightDominant ? dominantColor : recessiveColor;

  // If neither is explicitly dominant, color the higher value
  const autoLeftColor =
    !leftDominant && !rightDominant && leftValue > rightValue
      ? dominantColor
      : leftColor;
  const autoRightColor =
    !leftDominant && !rightDominant && rightValue > leftValue
      ? dominantColor
      : rightColor;

  //   console.log(leftDominant, rightDominant);

  return (
    <View style={styles.statBarContainer}>
      <View style={styles.statRow}>
        <Text style={styles.statValue}>{leftValue}</Text>
        <Text style={styles.statLabel}>{label}</Text>
        <Text style={styles.statValue}>{rightValue}</Text>
      </View>
      <View style={styles.progressContainer}>
        <View
          style={[
            styles.leftProgress,
            //   { flex: Math.max(0.0001, leftProportion) },
          ]}
        >
          <View
            style={[
              styles.progressFill,
              {
                flex: Math.max(0.0001, leftProportion),
                backgroundColor: autoLeftColor,
              },
            ]}
          />
        </View>
        <View
          style={[
            styles.rightProgress,
            //   { flex: Math.max(0.0001, rightProportion) },
          ]}
        >
          <View
            style={[
              styles.progressFill,
              {
                flex: Math.max(0.0001, rightProportion),
                backgroundColor: autoRightColor,
              },
            ]}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  statsContainer: {
    width: "100%",
  },
  statRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingVertical: 12,
    width: screenWidth - 40,
    justifyContent: "space-between",
  },
  statValue: {
    color: "white",
    width: 35,
    textAlign: "center",
    fontSize: 14,
    fontWeight: "700",
    verticalAlign: "middle",
  },
  statBarContainer: {
    flex: 1,
    marginHorizontal: 10,
    marginVertical: 7,
  },
  statLabel: {
    color: "#fff",
    fontSize: 14,
    // marginBottom: 15,
    textAlign: "center",
    fontWeight: "700",
  },
  progressContainer: {
    flexDirection: "row",
    height: 6,
    width: "100%",
  },
  leftProgress: {
    height: "150%",
    justifyContent: "flex-end",
    alignItems: "center",
    // paddingHorizontal: 4,
    marginRight: 2,
    width: screenWidth / 2.25,
    backgroundColor: "#777",
    borderRadius: 6,
    flexDirection: "row",
  },
  rightProgress: {
    height: "150%",
    justifyContent: "flex-start",
    alignItems: "center",
    // paddingHorizontal: 4,
    marginLeft: 2,
    flexDirection: "row",
    backgroundColor: "#777",
    borderRadius: 6,
    width: screenWidth / 2.25,
  },
  progressFill: {
    height: "100%",
    borderRadius: 6,
    width: "100%",
    // justifyContent: "center",
  },
});

export default StatBar;
