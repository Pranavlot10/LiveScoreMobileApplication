import React, { useRef, useEffect } from "react";
import { StyleSheet, View, Animated, Text } from "react-native";
import useSportsStore from "../zustand/useSportsStore";
import ImageButtonComponent from "../components/PressableComponents/imageButtonComponent";
import { COLORS, FONTS } from "../constants/theme";

const SportsComponent = ({ showLabels = false }) => {
  const selectedSport = useSportsStore((state) => state.selectedSport);
  const setSelectedSport = useSportsStore((state) => state.setSelectedSport);

  const footballScale = useRef(new Animated.Value(1)).current;
  const cricketScale = useRef(new Animated.Value(1)).current;
  const basketballScale = useRef(new Animated.Value(1)).current;

  const scaleMap = {
    Football: footballScale,
    Cricket: cricketScale,
    Basketball: basketballScale,
  };

  useEffect(() => {
    Object.entries(scaleMap).forEach(([sport, animatedValue]) => {
      Animated.timing(animatedValue, {
        toValue: sport === selectedSport ? 1.2 : 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });
  }, [selectedSport]);

  return (
    <View>
      <View style={styles.sportsContainer}>
        <Animated.View
          style={[
            styles.sportButtonWrapper,
            {
              transform: [{ scale: footballScale }],
              backgroundColor:
                selectedSport === "Football"
                  ? "rgba(93, 156, 236, 0.2)"
                  : "transparent",
            },
          ]}
        >
          <ImageButtonComponent
            iconSource={require("../assets/football.png")}
            onPress={() => setSelectedSport("Football")}
            isSelected={selectedSport === "Football"}
          />
          {showLabels && (
            <Text
              style={[
                styles.sportLabel,
                selectedSport === "Football" && styles.selectedSportLabel,
              ]}
            >
              Football
            </Text>
          )}
        </Animated.View>

        <Animated.View
          style={[
            styles.sportButtonWrapper,
            {
              transform: [{ scale: cricketScale }],
              backgroundColor:
                selectedSport === "Cricket"
                  ? "rgba(93, 156, 236, 0.2)"
                  : "transparent",
            },
          ]}
        >
          <ImageButtonComponent
            iconSource={require("../assets/cricket.png")}
            onPress={() => setSelectedSport("Cricket")}
            isSelected={selectedSport === "Cricket"}
          />
          {showLabels && (
            <Text
              style={[
                styles.sportLabel,
                selectedSport === "Cricket" && styles.selectedSportLabel,
              ]}
            >
              Cricket
            </Text>
          )}
        </Animated.View>

        <Animated.View
          style={[
            styles.sportButtonWrapper,
            {
              transform: [{ scale: basketballScale }],
              backgroundColor:
                selectedSport === "Basketball"
                  ? "rgba(93, 156, 236, 0.2)"
                  : "transparent",
            },
          ]}
        >
          <ImageButtonComponent
            iconSource={require("../assets/basketball.png")}
            onPress={() => setSelectedSport("Basketball")}
            isSelected={selectedSport === "Basketball"}
          />
          {showLabels && (
            <Text
              style={[
                styles.sportLabel,
                selectedSport === "Basketball" && styles.selectedSportLabel,
              ]}
            >
              Basketball
            </Text>
          )}
        </Animated.View>
      </View>
    </View>
  );
};

export default SportsComponent;

const styles = StyleSheet.create({
  sportsContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border || "#3D3D3D",
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 4,
    marginHorizontal: 16,
    marginBottom: 6,
    backgroundColor: COLORS.secondary,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sportButtonWrapper: {
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 8,
  },
  sportLabel: {
    marginTop: 2,
    fontSize: 10,
    color: COLORS.text?.secondary || "#CCCCCC",
    fontWeight: "500",
  },
  selectedSportLabel: {
    color: COLORS.text?.primary || "#FFFFFF",
    fontWeight: "bold",
  },
});
