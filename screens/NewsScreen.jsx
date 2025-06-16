import { StyleSheet, View, Text } from "react-native";
import { useState, useEffect } from "react";
import { serverIP } from "@env";
import axios from "axios";
import { FlatList } from "react-native-gesture-handler";

import useSportsStore from "../zustand/useSportsStore";
import NewsCard from "../components/NewsCardComponent";
import NewsCardSkeleton from "../components/SkeletonPlaceholder";

function NewsScreen() {
  const selectedSport = useSportsStore((state) => state.selectedSport); // Get selected sport from Zustand
  const [newsData, setNewsData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  function formatDateAndTimeAgo(utcDateStr) {
    const istOffset = 5.5 * 60; // IST is UTC+5:30 in minutes
    const dateUtc = new Date(utcDateStr);
    const istTime = new Date(dateUtc.getTime() + istOffset * 60 * 1000);

    // Format: 11 Mar, 2025 | 9:55 PM
    const options = { day: "2-digit", month: "short", year: "numeric" };
    const dateStr = istTime.toLocaleDateString("en-IN", options);
    let hours = istTime.getHours();
    const minutes = istTime.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    const formattedTime = `${dateStr} | ${hours}:${minutes} ${ampm}`;

    // Time ago calculation
    const now = new Date();
    const nowIST = new Date(now.getTime() + istOffset * 60 * 1000);
    const diffMs = nowIST - istTime;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHrs = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHrs / 24);

    let timeAgo = "";
    if (diffDays > 0) timeAgo = `${diffDays}d`;
    else if (diffHrs > 0) timeAgo = `${diffHrs}h`;
    else if (diffMin > 0) timeAgo = `${diffMin}m`;
    else timeAgo = `${diffSec}s`;

    return {
      formatted: formattedTime,
      timeAgo: timeAgo,
    };
  }

  useEffect(() => {
    console.log(selectedSport);
    const fetchData = async () => {
      try {
        setIsLoading(true);
        if (selectedSport === "Cricket") {
          const response = await axios.get(`http://${serverIP}/cricket/news`);

          // Update all states at once to reduce re-renders
          setNewsData(response?.data); // Set the data from the server response
        }
        if (selectedSport === "Football") {
          const response = await axios.get(`http://${serverIP}/football/news`);
          console.log("football");
          // Update all states at once to reduce re-renders
          setNewsData(response?.data); // Set the data from the server response
        }
        if (selectedSport === "Basketball") {
          const response = await axios.get(
            `http://${serverIP}/basketball/news`
          );

          // Update all states at once to reduce re-renders
          setNewsData(response?.data); // Set the data from the server response
        }
        // console.log(h2hData[0]);

        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setIsLoading(false);
        // You might want to show an error message to the user here
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.rootContainer}>
        <FlatList
          data={[1, 2, 3, 4, 5, 6, 7, 8]}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item }) => <NewsCardSkeleton />}
          showsVerticalScrollIndicator={false}
        />
      </View>
    );
  }

  if (selectedSport === "Cricket") {
    return (
      <View style={styles.rootContainer}>
        <FlatList
          data={newsData}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item }) => (
            <NewsCard
              id={item.id}
              headline={item.headline}
              summary={item.summary}
              imageUrl={item.imageUrl}
              pubAgo={item.pubAgo}
              pubTime={item.pubTime}
              source={item.source}
              content={item.content ?? ""}
            />
          )}
          showsVerticalScrollIndicator={false}
        />
      </View>
    );
  }
  if (selectedSport === "Football" || selectedSport === "Basketball") {
    // console.log("football/basket", newsData.length);
    return (
      <View style={styles.rootContainer}>
        <FlatList
          data={newsData}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item, index }) => {
            const { formatted, timeAgo } = formatDateAndTimeAgo(item.date);
            // console.log(index, item.thumbnail);
            return (
              <NewsCard
                id={index}
                headline={item.title}
                summary={item.description}
                imageUrl={item.thumbnail}
                pubAgo={timeAgo}
                pubTime={formatted}
                source={item.source.name}
                url={item.url}
              />
            );
          }}
          showsVerticalScrollIndicator={false}
        />
      </View>
    );
  }
}

export default NewsScreen;

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
  },
});
