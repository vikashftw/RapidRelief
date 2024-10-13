import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import axios from "axios";
import * as Location from "expo-location";

interface Shelter {
  id: string;
  name: string | null;
  distance: number | null;
}

interface DisplaySheltersProps {
  onClose: () => void;
}

const DisplayShelters: React.FC<DisplaySheltersProps> = ({ onClose }) => {
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  useEffect(() => {
    const getUserLocationAndFetchShelters = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        let location = await Location.getCurrentPositionAsync({});
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      }
    };

    getUserLocationAndFetchShelters();
  }, []);

  useEffect(() => {
    if (userLocation) {
      fetchShelters(userLocation.latitude, userLocation.longitude);
    }
  }, [userLocation]);

  const fetchShelters = async (latitude: number, longitude: number) => {
    try {
      const response = await axios.get(
        "http://100.83.200.110:3000/api/locations/nearby",
        {
          params: { latitude, longitude, radius: 250000 },
        }
      );

      const sheltersData = response.data.filter(
        (location: any) => location.type === "shelter"
      );

      setShelters(sheltersData.slice(0, 15));
    } catch (error) {
      console.error("Error fetching shelters:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: Shelter }) => (
    <View style={styles.item}>
      <Text style={styles.name}>{item.name ? item.name : "EMS"}</Text>
      <Text style={styles.distance}>
        {item.distance !== null ? `${item.distance} km` : "N/A"}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <Text style={styles.closeText}>✖</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Nearby Shelters</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />
      ) : shelters.length > 0 ? (
        <FlatList
          data={shelters}
          renderItem={renderItem}
          keyExtractor={(item) =>
            item.id !== undefined
              ? item.id.toString()
              : Math.random().toString()
          }
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          style={styles.flatList}
        />
      ) : (
        <Text>No shelters found</Text>
      )}

      <Text style={styles.count}>Shelters count: {shelters.length}</Text>
    </View>
  );
};

const { height } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 80,
    left: 0,
    right: 0,
    height: height / 2,
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    padding: 10,
    zIndex: 1,
  },
  closeText: {
    fontSize: 24,
    color: "#3b5998",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  loader: {
    flex: 1,
    justifyContent: "center",
  },
  listContainer: {
    paddingHorizontal: 10,
  },
  flatList: {
    flex: 1,
  },
  item: {
    marginVertical: 8,
    padding: 15,
    backgroundColor: "#f9f9f9",
    borderRadius: 5,
    width: "100%",
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
  },
  distance: {
    fontSize: 14,
    color: "#666",
  },
  count: {
    textAlign: "center",
    marginTop: 10,
    color: "#666",
  },
});

export default DisplayShelters;