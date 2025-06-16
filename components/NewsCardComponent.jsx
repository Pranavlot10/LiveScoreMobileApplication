import React from "react";
import {
  View,
  Text,
  ImageBackground,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";

import useSportsStore from "../zustand/useSportsStore";

const NewsCard = ({
  id,
  headline,
  summary,
  imageUrl,
  pubAgo,
  pubTime,
  source,
  content,
  url,
}) => {
  const selectedSport = useSportsStore((state) => state.selectedSport); // Get selected sport from Zustand
  const navigation = useNavigation();

  function onPressHandler() {
    selectedSport === "cricket"
      ? navigation.navigate("CricketNewsContent", {
          newsId: id,
          headline: headline,
          summary: summary,
          imageUrl: imageUrl,
          pubAgo: pubAgo,
          pubTime: pubTime,
          source: source,
          content: content,
        })
      : navigation.navigate("WebViewScreen", {
          url: url,
          title: headline,
        });
  }

  return (
    <TouchableOpacity activeOpacity={0.7} onPress={onPressHandler}>
      <ImageBackground
        source={{ uri: imageUrl }}
        style={styles.imageBackground}
      >
        <LinearGradient
          colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.6)", "rgba(0,0,0,0.9)"]} // More gradient coverage
          style={styles.overlay}
        />

        <View style={styles.content}>
          <Text style={styles.source}>{`${source} | ${pubAgo} ago`}</Text>
          <Text style={styles.headline}>{headline}</Text>
          <Text style={styles.description}>{summary}</Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button}>
              <Text style={styles.buttonText}>Share</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );
};
const styles = StyleSheet.create({
  imageBackground: {
    width: "100%",
    height: 400,
    justifyContent: "flex-end",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    padding: 20,
    position: "absolute",
    bottom: 10, // Moves content lower
    left: 0,
    right: 0,
  },
  source: {
    color: "#ccc",
    fontSize: 12,
    marginBottom: 5,
  },
  headline: {
    color: "#fff",
    fontSize: 22, // Slightly bigger text for better readability
    fontWeight: "bold",
    marginBottom: 10,
  },
  description: {
    color: "#ddd",
    fontSize: 14,
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 10,
  },
  button: {
    borderWidth: 1,
    borderColor: "#fff",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
});
export default NewsCard;
