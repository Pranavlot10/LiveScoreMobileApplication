import { StyleSheet, View, Text, Dimensions } from "react-native";
import { useState } from "react";
import { TabView, TabBar } from "react-native-tab-view";
import debounce from "lodash.debounce";

import PartnershipBar from "./PartnershipProgressBar";

const screenWidth = Dimensions.get("window").width;

export default function PartnershipsComponent({ cricbuzzScorecard }) {
  // TabView state
  const [index, setIndex] = useState(0);

  // Create routes from team names
  const routes =
    cricbuzzScorecard?.map((inning, idx) => ({
      key: `tab-${idx}`,
      title: inning?.batTeamDetails?.batTeamShortName || `Team ${idx + 1}`,
    })) || [];

  // Render scene for each tab
  const renderScene = ({ route }) => {
    const tabIndex = parseInt(route.key.split("-")[1]);
    const innings = cricbuzzScorecard[tabIndex];

    if (!innings) return null;

    try {
      const partnerships = innings.partnership.partnership;

      if (!partnerships || partnerships.length === 0) {
        return (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>No partnership data available</Text>
          </View>
        );
      }

      return (
        <View style={styles.sceneContainer}>
          {partnerships.map((part, index) => {
            try {
              return (
                <View key={index} style={styles.partnershipRow}>
                  <View style={styles.partnershipheader}>
                    <Text style={styles.bat1NameText}>
                      {part.bat1Name || ""}
                    </Text>
                    <View style={styles.partnershipText}>
                      <Text>{part.totalRuns || "0"}</Text>
                      <Text>
                        {part.totalBalls ? ` (${part.totalBalls})` : "(0)"}
                      </Text>
                    </View>
                    <Text style={styles.bat2NameText}>
                      {part.bat2Name || ""}
                    </Text>
                  </View>
                  <View style={styles.partnershipContent}>
                    <Text style={styles.bats1RunText}>
                      {part.bat1Runs || "0"}
                    </Text>
                    <PartnershipBar
                      leftValue={part?.bat1Runs || 0}
                      rightValue={part?.bat2Runs || 0}
                    />
                    <Text style={styles.bats2RunText}>
                      {part.bat2Runs || "0"}
                    </Text>
                  </View>
                </View>
              );
            } catch (err) {
              console.error("Error in partnership mapping:", err);
              return null;
            }
          })}
        </View>
      );
    } catch (err) {
      console.error("Error in innings mapping:", err);
      return (
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>Error loading partnership data</Text>
        </View>
      );
    }
  };

  // Custom TabBar
  const renderTabBar = (props) => (
    <TabBar
      {...props}
      scrollEnabled={routes.length > 2}
      indicatorStyle={styles.indicator}
      style={styles.tabBar}
      labelStyle={styles.tabLabel}
      tabStyle={styles.tab}
      activeColor="#fff"
      inactiveColor="#aaa"
    />
  );

  // If no scorecard data, show message
  if (!cricbuzzScorecard || cricbuzzScorecard.length === 0) {
    return (
      <View style={styles.noDataContainer}>
        <Text style={styles.noDataText}>No scorecard data available</Text>
      </View>
    );
  }

  return (
    <View style={styles.rootContainer}>
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        renderTabBar={renderTabBar}
        onIndexChange={setIndex}
        initialLayout={{ width: screenWidth - 36 }}
        style={styles.tabView}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
  },
  tabView: {
    width: screenWidth - 36,
  },
  tabBar: {
    backgroundColor: "#222831",
    elevation: 0,
    shadowOpacity: 0,
  },
  tab: {
    width: "auto",
    paddingHorizontal: 10,
  },
  indicator: {
    backgroundColor: "#00ADB5",
    height: 3,
  },
  tabLabel: {
    fontWeight: "500",
    textTransform: "none",
    fontSize: 14,
  },
  sceneContainer: {
    width: screenWidth - 36,
    paddingVertical: 10,
  },
  noDataContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  noDataText: {
    fontSize: 16,
    color: "#666",
  },
  partnershipRow: {
    marginVertical: 5,
    maxWidth: "99%",
  },
  partnershipText: {
    flexDirection: "row",
  },
  partnershipheader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  partnershipContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-evenly",
    marginTop: 5,
  },
  bats1RunText: {
    width: 20,
  },
  bats2RunText: {
    width: 20,
    textAlign: "right",
  },
  bat1NameText: {
    width: 140,
  },
  bat2NameText: {
    width: 140,
    textAlign: "right",
  },
});
