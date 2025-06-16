import React, {
  useCallback,
  useEffect,
  useState,
  useRef,
  useMemo,
} from "react";
import { useNavigation } from "@react-navigation/native";
import Carousel from "react-native-reanimated-carousel";
import axios from "axios";
import { serverIP } from "@env";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ActivityIndicator,
  Dimensions,
  TouchableOpacity,
  Animated,
} from "react-native";
import { FlatList, ScrollView } from "react-native-gesture-handler";
import { LinearGradient } from "expo-linear-gradient";

import FootballMatchComponent from "./FootballMatchComponent";
import { useFavouritesStore } from "../../zustand/useFavouritesStore";

const screenWidth = Dimensions.get("screen").width;

// Color palette for grayish theme with added gradient colors
const COLORS = {
  background: "#212121",
  cardBackground: "#2A2A2A",
  primary: "#4a4a4a",
  secondary: "#3a3a3a",
  accent: "#5D9CEC", // Blue accent for selected items
  accentGradient: ["#5D9CEC", "#4A89DC"], // Gradient for selected date
  text: {
    primary: "#FFFFFF",
    secondary: "#CCCCCC",
    accent: "#8E8E8E",
  },
  live: "#FF5252",
  liveGradient: ["#FF5252", "#FF3636"],
  border: "#3D3D3D",
  loading: "#5D9CEC",
};

const getMatchStatus = (match) => {
  const statusCode = match?.status?.code;
  const startTimestamp = match?.startTimestamp;
  const currentPeriodStart = match?.time?.currentPeriodStartTimestamp;

  if (statusCode === 6 || statusCode === 7) {
    const currentTime = Math.floor(Date.now() / 1000);
    const minutesPlayed = Math.min(
      Math.floor((currentTime - currentPeriodStart) / 60),
      45
    );
    return statusCode === 6 ? `${minutesPlayed}'` : `${45 + minutesPlayed}'`;
  }

  if (statusCode === 120) return "AP";
  if (statusCode === 31) return "HT";
  if (statusCode === 100) return "FT";
  if (statusCode === 110) return "AET";
  if (statusCode === 70) return "Canc.";
  if (statusCode === 60) return "PST";
  if (statusCode === 0) {
    const date = new Date(startTimestamp * 1000);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  if (statusCode === 42) {
    const initialSeconds = match.time.initial || 0; // Total seconds till last period
    const extraSeconds = match.time.extra || 0; // Extra time played in the current period

    // Convert to minutes
    const initialMinutes = Math.floor(initialSeconds / 60);
    const extraMinutes = Math.floor(extraSeconds / 60);

    // Total minutes played
    return `${initialMinutes + extraMinutes}'`;
  }

  if (statusCode === 50) return "PEN";
  console.log(match?.status, match?.season.name);
  return "Unknown";
};

function filterTodaysMatches(matches) {
  const todayLocal = new Date();
  todayLocal.setHours(0, 0, 0, 0); // Reset to local midnight

  return matches.filter((match) => {
    const matchDateLocal = new Date(match.startTimestamp * 1000); // Convert to Date (Local Time)
    matchDateLocal.setHours(0, 0, 0, 0); // Reset to local midnight

    return matchDateLocal.getTime() === todayLocal.getTime();
  });
}

// Helper function to format date
const formatDate = (offset) => {
  const date = new Date();
  date.setDate(date.getDate() + offset);

  // Format as "DD Mon" (e.g., "15 Feb")
  return `${date.getDate()} ${date.toLocaleString("default", {
    month: "short",
  })}`;
};

// Get day of week
const getDayOfWeek = (offset) => {
  const date = new Date();
  date.setDate(date.getDate() + offset);

  // For today and yesterday, return those words instead of the day name
  if (offset === 0) return "Today";

  return date.toLocaleString("default", { weekday: "short" });
};

// Helper function to get a unique key for a date (based on actual date, not just offset)
const getDateKey = (offset) => {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
};

const MatchesList = () => {
  const carouselRef = useRef(null);
  const dateScrollViewRef = useRef(null);
  const dateOffsets = [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5];
  const [liveOnly, setLiveOnly] = useState(false);
  const [currentOffset, setCurrentOffset] = useState(0);
  const [footballData, setFootballData] = useState({});
  const [loadingOffsets, setLoadingOffsets] = useState({});
  const [currentCarouselIndex, setCurrentCarouselIndex] = useState(
    dateOffsets.indexOf(0)
  );
  const navigation = useNavigation();
  const { favourites, loadFavourites } = useFavouritesStore();

  const memoizedFavoriteLeagues = useMemo(
    () => [
      ...favourites.football.leagues,
      ...favourites.cricket.leagues,
      ...favourites.basketball.leagues,
    ],
    [favourites]
  );

  const memoizedFavoriteTeams = useMemo(
    () => [
      ...favourites.football.teams,
      ...favourites.cricket.teams,
      ...favourites.basketball.teams,
    ],
    [favourites]
  );

  const memoizedFavoriteMatches = useMemo(
    () => [
      ...favourites.football.matches,
      ...favourites.cricket.matches,
      ...favourites.basketball.matches,
    ],
    [favourites]
  );

  const isMatchFavorite = useCallback(
    (match) => {
      return (
        memoizedFavoriteMatches.includes(match.id) ||
        useFavouritesStore.getState().containsFavoriteTeam(match)
      );
    },
    [memoizedFavoriteMatches]
  );

  // Add animation value for live button pulse effect
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    loadFavourites();
  }, []);

  // Start pulse animation when liveOnly is true
  useEffect(() => {
    if (liveOnly) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      // Stop animation
      pulseAnim.setValue(1);
      pulseAnim.stopAnimation();
    }
  }, [liveOnly, pulseAnim]);

  const fetchData = useCallback(
    async (offset) => {
      // Get date-based key instead of using offset directly
      const dateKey = getDateKey(offset);

      // Skip if already loading or data exists
      if (loadingOffsets[dateKey] || footballData[dateKey]) return;

      try {
        // Mark this offset as loading
        setLoadingOffsets((prev) => ({ ...prev, [dateKey]: true }));

        const date = new Date();
        date.setDate(date.getDate() + offset);

        // Make sure we're passing correct date components to the API
        const response = await axios.get(
          `http://${serverIP}/football/todays-matches?date=${date.getDate()}&month=${
            date.getMonth() + 1
          }&year=${date.getFullYear()}`
        );

        // Store the date and matches data together to ensure we match properly
        const matchesWithDate = response?.data?.map((match) => ({
          ...match,
          selectedDateKey: dateKey, // Add a reference to which date this belongs to
        }));

        // Update football data by merging with existing data
        setFootballData((prev) => ({
          ...prev,
          [dateKey]: matchesWithDate,
        }));
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        // Unmark loading state regardless of success/failure
        setLoadingOffsets((prev) => ({ ...prev, [dateKey]: false }));
      }
    },
    [footballData, loadingOffsets]
  );

  function onPressHandler(leagueId, leagueName, leagueImage, seasonId) {
    navigation.navigate("FootballLeagueScreen", {
      leagueId: leagueId,
      seasonId: seasonId,
      leagueName: leagueName,
      leagueImage: leagueImage,
    });
  }

  // Fetch data for current offset on initial load and when offset changes
  useEffect(() => {
    // Always fetch current offset
    fetchData(currentOffset);

    // Scroll the date selector to make the selected date visible
    // Using setTimeout to ensure the component has rendered
    setTimeout(() => {
      if (dateScrollViewRef.current) {
        const scrollToX = dateOffsets.indexOf(currentOffset) * 62; // Adjusted width for each date item
        dateScrollViewRef.current.scrollTo({
          x: scrollToX - screenWidth / 3,
          animated: true,
        });
      }
    }, 100);
  }, [currentOffset, fetchData]);

  const renderItem = useCallback(({ item }) => {
    const [tournamentId, tournamentMatches] = item;

    return (
      <View style={styles.tournamentContainer}>
        <TouchableOpacity
          style={styles.leagueContainer}
          onPress={() =>
            onPressHandler(
              tournamentMatches.matches[0].tournament.uniqueTournament.id,
              tournamentMatches.matches[0].tournament.uniqueTournament.name,
              tournamentMatches.matches[0].tournament.uniqueTournament.logo,
              tournamentMatches.matches[0].season.id
            )
          }
        >
          <View style={styles.logoContainer}>
            <Image
              style={styles.logo}
              source={{
                uri: tournamentMatches.matches[0].tournament.uniqueTournament
                  .logo,
              }}
              resizeMode="contain"
              onError={(error) =>
                console.log("Error loading logo:", error.nativeEvent.error)
              }
            />
          </View>
          <View>
            <Text style={styles.tournamentName}>{tournamentMatches.name}</Text>
            <Text style={styles.countryName}>
              {tournamentMatches.matches[0].tournament.category.country.name}
            </Text>
          </View>
        </TouchableOpacity>
        {tournamentMatches.matches.map((match) => (
          <FootballMatchComponent
            key={match.id}
            id={match.id}
            match={match}
            homeLogo={match?.homeTeam?.logo}
            awayLogo={match?.awayTeam?.logo}
            matchStatus={getMatchStatus(match)}
          />
        ))}
      </View>
    );
  }, []);

  // Modified to use dateKey instead of direct offset
  const isMatchLive = (match) => {
    const statusCode = match?.status?.code;
    // Status codes 6 and 7 represent first and second half in play
    return (
      (statusCode === 6 || statusCode === 7 || statusCode === 120) &&
      !match.winnerCode
    ); // Include extra time (120)
  };

  // Completely revamped function that uses the stored dateKey in the match
  const groupMatchesByTournament = useCallback(
    (matches, targetDateKey) => {
      if (!matches || !Array.isArray(matches)) return {};

      // Filter matches based on current date and live status if needed
      const filteredMatches = matches.filter((match) => {
        // Always filter by current date using the stored dateKey
        const matchesDateKey = match.selectedDateKey === targetDateKey;

        // If liveOnly is enabled, also filter by live status
        return matchesDateKey && (!liveOnly || isMatchLive(match));
      });

      return filteredMatches.reduce((acc, match) => {
        const tournamentKey = match.tournament.id;

        if (!acc[tournamentKey]) {
          acc[tournamentKey] = {
            name: match.tournament.name,
            matches: [],
          };
        }

        acc[tournamentKey].matches.push(match);
        return acc;
      }, {});
    },
    [liveOnly]
  );

  const renderCarouselItem = useCallback(
    ({ item: offset, index }) => {
      const dateKey = getDateKey(offset);
      const isLoading = loadingOffsets[dateKey] && !footballData[dateKey];

      if (isLoading) {
        return (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.loading} />
            <Text style={styles.loadingText}>Loading matches...</Text>
          </View>
        );
      }

      const data = footballData[dateKey] || [];

      const favForDate = data.filter((match) => isMatchFavorite(match));
      const groupedFavMatches = groupMatchesByTournament(favForDate, dateKey);
      const favMatchesEntries = Object.entries(groupedFavMatches);

      // console.log("fav", favForDate);

      // Use the dateKey to group matches
      const groupedMatches = groupMatchesByTournament(data, dateKey);
      const matchesEntries = Object.entries(groupedMatches);

      if (matchesEntries.length === 0) {
        return (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {liveOnly
                ? "No live matches available"
                : "No matches available for this date"}
            </Text>
          </View>
        );
      }

      return (
        <View style={{ flex: 1 }}>
          <FlatList
            data={[
              ...(favForDate.length > 0
                ? [{ type: "favorites", matches: favForDate }]
                : []),
              ...matchesEntries.map((entry) => ({
                type: "tournament",
                data: entry,
              })),
            ]}
            keyExtractor={(item, index) =>
              item.type === "favorites" ? "favorites" : item.data[0]
            }
            renderItem={({ item }) => {
              if (item.type === "favorites") {
                return (
                  <View style={styles.favSection}>
                    <Text style={styles.favHeader}>FAVOURITE MATCHES</Text>
                    {item.matches.map((match) => (
                      <FootballMatchComponent
                        key={match.id}
                        id={match.id}
                        match={match}
                        homeLogo={match?.homeTeam?.logo}
                        awayLogo={match?.awayTeam?.logo}
                        matchStatus={getMatchStatus(match)}
                        isFavorite={true}
                      />
                    ))}
                  </View>
                );
              }
              return renderItem({ item: item.data });
            }}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.flatListContent}
          />
        </View>
      );
    },
    [footballData, loadingOffsets, renderItem, liveOnly]
  );

  const handleDatePress = (offset) => {
    // Find the index in dateOffsets array
    const index = dateOffsets.indexOf(offset);

    // Set the current offset to update app state
    setCurrentOffset(offset);
    setCurrentCarouselIndex(index);

    // Programmatically move the carousel to this index
    if (carouselRef.current) {
      carouselRef.current.scrollTo({ index });
    }
  };

  // Enhanced date item renderer
  const renderDateItem = (offset) => {
    const isSelected = offset === currentOffset;
    const dateObj = new Date();
    dateObj.setDate(dateObj.getDate() + offset);

    // Check if date is today
    const isToday = offset === 0;

    return (
      <TouchableOpacity
        key={offset}
        style={[
          styles.dateItem,
          isSelected && styles.selectedDateItemContainer,
          { opacity: liveOnly ? 0.5 : 1 },
        ]}
        onPress={() => handleDatePress(offset)}
        disabled={liveOnly}
      >
        {isSelected ? (
          <LinearGradient
            colors={COLORS.accentGradient}
            style={styles.selectedGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.dateContent}>
              <Text style={[styles.dayText, styles.selectedDateText]}>
                {isToday ? "TODAY" : getDayOfWeek(offset)}
              </Text>
              <Text style={[styles.dateText, styles.selectedDateText]}>
                {formatDate(offset)}
              </Text>
              {isToday && <View style={styles.todayIndicator} />}
            </View>
          </LinearGradient>
        ) : (
          <View style={styles.dateContent}>
            <Text style={[styles.dayText, isToday && styles.todayText]}>
              {isToday ? "TODAY" : getDayOfWeek(offset)}
            </Text>
            <Text style={styles.dateText}>{formatDate(offset)}</Text>
            {isToday && <View style={styles.todayIndicator} />}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Enhanced Date and Live Filter Container */}
      <View style={styles.dateOuterContainer}>
        {/* Live Button with Gradient and Animation */}
        <TouchableOpacity
          style={styles.liveButtonContainer}
          onPress={() => setLiveOnly(!liveOnly)}
        >
          <LinearGradient
            colors={
              liveOnly ? COLORS.liveGradient : [COLORS.primary, COLORS.primary]
            }
            style={styles.liveContainer}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Animated.View
              style={[
                styles.liveIndicator,
                liveOnly && styles.liveIndicatorActive,
                { transform: [{ scale: liveOnly ? pulseAnim : 1 }] },
              ]}
            />
            <Text style={[styles.liveText, liveOnly && styles.liveTextActive]}>
              LIVE
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Date Selector with Shadow Gradient Edges */}
        <View style={styles.dateScrollContainer}>
          {/* Left fade gradient for scrolling indication */}
          <LinearGradient
            colors={["rgba(42, 42, 42, 0.9)", "rgba(42, 42, 42, 0)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.fadeGradient}
            pointerEvents="none"
          />

          <ScrollView
            ref={dateScrollViewRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.dateContainer}
            scrollEnabled={!liveOnly}
          >
            {dateOffsets.map(renderDateItem)}
          </ScrollView>

          {/* Right fade gradient for scrolling indication */}
          <LinearGradient
            colors={["rgba(42, 42, 42, 0)", "rgba(42, 42, 42, 0.9)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.fadeGradient, styles.fadeRight]}
            pointerEvents="none"
          />
        </View>
      </View>

      {/* Matches Carousel */}
      <View style={styles.rootContainer}>
        <Carousel
          ref={carouselRef}
          data={dateOffsets}
          renderItem={renderCarouselItem}
          width={screenWidth - 45}
          defaultIndex={currentCarouselIndex}
          onSnapToItem={(index) => {
            // Only change offset if not in live mode
            if (!liveOnly) {
              const newOffset = dateOffsets[index];
              setCurrentCarouselIndex(index);
              if (newOffset !== undefined && newOffset !== currentOffset) {
                setCurrentOffset(newOffset);
              }
            }
          }}
          enabled={!liveOnly}
          pagingEnabled
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: 5, // Reduced from 10
  },
  dateOuterContainer: {
    borderWidth: 1,
    borderRadius: 12, // Reduced from 16
    marginHorizontal: 8, // Reduced from 12
    marginBottom: 8, // Reduced from 12
    flexDirection: "row",
    alignItems: "center",
    borderColor: COLORS.border,
    backgroundColor: COLORS.cardBackground,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    overflow: "hidden",
    height: 58, // Explicitly set a more compact height
  },
  dateScrollContainer: {
    flex: 1,
    position: "relative",
    height: 58, // Match parent height
  },
  fadeGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    width: 15, // Reduced from 20
    zIndex: 1,
  },
  fadeRight: {
    left: undefined,
    right: 0,
  },
  dateContainer: {
    paddingVertical: 6, // Reduced from 12
    paddingHorizontal: 4, // Reduced from 8
  },
  dateItem: {
    width: 60, // Reduced from 70
    height: 46, // Reduced from 70
    marginHorizontal: 2, // Reduced from 4
    borderRadius: 8, // Reduced from 12
    overflow: "hidden",
  },
  dateContent: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.primary,
    borderRadius: 8, // Reduced from 12
  },
  selectedDateItemContainer: {
    elevation: 5,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  selectedGradient: {
    width: "100%",
    height: "100%",
    borderRadius: 8, // Reduced from 12
    justifyContent: "center",
    alignItems: "center",
  },
  selectedDateText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  dayText: {
    fontSize: 12, // Reduced from 14
    fontWeight: "bold",
    marginBottom: 2, // Reduced from 4
    color: COLORS.text.secondary,
  },
  dateText: {
    fontSize: 11, // Reduced from 13
    color: COLORS.text.secondary,
  },
  todayText: {
    color: COLORS.accent,
  },
  todayIndicator: {
    position: "absolute",
    bottom: 4, // Reduced from 6
    width: 3, // Reduced from 4
    height: 3, // Reduced from 4
    borderRadius: 1.5, // Reduced from 2
    backgroundColor: COLORS.accent,
  },
  liveButtonContainer: {
    marginLeft: 6, // Reduced from 8
    marginRight: 3, // Reduced from 4
    borderRadius: 8, // Reduced from 12
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  liveContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    height: 46, // Reduced from 70
    paddingHorizontal: 12, // Reduced from 16
    borderRadius: 8, // Reduced from 12
  },
  liveText: {
    color: COLORS.text.primary,
    fontWeight: "bold",
    fontSize: 11, // Reduced from 13
    letterSpacing: 1,
  },
  liveTextActive: {
    color: "#FFFFFF",
  },
  liveIndicator: {
    width: 6, // Reduced from 8
    height: 6, // Reduced from 8
    borderRadius: 3, // Reduced from 4
    backgroundColor: "#888",
    marginRight: 6, // Reduced from 8
  },
  liveIndicatorActive: {
    backgroundColor: "#fff",
    shadowColor: "#fff",
    shadowOpacity: 0.8,
    shadowRadius: 3,
  },
  favSection: {
    marginBottom: 12,
    padding: 8,
    borderRadius: 8,
    backgroundColor: COLORS.secondary,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  favHeader: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.text.primary,
    marginBottom: 6,
  },
  rootContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderRadius: 10, // Reduced from 12
    marginHorizontal: 8, // Reduced from 12
    padding: 8, // Reduced from 12
    borderColor: COLORS.border,
    backgroundColor: COLORS.cardBackground,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 30, // Reduced from 40
  },
  emptyText: {
    color: COLORS.text.accent,
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 30, // Reduced from 40
  },
  loadingText: {
    color: COLORS.text.primary,
    marginTop: 10, // Reduced from 12
    fontSize: 16,
  },
  tournamentContainer: {
    marginBottom: 12, // Reduced from 16
    borderRadius: 8, // Reduced from 10
    backgroundColor: COLORS.secondary,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  leagueContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10, // Reduced from 12
    paddingHorizontal: 10, // Reduced from 12
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border,
  },
  logoContainer: {
    marginRight: 10, // Reduced from 12
    width: 30, // Reduced from 36
    height: 30, // Reduced from 36
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 15, // Reduced from 18
    padding: 2, // Reduced from 3
  },
  logo: {
    height: 26, // Reduced from 30
    width: 26, // Reduced from 30
    aspectRatio: 1,
  },
  tournamentName: {
    fontSize: 14, // Reduced from 16
    fontWeight: "bold",
    color: COLORS.text.primary,
  },
  countryName: {
    fontSize: 12, // Reduced from 14
    color: COLORS.text.secondary,
    marginTop: 1, // Reduced from 2
  },
  flatListContent: {
    paddingVertical: 6, // Reduced from 8
  },
});

export default MatchesList;
export { getMatchStatus };
