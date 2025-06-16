import React from "react";
import { View, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolateColor,
} from "react-native-reanimated";
import { FlatList } from "react-native-gesture-handler";

const MatchCardSkeleton = () => {
  const animation = useSharedValue(0);

  // Start the animation loop (blinking effect)
  React.useEffect(() => {
    animation.value = withRepeat(withTiming(1, { duration: 2000 }), -1, true);
  }, []);

  // Animated blinking effect on the entire card
  const animatedStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: interpolateColor(
        animation.value,
        [0, 1],
        ["#E0E0E0", "#F5F5F5"] // Blinking between light gray shades
      ),
    };
  });

  return <Animated.View style={[styles.card, animatedStyle]} />;
};

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    borderWidth: 2,
    borderRadius: 8,
    marginHorizontal: 10,
    padding: 10,
  },
  card: {
    height: 110,
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: "#E0E0E0",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
  },
});

export default MatchCardSkeleton;
