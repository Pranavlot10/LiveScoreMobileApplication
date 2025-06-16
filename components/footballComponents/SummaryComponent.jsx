import React, { useState, useCallback } from "react";
import { StyleSheet, Dimensions, View, ScrollView } from "react-native";
import { TabView, SceneMap, TabBar } from "react-native-tab-view";
import MatchCommentary from "./MatchCommentary";
import MatchTimeline from "./FootballTimeLineComponent";

const screenWidth = Dimensions.get("screen").width;

export default function FootballSummaryComponent({ matchId, incidentsData }) {
  const [index, setIndex] = useState(0);

  const routes = [
    { key: "timeline", title: "Timeline" },
    { key: "commentary", title: "Commentary" },
  ];

  const renderScene = SceneMap({
    timeline: () => (
      <ScrollView
        contentContainerStyle={styles.sceneContainer}
        scrollEnabled={true}
        horizontal={false} // Disable horizontal scrolling to avoid conflicts
      >
        <MatchTimeline incidentsData={incidentsData} />
      </ScrollView>
    ),
    commentary: () => (
      <ScrollView
        contentContainerStyle={styles.sceneContainer}
        scrollEnabled={true}
        horizontal={false} // Disable horizontal scrolling to avoid conflicts
      >
        <MatchCommentary matchId={matchId} />
      </ScrollView>
    ),
  });

  const memoizedRenderScene = useCallback(renderScene, [
    incidentsData,
    matchId,
  ]);

  const renderTabBar = (props) => (
    <TabBar
      {...props}
      style={styles.tabBar}
      indicatorStyle={styles.indicator}
      labelStyle={styles.tabLabel}
      activeColor="#AA60C8"
      inactiveColor="#fff"
      tabStyle={styles.tabStyle}
    />
  );

  const memoizedRenderTabBar = useCallback(renderTabBar, []);

  const handleIndexChange = useCallback((newIndex) => {
    console.log("FootballSummaryComponent TabView index changed to:", newIndex);
    setIndex(newIndex);
  }, []);

  return (
    <View style={styles.rootContainer}>
      <TabView
        navigationState={{ index, routes }}
        renderScene={memoizedRenderScene}
        onIndexChange={handleIndexChange}
        initialLayout={{ width: screenWidth }}
        renderTabBar={memoizedRenderTabBar}
        lazy={true}
        swipeEnabled={true} // Explicitly enable swipe gestures
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
    backgroundColor: "#222831",
    paddingVertical: 5,
  },
  indicator: {
    height: 0,
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  tabStyle: {
    width: "auto",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  sceneContainer: {
    flexGrow: 1,
    backgroundColor: "#222831",
  },
});
