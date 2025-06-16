import React, { useRef, useState, useEffect, lazy, Suspense } from "react";
import {
  StyleSheet,
  View,
  Dimensions,
  Text,
  Animated,
  ScrollView,
  ActivityIndicator,
  Image,
  Modal,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  Platform,
} from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { TabView, SceneMap, TabBar } from "react-native-tab-view";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { serverIP } from "@env";

import CricketScorecardComponent from "../components/CricketMatchDetailsComponents/CricketScorecardComponent";
import CricketScoreComponent from "../components/CricketMatchDetailsComponents/CricketScoreComponent";
import CricketMinimalScoreComponent from "../components/CricketMatchDetailsComponents/CricketMinimalScoreComponent";

const screenWidth = Dimensions.get("window").width;

const CricketMatchSummaryComponent = lazy(() =>
  import(
    "../components/CricketMatchDetailsComponents/CricketMatchSummaryComponent"
  )
);
const CricketMatchStatsComponent = lazy(() =>
  import(
    "../components/CricketMatchDetailsComponents/CricketMatchStatsComponent"
  )
);

export default function CricketMatchDetailsScreen({ route, navigation }) {
  const { matchId, hTeam, aTeam, matchInfo } = route.params;
  const params = { aTeam: JSON.stringify(aTeam), hTeam: JSON.stringify(hTeam) };

  const [scorecardData, setScorecardData] = useState(null);
  const [squadsData, setSquadsData] = useState(null);
  const [teamImageData, setTeamImageData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalKey, setModalKey] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const scrollY = useRef(new Animated.Value(0)).current;

  // Animation values
  const HEADER_MAX_HEIGHT = 300;
  const HEADER_MIN_HEIGHT = Platform.OS === "ios" ? 90 : 70;
  const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(
          `http://${serverIP}/cricket/scorecard/${matchId}?${new URLSearchParams(
            params
          )}`
        );
        setScorecardData(response.data?.scorecard);
        setSquadsData(response.data?.squads);
        setTeamImageData(response.data?.teamImages);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, [matchId]);

  const routes = [
    { key: "scorecard", title: "Scorecard" },
    { key: "summary", title: "Summary" },
    { key: "stats", title: "Stats" },
  ];

  const renderScene = SceneMap({
    scorecard: () => (
      <ScrollView style={styles.sceneContainer}>
        <CricketScorecardComponent
          scorecardData={scorecardData}
          matchHeader={matchInfo}
          squadsData={squadsData}
        />
      </ScrollView>
    ),
    summary: () => (
      <Suspense fallback={<LoadingIndicator />}>
        <CricketMatchSummaryComponent matchId={matchId} />
      </Suspense>
    ),
    stats: () => (
      <Suspense fallback={<LoadingIndicator />}>
        <CricketMatchStatsComponent
          matchId={matchId}
          matchHeader={matchInfo}
          scorecardData={scorecardData}
        />
      </Suspense>
    ),
  });

  const renderTabBar = (props) => (
    <TabBar
      {...props}
      style={styles.tabBar}
      indicatorStyle={styles.indicator}
      labelStyle={styles.tabLabel}
      activeColor="#AA60C8"
      inactiveColor="#AAAAAA"
      scrollEnabled={false}
      tabStyle={styles.tabStyle}
      pressColor="rgba(170, 96, 200, 0.1)"
    />
  );

  const LoadingIndicator = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#AA60C8" />
      <Text style={styles.loadingText}>Loading...</Text>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingScreenContainer}>
        <ActivityIndicator size="large" color="#AA60C8" />
        <Text style={styles.loadingScreenText}>Loading Match Details...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.rootContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#121212" />

      {/* Header with back button */}
      <BlurView intensity={100} tint="dark" style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="chevron-back" size={28} color="#E0E0E0" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Match Details</Text>
          <Text style={styles.headerSubtitle}>{matchInfo.tournament}</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="star-outline" size={24} color="#E0E0E0" />
          </TouchableOpacity>
        </View>
      </BlurView>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
      >
        <View style={styles.scoreCardContainer}>
          <CricketScoreComponent
            matchHeader={matchInfo}
            scorecardData={scorecardData}
            teamImageData={teamImageData}
          />
        </View>

        <View style={styles.tabBarContainer}>
          {routes.map((route, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.tab,
                selectedTabIndex === index
                  ? styles.activeTab
                  : styles.inactiveTab,
              ]}
              onPress={() => {
                setSelectedTabIndex(index);
                setModalVisible(true);
              }}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.tabText,
                  selectedTabIndex === index
                    ? styles.activeTabText
                    : styles.inactiveTabText,
                ]}
              >
                {route.title}
              </Text>
              {selectedTabIndex === index && (
                <View style={styles.tabIndicator} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Modal for full-screen content */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
          statusBarTranslucent={true}
        >
          <View style={styles.modalOverlay}>
            <Animated.View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <TouchableOpacity
                  style={styles.modalBackButton}
                  onPress={() => setModalVisible(false)}
                  hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                >
                  <Ionicons name="chevron-down" size={28} color="#FFFFFF" />
                </TouchableOpacity>
                <CricketMinimalScoreComponent
                  matchHeader={matchInfo}
                  scorecardData={scorecardData}
                  teamImageData={teamImageData}
                />
                <View style={styles.modalHeaderSpacer} />
              </View>

              <View style={styles.modalContent}>
                <TabView
                  key={modalKey}
                  navigationState={{ index: selectedTabIndex, routes }}
                  renderScene={renderScene}
                  onIndexChange={setSelectedTabIndex}
                  initialLayout={{ width: screenWidth }}
                  renderTabBar={renderTabBar}
                  lazy={true}
                  swipeEnabled={true}
                />
              </View>
            </Animated.View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: "#181818",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#1E1E1E",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(80, 80, 80, 0.5)",
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "rgba(60, 60, 60, 0.5)",
  },
  headerTitleContainer: {
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#9e9e9e",
    marginTop: 2,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerButton: {
    padding: 8,
    borderRadius: 20,
    marginLeft: 10,
    backgroundColor: "rgba(60, 60, 60, 0.5)",
  },
  scrollView: {
    flex: 1,
  },
  scoreCardContainer: {
    backgroundColor: "#2E3A59",
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    marginBottom: 15,
    paddingBottom: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  tabBarContainer: {
    flexDirection: "row",
    backgroundColor: "#1A2138",
    paddingTop: 12,
    paddingBottom: 0,
    justifyContent: "space-around",
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    marginHorizontal: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  tab: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    flex: 1,
    alignItems: "center",
    position: "relative",
  },
  activeTab: {
    backgroundColor: "transparent",
  },
  inactiveTab: {
    backgroundColor: "transparent",
  },
  tabText: {
    fontSize: 16,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  activeTabText: {
    color: "#AA60C8",
  },
  inactiveTabText: {
    color: "#8D9AAF",
  },
  tabIndicator: {
    position: "absolute",
    bottom: 0,
    left: 15,
    right: 15,
    height: 3,
    backgroundColor: "#AA60C8",
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    height: "90%",
    backgroundColor: "#181818",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: "hidden",
    width: "100%",
    // Remove position: "absolute" to test if that's causing the issue
  },
  modalBackground: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(170, 96, 200, 0.2)",
    backgroundColor: "rgba(24, 24, 24, 0.95)",
    zIndex: 1,
  },
  modalBackButton: {
    padding: 8,
    backgroundColor: "rgba(80, 80, 80, 0.4)",
    borderRadius: 20,
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  modalHeaderSpacer: {
    width: 40,
    height: 40,
  },
  modalContent: {
    flex: 1,
    backgroundColor: "transparent",
    height: "100%", // This ensures it takes full height
  },
  tabBar: {
    backgroundColor: "rgba(26, 26, 26, 0.95)",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(170, 96, 200, 0.3)",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  indicator: {
    backgroundColor: "#AA60C8",
    height: 3,
    borderRadius: 3,
  },
  tabLabel: {
    fontSize: 15,
    fontWeight: "700",
    textTransform: "capitalize",
    letterSpacing: 0.5,
  },
  tabStyle: {
    width: "auto",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  sceneContainer: {
    flexGrow: 1,
    backgroundColor: "#121212",
    paddingBottom: 20,
  },
  loadingContainer: {
    padding: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    color: "#fff",
    fontSize: 16,
    marginTop: 10,
  },
  loadingScreenContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#222831",
  },
  loadingScreenText: {
    color: "#fff",
    fontSize: 18,
    marginTop: 15,
    fontWeight: "500",
  },
});
