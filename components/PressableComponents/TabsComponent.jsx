import React from "react";
import { Pressable, Text, StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";

function TabsComponent({ title, onPress, selected }) {
  const animatedUnderlineStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scaleX: withTiming(selected ? 1 : 0, {
          duration: 150,
        }),
      },
    ],
  }));

  const animatedTextStyle = useAnimatedStyle(() => ({
    color: withTiming(selected ? "white" : "grey", {
      duration: 150,
    }),
    fontWeight: selected ? "bold" : "normal",
  }));

  return (
    <Pressable
      onPress={onPress}
      style={styles.tab}
      accessibilityLabel={title}
      accessibilityRole="button"
    >
      <View style={styles.tabContent}>
        <Animated.Text style={[styles.text, animatedTextStyle]}>
          {title}
        </Animated.Text>
        <Animated.View style={[styles.underline, animatedUnderlineStyle]} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
  },
  tabContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontSize: 16,
    color: "red",
  },
  underline: {
    height: 3,
    color: "red",
    width: "100%",
    transform: [{ scaleX: 0 }],
    alignSelf: "flex-start", // Ensures the underline grows from the left
  },
});

export default TabsComponent;
