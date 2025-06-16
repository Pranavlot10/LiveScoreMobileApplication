import { Image, StyleSheet, Pressable } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { useEffect } from "react";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function ImageButtonComponent({
  onPress,
  iconSource,
  alt,
  iconStyle,
  imgStyle,
  isSelected,
}) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  useEffect(() => {
    if (isSelected) {
      scale.value = withSpring(1.1);
      opacity.value = withSpring(1);
    } else {
      scale.value = withSpring(1);
      opacity.value = withSpring(0.6);
    }
  }, [isSelected]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

  return (
    <AnimatedPressable
      onPress={onPress}
      style={[
        styles.iconWrapper,
        isSelected && styles.selectedWrapper,
        animatedStyle,
      ]}
    >
      <Image style={styles.image} source={iconSource} alt={alt} />
    </AnimatedPressable>
  );
}

export default ImageButtonComponent;

const styles = StyleSheet.create({
  iconWrapper: {
    padding: 5,
    borderRadius: 50, // Make it circular
    // backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    margin: 7,
  },
  image: {
    height: 40,
    width: 40,
  },
  selectedWrapper: {
    shadowColor: "#00A9FF", // Blue halo glow
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.7,
    shadowRadius: 8,
    elevation: 10, // For Android glow
  },
});
