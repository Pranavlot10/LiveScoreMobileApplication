import { Pressable, Text, StyleSheet, Animated } from "react-native";
import { useRef } from "react";
import { LinearGradient } from "expo-linear-gradient";

function ButtonComponent({
  title,
  onPress,
  fontSize,
  style,
  gradientColors = ["#42A5F5", "#1976D2"],
  disabled = false,
}) {
  const scaleValue = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (disabled) return;
    Animated.spring(scaleValue, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    if (disabled) return;
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Pressable
      onPress={disabled ? null : onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      accessibilityLabel={title}
    >
      <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
        <LinearGradient
          colors={disabled ? ["#666", "#999"] : gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.container, style]}
        >
          <Text style={[styles.text, fontSize, disabled && { opacity: 0.6 }]}>
            {title}
          </Text>
        </LinearGradient>
      </Animated.View>
    </Pressable>
  );
}

export default ButtonComponent;

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
    width: "100%", // Full width for consistency
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4, // Shadow for Android
  },
  text: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
