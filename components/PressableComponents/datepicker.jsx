import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import ButtonComponent from "./ButtonComponent";
import ImageButtonComponent from "./imageButtonComponent";

function DatePickerWidget() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const dateOffsets = [-2, -1, 0, 1, 2];

  const onChange = (event, date) => {
    setShowPicker(false);
    if (date) setSelectedDate(date);
    console.log(selectedDate);
  };

  const updateDate = (daysOffset) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + daysOffset);
    setSelectedDate(newDate);
  };

  return (
    <View style={styles.container}>
      {dateOffsets.map((offset) => (
        <ButtonComponent
          key={offset}
          style={styles.dateButton}
          title={(selectedDate.getDate() + offset).toString()}
          onPress={() => updateDate(offset)}
        />
      ))}
      <ImageButtonComponent
        iconSource={require("../../assets/calendar.png")}
        onPress={() => setShowPicker(true)}
      />

      {showPicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={onChange}
        />
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-evenly",
  },

  dateButton: {
    maxWidth: 30,
  },
});

export default DatePickerWidget;
