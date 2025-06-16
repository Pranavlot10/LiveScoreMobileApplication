// Fully styled and themed BasketFixturesComponent matching football UI

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

import BasketMatchComponent from "./BasketMatchComponent";
import { useFavouritesStore } from "../../zustand/useFavouritesStore";

const screenWidth = Dimensions.get("screen").width;

const COLORS = {
  background: "#212121",
  cardBackground: "#2A2A2A",
  primary: "#4a4a4a",
  secondary: "#3a3a3a",
  accent: "#5D9CEC",
  accentGradient: ["#5D9CEC", "#4A89DC"],
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

const getDateKey = (offset) => {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
};

const getMatchStatus = (match) => {
  const code = match?.status?.code;
  const start = match?.startTimestamp;
  if (code === 0 && start) {
    const d = new Date(start * 1000);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  return (
    {
      13: "1Q",
      14: "2Q",
      15: "3Q",
      16: "4Q",
      31: "HT",
      40: "OT",
      100: "FT",
      110: "AET",
      70: "Canc.",
      60: "PST",
      50: "PEN",
    }[code] || "Unknown"
  );
};

const formatDate = (offset) => {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return `${date.getDate()} ${date.toLocaleString("default", {
    month: "short",
  })}`;
};

const getDayOfWeek = (offset) => {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return offset === 0
    ? "TODAY"
    : date.toLocaleString("default", { weekday: "short" });
};

const isMatchLive = (match) =>
  [13, 14, 15, 16, 40, 120].includes(match?.status?.code);

const BasketFixturesComponent = () => {
  const navigation = useNavigation();
  const dateOffsets = [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5];
  const [currentOffset, setCurrentOffset] = useState(0);
  const [loadingOffsets, setLoadingOffsets] = useState({});
  const [basketData, setBasketData] = useState({});
  const [liveOnly, setLiveOnly] = useState(false);
  const [currentCarouselIndex, setCurrentCarouselIndex] = useState(
    dateOffsets.indexOf(0)
  );
  const carouselRef = useRef(null);
  const dateScrollViewRef = useRef(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const { favourites, loadFavourites } = useFavouritesStore();

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

  const groupMatchesByTournament = useCallback(
    (matches, dateKey) => {
      const filtered = matches.filter(
        (m) => m.selectedDateKey === dateKey && (!liveOnly || isMatchLive(m))
      );
      return filtered.reduce((acc, match) => {
        const key = match.tournament.id;
        if (!acc[key]) acc[key] = { name: match.tournament.name, matches: [] };
        acc[key].matches.push(match);
        return acc;
      }, {});
    },
    [liveOnly]
  );

  useEffect(() => {
    loadFavourites();
  }, []);

  useEffect(() => {
    if (liveOnly) {
      const animation = Animated.loop(
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
      );
      animation.start();
      return () => animation.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [liveOnly, pulseAnim]);

  useEffect(() => {
    const runFetch = async () => {
      const dateKey = getDateKey(currentOffset);
      if (!loadingOffsets[dateKey] && !basketData[dateKey]) {
        try {
          setLoadingOffsets((prev) => ({ ...prev, [dateKey]: true }));
          const date = new Date();
          date.setDate(date.getDate() + currentOffset);
          const res = await axios.get(
            `http://${serverIP}/basketball/todays-matches?date=${date.getDate()}&month=${
              date.getMonth() + 1
            }&year=${date.getFullYear()}`
          );
          const matchesWithDate = res?.data?.map((m) => ({
            ...m,
            selectedDateKey: dateKey,
          }));
          setBasketData((prev) => ({ ...prev, [dateKey]: matchesWithDate }));
        } catch (e) {
          console.error("Fetch Error:", e);
        } finally {
          setLoadingOffsets((prev) => ({ ...prev, [dateKey]: false }));
        }
      }
    };
    runFetch();
    setTimeout(() => {
      if (dateScrollViewRef.current) {
        dateScrollViewRef.current.scrollTo({
          x: dateOffsets.indexOf(currentOffset) * 62 - screenWidth / 3,
          animated: true,
        });
      }
    }, 100);
  }, [currentOffset]);

  const handleDatePress = (offset) => {
    setCurrentOffset(offset);
    setCurrentCarouselIndex(dateOffsets.indexOf(offset));
    if (carouselRef.current)
      carouselRef.current.scrollTo({ index: dateOffsets.indexOf(offset) });
  };

  const renderDateItem = (offset) => {
    const isSelected = offset === currentOffset;
    return (
      <TouchableOpacity
        key={offset}
        style={[
          styles.dateItem,
          isSelected && styles.selectedDateItemContainer,
        ]}
        onPress={() => handleDatePress(offset)}
        disabled={liveOnly}
      >
        {isSelected ? (
          <LinearGradient
            colors={COLORS.accentGradient}
            style={styles.selectedGradient}
          >
            <View style={styles.dateContent}>
              <Text style={[styles.dayText, styles.selectedDateText]}>
                {getDayOfWeek(offset)}
              </Text>
              <Text style={[styles.dateText, styles.selectedDateText]}>
                {formatDate(offset)}
              </Text>
              {offset === 0 && <View style={styles.todayIndicator} />}
            </View>
          </LinearGradient>
        ) : (
          <View style={styles.dateContent}>
            <Text style={[styles.dayText, offset === 0 && styles.todayText]}>
              {getDayOfWeek(offset)}
            </Text>
            <Text style={styles.dateText}>{formatDate(offset)}</Text>
            {offset === 0 && <View style={styles.todayIndicator} />}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderCarouselItem = ({ item: offset }) => {
    const dateKey = getDateKey(offset);
    const isLoading = loadingOffsets[dateKey] && !basketData[dateKey];
    const matches = basketData[dateKey] || [];

    if (isLoading) {
      return (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color={COLORS.loading} />
          <Text style={{ color: COLORS.text.primary, marginTop: 10 }}>
            Loading matches...
          </Text>
        </View>
      );
    }

    // Filter favorite matches for this date
    const favForDate = matches.filter((match) => isMatchFavorite(match));
    const grouped = groupMatchesByTournament(matches, dateKey);

    if (Object.keys(grouped).length === 0) {
      return (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text style={{ color: COLORS.text.accent }}>
            {liveOnly
              ? "No live matches available"
              : "No matches available for this date"}
          </Text>
        </View>
      );
    }

    return (
      <FlatList
        data={[
          ...(favForDate.length > 0
            ? [{ type: "favorites", matches: favForDate }]
            : []),
          ...Object.entries(grouped).map((entry) => ({
            type: "tournament",
            data: entry,
          })),
        ]}
        keyExtractor={(item) =>
          item.type === "favorites" ? "favorites" : item.data[0]
        }
        renderItem={({ item }) => {
          if (item.type === "favorites") {
            return (
              <View style={styles.favSection}>
                <Text style={styles.favHeader}>FAVOURITE MATCHES</Text>
                {item.matches.map((match) => (
                  <BasketMatchComponent
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
          return (
            <View style={styles.tournamentContainer}>
              <TouchableOpacity
                style={styles.leagueContainer}
                onPress={() =>
                  navigation.navigate("BasketballLeagueScreen", {
                    leagueId:
                      item.data[1].matches[0].tournament.uniqueTournament.id,
                    seasonId: item.data[1].matches[0].season.id,
                    leagueName: item.data[1].name,
                    leagueImage:
                      item.data[1].matches[0].tournament.uniqueTournament.logo,
                  })
                }
              >
                <Image
                  source={{
                    uri: item.data[1].matches[0].tournament.uniqueTournament
                      .logo,
                  }}
                  style={styles.logo}
                  resizeMode="contain"
                />
                <View>
                  <Text style={styles.tournamentName}>{item.data[1].name}</Text>
                  <Text style={styles.countryName}>
                    {item.data[1].matches[0].tournament.category.country.name}
                  </Text>
                </View>
              </TouchableOpacity>
              {item.data[1].matches.map((match) => (
                <BasketMatchComponent
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
        }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 12 }}
      />
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.dateOuterContainer}>
        <TouchableOpacity
          style={styles.liveButtonContainer}
          onPress={() => setLiveOnly(!liveOnly)}
        >
          <LinearGradient
            colors={
              liveOnly ? COLORS.liveGradient : [COLORS.primary, COLORS.primary]
            }
            style={styles.liveContainer}
          >
            <Animated.View
              style={[
                styles.liveIndicator,
                liveOnly && styles.liveIndicatorActive,
                { transform: [{ scale: pulseAnim }] },
              ]}
            />
            <Text style={[styles.liveText, liveOnly && styles.liveTextActive]}>
              LIVE
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.dateScrollContainer}>
          <LinearGradient
            colors={["rgba(42, 42, 42, 0.9)", "rgba(42, 42, 42, 0)"]}
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

          <LinearGradient
            colors={["rgba(42, 42, 42, 0)", "rgba(42, 42, 42, 0.9)"]}
            style={[styles.fadeGradient, styles.fadeRight]}
            pointerEvents="none"
          />
        </View>
      </View>

      {/* Favorites Section */}
      {basketData[getDateKey(currentOffset)]?.some(isMatchFavorite) && (
        <View
          style={[styles.favSection, { marginHorizontal: 8, marginBottom: 8 }]}
        >
          <Text style={styles.favHeader}>FAVOURITE MATCHES</Text>
          <FlatList
            data={
              basketData[getDateKey(currentOffset)]?.filter(isMatchFavorite) ||
              []
            }
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <BasketMatchComponent
                key={item.id}
                id={item.id}
                match={item}
                homeLogo={item?.homeTeam?.logo}
                awayLogo={item?.awayTeam?.logo}
                matchStatus={getMatchStatus(item)}
                isFavorite={true}
              />
            )}
            scrollEnabled={false}
          />
        </View>
      )}

      <View style={styles.rootContainer}>
        <Carousel
          ref={carouselRef}
          data={dateOffsets}
          renderItem={renderCarouselItem}
          width={screenWidth - 45}
          defaultIndex={currentCarouselIndex}
          onSnapToItem={(index) => {
            if (!liveOnly) {
              const offset = dateOffsets[index];
              setCurrentOffset(offset);
              setCurrentCarouselIndex(index);
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
    paddingTop: 5,
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
  dateOuterContainer: {
    borderWidth: 1,
    borderRadius: 12,
    marginHorizontal: 8,
    marginBottom: 8,
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
    height: 58,
  },
  dateScrollContainer: {
    flex: 1,
    position: "relative",
    height: 58,
  },
  fadeGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    width: 15,
    zIndex: 1,
  },
  fadeRight: {
    left: undefined,
    right: 0,
  },
  dateContainer: {
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  dateItem: {
    width: 60,
    height: 46,
    marginHorizontal: 2,
    borderRadius: 8,
    overflow: "hidden",
  },
  dateContent: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.primary,
    borderRadius: 8,
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
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  selectedDateText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  dayText: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 2,
    color: COLORS.text.secondary,
  },
  dateText: {
    fontSize: 11,
    color: COLORS.text.secondary,
  },
  todayText: {
    color: COLORS.accent,
  },
  todayIndicator: {
    position: "absolute",
    bottom: 4,
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: COLORS.accent,
  },
  liveButtonContainer: {
    marginLeft: 6,
    marginRight: 3,
    borderRadius: 8,
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
    height: 46,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  liveText: {
    color: COLORS.text.primary,
    fontWeight: "bold",
    fontSize: 11,
    letterSpacing: 1,
  },
  liveTextActive: {
    color: "#FFFFFF",
  },
  liveIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#888",
    marginRight: 6,
  },
  liveIndicatorActive: {
    backgroundColor: "#fff",
    shadowColor: "#fff",
    shadowOpacity: 0.8,
    shadowRadius: 3,
  },
  tournamentContainer: {
    marginBottom: 12,
    borderRadius: 8,
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
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border,
  },
  logo: {
    height: 30,
    width: 30,
    marginRight: 10,
  },
  tournamentName: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.text.primary,
  },
  countryName: {
    fontSize: 12,
    color: COLORS.text.secondary,
    marginTop: 1,
  },
  favSection: {
    marginBottom: 12,
    borderRadius: 8,
    backgroundColor: COLORS.secondary,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  favHeader: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.text.primary,
    padding: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border,
  },
});

export default BasketFixturesComponent;
export { getMatchStatus };
