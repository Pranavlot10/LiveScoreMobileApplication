import React from "react";
import { View, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
  interpolateColor,
} from "react-native-reanimated";

const NewsCardSkeleton = () => {
  // Shared value to control the animation
  const translateY = useSharedValue(-100); // Start above the card

  // Infinite vertical loop animation
  translateY.value = withRepeat(
    withTiming(380, { duration: 2000 }), // Move down
    -1,
    true
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    backgroundColor: interpolateColor(
      interpolate(translateY.value, [-100, 380], [0, 1]),
      [0, 1],
      ["#e0e0e0", "#f5f5f5"]
    ),
  }));

  return (
    <View style={styles.card}>
      {/* Static background */}
      <View style={styles.background} />

      {/* Moving gradient overlay */}
      <Animated.View style={[styles.gradientOverlay, animatedStyle]} />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: "100%",
    height: 400, // Matches NewsCard size
    borderRadius: 8,
    overflow: "hidden", // Ensures animation stays inside card
    backgroundColor: "#e0e0e0",
    // marginBottom: 10,
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#e0e0e0",
  },
  gradientOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "100%",
    opacity: 0.6, // Adjust opacity for realism
  },
});

export default NewsCardSkeleton;
