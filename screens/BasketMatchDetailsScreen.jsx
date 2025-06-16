import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  Modal,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StatusBar,
  Platform,
  Animated,
  SafeAreaView,
} from "react-native";
import { TabView, SceneMap, TabBar } from "react-native-tab-view";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { serverIP } from "@env";
import { Suspense } from "react";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";

import BasketScoreComponent from "../components/BasketballComponents/BasketScoreComponent";
import BasketPlayerStats from "../components/BasketballComponents/BasketPlayerStatsPage";
import TwitterFeed from "../components/TwitterFeed";
import BasketTableComponent from "../components/BasketballComponents/BasketTableComponent";

const BasketballSummaryComponent = React.lazy(() =>
  import("../components/footballComponents/SummaryComponent")
);
const BasketballStatsPage = React.lazy(() =>
  import("../components/footballComponents/FootballStatsPage")
);

const screenWidth = Dimensions.get("window").width;
const HEADER_MAX_HEIGHT = 300;
const HEADER_MIN_HEIGHT = Platform.OS === "ios" ? 90 : 70;
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

export default function BasketMatchDetailsScreen({ route, navigation }) {
  const { matchId, match, matchStatus } = route.params;
  const [incidentsData, setIncidentsData] = useState({});
  const [lineupsData, setLineupsData] = useState({});
  const [matchInfoData, setMatchInfoData] = useState({});
  const [tweets, setTweets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFeedLoading, setIsFeedLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTab, setSelectedTab] = useState(0);
  const [modalKey, setModalKey] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const scrollY = new Animated.Value(0);
  const headerHeight = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
    extrapolate: "clamp",
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE / 2, HEADER_SCROLL_DISTANCE],
    outputRange: [1, 0.5, 0],
    extrapolate: "clamp",
  });

  const contentOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE / 2],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  const LoadingIndicator = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#FF4500" />
      <Text style={styles.loadingText}>Loading...</Text>
    </View>
  );

  const LoadingScreen = () => (
    <View style={styles.loadingScreen}>
      <StatusBar barStyle="light-content" backgroundColor="#181818" />
      <ActivityIndicator size="large" color="#FF4500" />
      <Text style={styles.loadingScreenText}>Loading game details...</Text>
    </View>
  );

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(
          `http://${serverIP}/basketball/details/${matchId}`
        );
        setIncidentsData(response?.data?.incidentsData || {});
        setLineupsData(response?.data?.lineupsData || {});
        setMatchInfoData(response?.data?.matchInfoData || {});
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching initial data:", error);
        setIsLoading(false);
      }
    };

    const fetchTweets = async () => {
      const baseQuery = `basketball ${match.homeTeam.shortName} ${
        match.awayTeam.shortName
      } ${match.tournament.uniqueTournament?.name || match.tournament.name}`;
      try {
        setIsFeedLoading(true);
        const res = await axios.get(
          `http://${serverIP}/tweets?q=${encodeURIComponent(baseQuery)}`
        );
        setTweets(res.data.tweets || []);
        setIsFeedLoading(false);
      } catch (error) {
        console.error("Failed to fetch tweets:", error.message);
        setIsFeedLoading(false);
      }
    };

    fetchInitialData();
    fetchTweets();
  }, [matchId, match]);

  const tabTitles = useMemo(() => {
    const titles = ["Players Stats"];
    if (match.status.code !== 0) titles.push("Timeline");
    titles.push("Stats");
    if (matchInfoData?.event?.tournament?.competitionType === 1)
      titles.push("Table");
    titles.push("Feed");
    return titles;
  }, [match.status.code, matchInfoData?.event?.tournament?.competitionType]);

  const routes = useMemo(
    () =>
      tabTitles.map((title) => ({
        key: title.toLowerCase(),
        title,
      })),
    [tabTitles]
  );

  const renderScene = SceneMap({
    "players stats": () => (
      <ScrollView
        contentContainerStyle={styles.sceneContainer}
        showsVerticalScrollIndicator={false}
      >
        <BasketPlayerStats
          lineupsData={lineupsData}
          matchInfo={matchInfoData.event}
          homeDetails={match.homeTeam}
          awayDetails={match.awayTeam}
        />
      </ScrollView>
    ),
    timeline: () => (
      <Suspense fallback={<LoadingIndicator />}>
        <BasketballSummaryComponent
          matchId={matchId}
          incidentsData={incidentsData.incidents || []}
        />
      </Suspense>
    ),
    stats: () => (
      <Suspense fallback={<LoadingIndicator />}>
        <BasketballStatsPage
          matchId={matchId}
          match={match}
          matchInfoData={matchInfoData.event || {}}
        />
      </Suspense>
    ),
    table: () => (
      <Suspense fallback={<LoadingIndicator />}>
        <ScrollView
          contentContainerStyle={styles.sceneContainer}
          showsVerticalScrollIndicator={false}
        >
          <BasketTableComponent
            leagueId={
              match.tournament.uniqueTournament?.id || match.tournament.id
            }
            seasonId={match.season.id}
          />
        </ScrollView>
      </Suspense>
    ),
    feed: () => (
      <ScrollView
        contentContainerStyle={styles.sceneContainer}
        showsVerticalScrollIndicator={false}
      >
        <TwitterFeed
          team1={match.homeTeam.shortName}
          team2={match.awayTeam.shortName}
          tweets={tweets}
        />
      </ScrollView>
    ),
  });

  const memoizedRenderScene = useCallback(renderScene, [
    lineupsData,
    incidentsData,
    matchId,
    match,
    matchInfoData,
    tweets,
  ]);

  const renderTabBar = (props) => (
    <TabBar
      {...props}
      style={styles.tabBar}
      indicatorStyle={styles.indicator}
      labelStyle={styles.tabLabel}
      activeColor="#FF4500"
      inactiveColor="#AAAAAA"
      scrollEnabled={routes.length > 3}
      tabStyle={styles.tabStyle}
      pressColor="rgba(255, 69, 0, 0.1)"
    />
  );

  const memoizedRenderTabBar = useCallback(renderTabBar, [routes]);

  const handlePartialContentPress = useCallback(
    (index) => {
      setSelectedTab(index);
      setModalKey((prev) => prev + 1);
      setModalVisible(true);
    },
    [tabTitles]
  );

  const handleIndexChange = useCallback(
    (newIndex) => {
      setSelectedTab(newIndex);
    },
    [tabTitles]
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const response = await axios.get(
        `http://${serverIP}/basketball/details/${matchId}`
      );
      setIncidentsData(response?.data?.incidentsData || {});
      setLineupsData(response?.data?.lineupsData || {});
      setMatchInfoData(response?.data?.matchInfoData || {});
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setRefreshing(false);
    }
  }, [matchId]);

  if (isLoading) return <LoadingScreen />;

  const renderMatchInfo = () => {
    const arena = matchInfoData?.event?.venue?.name || "Unknown Arena";
    const competition =
      match.tournament.uniqueTournament?.name ||
      match.tournament.name ||
      "Unknown Competition";
    const referee = matchInfoData?.event?.referee?.name || "Unknown Referee";
    const startTime = matchInfoData?.event?.startTimestamp
      ? new Date(matchInfoData.event.startTimestamp * 1000).toLocaleString(
          undefined,
          {
            weekday: "long",
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }
        )
      : "Unknown Date/Time";

    return (
      <View style={styles.matchInfoContainer}>
        <Text style={styles.matchInfoTitle}>Game Information</Text>
        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Ionicons
              name="person-outline"
              size={22}
              color="#9e9e9e"
              style={styles.infoIcon}
            />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Referee</Text>
              <Text style={styles.infoValue}>{referee}</Text>
            </View>
          </View>
          <View style={styles.infoItem}>
            <Ionicons
              name="location-outline"
              size={22}
              color="#9e9e9e"
              style={styles.infoIcon}
            />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Arena</Text>
              <Text style={styles.infoValue}>{arena}</Text>
            </View>
          </View>
          <View style={styles.infoItem}>
            <Ionicons
              name="trophy-outline"
              size={22}
              color="#9e9e9e"
              style={styles.infoIcon}
            />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Competition</Text>
              <Text style={styles.infoValue}>{competition}</Text>
            </View>
          </View>
          <View style={styles.infoItem}>
            <Ionicons
              name="calendar-outline"
              size={22}
              color="#9e9e9e"
              style={styles.infoIcon}
            />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Date & Time</Text>
              <Text style={styles.infoValue}>{startTime}</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderPartialContent = (tabTitle, idx) => {
    switch (tabTitle) {
      case "Timeline":
        const timelineEvents = (incidentsData.incidents || [])
          .sort((a, b) => b.time - a.time)
          .slice(0, 5);
        return (
          <TouchableOpacity
            style={styles.sectionContainer}
            onPress={() =>
              handlePartialContentPress(tabTitles.indexOf("Timeline"))
            }
            activeOpacity={0.8}
          >
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <Ionicons
                  name="time-outline"
                  size={20}
                  color="#7E7E7E"
                  style={styles.sectionIcon}
                />
                <Text style={styles.sectionTitle}>Timeline</Text>
              </View>
              <TouchableOpacity
                style={styles.viewMoreButton}
                onPress={() =>
                  handlePartialContentPress(tabTitles.indexOf("Timeline"))
                }
              >
                <Text style={styles.viewMoreText}>View More</Text>
                <Ionicons name="chevron-forward" size={16} color="#7E7E7E" />
              </TouchableOpacity>
            </View>
            {timelineEvents.length > 0 ? (
              timelineEvents.map((item, index) => (
                <View key={index} style={styles.timelineEvent}>
                  <Text style={styles.eventTime}>{item.time}'</Text>
                  <View style={styles.eventIcon}>
                    <Ionicons
                      name="basketball-outline"
                      size={18}
                      color="#fff"
                    />
                  </View>
                  <Text style={styles.eventDescription}>
                    {item.incidentType === "goal"
                      ? item.incidentClass === "onePoint"
                        ? `Free Throw`
                        : item.incidentClass === "twoPoints"
                        ? `2pt Shot`
                        : item.incidentClass === "threePoints"
                        ? `3pt Shot`
                        : ""
                      : item.incidentType === "period"
                      ? item.text
                      : ""}{" "}
                    {item.incidentType === "period"
                      ? ""
                      : `- ${item.player?.name}` || "Unknown"}
                  </Text>
                </View>
              ))
            ) : (
              <View style={styles.noDataContainer}>
                <Ionicons
                  name="alert-circle-outline"
                  size={24}
                  color="#9E9E9E"
                />
                <Text style={styles.noDataText}>No events available</Text>
              </View>
            )}
          </TouchableOpacity>
        );
      case "Players Stats":
        const homeScores = [
          matchInfoData?.event?.homeScore?.period1,
          matchInfoData?.event?.homeScore?.period2,
          matchInfoData?.event?.homeScore?.period3,
          matchInfoData?.event?.homeScore?.period4,
        ] || { 0: 0, 1: 0, 2: 0, 3: 0 };
        const awayScores = [
          matchInfoData?.event?.awayScore?.period1,
          matchInfoData?.event?.awayScore?.period2,
          matchInfoData?.event?.awayScore?.period3,
          matchInfoData?.event?.awayScore?.period4,
        ] || { 0: 0, 1: 0, 2: 0, 3: 0 };
        const homeTotal = matchInfoData?.event?.homeScore?.normaltime || 0;
        const awayTotal = matchInfoData?.event?.awayScore?.normaltime || 0;

        return (
          <TouchableOpacity
            style={styles.sectionContainer}
            onPress={() =>
              handlePartialContentPress(tabTitles.indexOf("Players Stats"))
            }
            activeOpacity={0.8}
          >
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <Ionicons
                  name="people-outline"
                  size={20}
                  color="#7E7E7E"
                  style={styles.sectionIcon}
                />
                <Text style={styles.sectionTitle}>Score by Quarter</Text>
              </View>
              <TouchableOpacity
                style={styles.viewMoreButton}
                onPress={() =>
                  handlePartialContentPress(tabTitles.indexOf("Players Stats"))
                }
              >
                <Text style={styles.viewMoreText}>View More</Text>
                <Ionicons name="chevron-forward" size={16} color="#7E7E7E" />
              </TouchableOpacity>
            </View>
            <View style={styles.scoreTable}>
              <View style={styles.scoreTableRow}>
                <Text style={[styles.scoreTableCell, styles.scoreTableHeader]}>
                  Team
                </Text>
                <Text style={[styles.scoreTableCell, styles.scoreTableHeader]}>
                  1
                </Text>
                <Text style={[styles.scoreTableCell, styles.scoreTableHeader]}>
                  2
                </Text>
                <Text style={[styles.scoreTableCell, styles.scoreTableHeader]}>
                  3
                </Text>
                <Text style={[styles.scoreTableCell, styles.scoreTableHeader]}>
                  4
                </Text>
                <Text style={[styles.scoreTableCell, styles.scoreTableHeader]}>
                  T
                </Text>
              </View>
              <View style={styles.scoreTableRow}>
                <Text style={[styles.scoreTableCell, styles.scoreTableTeam]}>
                  {match.homeTeam.shortName}
                </Text>
                <Text style={styles.scoreTableCell}>{homeScores[0] || 0}</Text>
                <Text style={styles.scoreTableCell}>{homeScores[1] || 0}</Text>
                <Text style={styles.scoreTableCell}>{homeScores[2] || 0}</Text>
                <Text style={styles.scoreTableCell}>{homeScores[3] || 0}</Text>
                <Text style={[styles.scoreTableCell, styles.scoreTableTotal]}>
                  {homeTotal}
                </Text>
              </View>
              <View style={styles.scoreTableRow}>
                <Text style={[styles.scoreTableCell, styles.scoreTableTeam]}>
                  {match.awayTeam.shortName}
                </Text>
                <Text style={styles.scoreTableCell}>{awayScores[0] || 0}</Text>
                <Text style={styles.scoreTableCell}>{awayScores[1] || 0}</Text>
                <Text style={styles.scoreTableCell}>{awayScores[2] || 0}</Text>
                <Text style={styles.scoreTableCell}>{awayScores[3] || 0}</Text>
                <Text style={[styles.scoreTableCell, styles.scoreTableTotal]}>
                  {awayTotal}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        );
      case "Feed":
        const firstTweet = tweets[0];
        return (
          <TouchableOpacity
            style={styles.sectionContainer}
            onPress={() => handlePartialContentPress(tabTitles.indexOf("Feed"))}
            activeOpacity={0.8}
          >
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <Ionicons
                  name="logo-twitter"
                  size={20}
                  color="#657786"
                  style={styles.sectionIcon}
                />
                <Text style={styles.sectionTitle}>Game Tweets</Text>
              </View>
              <TouchableOpacity
                style={styles.viewMoreButton}
                onPress={() =>
                  handlePartialContentPress(tabTitles.indexOf("Feed"))
                }
              >
                <Text style={styles.viewMoreText}>View More</Text>
                <Ionicons name="chevron-forward" size={16} color="#7E7E7E" />
              </TouchableOpacity>
            </View>
            {isFeedLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#FF4500" />
                <Text style={styles.loadingText}>Loading tweets...</Text>
              </View>
            ) : firstTweet ? (
              <View style={styles.tweetCard}>
                <View style={styles.userInfo}>
                  <Image
                    source={{
                      uri:
                        firstTweet.profilePic ||
                        "https://via.placeholder.com/35",
                    }}
                    style={styles.profileImage}
                    resizeMode="cover"
                  />
                  <View style={styles.userDetails}>
                    <Text style={styles.userName}>{firstTweet.user}</Text>
                    {firstTweet.timestamp && (
                      <Text style={styles.tweetTime}>
                        {new Date(firstTweet.timestamp).toLocaleString(
                          undefined,
                          {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </Text>
                    )}
                  </View>
                </View>
                <Text style={styles.tweetText} numberOfLines={3}>
                  {firstTweet.text}
                </Text>
                {firstTweet.images && firstTweet.images.length > 0 && (
                  <Image
                    source={{ uri: firstTweet.images[0] }}
                    style={styles.tweetImage}
                    resizeMode="cover"
                  />
                )}
                {firstTweet.videoThumbnail && (
                  <View style={styles.videoContainer}>
                    <Image
                      source={{ uri: firstTweet.videoThumbnail }}
                      style={styles.videoThumbnail}
                      resizeMode="cover"
                    />
                    <View style={styles.playButtonOverlay}>
                      <Ionicons
                        name="play-circle"
                        size={40}
                        color="rgba(200,200,200,0.9)"
                      />
                    </View>
                  </View>
                )}
                <View style={styles.tweetActions}>
                  <View style={styles.tweetAction}>
                    <Ionicons name="heart-outline" size={18} color="#9E9E9E" />
                    <Text style={styles.actionCount}>
                      {Math.floor(Math.random() * 100)}
                    </Text>
                  </View>
                  <View style={styles.tweetAction}>
                    <Ionicons
                      name="chatbubble-outline"
                      size={18}
                      color="#9E9E9E"
                    />
                    <Text style={styles.actionCount}>
                      {Math.floor(Math.random() * 20)}
                    </Text>
                  </View>
                  <View style={styles.tweetAction}>
                    <Ionicons name="repeat" size={18} color="#9E9E9E" />
                    <Text style={styles.actionCount}>
                      {Math.floor(Math.random() * 50)}
                    </Text>
                  </View>
                </View>
              </View>
            ) : (
              <View style={styles.noDataContainer}>
                <Ionicons
                  name="alert-circle-outline"
                  size={24}
                  color="#9E9E9E"
                />
                <Text style={styles.noDataText}>No tweets available</Text>
              </View>
            )}
          </TouchableOpacity>
        );
      case "Stats":
      case "Table":
        return null;
      default:
        return null;
    }
  };

  const renderStatsAndTable = () => {
    const hasStats = tabTitles.includes("Stats");
    const hasTable = tabTitles.includes("Table");

    if (!hasStats && !hasTable) return null;

    return (
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleContainer}>
            <Ionicons
              name="stats-chart"
              size={20}
              color="#7E7E7E"
              style={styles.sectionIcon}
            />
            <Text style={styles.sectionTitle}>Stats & Table</Text>
          </View>
        </View>
        <View style={styles.statsTableRow}>
          {hasStats && (
            <TouchableOpacity
              style={styles.statsTableItem}
              onPress={() =>
                handlePartialContentPress(tabTitles.indexOf("Stats"))
              }
              activeOpacity={0.7}
            >
              <Ionicons name="bar-chart-outline" size={40} color="#7E7E7E" />
              <Text style={styles.placeholderText}>Game Statistics</Text>
              <Text style={styles.placeholderSubText}>
                Tap to view detailed stats
              </Text>
            </TouchableOpacity>
          )}
          {hasTable && (
            <TouchableOpacity
              style={styles.statsTableItem}
              onPress={() =>
                handlePartialContentPress(tabTitles.indexOf("Table"))
              }
              activeOpacity={0.7}
            >
              <Ionicons name="grid-outline" size={40} color="#7E7E7E" />
              <Text style={styles.placeholderText}>League Standings</Text>
              <Text style={styles.placeholderSubText}>
                Tap to view the full table
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const MinimalScoreComponent = ({ match, matchStatus }) => {
    return (
      <View style={styles.minimalScoreContainer}>
        <View style={styles.teamContainer}>
          <Image
            source={{ uri: match.homeTeam.logo }}
            style={styles.teamLogo}
            resizeMode="contain"
          />
          <Text style={styles.teamName} numberOfLines={1}>
            {match.homeTeam.shortName}
          </Text>
        </View>
        <View style={styles.scoreInnerContainer}>
          <Text style={styles.scoreText}>
            {match.homeScore.current} - {match.awayScore.current}
          </Text>
          {matchStatus === "inprogress" && (
            <View style={styles.liveIndicator}>
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          )}
          {matchStatus !== "inprogress" && (
            <Text style={styles.statusText}>
              {matchStatus === "ended" ? "FT" : match.status.description}
            </Text>
          )}
        </View>
        <View style={styles.teamContainer}>
          <Image
            source={{ uri: match.awayTeam.logo }}
            style={styles.teamLogo}
            resizeMode="contain"
          />
          <Text style={styles.teamName} numberOfLines={1}>
            {match.awayTeam.shortName}
          </Text>
        </View>
      </View>
    );
  };
  return (
    <SafeAreaView style={styles.rootContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#181818" />
      <BlurView intensity={100} tint="dark" style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="chevron-back" size={28} color="#E0E0E0" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Game Details</Text>
          <Text style={styles.headerSubtitle}>
            {match.tournament.uniqueTournament?.name || match.tournament.name}
          </Text>
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
      <Animated.ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        refreshing={refreshing}
        onRefresh={handleRefresh}
      >
        <View style={styles.scoreContainer}>
          <BasketScoreComponent
            incidentsData={incidentsData}
            match={match}
            matchStatus={matchStatus}
          />
        </View>
        <View style={styles.contentContainer}>
          {tabTitles.map((title, idx) => {
            if (title === "Stats" || title === "Table") return null;
            return (
              <View key={idx}>
                {renderPartialContent(title, idx)}
                {idx < tabTitles.length - 1 && <View style={styles.divider} />}
              </View>
            );
          })}
          {renderStatsAndTable()}
          {(tabTitles.includes("Stats") || tabTitles.includes("Table")) && (
            <View style={styles.divider} />
          )}
          {renderMatchInfo()}
        </View>
      </Animated.ScrollView>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
        statusBarTranslucent={true}
      >
        <View style={styles.modalOverlay}>
          <Animated.View style={styles.modalContainer}>
            <LinearGradient
              colors={["#272727", "#1A1A1A", "#121212"]}
              style={styles.modalBackground}
            />
            <View style={styles.modalHeader}>
              <TouchableOpacity
                style={styles.modalBackButton}
                onPress={() => setModalVisible(false)}
                hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
              >
                <Ionicons name="chevron-down" size={28} color="#FFFFFF" />
              </TouchableOpacity>
              <MinimalScoreComponent match={match} matchStatus={matchStatus} />
              <View style={styles.modalHeaderSpacer} />
            </View>
            <View style={styles.modalContent}>
              <TabView
                key={modalKey}
                navigationState={{ index: selectedTab, routes }}
                renderScene={memoizedRenderScene}
                onIndexChange={handleIndexChange}
                initialLayout={{ width: screenWidth }}
                renderTabBar={memoizedRenderTabBar}
                lazy={true}
                swipeEnabled={true}
              />
            </View>
          </Animated.View>
        </View>
      </Modal>
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
  scoreContainer: {
    paddingVertical: 10,
    alignItems: "center",
  },
  teamContainer: {
    alignItems: "center",
    width: 80,
  },
  teamLogo: {
    width: 28,
    height: 28,
    marginBottom: 4,
  },
  teamName: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
    textAlign: "center",
    marginTop: 2,
  },
  scoreInnerContainer: {
    alignItems: "center",
    marginHorizontal: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "rgba(80, 80, 80, 0.4)",
    borderRadius: 12,
  },
  minimalScoreContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
    flex: 1,
  },
  scoreText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  statusText: {
    fontSize: 12,
    color: "#BBBBBB",
    marginTop: 2,
  },
  liveIndicator: {
    backgroundColor: "#ff4757",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 2,
  },
  liveText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  contentContainer: {
    paddingBottom: 20,
  },
  sectionContainer: {
    backgroundColor: "#323232",
    marginHorizontal: 16,
    marginVertical: 10,
    padding: 16,
    borderRadius: 16,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(150, 150, 150, 0.2)",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  sectionIcon: {
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#E0E0E0",
  },
  viewMoreButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(100, 100, 100, 0.25)",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(150, 150, 150, 0.3)",
  },
  viewMoreText: {
    fontSize: 14,
    color: "#CCCCCC",
    marginRight: 5,
    fontWeight: "600",
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(150, 150, 150, 0.2)",
    marginHorizontal: 16,
  },
  matchInfoContainer: {
    backgroundColor: "#252525",
    marginHorizontal: 16,
    marginVertical: 10,
    padding: 20,
    borderRadius: 16,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(80, 80, 80, 0.5)",
  },
  matchInfoTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#E0E0E0",
    marginBottom: 16,
  },
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    width: "48%",
    marginBottom: 16,
    backgroundColor: "#2A2A2A",
    padding: 12,
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: "#757575",
  },
  infoIcon: {
    marginRight: 10,
    marginTop: 2,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: "#9e9e9e",
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    color: "#E0E0E0",
    fontWeight: "500",
  },
  timelineEvent: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
    padding: 12,
    backgroundColor: "#3A3A3A",
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: "#7E7E7E",
  },
  eventTime: {
    width: 50,
    fontSize: 14,
    fontWeight: "700",
    color: "#E0E0E0",
    textAlign: "center",
    backgroundColor: "#505050",
    borderRadius: 8,
    padding: 5,
  },
  eventIcon: {
    width: 40,
    alignItems: "center",
    marginHorizontal: 10,
  },
  eventDescription: {
    fontSize: 14,
    fontWeight: "600",
    color: "#E0E0E0",
  },
  scoreTable: {
    backgroundColor: "#3A3A3A",
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: "rgba(150, 150, 150, 0.3)",
  },
  scoreTableRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(150, 150, 150, 0.2)",
  },
  scoreTableCell: {
    flex: 1,
    textAlign: "center",
    fontSize: 16,
    color: "#E0E0E0",
  },
  scoreTableHeader: {
    fontWeight: "700",
    color: "#FFFFFF",
  },
  scoreTableTeam: {
    fontWeight: "600",
    color: "#FF4500",
  },
  scoreTableTotal: {
    fontWeight: "700",
    color: "#FFFFFF",
  },
  statsTableRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  statsTableItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#3A3A3A",
    padding: 18,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(150, 150, 150, 0.3)",
  },
  placeholderText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#E0E0E0",
    marginTop: 12,
    textAlign: "center",
  },
  placeholderSubText: {
    fontSize: 13,
    color: "#BBBBBB",
    marginTop: 6,
    textAlign: "center",
  },
  tweetCard: {
    padding: 15,
    backgroundColor: "#3A3A3A",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(150, 150, 150, 0.3)",
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 2,
    borderColor: "#657786",
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#E0E0E0",
  },
  tweetTime: {
    fontSize: 12,
    color: "#BBBBBB",
  },
  tweetText: {
    fontSize: 15,
    lineHeight: 22,
    color: "#E0E0E0",
    marginBottom: 10,
  },
  tweetImage: {
    width: "100%",
    height: 180,
    borderRadius: 12,
    marginTop: 10,
  },
  videoContainer: {
    position: "relative",
    marginTop: 10,
    borderRadius: 12,
    overflow: "hidden",
  },
  videoThumbnail: {
    width: "100%",
    height: 180,
    borderRadius: 12,
  },
  playButtonOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  tweetActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 15,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(150, 150, 150, 0.2)",
  },
  tweetAction: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionCount: {
    marginLeft: 5,
    fontSize: 14,
    color: "#BBBBBB",
  },
  noDataContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  noDataText: {
    fontSize: 14,
    color: "#9E9E9E",
    fontStyle: "italic",
    marginTop: 8,
  },
  loadingContainer: {
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    fontSize: 15,
    color: "#FF4500",
    marginTop: 10,
  },
  loadingScreen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#181818",
  },
  loadingScreenText: {
    marginTop: 16,
    fontSize: 16,
    color: "#FFFFFF",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  modalContainer: {
    flex: 1,
    marginTop: 25,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: "hidden",
    backgroundColor: "#181818",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    elevation: 6,
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
    borderBottomColor: "rgba(255, 69, 0, 0.2)",
  },
  modalBackButton: {
    padding: 8,
    backgroundColor: "rgba(80, 80, 80, 0.4)",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  modalHeaderSpacer: {
    width: 40,
    height: 40,
  },
  modalContent: {
    flex: 1,
    backgroundColor: "transparent",
  },
  tabBar: {
    backgroundColor: "rgba(26, 26, 26, 0.95)",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 69, 0, 0.3)",
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
    backgroundColor: "#FF4500",
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
});
