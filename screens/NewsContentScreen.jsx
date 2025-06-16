import {
  StyleSheet,
  View,
  Text,
  Image,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { useState, useEffect } from "react";
import { serverIP } from "@env";
import axios from "axios";
import { ScrollView } from "react-native-gesture-handler";
import RenderHTML from "react-native-render-html";

const screenWidth = Dimensions.get("screen").width;

function NewsContentScreen({ route }) {
  const { newsId, headline, summary, imageUrl, pubTime, content } =
    route.params;
  const [newsData, setNewsData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  console.log(newsId);
  // console.log(content);

  useEffect(() => {
    const fetchNewsContent = async () => {
      if (content === "") {
        try {
          const response = await axios.get(
            `http://${serverIP}/cricket/newsContent/${newsId}`
          );
          console.log(JSON.stringify(response?.data, null, 2));
          setNewsData(response?.data);
        } catch (error) {
          console.error("Error fetching data:", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    fetchNewsContent();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Fetching latest updates...</Text>
      </View>
    );
  }
  console.log(JSON.stringify(newsData, null, 2));

  // Function to render formatted text (handles **bold** and *italic*)
  const renderFormattedText = (formattedText) => {
    const regex = /(\*\*(.*?)\*\*)|(\*(.*?)\*)/g;

    let elements = [];
    let lastIndex = 0;

    formattedText.replace(
      regex,
      (match, boldFull, boldText, italicFull, italicText, offset) => {
        // Push unformatted text before the match
        if (offset > lastIndex) {
          elements.push(
            <Text key={lastIndex} style={styles.normalText}>
              {formattedText.substring(lastIndex, offset)}
            </Text>
          );
        }

        // Push formatted text
        if (boldFull) {
          elements.push(
            <Text key={offset} style={styles.boldText}>
              {boldText}
            </Text>
          );
        } else if (italicFull) {
          elements.push(
            <Text key={offset} style={styles.italicText}>
              {italicText}
            </Text>
          );
        }

        lastIndex = offset + match.length;
      }
    );

    // Add any remaining text after the last match
    if (lastIndex < formattedText.length) {
      elements.push(
        <Text key={lastIndex} style={styles.normalText}>
          {formattedText.substring(lastIndex)}
        </Text>
      );
    }

    return elements;
  };

  return (
    <ScrollView style={styles.rootContainer}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>{headline}</Text>
        <Text style={styles.summaryText}>{summary}</Text>
      </View>

      <View style={styles.imageContainer}>
        <Image source={{ uri: imageUrl }} style={styles.image} />
        <Text style={styles.pubTimeText}>{pubTime}</Text>
      </View>

      <View style={styles.contentContainer}>
        {content && content.trim() !== "" ? (
          <RenderHTML
            baseStyle={styles.content}
            contentWidth={screenWidth}
            source={{ html: content }}
          />
        ) : (
          newsData?.content?.map((item, index) => (
            <Text key={index} style={styles.content}>
              {renderFormattedText(item.contentValue)}
            </Text>
          ))
        )}
      </View>
    </ScrollView>
  );
}

export default NewsContentScreen;

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: "#F5F5F5", // Light background
  },
  boldText: {
    fontWeight: "700",
    fontSize: 18,
  },
  italicText: {
    fontStyle: "italic",
  },
  headerContainer: {
    backgroundColor: "#003366", // Dark blue for contrast
    paddingVertical: 12,
    paddingHorizontal: 15,
  },
  headerText: {
    textAlign: "center",
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF", // White text for contrast
  },
  summaryText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#DDDDDD", // Light gray
    textAlign: "center",
  },
  image: {
    width: "100%",
    height: 400,
  },

  pubTimeText: {
    marginLeft: 15,
  },

  contentContainer: {
    padding: 15,
  },
  content: {
    textAlign: "justify",
    fontSize: 16,
    color: "#333333", // Dark gray for readability
    lineHeight: 24,
    marginTop: 10,
  },
});
