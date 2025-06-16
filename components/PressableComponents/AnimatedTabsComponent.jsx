import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  interpolateColor,
} from "react-native-reanimated";

const screenWidth = Dimensions.get("screen").width;

export default function AnimatedTabsComponent({
  titles,
  selectedIndex,
  onPress,
  swipeAnim,
}) {
  const getAnimatedStyle = (index) =>
    useAnimatedStyle(() => {
      let backgroundColor = "#ecf0f1";
      let textColor = "#2c3e50";

      if (index === selectedIndex) {
        backgroundColor = interpolateColor(
          swipeAnim.value,
          [-screenWidth, 0, screenWidth],
          [
            index > 0 ? "#AA60C8" : "#ecf0f1",
            "#AA60C8",
            index < titles.length - 1 ? "#AA60C8" : "#ecf0f1",
          ]
        );
        textColor = interpolateColor(
          swipeAnim.value,
          [-screenWidth, 0, screenWidth],
          [
            index > 0 ? "#fff" : "#2c3e50",
            "#fff",
            index < titles.length - 1 ? "#fff" : "#2c3e50",
          ]
        );
      } else if (index === selectedIndex + 1) {
        backgroundColor = interpolateColor(
          swipeAnim.value,
          [-screenWidth, 0],
          ["#AA60C8", "#ecf0f1"]
        );
        textColor = interpolateColor(
          swipeAnim.value,
          [-screenWidth, 0],
          ["#fff", "#2c3e50"]
        );
      } else if (index === selectedIndex - 1) {
        backgroundColor = interpolateColor(
          swipeAnim.value,
          [0, screenWidth],
          ["#ecf0f1", "#AA60C8"]
        );
        textColor = interpolateColor(
          swipeAnim.value,
          [0, screenWidth],
          ["#2c3e50", "#fff"]
        );
      }

      return {
        backgroundColor,
      };
    });

  const getTextStyle = (index) =>
    useAnimatedStyle(() => {
      let textColor = "#2c3e50";

      if (index === selectedIndex) {
        textColor = interpolateColor(
          swipeAnim.value,
          [-screenWidth, 0, screenWidth],
          [
            index > 0 ? "#fff" : "#2c3e50",
            "#fff",
            index < titles.length - 1 ? "#fff" : "#2c3e50",
          ]
        );
      } else if (index === selectedIndex + 1) {
        textColor = interpolateColor(
          swipeAnim.value,
          [-screenWidth, 0],
          ["#fff", "#2c3e50"]
        );
      } else if (index === selectedIndex - 1) {
        textColor = interpolateColor(
          swipeAnim.value,
          [0, screenWidth],
          ["#2c3e50", "#fff"]
        );
      }

      return {
        color: textColor,
      };
    });

  return (
    <View style={styles.tabContainer}>
      {titles.map((title, index) => (
        <TouchableOpacity
          key={index}
          style={styles.tabWrapper}
          onPress={() => onPress(index)}
          activeOpacity={0.8}
        >
          <Animated.View
            style={[
              styles.tab,
              index === selectedIndex ? styles.activeTab : styles.inactiveTab,
              getAnimatedStyle(index),
            ]}
          >
            <Animated.Text style={[styles.tabText, getTextStyle(index)]}>
              {title}
            </Animated.Text>
          </Animated.View>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#f5f5f5",
    paddingBottom: 10,
    paddingHorizontal: 10,
  },
  tabWrapper: {
    flex: 1,
    marginHorizontal: 8,
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 25,
    overflow: "hidden",
  },
  activeTab: {
    backgroundColor: "#AA60C8",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  inactiveTab: {
    backgroundColor: "#ecf0f1",
    borderWidth: 1,
    borderColor: "#bdc3c7",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  tabText: {
    fontSize: 16,
    fontWeight: "600",
    textTransform: "capitalize",
  },
});
