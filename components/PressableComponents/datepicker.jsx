import { useEffect, useState, useRef, useMemo } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import TabsComponent from "./TabsComponent";
import ImageButtonComponent from "./imageButtonComponent";

function DatePickerComponent({ currentOffset, setCurrentOffset }) {
  const [showPicker, setShowPicker] = useState(false);
  const scrollViewRef = useRef(null);

  // Use memoization to avoid recalculating the date offsets unnecessarily
  const dateOffsets = useMemo(
    () => Array.from({ length: 11 }, (_, i) => i - 5),
    []
  );

  // Calculate the scroll offset dynamically for better adaptability
  const scrollToCurrentOffset = () => {
    if (scrollViewRef.current) {
      const tabWidth = 32; // Adjust this if the tab width changes
      const scrollOffset = (currentOffset + 5) * tabWidth;
      requestAnimationFrame(() => {
        scrollViewRef.current.scrollTo({ x: scrollOffset, animated: true });
      });
    }
  };

  // Effect to scroll to the correct position when the current offset changes
  useEffect(() => {
    scrollToCurrentOffset();
  }, [currentOffset]);

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        contentContainerStyle={styles.dateScroll}
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
      >
        {dateOffsets.map((offset) => {
          const date = new Date();
          date.setDate(date.getDate() + offset);
          const day = date.getDate().toString();

          return (
            <TabsComponent
              key={offset}
              title={day}
              tabCount={dateOffsets.length}
              onPress={() => setCurrentOffset(offset)}
              selected={currentOffset === offset}
            />
          );
        })}
      </ScrollView>
      <ImageButtonComponent
        iconSource={require("../../assets/calendar.png")}
        onPress={() => setShowPicker(true)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
  },
  dateScroll: {
    flexDirection: "row",
    alignItems: "center",
  },
});

export default DatePickerComponent;
