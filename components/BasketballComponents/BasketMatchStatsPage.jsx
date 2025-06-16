import React, { useState, useCallback } from "react";
import { StyleSheet, Dimensions, View, ScrollView } from "react-native";
import { TabView, SceneMap, TabBar } from "react-native-tab-view";
import H2HPage from "./H2HComponent";
import TeamStatsPage from "./teamStatsComponent";

const screenWidth = Dimensions.get("screen").width;

export default function BasketMatchStatsPage({ match, matchId }) {
  const [index, setIndex] = useState(0);

  const screenTabs = [match.status.code !== 0 && "Match", "H2H"].filter(
    Boolean
  );

  const routes = screenTabs.map((title) => ({
    key: title.toLowerCase(),
    title,
  }));

  const MatchTab = () => (
    <ScrollView
      contentContainerStyle={styles.sceneContainer}
      scrollEnabled={true}
      horizontal={false}
    >
      <TeamStatsPage matchId={matchId} />
    </ScrollView>
  );

  const H2HTab = () => (
    <ScrollView
      contentContainerStyle={styles.sceneContainer}
      scrollEnabled={true}
      horizontal={false}
    >
      <H2HPage matchId={match.customId} currentMatch={match} />
    </ScrollView>
  );

  const renderScene = SceneMap({
    match: MatchTab,
    h2h: H2HTab,
  });

  const memoizedRenderScene = useCallback(renderScene, [matchId, match]);

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
    console.log("BasketMatchStatsPage TabView index changed to:", newIndex);
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
        swipeEnabled={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    width: screenWidth,
    backgroundColor: "#222831",
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
