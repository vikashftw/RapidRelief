import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

interface EmergencyButtonProps {
  onEmergencyCall: () => void;
}

export default function EmergencyButton({
  onEmergencyCall,
}: EmergencyButtonProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.emergencyButton}
        onPress={onEmergencyCall}
      >
        <Text style={styles.buttonText}>SOS</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 8,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  emergencyButton: {
    width: 115,
    height: 46,
    backgroundColor: "#ff4b5c", 
    borderRadius: 15, 
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.46,
    shadowRadius: 11.14,
    elevation: -10,
    borderWidth: 2,
    borderColor: "#ff858d",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
    textAlign: "center",
    textTransform: "uppercase",
  },
});
