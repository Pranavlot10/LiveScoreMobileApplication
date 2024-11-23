import { Image, Pressable, StyleSheet } from "react-native";

function ImageButtonComponent({ onPress, iconSource, alt, iconStyle }) {
  return (
    <Pressable onPress={onPress} style={[styles.icon, iconStyle]}>
      <Image style={styles.image} source={iconSource} alt={alt} />
    </Pressable>
  );
}

export default ImageButtonComponent;

const styles = StyleSheet.create({
  icon: {
    padding: 8,
  },
  image: {
    height: 40,
    width: 40,
  },
});
