import {
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { FlatList, ScrollView } from "react-native-gesture-handler";
import Carousel from "react-native-reanimated-carousel";
import { useState, useRef, useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import { serverIP } from "@env";
import { LinearGradient } from "expo-linear-gradient";

import CricketMatchOverviewComponent from "./CricketMatchOverviewComponent";

const screenWidth = Dimensions.get("window").width;

const formatDate = (date) => {
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
  });
};

const getDayOfWeek = (date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);

  if (date.getTime() === today.getTime()) {
    return "TODAY";
  }
  return date.toLocaleDateString("default", { weekday: "short" });
};

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
  border: "#3D3D3D",
  loading: "#5D9CEC",
};

function FixturesComponent() {
  const carouselRef = useRef(null);
  const dateOffsets = [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5];
  const [processedData, setProcessedData] = useState([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const navigation = useNavigation();
  const [currentOffset, setCurrentOffset] = useState(0);
  const [liveMatchesData, setLiveMatchesData] = useState([]);
  const [upcomingMatchesData, setUpcomingMatchesData] = useState([]);
  const [recentMatchesData, setRecentMatchesData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const dateScrollViewRef = useRef(null);

  const formatDate = (date) => {
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
    });
  };

  const getDayOfWeek = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);

    if (date.getTime() === today.getTime()) {
      return "TODAY";
    }
    return date.toLocaleDateString("default", { weekday: "short" });
  };

  const navigateDate = (direction) => {
    const currentIndex = dateOffsets.indexOf(currentOffset);
    const newIndex =
      direction === "next"
        ? Math.min(currentIndex + 1, dateOffsets.length - 1)
        : Math.max(currentIndex - 1, 0);
    carouselRef.current?.scrollTo({ index: newIndex });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Request timeout")), 10000)
        );
        const fetchPromise = axios.get(
          `http://${serverIP}/cricket/todays-matches`
        );
        const response = await Promise.race([fetchPromise, timeoutPromise]);
        const { liveMatchesData, upcomingMatchesData, recentMatchesData } =
          response.data;
        setLiveMatchesData(liveMatchesData || []);
        setUpcomingMatchesData(upcomingMatchesData || []);
        setRecentMatchesData(recentMatchesData || []);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const data = {
      cricket: {
        liveMatches: liveMatchesData || [],
        upcomingMatches: upcomingMatchesData || [],
        recentMatches: recentMatchesData || [],
      },
    };
    if (!data) return;

    const processedMatches = dateOffsets.map((offset) => {
      const date = new Date();
      date.setDate(date.getDate() + offset);
      // console.log(date, date.toISOString());

      const isTimestampToday = (timestamp, endTimestamp) => {
        if (!timestamp) return false; // Handle missing timestamp

        date.setHours(0, 0, 0, 0); // Normalize to start of day

        const startDate = new Date(Number(timestamp));
        startDate.setHours(0, 0, 0, 0);

        const endDate = new Date(Number(endTimestamp));
        endDate.setHours(23, 59, 59, 999); // End of match day

        // Check if today falls within the match's duration
        return date >= startDate && date <= endDate;
      };

      const matchesForDate = [
        ...data?.cricket?.recentMatches?.filter((match) =>
          isTimestampToday(match.matchInfo.startDate, match.matchInfo.endDate)
        ),
        ...data?.cricket?.liveMatches?.filter((match) =>
          isTimestampToday(match.matchInfo.startDate, match.matchInfo.endDate)
        ), // Now filters correctly
        ...data?.cricket?.upcomingMatches?.filter((match) =>
          isTimestampToday(match.matchInfo.startDate, match.matchInfo.endDate)
        ),
      ];

      const groupedMatches = matchesForDate.reduce((acc, match) => {
        const seriesName = match.matchInfo.seriesName;
        if (!acc[seriesName]) {
          acc[seriesName] = [];
        }
        acc[seriesName].push(match);
        return acc;
      }, {});

      return { date, groupedMatches };
    });

    setProcessedData(processedMatches);
    setIsDataLoaded(true);
  }, [liveMatchesData, upcomingMatchesData, recentMatchesData]);

  if (!isDataLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00ff00" />
        <Text>Loading matches...</Text>
      </View>
    );
  }

  function onPressHandler(seriesId, seriesName) {
    // console.log("fixtures", seriesId, seriesName, seriesType);
    navigation.navigate("CricketSeriesScreen", {
      seriesId: seriesId,
      seriesName: seriesName,
    });
  }

  // console.log(processedData);
  if (
    processedData.every((item) => Object.keys(item.groupedMatches).length === 0)
  ) {
    return (
      <View style={styles.emptyContainer}>
        <Text>No matches available</Text>
      </View>
    );
  }

  function MatchComponentSelector(item) {
    // console.log(item?.matchScore?.team1Score);
    return (
      <CricketMatchOverviewComponent
        matchDetails={{
          matchId: item.matchInfo.matchId,
          matchType: item.matchInfo.seriesName,
          date:
            item.matchInfo.matchFormat === "TEST"
              ? `${new Date(Number(item.matchInfo.startDate))
                  .toLocaleDateString("en-GB", {
                    day: "2-digit",
                  })
                  .replace(" ", "-")}-${new Date(Number(item.matchInfo.endDate))
                  .toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                  })
                  .replace(" ", "-")}`
              : new Date(Number(item.matchInfo.startDate))
                  .toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                  })
                  .replace(" ", "-"),
          status: item.matchInfo.status,
          seriesType: item.matchInfo.matchFormat,
          seriesId: item.matchInfo.seriesId,
        }}
        hTeam={item.matchInfo.team1}
        aTeam={item.matchInfo.team2}
        score={{
          hScore: item?.matchScore?.team1Score
            ? Object.keys(item.matchScore.team1Score).length > 0
              ? item?.matchScore?.team1Score || ""
              : ""
            : "",
          aScore: item?.matchScore?.team2Score
            ? Object.keys(item.matchScore.team2Score).length > 0
              ? item?.matchScore?.team2Score || ""
              : ""
            : "",
        }}
        matchStatus={item.matchInfo.state}
        matchInfo={item.matchInfo}
      />
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.dateOuterContainer}>
        <ScrollView
          ref={dateScrollViewRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.dateContainer}
        >
          {dateOffsets.map((offset) => {
            const date = new Date(Date.now() + offset * 24 * 60 * 60 * 1000);
            const isSelected = offset === currentOffset;
            const isToday = offset === 0;

            return (
              <TouchableOpacity
                key={offset}
                style={[
                  styles.dateItem,
                  isSelected && styles.selectedDateItemContainer,
                ]}
                onPress={() => {
                  setCurrentOffset(offset);
                  carouselRef.current?.scrollTo({
                    index: dateOffsets.indexOf(offset),
                  });
                }}
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
                        {getDayOfWeek(date)}
                      </Text>
                      <Text style={[styles.dateText, styles.selectedDateText]}>
                        {formatDate(date)}
                      </Text>
                      {isToday && <View style={styles.todayIndicator} />}
                    </View>
                  </LinearGradient>
                ) : (
                  <View style={styles.dateContent}>
                    <Text style={[styles.dayText, isToday && styles.todayText]}>
                      {getDayOfWeek(date)}
                    </Text>
                    <Text style={styles.dateText}>{formatDate(date)}</Text>
                    {isToday && <View style={styles.todayIndicator} />}
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <View style={styles.rootContainer}>
        <Carousel
          ref={carouselRef}
          data={processedData}
          renderItem={({ item }) => (
            <View style={styles.carouselItem}>
              <ScrollView showsVerticalScrollIndicator={false}>
                {Object.keys(item.groupedMatches).length > 0 ? (
                  Object.keys(item.groupedMatches).map((seriesName) => (
                    <View key={seriesName} style={styles.tournamentContainer}>
                      <TouchableOpacity
                        onPress={() =>
                          onPressHandler(
                            item.groupedMatches[seriesName][0].matchInfo
                              .seriesId,
                            seriesName
                          )
                        }
                      >
                        <Text
                          style={styles.seriesTitle}
                        >{`${seriesName} >`}</Text>
                      </TouchableOpacity>
                      {item.groupedMatches[seriesName].map((match) => (
                        <CricketMatchOverviewComponent
                          key={match.matchInfo.matchId}
                          matchDetails={{
                            matchId: match.matchInfo.matchId,
                            matchType: match.matchInfo.seriesName,
                            date: new Date(match.matchInfo.startDate),
                            status: match.matchInfo.status,
                            seriesId: match.matchInfo.seriesId,
                          }}
                          hTeam={match.matchInfo.team1}
                          aTeam={match.matchInfo.team2}
                          score={{
                            hScore: match.matchScore?.team1Score || "",
                            aScore: match.matchScore?.team2Score || "",
                          }}
                          matchStatus={match.matchInfo.status}
                          matchInfo={match.matchInfo}
                        />
                      ))}
                    </View>
                  ))
                ) : (
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>
                      No matches available for this date
                    </Text>
                  </View>
                )}
              </ScrollView>
            </View>
          )}
          width={screenWidth}
          defaultIndex={dateOffsets.indexOf(currentOffset)}
          onSnapToItem={(index) => {
            const newOffset = dateOffsets[index];
            if (newOffset !== undefined) {
              requestAnimationFrame(() => {
                setCurrentOffset(newOffset);
              });
            }
          }}
          pagingEnabled
        />
      </View>
    </View>
  );
}

export default FixturesComponent;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: 8,
  },
  rootContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    marginHorizontal: 8,
    borderColor: COLORS.border,
    backgroundColor: COLORS.cardBackground,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    overflow: "hidden",
  },
  carouselItem: {
    flex: 1,
    width: screenWidth - 16,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  tournamentContainer: {
    marginBottom: 10,
    borderRadius: 10,
    backgroundColor: COLORS.secondary,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  seriesTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.text.primary,
    paddingVertical: 12,
    paddingHorizontal: 12,
    letterSpacing: 0.3,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    color: COLORS.text.accent,
    fontSize: 16,
    fontWeight: "500",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  dateOuterContainer: {
    borderRadius: 12,
    marginHorizontal: 8,
    marginBottom: 8,
    backgroundColor: COLORS.cardBackground,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    overflow: "hidden",
    height: 64,
  },
  dateContainer: {
    paddingVertical: 8,
    paddingHorizontal: 6,
  },
  dateItem: {
    width: 64,
    height: 48,
    marginHorizontal: 3,
    borderRadius: 10,
    overflow: "hidden",
  },
  dateContent: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.primary,
    borderRadius: 10,
  },
  selectedGradient: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  selectedDateText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  dayText: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 3,
    color: COLORS.text.secondary,
  },
  dateText: {
    fontSize: 12,
    color: COLORS.text.secondary,
    fontWeight: "500",
  },
  todayText: {
    color: COLORS.accent,
  },
  todayIndicator: {
    position: "absolute",
    bottom: 4,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.accent,
  },
});
