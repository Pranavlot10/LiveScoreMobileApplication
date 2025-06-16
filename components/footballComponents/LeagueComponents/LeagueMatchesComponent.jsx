import { StyleSheet, Dimensions, View, Text } from "react-native";
import { useState, useEffect } from "react";
import { TabView, TabBar } from "react-native-tab-view";

// Make sure these imports are correct - check your project structure
import LeagueFixtures from "./LeagueFixtures";
import LeagueResults from "./LeagueResults";

import { COLORS } from "../../../constants/theme";

const screenWidth = Dimensions.get("screen").width;

export default function LeagueMatchesPage({
  leagueId,
  seasonId,
  onContentReady,
}) {
  // Tab view state
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: "fixtures", title: "Fixtures" },
    { key: "results", title: "Results" },
  ]);

  // Track which routes have been visited for lazy loading
  const [routesVisited, setRoutesVisited] = useState({
    fixtures: true, // Fixtures is visited by default
    results: false, // Results not visited yet
  });

  // Notify parent when content is ready or tab changes
  useEffect(() => {
    if (onContentReady && routesVisited[routes[index].key]) {
      onContentReady();
    }
  }, [routesVisited, index, routes, onContentReady]);

  // Handle tab index change
  const handleIndexChange = (newIndex) => {
    setIndex(newIndex);

    // Mark the route as visited when switching tabs
    const currentRouteKey = routes[newIndex].key;
    if (!routesVisited[currentRouteKey]) {
      setRoutesVisited((prev) => ({
        ...prev,
        [currentRouteKey]: true,
      }));
    }
  };

  // Custom tab bar
  const renderTabBar = (props) => (
    <TabBar
      {...props}
      indicatorStyle={styles.indicator}
      style={styles.tabBar}
      labelStyle={styles.tabLabel}
      activeColor="#ffffff"
      inactiveColor="#aaaaaa"
      pressColor="rgba(255, 255, 255, 0.1)"
    />
  );

  // Render scenes for each tab
  const renderScene = ({ route }) => {
    // Only render if the route has been visited
    if (!routesVisited[route.key]) {
      return (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Swipe to load content...</Text>
        </View>
      );
    }

    switch (route.key) {
      case "fixtures":
        // Check if LeagueFixtures exists before rendering
        if (
          typeof LeagueFixtures !== "function" &&
          typeof LeagueFixtures !== "object"
        ) {
          return (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>
                LeagueFixtures component not found
              </Text>
            </View>
          );
        }
        return (
          <LeagueFixtures
            leagueId={leagueId}
            seasonId={seasonId}
            onContentReady={onContentReady}
          />
        );
      case "results":
        // Check if LeagueResults exists before rendering
        if (
          typeof LeagueResults !== "function" &&
          typeof LeagueResults !== "object"
        ) {
          return (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>
                LeagueResults component not found
              </Text>
            </View>
          );
        }
        return (
          <LeagueResults
            leagueId={leagueId}
            seasonId={seasonId}
            onContentReady={onContentReady}
          />
        );
      default:
        return null;
    }
  };

  return (
    <View
      style={styles.rootContainer}
      onLayout={() => {
        if (onContentReady) onContentReady();
      }}
    >
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        renderTabBar={renderTabBar}
        onIndexChange={handleIndexChange}
        initialLayout={{ width: screenWidth }}
        lazy={false} // We're handling our own lazy loading
        swipeEnabled={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    width: screenWidth,
  },
  tabBar: {
    backgroundColor: COLORS.background, // Matching the original dark background
    elevation: 0, // Remove shadow on Android
    shadowOpacity: 0, // Remove shadow on iOS
    borderBottomWidth: 0,
  },
  indicator: {
    backgroundColor: "#ffffff", // White indicator for dark theme
    height: 3,
  },
  tabLabel: {
    fontWeight: "500",
    textTransform: "none", // Prevents automatic uppercase conversion
  },
  loadingContainer: {
    height: 300,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#222831", // Maintaining the dark background
  },
  loadingText: {
    textAlign: "center",
    color: "#ffffff",
    fontSize: 16,
  },
});
