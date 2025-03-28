import React, { useState } from "react";
import { 
  View, Text, Image, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert 
} from "react-native";
import Icon from "react-native-vector-icons/Feather";
import { Rating } from "react-native-ratings";
import { getTruckerById, Trucker } from "../../services/api"; // ✅ Import API function & Interface

const UserProfileScreen = () => {
  const [truckerId, setTruckerId] = useState(""); // Input field for ID
  const [trucker, setTrucker] = useState<Trucker | null>(null); // ✅ Use correct Trucker type
  const [loading, setLoading] = useState(false);

  // ✅ Fetch trucker details by ID
  const fetchTrucker = async () => {
    if (!truckerId.trim()) {
      Alert.alert("Error", "Please enter a valid Trucker ID");
      return;
    }

    setLoading(true);
    try {
      const data = await getTruckerById(Number(truckerId)); // ✅ Call API function with ID
      console.log("Fetched Trucker:", data);
      setTrucker(data);
    } catch (error) {
      Alert.alert("Error", "Trucker not found or failed to fetch details");
      setTrucker(null); // Clear previous data if error occurs
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton}>
        <Icon name="arrow-left" size={24} color="#333" />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      {/* Enter Trucker ID */}
      <Text style={styles.label}>Enter Trucker ID</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter ID"
        keyboardType="numeric"
        value={truckerId}
        onChangeText={setTruckerId}
      />
      <TouchableOpacity style={styles.fetchButton} onPress={fetchTrucker}>
        <Text style={styles.buttonText}>Fetch Trucker</Text>
      </TouchableOpacity>

      {loading && <ActivityIndicator size="large" color="#5c8bcf" />}

      {/* Display Trucker Details Only If Available */}
      {trucker && (
        <>
          {/* Profile Image */}
          <View style={styles.imageContainer}>
          <Image
            source={require("../../assets/images/TruckerTestingImage.jpeg")} 
            style={styles.profileImage}
          />
          </View>

          {/* User Info */}
          <Text style={styles.label}>Name</Text>
          <TextInput style={styles.input} value={trucker.name} editable={false} />

          <Text style={styles.label}>Email</Text>
          <TextInput style={styles.input} value={trucker.email} editable={false} />

          <Text style={styles.label}>Phone Number</Text>
          <TextInput style={styles.input} value={trucker.phone_number} editable={false} />

          <Text style={styles.label}>Age</Text>
          <TextInput style={styles.input} value={trucker.age.toString()} editable={false} />

          <Text style={styles.label}>Gender</Text>
          <TextInput style={styles.input} value={trucker.gender} editable={false} />

          <Text style={styles.label}>Status</Text>
          <TextInput style={styles.input} value={trucker.status} editable={false} />

          {/* Rating */}
          <Text style={styles.label}>Rating</Text>
          <View style={styles.ratingContainer}>
            <Rating type="star" ratingCount={5} imageSize={30} startingValue={trucker.rating} readonly />
          </View>

          {/* Rides Button */}
          <TouchableOpacity style={styles.ridesButton}>
            <Text style={styles.buttonText}>Rides</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  backText: {
    fontSize: 16,
    marginLeft: 5,
    color: "#333",
  },
  imageContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#333",
  },
  input: {
    backgroundColor: "#f0f0f0",
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    color: "#333",
  },
  fetchButton: {
    backgroundColor: "#007bff",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
  },
  buttonText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "bold",
  },
  ratingContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  ridesButton: {
    backgroundColor: "#5c8bcf",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
});

export default UserProfileScreen;
