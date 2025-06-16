import { View, Text, StyleSheet, Alert, FlatList } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { TouchableOpacity } from "react-native-gesture-handler";
import useAuthStore from "../zustand/useAuthStore";
import useSportsStore from "../zustand/useSportsStore";

function OptionsScreen() {
  const navigation = useNavigation();
  const logout = useAuthStore((state) => state.logout);
  const { sports, selectedSport, setSelectedSport } = useSportsStore();

  const handleLogout = async () => {
    Alert.alert(
      "Logging Out",
      "Are you sure you want to sign out of your account?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Yes, Log Out",
          style: "destructive",
          onPress: async () => {
            await logout();
            navigation.reset({
              index: 0,
              routes: [{ name: "LoginScreen" }],
            });
          },
        },
      ]
    );
  };

  const renderSportItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.sportItem,
        selectedSport === item.name && styles.selectedSportItem,
      ]}
      onPress={() => setSelectedSport(item.name)}
    >
      <Text
        style={[
          styles.sportText,
          selectedSport === item.name && styles.selectedSportText,
        ]}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Settings</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Default Sport</Text>
        <FlatList
          data={sports}
          renderItem={renderSportItem}
          keyExtractor={(item) => item.id}
          style={styles.sportList}
        />
        {selectedSport && (
          <Text style={styles.selectedSport}>Selected: {selectedSport}</Text>
        )}
      </View>

      <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </View>
  );
}

export default OptionsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    padding: 20,
    paddingTop: 40,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  section: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 15,
  },
  sportList: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
  },
  sportItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  selectedSportItem: {
    backgroundColor: "#e3f2fd",
  },
  sportText: {
    fontSize: 16,
    color: "#666",
  },
  selectedSportText: {
    color: "#2196f3",
    fontWeight: "500",
  },
  selectedSport: {
    marginTop: 15,
    fontSize: 16,
    color: "#2196f3",
    textAlign: "center",
  },
  logoutButton: {
    backgroundColor: "#d9534f",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    margin: 20,
    alignItems: "center",
  },
  logoutText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
