import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
} from "react-native";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import EmergencyButton from "./EmergencyCall";
import { LinearGradient } from "expo-linear-gradient";
import DisplayProfile from "./DisplayProfile";
import DisplayList from "./DisplayList";
import axios from "axios";
import * as Location from "expo-location";
import DisplaySuccess from "./DisplaySuccess";

interface FooterProps {
  goToRegister: () => void;
}

interface Client {
  _id: string;
  name: string;
  location: {
    coordinates: [number, number];
  };
  capacity: number;
  specialties: string[];
}

const Footer: React.FC<FooterProps> = ({ goToRegister }) => {
  const [isDisplayProfile, setDisplayProfile] = useState(false);
  const [isDisplayList, setDisplayList] = useState(false);
  const [isDisplaySuccess, setDisplaySuccess] = useState(false);
  const [isClientName, setClientName] = useState("");
  const [longitude, setLongitude] = useState<number>();
  const [latitude, setLatitude] = useState<number>();

  const handleEmergencyCall = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission to access location was denied");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      setLatitude(latitude);
      setLongitude(longitude);

      const response = await axios.get(
        "http://100.83.200.110:3000/api/clients/nearby",
        {
          params: { latitude, longitude, maxDistance: 250000 },
        }
      );

      const nearbyClients: Client[] = response.data;

      if (nearbyClients.length === 0) {
        Alert.alert("No nearby emergency services found.");
        return;
      }

      const closestClient = nearbyClients[0];

      await axios.post("http://100.83.200.110:3000/api/clients/alert", {
        clientId: closestClient._id,
        location: {
          latitude,
          longitude,
        },
      });

      Alert.alert(
        "Emergency Alert Sent",
        `Alert sent to ${closestClient.name}. They will contact you shortly.`,
        [
          {
            text: "OK",
            onPress: () => {
              setTimeout(() => {
                setDisplaySuccess(true);
                setClientName(closestClient.name);
              }, 2000);
            },
          },
        ]
      );
    } catch (error) {
      console.error("Error in emergency call process:", error);
      Alert.alert("Failed to process emergency call. Please try again.");
    }
  };

  return (
    <>
      <LinearGradient
        colors={["#4c669f", "#3b5998", "#192f6a"]}
        style={styles.container}
      >
        <TouchableOpacity
          id="search-icon"
          style={styles.iconButton}
          onPress={() => setDisplayList(true)}
        >
          <FontAwesome name="search" size={34} color="white" />
        </TouchableOpacity>

        <View style={styles.emergencyButtonContainer}>
          <EmergencyButton onEmergencyCall={handleEmergencyCall} />
        </View>

        <TouchableOpacity
          id="profile-icon"
          style={styles.iconButton}
          onPress={() => setDisplayProfile(true)}
        >
          <Ionicons name="person-circle" size={38} color="white" />
        </TouchableOpacity>
      </LinearGradient>

      {/* Display Profile Page over the whole screen */}
      {isDisplayProfile && (
        <View style={styles.overlayContainer}>
          <DisplayProfile
            setDisplayProfile={setDisplayProfile}
            goToRegister={goToRegister} // Pass the navigation function to go to register
          />
        </View>
      )}

      {/* Display List Page */}
      {isDisplayList && <DisplayList onClose={() => setDisplayList(false)} />}
      {isDisplaySuccess && (
        <DisplaySuccess
          onClose={() => setDisplaySuccess(false)}
          ems_name={isClientName}
          longitude={longitude}
          latitude={latitude}
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    height: 80,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  iconButton: {
    padding: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  emergencyButtonContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 20,
    alignItems: "center",
    zIndex: 5,
  },
  overlayContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
    zIndex: 2000,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
  },
});

export default Footer;
