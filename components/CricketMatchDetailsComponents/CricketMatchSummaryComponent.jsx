import { StyleSheet, View, Dimensions, Animated } from "react-native";
import { useState, useRef, memo } from "react";
import { TabView, TabBar } from "react-native-tab-view";
import DropDownPicker from "react-native-dropdown-picker";

import CricketCommentaryComponent from "./CricketCommentaryComponent";
import CricketOverHistoryComponent from "./CricketOverHistoryComponent";

const screenWidth = Dimensions.get("screen").width;
const MemoizedDropDownPicker = memo(DropDownPicker);

export default function CricketMatchSummaryComponent({
  matchId,
  scorecardData,
}) {
  // TabView state
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: "commentary", title: "Commentary" },
    { key: "overHistory", title: "Over History" },
  ]);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownItems, setDropdownItems] = useState([]);
  const [selectedDropdownValue, setSelectedDropdownValue] = useState(null);

  // Render scene for TabView
  const renderScene = ({ route }) => {
    switch (route.key) {
      case "commentary":
        return <CricketCommentaryComponent matchId={matchId} />;
      case "overHistory":
        return <CricketOverHistoryComponent matchId={matchId} />;
      default:
        return null;
    }
  };

  // Custom TabBar
  const renderTabBar = (props) => (
    <TabBar
      {...props}
      indicatorStyle={styles.indicator}
      style={styles.tabBar}
      labelStyle={styles.tabLabel}
      activeColor="#fff"
      inactiveColor="#aaa"
    />
  );

  return (
    <View style={styles.rootContainer}>
      {/* <View style={{ marginHorizontal: 10, marginBottom: 10 }}>
        <MemoizedDropDownPicker
          open={dropdownOpen}
          value={selectedDropdownValue}
          items={dropdownItems}
          setOpen={setDropdownOpen}
          setValue={setSelectedDropdownValue}
          setItems={setDropdownItems}
          placeholder="Select an option"
          zIndex={1000}
          zIndexInverse={3000}
          style={styles.dropdown}
          dropDownContainerStyle={styles.dropdownContainer}
          textStyle={styles.dropdownText}
          closeOnBackPressed={true}
        />
      </View> */}

      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        renderTabBar={renderTabBar}
        onIndexChange={setIndex}
        initialLayout={{ width: screenWidth }}
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
    backgroundColor: "#222831",
  },
  indicator: {
    backgroundColor: "#00ADB5",
    height: 3,
  },
  tabLabel: {
    fontWeight: "500",
    textTransform: "none",
  },
  dropdown: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#cccccc",
    height: 40,
    paddingHorizontal: 10,
    width: 150,
  },
  dropDownContainer: {
    backgroundColor: "#f8f8f8",
    borderRadius: 8,
    borderColor: "#cccccc",
    width: 200,
  },
  dropdownText: {
    fontSize: 14,
    color: "#333333",
  },
  // Skeleton Loader Styles
  skeletonOverContainer: {
    marginVertical: 5,
    padding: 10,
    backgroundColor: "#e0e0e0",
    borderRadius: 8,
  },
  skeletonOverHeader: {
    flexDirection: "row",
    marginBottom: 5,
  },
  skeletonSmallLine: {
    width: 50,
    height: 10,
    backgroundColor: "#cccccc",
    marginRight: 10,
  },
  skeletonLargeLine: {
    flex: 1,
    height: 10,
    backgroundColor: "#cccccc",
  },
  skeletonBallRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  skeletonBall: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#cccccc",
  },
});
