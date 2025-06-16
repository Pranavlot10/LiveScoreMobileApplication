import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";

const screenWidth = Dimensions.get("window").width;

const ProgressBarComponent = ({ segments }) => {
  const totalValue = segments.reduce(
    (total, segment) => total + segment.value,
    0
  );
  return (
    <View style={[styles.progressBar]}>
      {segments.map((segment, index) => {
        return (
          <View
            key={index}
            style={[
              styles.progressSegment,
              {
                flex: segment.value / totalValue,
                backgroundColor: segment.color,
              },
            ]}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  progressBar: {
    flexDirection: "row",
    height: 10, // Adjust the height of the progress bar
    borderRadius: 15, // Optional: rounded corners
    overflow: "hidden", // Prevent overflow
    justifyContent: "center",
  },
  progressSegment: {
    height: "100%",
    // width: "90%",
    borderRadius: 15,
    marginHorizontal: 1,
  },
});

export default ProgressBarComponent;
