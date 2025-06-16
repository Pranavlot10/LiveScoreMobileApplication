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
  ImageBackground,
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
import { format } from "date-fns";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import FootballScoreComponent from "../components/footballComponents/FootballScoreComponent";
import FootballLineupsComponent from "../components/footballComponents/FootballLineupsComponents";
import TwitterFeed from "../components/TwitterFeed";
import { Suspense } from "react";
import Svg, { Rect, Circle, Image as SvgImage } from "react-native-svg";

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

const FootballSummaryComponent = React.lazy(() =>
  import("../components/footballComponents/SummaryComponent")
);
const StatsPage = React.lazy(() =>
  import("../components/footballComponents/FootballStatsPage")
);
const TableComponent = React.lazy(() =>
  import("../components/footballComponents/TableComponent")
);

// Animation values
const HEADER_MAX_HEIGHT = 300;
const HEADER_MIN_HEIGHT = Platform.OS === "ios" ? 90 : 70;
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

export default function FootballMatchDetailsScreen({ route, navigation }) {
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

  // Animation state
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

  // Loading indicator component
  const LoadingIndicator = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#8A2BE2" />
      <Text style={styles.loadingText}>Loading...</Text>
    </View>
  );

  // Full loading screen
  const LoadingScreen = () => (
    <View style={styles.loadingScreen}>
      <StatusBar barStyle="light-content" backgroundColor="#121212" />
      <ActivityIndicator size="large" color="#8A2BE2" />
      <Text style={styles.loadingScreenText}>Loading match details...</Text>
    </View>
  );

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(
          `http://${serverIP}/football/details/${matchId}`
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
      const baseQuery = `football (${match.homeTeam.name} OR ${match.awayTeam.name} OR "${match.homeTeam.name} vs ${match.awayTeam.name}") ${match.tournament.uniqueTournament.name}`;
      let sinceDate, untilDate;
      if (matchInfoData?.event?.startTimestamp) {
        const matchDate = new Date(matchInfoData.event.startTimestamp * 1000);
        sinceDate = new Date(matchDate);
        sinceDate.setDate(matchDate.getDate() - 1);
        const since = sinceDate.toISOString().split("T")[0];
        untilDate = new Date(matchDate);
        untilDate.setDate(matchDate.getDate() + 1);
        const until = untilDate.toISOString().split("T")[0];

        try {
          setIsFeedLoading(true);
          const res = await axios.get(
            `http://${serverIP}/tweets?q=${encodeURIComponent(
              baseQuery
            )}&since=${since}&until=${until}`
          );
          setTweets(res.data.tweets || []);
          setIsFeedLoading(false);
        } catch (error) {
          console.error("Failed to fetch tweets:", error.message);
          setIsFeedLoading(false);
        }
      } else {
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
      }
    };

    fetchInitialData();
    fetchTweets();
  }, [matchId, match, matchInfoData?.event?.startTimestamp]);

  const tabTitles = useMemo(() => {
    const titles = [];
    titles.push("Lineups");
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
    lineups: () => (
      <ScrollView
        contentContainerStyle={styles.sceneContainer}
        showsVerticalScrollIndicator={false}
      >
        <FootballLineupsComponent
          lineupsData={lineupsData}
          incidentsData={incidentsData}
          matchId={matchId}
          homeTeamLogo={match.homeTeam.logo}
          awayTeamLogo={match.awayTeam.logo}
        />
      </ScrollView>
    ),
    timeline: () => (
      <Suspense fallback={<LoadingIndicator />}>
        <FootballSummaryComponent
          matchId={matchId}
          incidentsData={incidentsData.incidents || []}
        />
      </Suspense>
    ),
    stats: () => (
      <Suspense fallback={<LoadingIndicator />}>
        <StatsPage
          matchId={matchId}
          match={match}
          matchInfoData={matchInfoData.event || {}}
        />
      </Suspense>
    ),
    feed: () => (
      <ScrollView
        contentContainerStyle={styles.sceneContainer}
        showsVerticalScrollIndicator={false}
      >
        <TwitterFeed
          team1={match.homeTeam.name}
          team2={match.awayTeam.name}
          tweets={tweets}
        />
      </ScrollView>
    ),
    table: () => (
      <Suspense fallback={<LoadingIndicator />}>
        <ScrollView
          contentContainerStyle={styles.sceneContainer}
          showsVerticalScrollIndicator={false}
        >
          <TableComponent
            leagueId={match.tournament.uniqueTournament.id}
            seasonId={match.season.id}
          />
        </ScrollView>
      </Suspense>
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
      activeColor="#8A2BE2"
      inactiveColor="#AAAAAA"
      scrollEnabled={routes.length > 3}
      tabStyle={styles.tabStyle}
      pressColor="rgba(138, 43, 226, 0.1)"
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
        `http://${serverIP}/football/details/${matchId}`
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

  if (isLoading) {
    return <LoadingScreen />;
  }
  const renderMatchInfo = () => {
    const stadium =
      matchInfoData?.event?.venue?.name ||
      match?.venue?.name ||
      "Unknown Stadium";
    const competition =
      match?.tournament?.uniqueTournament?.name || "Unknown Competition";
    const referee = matchInfoData?.event?.referee?.name || "Unknown Referee";
    const kickoffTimestamp =
      matchInfoData?.event?.startTimestamp || match?.startTimestamp;
    const kickoffDateTime = kickoffTimestamp
      ? format(new Date(kickoffTimestamp * 1000), "EEEE, d MMM yyyy, HH:mm")
      : "Unknown Date/Time";
    const attendance = matchInfoData?.event?.attendance || "Unknown";
    const weather =
      matchInfoData?.event?.weather?.description || "Not available";
    const temperature = matchInfoData?.event?.weather?.temperature?.celsius
      ? `${matchInfoData.event.weather.temperature.celsius}°C`
      : "N/A";

    return (
      <View style={styles.matchInfoContainer}>
        <Text style={styles.matchInfoTitle}>Match Information</Text>
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
              <Text style={styles.infoLabel}>Stadium</Text>
              <Text style={styles.infoValue}>{stadium}</Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <Ionicons
              name="people-outline"
              size={22}
              color="#9e9e9e"
              style={styles.infoIcon}
            />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Attendance</Text>
              <Text style={styles.infoValue}>{attendance}</Text>
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
              <Text style={styles.infoValue}>{kickoffDateTime}</Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <Ionicons
              name="partly-sunny-outline"
              size={22}
              color="#9e9e9e"
              style={styles.infoIcon}
            />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Weather</Text>
              <Text style={styles.infoValue}>
                {weather} ({temperature})
              </Text>
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
          .filter((item) => item.incidentType !== "injuryTime")
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
            {matchStatus === "ended" && (
              <View style={[styles.timelineEvent, styles.timelineEventFT]}>
                <Text style={styles.eventTime}>FT</Text>
                <View style={styles.eventIcon}>
                  <Ionicons name="flag" size={18} color="#7E7E7E" />
                </View>
                <Text style={styles.eventDescription}>Full Time</Text>
              </View>
            )}
            {timelineEvents.length > 0 ? (
              timelineEvents.map((item, index) => {
                let icon, description;
                const cx = 15;
                const cy = 15;

                const teamName = item.isHome
                  ? match.homeTeam.name
                  : match.awayTeam.name;

                if (item.incidentType === "period") {
                  return (
                    <View
                      key={index}
                      style={[styles.timelineEvent, styles.timelineEventPeriod]}
                    >
                      <Text style={styles.eventTime}>{item.text}</Text>
                      <View style={styles.eventIcon}>
                        <Ionicons
                          name="hourglass-outline"
                          size={18}
                          color="#7E7E7E"
                        />
                      </View>
                      <Text style={styles.eventDescription}>{item.text}</Text>
                    </View>
                  );
                }

                const timeText =
                  item.addedTime === 0 || !item.addedTime
                    ? `${item.time}'`
                    : `${item.time}+${item.addedTime}'`;

                switch (item.incidentType) {
                  case "goal":
                    icon = (
                      <Svg width={25} height={25}>
                        <Circle cx={cx - 5} cy={cy - 4} r={10} fill="#4A4A4A" />
                        <SvgImage
                          href={require("../assets/footballIcons/goal.png")}
                          x={cx - 15}
                          y={cy - 14}
                          width={20}
                          height={20}
                        />
                      </Svg>
                    );
                    description = (
                      <View>
                        <Text style={styles.eventDescription}>
                          {item.player?.name || "Unknown"} ({teamName})
                        </Text>
                        {item.assist1 && (
                          <Text style={styles.eventSubText}>
                            Assist: {item.assist1.name}
                          </Text>
                        )}
                        {item.incidentClass === "penalty" && (
                          <Text style={styles.eventSubText}>Penalty</Text>
                        )}
                      </View>
                    );
                    break;

                  case "substitution":
                    icon = (
                      <Svg width={35} height={35}>
                        <SvgImage
                          href={require("../assets/footballIcons/sub.png")}
                          x={cx - 10}
                          y={cy - 10}
                          width={25}
                          height={25}
                        />
                      </Svg>
                    );
                    description = (
                      <View>
                        <Text style={styles.eventDescription}>
                          {item.playerIn?.shortName || "Unknown"} ({teamName})
                        </Text>
                        <Text style={styles.eventSubText}>
                          ↑ {item.playerOut?.shortName || "Unknown"} ↓
                        </Text>
                      </View>
                    );
                    break;

                  case "card":
                    icon = (
                      <Svg width={25} height={25}>
                        <Rect
                          x={cx - 12}
                          y={cy - 14}
                          rx={2}
                          ry={1}
                          height={20}
                          width={14}
                          fill={
                            item.incidentClass === "yellow"
                              ? "#F0E68C"
                              : "#CD5C5C"
                          }
                        />
                      </Svg>
                    );
                    description = (
                      <View>
                        <Text style={styles.eventDescription}>
                          {item.player?.name || "Unknown"} ({teamName})
                        </Text>
                        {item.reason && (
                          <Text style={styles.eventSubText}>
                            ({item.reason})
                          </Text>
                        )}
                      </View>
                    );
                    break;

                  case "varDecision":
                    icon = (
                      <Svg width={35} height={35}>
                        <SvgImage
                          href={require("../assets/footballIcons/var.png")}
                          x={cx - 14}
                          y={cy - 9}
                          width={25}
                          height={25}
                        />
                      </Svg>
                    );
                    description = (
                      <View>
                        <Text style={styles.eventDescription}>
                          {item.player?.name || "Unknown"} ({teamName})
                        </Text>
                        <Text style={styles.eventSubText}>
                          {item.confirmed
                            ? item.incidentClass === "goalAwarded"
                              ? "Goal Stands"
                              : ""
                            : item.incidentClass === "goalAwarded"
                            ? "Goal Disallowed"
                            : item.incidentClass === "penaltyNotAwarded"
                            ? "Penalty Awarded"
                            : ""}
                        </Text>
                      </View>
                    );
                    break;

                  case "penaltyShootout":
                    icon = (
                      <Svg width={25} height={25}>
                        <Circle cx={cx - 5} cy={cy - 4} r={10} fill="#4A4A4A" />
                        <SvgImage
                          href={
                            item.incidentClass === "scored"
                              ? require("../assets/footballIcons/scored_pen.png")
                              : require("../assets/footballIcons/missed_pen.png")
                          }
                          x={cx - 15}
                          y={cy - 14}
                          width={20}
                          height={20}
                        />
                      </Svg>
                    );
                    description = (
                      <View>
                        <Text style={styles.eventDescription}>
                          {item.player?.name || "Unknown"} ({teamName})
                        </Text>
                        <Text style={styles.eventSubText}>
                          ({item.homeScore}-{item.awayScore})
                        </Text>
                      </View>
                    );
                    break;

                  default:
                    icon = (
                      <Svg width={25} height={25}>
                        <Circle cx={cx - 5} cy={cy - 4} r={10} fill="#4A4A4A" />
                      </Svg>
                    );
                    description = (
                      <Text style={styles.eventDescription}>
                        {item.incidentType} - {item.player?.name || "Unknown"} (
                        {teamName})
                      </Text>
                    );
                }

                return (
                  <View key={index} style={styles.timelineEvent}>
                    <Text style={styles.eventTime}>{timeText}</Text>
                    <View style={styles.eventIcon}>{icon}</View>
                    {description}
                  </View>
                );
              })
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

      case "Lineups":
        const homeFormation = lineupsData?.home?.formation || "4-3-3";
        const awayFormation = lineupsData?.away?.formation || "4-3-3";
        const homePlayers = lineupsData?.home?.players?.slice(0, 5) || [];
        const awayPlayers = lineupsData?.away?.players?.slice(0, 5) || [];

        return (
          <TouchableOpacity
            style={styles.sectionContainer}
            onPress={() =>
              handlePartialContentPress(tabTitles.indexOf("Lineups"))
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
                <Text style={styles.sectionTitle}>Lineups</Text>
              </View>
              <TouchableOpacity
                style={styles.viewMoreButton}
                onPress={() =>
                  handlePartialContentPress(tabTitles.indexOf("Lineups"))
                }
              >
                <Text style={styles.viewMoreText}>View More</Text>
                <Ionicons name="chevron-forward" size={16} color="#7E7E7E" />
              </TouchableOpacity>
            </View>
            <View style={styles.lineupPreview}>
              {/* Home Team */}
              <ImageBackground
                source={{
                  uri: match.homeTeam.logo || "https://via.placeholder.com/150",
                }}
                style={styles.teamPreview}
                imageStyle={styles.teamLogoBackground}
              >
                <LinearGradient
                  colors={["rgba(50,50,50,0.8)", "rgba(40,40,40,0.5)"]}
                  style={styles.overlay}
                />
                <View style={styles.teamContent}>
                  <View style={styles.teamHeader}>
                    <Text style={styles.teamName}>{match.homeTeam.name}</Text>
                  </View>
                  <View style={styles.formationContainer}>
                    <Text style={styles.formationLabel}>Formation</Text>
                    <Text style={styles.formation}>{homeFormation}</Text>
                  </View>

                  {homePlayers.length > 0 && (
                    <View style={styles.playersList}>
                      {homePlayers.slice(0, 3).map((player, index) => (
                        <View key={index} style={styles.playerItem}>
                          <View style={styles.playerNumberContainer}>
                            <Text style={styles.playerNumber}>
                              {player.shirtNumber || "?"}
                            </Text>
                          </View>
                          <Text style={styles.playerName} numberOfLines={1}>
                            {player.player.shortName || player.player.name}
                            {player.captain && (
                              <Text style={styles.captainBadge}> (C)</Text>
                            )}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              </ImageBackground>

              {/* Away Team */}
              <ImageBackground
                source={{
                  uri: match.awayTeam.logo || "https://via.placeholder.com/150",
                }}
                style={styles.teamPreview}
                imageStyle={styles.teamLogoBackground}
              >
                <LinearGradient
                  colors={["rgba(50,50,50,0.8)", "rgba(40,40,40,0.5)"]}
                  style={styles.overlay}
                />
                <View style={styles.teamContent}>
                  <View style={styles.teamHeader}>
                    <Text style={styles.teamName}>{match.awayTeam.name}</Text>
                  </View>
                  <View style={styles.formationContainer}>
                    <Text style={styles.formationLabel}>Formation</Text>
                    <Text style={styles.formation}>{awayFormation}</Text>
                  </View>

                  {awayPlayers.length > 0 && (
                    <View style={styles.playersList}>
                      {awayPlayers.slice(0, 3).map((player, index) => (
                        <View key={index} style={styles.playerItem}>
                          <View style={styles.playerNumberContainer}>
                            <Text style={styles.playerNumber}>
                              {player.shirtNumber || "?"}
                            </Text>
                          </View>
                          <Text style={styles.playerName} numberOfLines={1}>
                            {player.player.shortName || player.name}
                            {player.captain && (
                              <Text style={styles.captainBadge}> (C)</Text>
                            )}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              </ImageBackground>
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
                <Text style={styles.sectionTitle}>Match Tweets</Text>
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
                <ActivityIndicator size="small" color="#7E7E7E" />
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
              <Text style={styles.placeholderText}>Match Statistics</Text>
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
      <View style={styles.container}>
        <View style={styles.teamContainer}>
          <Image
            source={{ uri: match.homeTeam.logo }}
            style={styles.teamLogo}
            resizeMode="contain"
          />
          <Text style={styles.teamName} numberOfLines={1}>
            {match.homeTeam.name}
          </Text>
        </View>

        <View style={styles.scoreContainer}>
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
            {match.awayTeam.name}
          </Text>
        </View>
      </View>
    );
  };

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
          <Text style={styles.headerSubtitle}>
            {match.tournament.uniqueTournament.name}
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
          <FootballScoreComponent
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

      {/* Full screen modal for tabs */}
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
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
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
  scoreContainer: {
    alignItems: "center",
    marginHorizontal: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "rgba(80, 80, 80, 0.4)",
    borderRadius: 12,
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

  // Updated match info styles
  rootContainer: {
    flex: 1,
    backgroundColor: "#181818",
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
  timelineEvent: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
    padding: 12,
    backgroundColor: "#3A3A3A",
    borderRadius: 12,
    overflow: "hidden",
    borderLeftWidth: 3,
    borderLeftColor: "#7E7E7E",
  },
  timelineEventFT: {
    borderLeftColor: "#707070",
    backgroundColor: "rgba(80, 80, 80, 0.3)",
  },
  timelineEventPeriod: {
    borderLeftColor: "#909090",
    backgroundColor: "rgba(100, 100, 100, 0.3)",
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
  eventSubText: {
    fontSize: 12,
    color: "#BBBBBB",
    marginTop: 2,
  },
  lineupPreview: {
    flexDirection: "row",
    height: 180,
    justifyContent: "space-between",
    gap: 10,
  },
  teamPreview: {
    flex: 1,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(150, 150, 150, 0.3)",
  },
  teamLogoBackground: {
    opacity: 0.15,
    resizeMode: "contain",
  },
  teamContent: {
    padding: 15,
    height: "100%",
    justifyContent: "space-between",
  },
  teamName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#E0E0E0",
  },
  formationLabel: {
    fontSize: 12,
    color: "#BBBBBB",
    marginBottom: 2,
  },
  formation: {
    fontSize: 16,
    color: "#AAAAAA",
    fontWeight: "600",
  },
  playerNumberContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(150, 150, 150, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  playerNumber: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#CCCCCC",
  },
  playerName: {
    fontSize: 14,
    color: "#E0E0E0",
    flex: 1,
  },
  captainBadge: {
    fontSize: 12,
    color: "#CCCCCC",
    fontWeight: "bold",
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
  tweetActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 15,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(150, 150, 150, 0.2)",
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
    borderBottomColor: "rgba(138, 43, 226, 0.2)",
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
    width: 40, // Same width as modalBackButton for symmetrical spacing
    height: 40,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  modalContent: {
    flex: 1,
    backgroundColor: "transparent",
  },
  tabBar: {
    backgroundColor: "rgba(26, 26, 26, 0.95)",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(138, 43, 226, 0.3)",
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
    backgroundColor: "#8A2BE2",
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
