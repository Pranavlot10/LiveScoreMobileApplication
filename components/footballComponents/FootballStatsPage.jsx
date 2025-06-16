import React, { useState, useCallback } from "react";
import { StyleSheet, Dimensions, View, ScrollView } from "react-native";
import { TabView, SceneMap, TabBar } from "react-native-tab-view";
import TeamStatsPage from "./teamStatsComponent";
import H2HPage from "./H2HComponent";
import useSportsStore from "../../zustand/useSportsStore";
import InteractiveBasketballScoringChart from "../LineGraphComponent";

const screenWidth = Dimensions.get("screen").width;

export default function FootballStatsPage({
  match,
  matchId,
  incidentsData,
  matchInfoData,
}) {
  const selectedSport = useSportsStore((state) => state.selectedSport);
  const [index, setIndex] = useState(0);

  const screenTabs = [match.status.code !== 0 && "Match", "H2H"].filter(
    Boolean
  );

  if (selectedSport === "basketball") {
    screenTabs.splice(1, 0, "Graph");
  }

  const routes = screenTabs.map((title) => ({
    key: title.toLowerCase(),
    title,
  }));

  const renderScene = SceneMap({
    match: () => (
      <ScrollView
        contentContainerStyle={styles.sceneContainer}
        scrollEnabled={true}
        horizontal={false} // Disable horizontal scrolling to avoid conflicts
      >
        <TeamStatsPage matchId={matchId} matchInfoData={matchInfoData} />
      </ScrollView>
    ),
    graph: () => (
      <ScrollView
        contentContainerStyle={styles.sceneContainer}
        scrollEnabled={true}
        horizontal={false} // Disable horizontal scrolling to avoid conflicts
      >
        <InteractiveBasketballScoringChart
          gameData={incidentsData}
          matchInfoData={matchInfoData}
        />
      </ScrollView>
    ),
    h2h: () => (
      <ScrollView
        contentContainerStyle={styles.sceneContainer}
        scrollEnabled={true}
        horizontal={false} // Disable horizontal scrolling to avoid conflicts
      >
        <H2HPage
          matchId={match.customId}
          currentMatch={match}
          matchInfoData={matchInfoData}
        />
      </ScrollView>
    ),
  });

  const memoizedRenderScene = useCallback(renderScene, [
    matchId,
    matchInfoData,
    incidentsData,
    match,
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
    console.log("FootballStatsPage TabView index changed to:", newIndex);
    setIndex(newIndex);
  }, []);

  if (match.status.code === 0) {
    return (
      <View style={styles.rootContainer}>
        <H2HPage key="H2H" matchId={match.customId} currentMatch={match} />
      </View>
    );
  }

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
